# 05 · Tiempo real: SSE, duelos en vivo y ajedrez

## 1. Por qué SSE y no WebSocket

- Los duelos de Verbalia son **por turnos cortos con tick del servidor** (una
  pregunta cada N segundos, respuesta → POST). No hay estado de alta
  frecuencia que justifique un canal bidireccional.
- SSE es HTTP puro: pasa el CSP actual (`connect-src 'self'`), atraviesa
  proxies móviles, y se implementa con `ReadableStream` en un route handler.
- El input del cliente viaja por `POST /realtime/duels/:id/answer` (mismo
  guard, mismo zod, mismo rate limit que el resto de la API).
- Si algún día hace falta WS (p. ej. espectar en directo con 10 Hz), la
  migración solo toca `bus.ts` y el cliente de stream.

## 2. El stream: `GET /api/v1/realtime`

Autenticado por cookie. Respuesta `text/event-stream` con:

```
event: ping            // cada 25 s (keep-alive + medida de latencia)
data: {"t":1762761600000}

event: msg             // envoltorio único para todos los eventos
data: {"seq":42,"type":"duel.state","payload":{...}}
```

- `seq` monótono por conexión → el cliente detecta huecos y pide snapshot.
- Cabeceras: `Cache-Control: no-cache, no-transform`, `X-Accel-Buffering: no`
  (evita buffering de proxy). En `middleware.ts`, saltar el matcher de
  seguridad extra para `/api/v1/realtime` (mantener auth; nada más).
- Máximo 1 stream por usuario (nueva conexión cierra la anterior):
  evita conectores zombis y dobles notificaciones.

### Catálogo de eventos `type`

| type | Payload | Cuándo |
|---|---|---|
| `hello` | `{userId, serverTime}` | al abrir |
| `notif` | `{id, kind, payload}` | cualquier notificación nueva |
| `friend.presence` | `{userId, online}` | faro encendido/apagado (throttle 60 s) |
| `duel.invite` | `{duelId, by, formatId, difficulty, expiresAt}` | te retan |
| `duel.state` | `{phase, index?, endsAt?, you, opp}` | tick del duelo en vivo |
| `duel.finished` | `{result, scores}` | fin |
| `fleet.event` | `{kind, postId?}` | nuevo post en tu flota |
| `daily.open` | `{day}` | rollover (por si tienes la app abierta a medianoche) |

## 3. Protocolo de duelo LIVE (quiz/trivia/sprint/sinónimos)

Roles: el **servidor es el host**. Los clientes nunca calculan el estado.

```
 Estado WAITING: dos jugadores en la sala (matchmaking o reto directo)
   POST /realtime/duels/:id/ready          → ambos listos
   Servidor: status=ACTIVE, emite seed, fase countdown 3-2-1

 Para cada pregunta i (N total, p. ej. 10):
   Servidor → duel.state {phase:"question", index:i, endsAt: T_i}
              (payload del ejercicio SIN la respuesta correcta)
   Cliente  → POST /realtime/duels/:id/answer {index:i, choice, ms}
              servidor valida índice+ventana temporal y guarda
   Servidor → duel.state {phase:"answer", index:i,
                          correctIndex, you:{correct,combo}, opp:{correct:bool}}
              (a los dos, cuando ambos respondieron o expiró T_i)
   ... siguiente pregunta ...

 Fin → servidor calcula con scoring.ts → duel.finished
       winnerId (accuracy; desempate durationMs), TintaLedger, StatDaily,
       Notification DUEL_RESULT a ambos
```

Reglas de integridad:

1. `ms` lo mide el cliente pero el servidor **comprueba la ventana**:
   acepta respuestas hasta `endsAt + 800 ms` de gracia de red; el `ms`
   del cliente solo se usa para desempates si pasa el umbral de plausibilidad.
2. Doble respuesta a la misma `index` → 409, se guarda la primera.
3. Desconexión: el duelo sigue; al reconectar, `GET /duels/:id` da snapshot
   y el stream re-emite `duel.state` de la pregunta vigente. Si un jugador
   no responde 3 preguntas seguidas → abandono (pierde, sin castigo duro).
4. El payload de pregunta viaja **sin** `answerIndex` (se tira del pack
   en servidor antes de serializar).

## 4. Ajedrez y damas en vivo

- `POST /realtime/duels/:id/answer` reutilizado: `{index: nTurno, choice: {from, to, promotion}}`.
- Servidor valida con `chess.js` (ya en deps) sobre la partida canónica que
  guarda en `Duel.data`-equivalente (transcripción de movimientos en
  `DuelParticipant.transcript` del creador: los movimientos son la partida).
- **Reloj server-authoritative**: `endsAt` por turno (p. ej. 3 días por
  jugador estilo correspondencia, o 3 min total); el servidor calcula el
  consumo con timestamps propios. Bandera = derrota.
- Undo no existe (como el ajedrez real). Chat: QUICKMSG ("¡Buena jugada!").

## 5. Presencia de amigos ("faros encendidos")

- Al abrir la app con sesión → cliente conecta SSE → servidor marca
  `Session.lastSeenAt` cada ping. Presencia = sesión con ping < 90 s.
- `friend.presence` se emite a amigos conectados con **throttle de 60 s**
  (nada de spam de on/off). Tres estados: encendido (jugó hoy),
  brillante (jugando ahora), apagado.
- Coste ínfimo; sin más infraestructura.

## 6. Bus y escalado

```ts
// src/server/bus.ts — interfaz estable para toda la vida del producto
export interface Bus {
  publish(channel: string, ev: BusEvent): void;
  subscribe(channel: string, fn: (ev: BusEvent) => void): () => void;
}
// Fase A: MemoryBus (Map<string, Set<fn>>) — 30 líneas
// Fase B: RedisBus (pub/sub) — mismos canales: "user:<id>", "duel:<id>", "fleet:<id>"
```

Canales: `user:<userId>` (notif, invites), `duel:<duelId>`, `fleet:<fleetId>`.
Con RedisBus, cualquier instancia puede servir cualquier SSE; el estado del
duelo se lee de Postgres en cada tick (1 query por tick es asumible; cache
de 500 ms si hace falta).

## 7. Cliente (pseudocódigo del hook)

```ts
// src/hooks/use-realtime.ts
export function useRealtime() {
  useEffect(() => {
    if (!navigator.onLine || !authed) return;
    const es = new EventSource("/api/v1/realtime");
    es.addEventListener("msg", (e) => {
      const { seq, type, payload } = JSON.parse(e.data);
      if (seq !== lastSeq + 1) refetchSnapshot();     // hueco → resincronizar
      lastSeq = seq;
      handle(type, payload);                           // store de online-store.ts
    });
    return () => es.close();
  }, [authed]);
}
```

- La PWA **no** registra el SSE como tarea en background (no existe eso):
  las notificaciones reales cuando la app está cerrada quedan como email
  opcional (digest) y se estudia push web en una ola posterior.
