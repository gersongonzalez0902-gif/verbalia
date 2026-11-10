# 09 · Integración con el repositorio actual

## 1. Qué cambia en los archivos existentes (auditoría hecha sobre tu zip)

| Archivo actual | Cambio | Detalle |
|---|---|---|
| `src/middleware.ts` | **mínimo** | El CSP ya funciona con SSE same-origin. Solo: excluir `/api/v1/realtime` del matcher de buffering y permitir `Cache-Control` propio. Añadir matcher interno `/internal/cron` protegido por secreto |
| `src/services/storage.ts` | **medio** | Implementar la cola de sync que ya declara: `SyncQueueItem`, `enqueue()`, `drain()`, y guardar `seed` en `SessionRecord`. Añadir `updatedAt` a `SrsCard` (para LWW) |
| `src/store/game-store.ts` | **medio** | Hook en `onSessionComplete`: guardar transcript + encolar `progress/events`; al desbloquear logro, marcar `dirty` |
| `src/engine/*` | **nada o casi** | Ya puros y testeables. SOLO extraer `resolveSession(seed, formatId, transcript)` a `src/engine/online.ts` reutilizando `scoring.ts`/`xp.ts` |
| `src/data/content.ts` | **pequeño** | Exponer `EXERCISES_BY_DIFFICULTY` si aún no existe, para que el servidor construya sesiones por seed sin depender del cliente |
| `src/components/game/pwa.tsx` | **pequeño** | Al recuperar red → `drain()` de la cola; indicador "sincronizando" |
| `src/screens/settings.tsx` | **medio** | Nueva sección "Cuenta": login/registro, verificación, dispositivos, borrar cuenta, "sincronizar ahora", digest de email on/off |
| `src/screens/onboarding.tsx` | **nada** | El registro NUNCA se mete en el onboarding; aparece al usar una feature online (reto diario, duelos…) |
| `src/lib/crypto-vault.ts` | **decae** | Se mantiene 2 versiones como backup opcional; luego retirar |
| `src/app/api/vault/route.ts` | **decae** | Congelado (solo mantenimiento); no se amplía |
| `prisma/` (nuevo) | **nuevo** | `schema.prisma` de este paquete + `seed.ts` |
| `tests/` | **medio** | Nuevos tests de merge, replay anti-trampa y servicios (§5) |

**Conclusión importante**: la columna vertebral del juego (motores, datos,
pantallas de juego) **no se toca**. La capa online es aditiva.

## 2. Nueva estructura de carpetas

```
src/
├── server/                        # SOLO importable desde route handlers
│   ├── auth/
│   │   ├── password.ts            # scrypt (02-cuentas-auth.md §3)
│   │   ├── session.ts             # crear/validar/rotar sesiones
│   │   ├── tokens.ts              # verificación/reset (un solo uso)
│   │   └── guard.ts               # requireUser(), requireRole()
│   ├── bus.ts                     # interfaz Bus + MemoryBus
│   ├── mailer.ts                  # Resend vía fetch, plantillas es-ES
│   ├── ratelimit.ts               # token bucket en memoria
│   ├── cron.ts                    # jobs (daily-rollover, duel-sweeper...)
│   └── services/
│       ├── merge.ts               # mergePayload() puro ⭐ testeado
│       ├── progress.ts            # GET/PUT/import/events
│       ├── online-engine.ts       # construirSesion(seed) → preguntas sin respuesta
│       ├── daily.ts               # reto diario
│       ├── leaderboard.ts         # rankings semanales + percentiles
│       ├── friends.ts             # grafo + códigos de faro
│       ├── duels.ts               # async + resolución
│       ├── ghosts.ts
│       ├── fleets.ts              # flotas, misiones, tablón
│       ├── ugc.ts                 # forja + validación
│       ├── moderation.ts          # colas + acciones + audit
│       └── notifications.ts
├── app/api/v1/                    # route handlers delgados: zod → service → json
│   ├── auth/...  progress/...  daily/...  leaderboard/...
│   ├── friends/...  duels/...  ghosts/...  fleets/...  ugc/...
│   ├── realtime/route.ts          # SSE
│   └── internal/cron/[job]/route.ts
├── lib/api-client.ts              # cliente tipado (fetch + csrf + cola)
├── hooks/use-realtime.ts          # SSE (05-tiempo-real.md §7)
├── store/online-store.ts          # sesión, notificaciones, presencia, duelos en vivo
└── screens/
    ├── account.tsx                # pantalla de cuenta (desde settings)
    ├── social.tsx                 # amigos + faros + bandeja de duelos
    ├── fleet.tsx                  # flota + tablón + misión
    ├── daily-challenge.tsx        # reto del día
    ├── duel-live.tsx              # duelo en tiempo real
    └── forge-hub.tsx              # forja comunitaria (O6)
```

## 3. Dependencias a añadir

```jsonc
{
  // OBLIGATORIAS: ninguna nueva para O0–O3 (scrypt es node:crypto,
  // mail va por fetch, SSE es nativo). Prisma ya está.
  // OPCIONALES recomendadas:
  "@node-rs/argon2": "^2",   // si prefieres argon2id a scrypt (binarios precompilados)
  "pino": "^9",              // logs JSON (o console JSON a mano)
  "ioredis": "^5"            // SOLO en Fase B (RedisBus)
}
```

## 4. Variables de entorno (`.env.example`)

```bash
DATABASE_URL="postgresql://..."        # Neon / local
APP_URL="https://verbalia.app"         # para links de email
NODE_ENV="production"

# Cron externo (Fase B) o interno:
CRON_SECRET="openssl rand -hex 32"

# Email (Resend; sin SDK, vía fetch)
RESEND_API_KEY="re_..."
MAIL_FROM="Verbalia <hola@verbalia.app>"

# Opcionales Fase B
REDIS_URL=""
```

## 5. Plan de tareas por olas (checklists accionables)

### O0 · Infra (≈ 2–3 días)
- [ ] `prisma/schema.prisma` + `migrate dev --name init` + `seed.ts`
- [ ] `src/server/ratelimit.ts` (port del patrón de la bóveda)
- [ ] `/api/v1/health` + setup de logs JSON
- [ ] CI: lint + tests + `migrate deploy` en preview

### O1 · Cuentas y sync (≈ 1–2 semanas)
- [ ] `auth/password.ts`, `auth/session.ts`, `auth/tokens.ts`, `auth/guard.ts`
- [ ] Endpoints auth 1–13 (tabla 04-api.md)
- [ ] `mailer.ts` con 4 plantillas: verificar, bienvenida, reset, cambio email
- [ ] `services/merge.ts` **puro** + tests (§6)
- [ ] Endpoints progress 14–18
- [ ] Cola de sync en `storage.ts` + hook en `game-store.ts`
- [ ] Pantalla "Cuenta" + flujo "subir tu progreso local"
- [ ] `middleware.ts`: CSRF header check para `/api/v1`

### O2 · Reto diario + rankings + tinta server (≈ 1 semana)
- [ ] `engine/online.ts`: `buildSeededSession()` + `resolveSession()` + tests con las semillas congeladas de ejemplo
- [ ] `cron.ts`: `daily-rollover` + `duel-sweeper` + `token-sweep`
- [ ] Endpoints daily 19–21 + leaderboard 22
- [ ] `TintaLedger` en todos los pagos; tienda local passa a gastar via events
- [ ] Pantalla `daily-challenge.tsx` + grid compartible (Web Share)
- [ ] Racha oficial desde StatDaily

### O3 · Amigos + duelos async + fantasmas (≈ 1–2 semanas)
- [ ] `friends.ts` + códigos de faro + bloqueos; endpoints 23–27
- [ ] `duels.ts` async + matchmaking `quick`; endpoints 28–34
- [ ] `ghosts.ts`; endpoints 35–36; campo `seed` en SessionRecord
- [ ] Pantalla `social.tsx` (amigos, bandeja, retar) + overlay de fantasma en `game-screen.tsx`
- [ ] Notificaciones (tabla + endpoints 53)

### O4 · Flotas y aula (≈ 1 semana)
- [ ] `fleets.ts`: join por código, roles, tablón QUICKMSG/RECORD/CHALLENGE
- [ ] `cron.ts`: `fleet-weekly` (cierres, cofres, racha de flota)
- [ ] Endpoints 37–45; pantallas `fleet.tsx`
- [ ] Panel docente (agregados de StatDaily del grupo)

### O5 · Tiempo real (≈ 1–2 semanas)
- [ ] `bus.ts` (MemoryBus) + `GET /realtime` SSE + `use-realtime.ts`
- [ ] Protocolo duelo LIVE (05 §3) + endpoints 55–56
- [ ] Ajedrez/damas en vivo con `chess.js` server-side + reloj server
- [ ] Presencia de amigos (faros) con throttle
- [ ] Prueba de carga: 200 duelos concurrentes en staging

### O6 · Forja y moderación (≈ 2 semanas)
- [ ] `ugc-schema.ts` (zod por tipo) + endpoints 46–52
- [ ] Cola de moderación + reportes + AuditLog + pantalla admin
- [ ] Filtros automáticos (contactos, palabrotas es/419)
- [ ] Pantalla `forge-hub.tsx` (forjar, biblioteca, mis packs)
- [ ] `noindex` en rutas sociales

## 6. Estrategia de testing (aprovechar que ya hay Vitest)

| Suite | Qué prueba |
|---|---|
| `tests/merge.test.ts` | `mergePayload` con 12 escenarios: offline largo, dos dispositivos, logro duplicado, SRS conflicto, wallet |
| `tests/online-engine.test.ts` | `buildSeededSession` determinista (misma seed → mismas preguntas), `resolveSession` acepta transcripción buena y **rechaza** 8 mutaciones maliciosas (respuestas duplicadas, tiempos negativos, índices fuera de rango, replay del mismo transcript) |
| `tests/auth.test.ts` | scrypt roundtrip, caducidad de tokens, invalidación tras reset, anti-enumeración (mismo shape de respuesta) |
| `tests/services.*.test.ts` | Servicios contra DB de test (`docker compose` con Postgres efímero o Neon branch) |
| `tests/load/duel.ts` | Script k6: 200 SSE + 50 submits/s |

Regla de oro heredada del repo: **todo lo que decide XP/tinta/rankings es
función pura testeada**; los route handlers son solo pegamento.

## 7. Feature flags

```ts
// src/server/flags.ts — simple, DB-free, por env:
ONLINE_AUTH=on  ONLINE_DAILY=on  ONLINE_DUELS=on  ONLINE_FLEETS=off  ONLINE_UGC=off
```

Lanzamiento progresivo: flags por ola; en la app, las features apagadas
no muestran su entrada ni en el mapa ni en menús (sin "próximamente" fantasma).

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Farmeo de rankings con freeplay inventado | solo sesiones con seed server cuentan para rankings; freeplay con caps |
| Doble gasto de tinta offline | tinta online = ledger idempotente; compras offline pendientes se suben con `refId` |
| SSE muerto en proxies móviles | heartbeat 25 s + reconexión con snapshot; degradación a polling si 3 fallos |
| Cola de moderación desbordada | cierre temporal de envíos (§08-3); nunca publicar sin revisar |
| Email no llega (spam) | Resend con dominio verificado + SPF/DKIM; login funciona sin verificar |
| Migración de racha local injusta | la racha oficial online arranca en el día 1 online (comunicado como "nueva regata") |
| Cuentas duplicadas por email con mayúsculas | normalización en un solo punto (`normalizeEmail`) |
| Abandono de la identidad offline | el juego local sigue siendo 100 % jugable sin cuenta; el modo offline queda intacto |

## 9. Orden de trabajo recomendado (si eres una persona sola)

Semana 1–2: O0 + O1 (el 60 % del valor). Semana 3: O2. Semana 4: O3.
→ **Con O3 cerrado tienes producto online completo** (cuentas, sync, reto
diario viral, rankings, amigos, duelos, fantasmas). O4–O6 son expansión.
