# 01 · Arquitectura

## 1. Diagrama general

```
                        ┌─────────────────────────────────────────────┐
                        │              VERBALIA (Next.js 16)          │
  PWA cliente           │                                             │
┌───────────────┐ HTTP  │  ┌──────────────┐   ┌─────────────────────┐  │
│  App actual   ├──────►│  │ /api/v1/*    │──►│  src/server/*       │  │
│  (React/PWA)  │       │  │ route        │   │  services puros +   │  │
│  IndexedDB    │  SSE  │  │ handlers     │   │  reglas de negocio  │  │
│  store local  │◄──────┤  └──────────────┘   └─────────┬───────────┘  │
│  cola offline │       │        │                       │              │
└───────────────┘       │  ┌─────▼───────┐         ┌─────▼──────────┐   │
                        │  │ Bus (SSE)   │         │ Prisma Client  │   │
                        │  │ in-memory   │         └─────┬──────────┘   │
                        │  └─────────────┘               │              │
                        │  ┌─────────────┐         ┌─────▼──────────┐   │
                        │  │ Mailer      │         │   PostgreSQL   │◄─┼── Neon / gestionado
                        │  │ (Resend/SMTP│         └────────────────┘   │
                        │  └─────────────┘                              │
                        │  ┌─────────────┐                              │
                        │  │ Cron (ver §7)│  rollover diario, expiraciones│
                        │  └─────────────┘                              │
                        └─────────────────────────────────────────────┘
```

Un solo despliegue. No hay microservicios. Todo lo que ya es puro y testeado
en `src/engine` se reutiliza **tal cual** en el servidor (mismo paquete TS).

## 2. Componentes

| Componente | Dónde vive | Responsabilidad |
|---|---|---|
| Route handlers | `src/app/api/v1/**` | HTTP: parseo zod, guard de sesión, respuesta JSON |
| Servicios | `src/server/services/*.ts` | Reglas de negocio puras respecto a DB (progress, duels, friends, fleets, leaderboard, daily, ugc, notifications) |
| Auth | `src/server/auth/*` | scrypt, tokens, sesiones, guard `requireUser()` |
| Bus SSE | `src/server/bus.ts` | Pub/sub en memoria para eventos en vivo (interfaz sustituible por Redis) |
| Mailer | `src/server/mailer.ts` | Envío de verificación/reset (Resend vía `fetch`, sin SDK) |
| Rate limit | `src/server/ratelimit.ts` | Token bucket en memoria por (ruta, userId\|IP) — patrón ya usado en la bóveda |
| Cron | `src/server/cron.ts` + una llamada protegida | Rollover diario, expiración de duelos, barrido de tokens, job de outliers |

## 3. Alternativas evaluadas y por qué se descartan

| Opción | Veredicto | Motivo |
|---|---|---|
| Auth.js / NextAuth | Descartada (por ahora) | Cero dependencias nativas y control total; con scrypt + cookies opacas son ~200 líneas testeables. Se puede migrar después si llega OAuth múltiple |
| Supabase (BaaS completo) | Descartada | Añade un segundo lugar de verdad (su auth + tu DB), RLS duplicando reglas, y vendor lock |
| Socket.io / WS dedicado | Descartado en O5 inicial | Los duelos son por turnos cortos y server-tick: SSE + POST es suficiente, pasa el CSP intacto y sobrevive a proxies móviles mejor |
| PartyKit / Durable Objects | Aplazada | Excelente para escala, pero prematuro; el Bus tiene interfaz para enchufarlo |
| SQLite | Descartada | Multi-instancia y rankings concurrentes piden Postgres desde el día 1 |

## 4. Modelo de ejecución y escalado

- **Fase A (hasta ~miles de usuarios activos)**: 1 instancia Node (Railway /
  Fly / VPS). Bus en memoria. SSE por conexión: presupuesto realista
  1–2k conexiones concurrentes (cada una ~10 KB de RAM + heartbeat 25 s).
- **Fase B**: Redis pub/sub como backend del Bus (interfaz ya definida:
  `publish(channel, event)` / `subscribe(channel, handler)`). Con Redis, las
  instancias son intercambiables sin sticky sessions (el estado del duelo
  vive en Postgres, el Bus solo notifica).
- El estado de duelo es **Postgres-first**: la fila `Duel` + `DuelParticipant`
  es la verdad; el Bus solo empuja "algo cambió". Un cliente que se
  reconecta hace `GET /duels/:id` y queda sincronizado sin estado en RAM.

## 5. Anti-trampa (diseño en profundidad)

Principio: **el cliente nunca calcula la puntuación que cuenta**.

1. **Contenido con semilla del servidor**: todo lo puntuado online (reto
   diario, duelos, torneos) usa `seed = f(dayKey|duelId)` que el servidor
   emite. El mismo `createRng` de `src/engine/rng.ts` selecciona ejercicios.
2. **Transcripción + re-simulación**: el cliente envía
   `{ answers: [{ i, choice, ms }], durationMs }` (índices y tiempos, nunca
   texto libre). El servidor ejecuta `resolveSession(seed, formatId,
   transcript)` (nuevo módulo puro en `src/engine/online.ts`, reutiliza
   `scoring.ts` y `xp.ts`) y obtiene la puntuación oficial. Transcripción
   inválida → rechazo + contador de strikes en el usuario.
3. **Suelos y techos de tiempo**: `ms` por respuesta ≥ 120 ms (humano); combo
   máximo plausible por formato; `durationMs` ≥ suma mínima. Parámetros por
   formato en una tabla de constantes (testeable).
4. **Topes diarios** online (igual que el arcade ya hace con `dailyXpCap`):
   XP y tinta online tienen cap por día por fuente.
5. **Outliers (job nocturno)**: media móvil de accuracy/tiempo por usuario;
   señales → `User.riskFlags`. Revisión humana, nunca baneo automático.
6. **Idempotencia**: `POST` que otorgan recompensas aceptan
   `Idempotency-Key`; la fila de `TintaLedger` usa `@@unique([userId, refId])`.
7. **Rachas y rankings server-side**: la racha "oficial" de rankings se
   calcula desde `StatDaily` (días con ≥1 sesión validada), no desde el
   cliente.

## 6. Seguridad global

- **Cookies de sesión**: `httpOnly; Secure; SameSite=Lax; Path=/; Max-Age=30d`
  (rolling). El token en DB está hasheado con SHA-256.
- **CSRF**: SameSite=Lax + exigir `Content-Type: application/json` y cabecera
  custom `x-verbalia-csrf` en todos los POST/PATCH/DELETE. Sin formularios
  cross-site no hay superficie.
- **Cabeceras**: el `middleware.ts` actual ya es excelente (CSP estricta,
  HSTS, COOP/CORP). Se mantiene; con SSE same-origin **no hay que abrir
  `connect-src`**. Único cambio: excluir `/api/v1/realtime` del buffering
  (ver 05-tiempo-real.md).
- **Validación**: zod en el borde de TODA entrada (patrón de la bóveda).
- **Rate limits** por ruta (ver 04-api.md) con buckets en memoria.
- **AuditLog**: toda acción de moderación/admin queda registrada con actor.
- **Anonimización en borrado**: ver 02-cuentas-auth.md §7.

## 7. Tareas programadas (cron)

| Job | Frecuencia | Qué hace |
|---|---|---|
| `daily-rollover` | 00:00 UTC | Materializa fila `DailyChallenge` del día (seed determinista), notifica recordatorio opcional |
| `duel-sweeper` | cada 10 min | Duelos `WAITING`/`ACTIVE` vencidos → `EXPIRED`; resuelve duelos async y reparte recompensas |
| `token-sweep` | cada hora | Tokens de verificación/reset caducados fuera |
| `fleet-weekly` | lunes 00:00 UTC | Cierra misión semanal, paga cofres, crea la siguiente |
| `outlier-job` | diario | Detección estadística → `riskFlags` |
| `notify-digest` | opcional diario | Email de resumen si el usuario lo activó |

Implementación: un `setInterval` en el proceso (suficiente con 1 instancia)
o un cron externo que llama a `POST /api/v1/internal/cron/:job` con secreto
de cabecera (para Fase B multi-instancia). Ambos caminos llaman al mismo
`src/server/cron.ts`.

## 8. Despliegue y costes estimados

| Fase | Infra | Coste mensual aprox. |
|---|---|---|
| O0–O3 | 1 instancia Next + Postgres Neon free | 0–7 € |
| O4–O5 | Instancia algo mayor + Neon Launch | 10–25 € |
| O6 con UGC | + cola de moderación (mismo DB) | igual |
| Escala (10k+ MAU) | 2 instancias + Redis + Postgres escalado | 50–120 € |

- Email: Resend free tier (3.000/mes) sobra para arrancar.
- Backups: Postgres gestionado con PITR (Neon lo trae desde planes bajos).
- Dominio + TLS termina en el PaaS.

## 9. Observabilidad mínima

- Logs estructurados JSON en servidor (`pino` opcional o `console.log` JSON):
  un línea por request con `route, userId, ms, status`.
- `GET /api/v1/health` → `{ db: true, bus: true, version }`.
- Métricas de producto ya salen gratis de `StatDaily` (DAU por sesión
  validada, reto diario jugado, duelos creados, etc.).
