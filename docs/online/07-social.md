# 07 · Social: amigos, duelos, fantasmas, flotas, aula, torneos

## 1. Códigos de faro (añadir amigos)

- Formato: `XXXX-NNNN` — 4 letras del alfabeto sin ambigüedad
  (`ABCDEFGHJKLMNPQRSTUVWXYZ` sin I/O) + 4 dígitos sin 0/1 → ~1.6M combinaciones,
  suficiente y legible en voz ("Alfa, Lima, Bravo, Oso — tres, siete, dos, uno").
- Derivado aleatorio (no del id: no debe ser enumerable). Regenerable
  (`POST /fleets/:id/rotate-code` análogo: `/friends` no necesita rotación,
  pero `PATCH /friends/code` puede regenerarlo si se filtró en una pizarra).
- Añadir por código **o** por handle. Ambos crean petición `PENDING`;
  el otro acepta. Límite: 100 amigos, 50 peticiones entrantes.
- Bloqueo: el bloqueado ve `not_found` en todo (sin filtrar que existe).

## 2. Presencia (faros)

| Estado | Significado |
|---|---|
| 🟢 Brillante | conectado ahora (SSE activo) |
| 🟡 Encendido | jugó hoy (≥1 sesión validada) |
| ⚪ Apagado | resto |

Sin "última conexión" exacta (privacidad): solo hoy/ayer/fechas antiguas.

## 3. Duelos asíncronos (el caballo de batalla)

- Creación: formato + dificultad + oponente (amigo) o matchmaking
  (`POST /duels/quick`: cola por `formatId+difficulty`, empareja por nivel
  MCER/level ±1; >5 min esperando → empareja con el que haya).
- Semilla emitida **al aceptar** (no al crear) para evitar preparación.
- Ventana de juego: 48 h. `duel-sweeper` expira y notifica.
- Resolución: gana `accuracy` del replay; desempata `durationMs` (más rápido);
  si empate exacto → tablas (`DUEL_TIE` a ambos).
- Recompensa: victoria 20 tinta / tablas 10; cap 60 tinta/día por duelos.
  Derrota: 5 de consuelo (que jugar duelos ya es práctica).
- Antitrampa: replay completo en submit (04-api.md §3.1).

## 4. Carreras fantasma (Regatas)

- `POST /ghosts` tras una sesión granjera con seed conocida (el cliente
  guarda la semilla de cada sesión en `SessionRecord` — campo nuevo
  `seed?`): guarda transcripción + resumen, `isPublic` opt-in.
- Jugar un fantasma: eliges `formatId+difficulty` → lista de fantasmas
  (amigos primero, públicos después, marcados los tuyos) → juegas la
  misma seed con el overlay del fantasma avanzando según sus `ms`.
- No hay recompensa por batir fantasmas de extraños (anti-grind), sí
  notificación `GHOST_BEATEN` si es de un amigo (¡y se comparte en el
  tablón como RECORD!).

## 5. Flotas

- Máx. 30 miembros (aula: hasta 50). Roles OWNER/OFFICER/MEMBER.
- Un usuario puede estar en **una** flota (identidad y lealtad; simplifica
  misiones). Salir → enfriamiento 7 días para fundar otra (anti-rota-flotas).
- **Tablón** (única "conversación"): posts de tipo RECORD (récord, fantasma,
  logro), CHALLENGE (reto con semilla adjunta), QUICKMSG (frase predefinida
  en español: "¡Bien dicho!", "¡Qué combo!", "¡Bienvenido a bordo!").
  Sin cuerpo libre inicialmente → cero moderación de texto, cero toxicidad.
  (v2: texto libre 280 chars con filtros si la comunidad madura.)
- **Misión semanal de flota**: objetivo = métrica agregada de todos los
  miembros (sum de `StatDaily`), escala con miembros: `target = base × √n`.
  Ej.: "Acertar 3.000 respuestas esta semana". Cumplida → cofre: 30 tinta
  por miembro activo (≥3 sesiones esa semana) + cosmético de flota si
  4 semanas seguidas.
- **Racha de flota**: cuenta como cumplida si ≥50 % de activos jugaron;
  pierde escudo de flota si no (los escudos de flota se compran con cofres).
  Anti-ansiedad colectiva, muy potente para clases.

## 6. Modo aula (la palanca de adopción)

- `Fleet.isClassroom = true` cambia tres cosas:
  1. El OWNER ve **panel docente**: progreso agregado por habilidad y
     día del grupo (percentiles, no contenidos privados), quién jugó hoy,
     misiones cumplidas. Sin notas individuales de error (eso es íntimo).
  2. Sin presence pública fuera del aula; sin duelos entre alumnos
     forzados (opcional el docente puede crear torneos de clase).
  3. Códigos rotables y regenerables por si la pizarra viaja.
- Cero datos personales de menores: el docente nunca ve emails, solo
  handles pseudónimos. El menor necesita email para la cuenta — el flujo
  recomendado en clase: cuenta con email del centro o del familiar
  (decisión de producto documentada en 08-ugc-moderacion.md §5).

## 7. Reto del día compartible

- `GET /daily` → formato rota (`engine/online.ts` tabla de rotación de 7 días:
  lunes trivia, martes cloze...), dificultad 2–4, seed `daily:<day>`.
- Submit → grid de emojis + enlace `?daily=2026-11-10` que abre el reto
  a quien lo reciba (Web Share API). La comparación social sin login:
  el grid es texto puro.
- Racha de reto diario aparte (badge propio en perfil).

## 8. Torneos asíncronos

- Bracket 8/16 sobre duelos ASYNC: registro abierto 48 h (`REGOPEN`),
  bracket generado por nivel, cada ronda = duelo de 48 h, el sweeper
  resuelve. Notificaciones por ronda. Premio: título temporal
  ("Regatista de la semana") + tinta.
- `Tournament.data` guarda el bracket JSON; los duelos de cada match se
  crean internamente y se enlazan.

## 9. Notificaciones (catálogo)

| kind | Payload típico | Se emite por |
|---|---|---|
| FRIEND_REQUEST | `{by, handle}` | POST /friends |
| DUEL_INVITE | `{duelId, by, formatId, expiresAt}` | reto directo |
| DUEL_RESULT | `{duelId, result, opp}` | resolución |
| FLEET_MISSION_DONE | `{fleetId, tinta}` | fleet-weekly |
| GHOST_BEATEN | `{runId, by}` | replay de fantasma |
| UGC_PUBLISHED / UGC_MODERATED | `{packId}` | forja |
| DAILY_REMIND | `{streak}` | cron opcional (solo si activado) |

Entrega: SSE en vivo + lista en app + (opcional) email digest diario.
Sin push web en v1 (es frágil en iOS PWA; se evalúa en O6).

## 10. Perfil público (`/navegante/<handle>`)

- Muestra: displayName, avatar+marco, banner, bio, logro destacado,
  nivel, racha actual, títulos, flota, 3 logros recientes.
- **No muestra**: email, stats íntimas (mapas de error), historial de
  sesiones. Botón "Retar" y "Añadir al faro". `noindex` en cabecera.
