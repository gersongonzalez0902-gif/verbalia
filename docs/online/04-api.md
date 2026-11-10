# 04 · API REST · contratos `/api/v1`

## 1. Convenciones

- Base: `/api/v1`. JSON en todo el cuerpo (POST/PUT/PATCH con
  `Content-Type: application/json` + cabecera `x-verbalia-csrf`).
- **Auth**: cookie de sesión (02-cuentas-auth.md). `requireUser()` en guard.
- **Validación**: zod en el borde; error de validación → 400 con detalles.
- **Errores** uniformes:
  ```json
  { "error": { "code": "duel_not_joinable", "message": "Este duelo ya no acepta jugadores" } }
  ```
- **Rate limit** (bucket en memoria): cabeceras `X-RateLimit-Remaining`;
  excedido → 429 + `Retry-After`.
- **Idempotencia**: los POST que otorgan recompensas aceptan
  `Idempotency-Key` (se refleja en `TintaLedger.refId`).
- **Paginación** por cursor: `?cursor=<id>&limit=20` →
  `{ items: [...], nextCursor: "..." | null }`.
- **Hora**: todo `day`/`weekKey` en UTC (`dateKey` del motor ya lo hace).

## 2. Tabla maestra de endpoints

Auth → detalle en 02-cuentas-auth.md. Auth = cookie de sesión salvo marcados 🔓 públicos.

### Cuentas
| # | Método · Ruta | Body → Respuesta | RL |
|---|---|---|---|
| 1 | POST `/auth/register` | `{email, password, displayName}` → `{user, needsVerification}` | 5/h·IP |
| 2 | POST `/auth/login` | `{email, password}` → `{user}` | 10/15m |
| 3 | POST `/auth/logout` | → `{ok}` | — |
| 4 | GET `/auth/me` 🔓 | → `{user \| null}` | — |
| 5 | POST `/auth/verify` | `{token}` → `{ok}` | 10/h |
| 6 | POST `/auth/resend-verification` | → `{ok}` | 3/h |
| 7 | POST `/auth/password/forgot` | `{email}` → siempre `{ok}` | 3/h·IP |
| 8 | POST `/auth/password/reset` | `{token, password}` → `{ok}` | 10/h |
| 9 | POST `/auth/password/change` | `{current, next}` → `{ok}` | 5/h |
| 10 | POST `/auth/email` | `{newEmail, password}` → `{ok}` | 3/h |
| 11 | GET `/auth/sessions` | → `{items}` | — |
| 12 | DELETE `/auth/sessions/:id` | → `{ok}` | 10/h |
| 13 | DELETE `/auth/account` | `{password}` → `{ok}` | 2/día |

### Progreso y estadísticas
| # | Método · Ruta | Body → Respuesta | RL |
|---|---|---|---|
| 14 | GET `/progress` | → `{version, payload, updatedAt}` | — |
| 15 | PUT `/progress` | `{baseUpdatedAt, payload}` → `{merged, updatedAt, conflicts?}` | 30/h |
| 16 | POST `/progress/import` | `{payload}` → `{merged, updatedAt}` (una vez) | 3/día |
| 17 | POST `/progress/events` | `{session: {formatId, seed?, transcript}}` → `{validated: {xp, tinta, flags}, statDelta}` | 60/h |
| 18 | GET `/stats/me?window=7d` | → `{days: StatDaily[], streakOfficial}` | — |

### Reto diario
| # | Método · Ruta | Body → Respuesta | RL |
|---|---|---|---|
| 19 | GET `/daily` 🔓 | → `{day, formatId, difficulty, seed, played?, stats}` | — |
| 20 | POST `/daily/submit` | `{transcript}` + `Idempotency-Key` → `{score, accuracy, bestCombo, rank, percentile, tinta}` | 5/día |
| 21 | GET `/daily/leaderboard?day&scope=global\|friends\|fleet` | → `{items: [{user, score, accuracy}], me}` | — |

### Rankings
| # | Método · Ruta | Body → Respuesta | RL |
|---|---|---|---|
| 22 | GET `/leaderboard?metric=xp\|correct\|combo\|streak&window=current\|last&scope=global\|friends\|fleet` | → `{items, me: {rank, percentile}}` | — |

### Amigos
| # | Método · Ruta | Body → Respuesta | RL |
|---|---|---|---|
| 23 | GET `/friends` | → `{friends: [{user, presence, streak}], incoming, outgoing}` | — |
| 24 | POST `/friends` | `{code \| handle}` → `{friendship, user}` | 20/h |
| 25 | PATCH `/friends/:id` | `{action: accept\|remove\|block}` → `{ok}` | 30/h |
| 26 | GET `/friends/code` | → `{farocode}` | — |
| 26b | PATCH `/friends/code` | → regenera `{farocode}` (si se filtró en una pizarra) | 2/día |
| 27 | GET `/friends/ghosts?formatId&difficulty` | → fantasmas jugables de amigos | — |

### Duelos
| # | Método · Ruta | Body → Respuesta | RL |
|---|---|---|---|
| 28 | POST `/duels` | `{mode, formatId, difficulty, opponentUserId?, stakeTinta?}` → `{duel, seed?}` | 20/h |
| 29 | POST `/duels/quick` | `{formatId, difficulty}` → `{duel}` (matchmaking async por nivel) | 20/h |
| 30 | GET `/duels?box=inbox\|sent\|finished` | → `{items}` | — |
| 31 | GET `/duels/:id` 🔓* | → `{duel, participants, myEntry?}` (*solo participantes o creador) | — |
| 32 | POST `/duels/:id/accept` | → `{duel, seed}` | 30/h |
| 33 | POST `/duels/:id/submit` | `{transcript}` + Idem-Key → `{result, tinta?}` | 5/duelo |
| 34 | POST `/duels/:id/cancel` | → `{ok}` (solo creador, si WAITING) | — |
| 35 | POST `/ghosts` | `{formatId, difficulty, transcript, isPublic}` → `{ghostRun}` | 10/día |
| 36 | GET `/ghosts?formatId&difficulty&scope=global` | → `{items}` (públicos + amigos) | — |

### Flotas
| # | Método · Ruta | Body → Respuesta | RL |
|---|---|---|---|
| 37 | POST `/fleets` | `{name, tag, isClassroom?}` → `{fleet}` (crea y entra) | 2/día |
| 38 | POST `/fleets/join` | `{code}` → `{fleet}` | 10/h |
| 39 | GET `/fleets/mine` | → `{memberships}` | — |
| 40 | GET `/fleets/:id` | → `{fleet, members, mission, posts(cursor)}` | — |
| 41 | PATCH `/fleets/:id` | `{name?, tag?, isClassroom?}` (OWNER) | 5/h |
| 42 | POST `/fleets/:id/leave` · POST `/fleets/:id/kick` `{userId}` (OFFICER+) | | 10/h |
| 43 | POST `/fleets/:id/posts` | `{kind, body?, payload?}` → `{post}` | 30/h |
| 44 | POST `/fleets/:id/rotate-code` | (OWNER) → `{code}` | 5/día |
| 45 | POST `/fleets/:id/mission/claim` | → `{tinta}` (idempotente por usuario) | — |

### UGC · La Forja (06) y Moderación (08)
| # | Método · Ruta | Body → Respuesta | RL |
|---|---|---|---|
| 46 | GET `/ugc/packs?type&sort=new\|helpful&cursor` 🔓 (solo PUBLISHED) | → `{items}` | — |
| 47 | POST `/ugc/packs` | `{type, title, payload, difficulty, tags}` → `{pack}` (status REVIEW) | 3/día* |
| 48 | GET `/ugc/packs/:id` 🔓 | → `{pack}` | — |
| 49 | POST `/ugc/packs/:id/rate` | `{stars}` → `{ok}` | 1/pack |
| 50 | POST `/ugc/packs/:id/plays` | `{correct, intent}` (agregado al terminar) | 20/h |
| 51 | POST `/ugc/packs/:id/report` · POST `/reports` genérico | `{reason, details?}` → `{ok}` | 10/día |
| 52 | GET `/ugc/mine` | → `{items}` | — |
| 53 | GET `/notifications?unread` → `{items}` · POST `/notifications/read` `{ids}` | | — |

### Tiempo real (SSE) y torneos
| # | Método · Ruta | Nota |
|---|---|---|
| 54 | GET `/realtime` | stream SSE autenticado (protocolo en 05-tiempo-real.md) |
| 55 | POST `/realtime/duels/:id/answer` | respuesta de duelo LIVE `{index, choice, ms}` |
| 56 | POST `/realtime/duels/:id/ready` · `/leave` | gestión de sala |
| 57 | GET `/tournaments` · POST `/tournaments/:id/register` 🔓* | *email verificado |

### Internos
| # | Método · Ruta | Nota |
|---|---|---|
| 58 | GET `/health` 🔓 | liveness |
| 59 | POST `/internal/cron/:job` | cabecera `x-cron-secret` |

*RL = rate limit. Todos los POST requieren CSRF header.

## 3. Ejemplos de los contratos críticos

### 3.1 `POST /progress/events` — subir una sesión jugada (el corazón anti-trampa)

```jsonc
// Request
{
  "session": {
    "formatId": "trivia",            // GameId
    "origin": "freeplay",            // "freeplay" | "daily" | "duel:duelId" | "ghost:runId"
    "seed": null,                    // en freeplay la eligió el cliente (solo cuenta con caps)
    "durationMs": 214500,
    "transcript": { "answers": [ { "i": 0, "choice": 2, "ms": 1830 },
                                  { "i": 1, "choice": 0, "ms": 940 } ] }
  }
}

// Response 200
{
  "validated": { "xp": 46, "tinta": 4, "accuracy": 0.83, "bestCombo": 7 },
  "statDelta": { "day": "2026-11-10", "xp": 46, "answers": 12, "correct": 10 },
  "flags": []                        // ["timing_floor", "implausible_combo"] → riskFlags++
}
```

Servidor: si `origin ≠ freeplay`, re-simula con la seed del servidor y **su**
puntuación es la válida (replay con `engine/online.ts`). En `freeplay` valida
suelos/techos y aplica tope diario (p. ej. 150 XP/día de freeplay subida).

### 3.2 `POST /daily/submit`

```jsonc
// Request  (la seed ya se obtuvo en GET /daily)
{ "transcript": { "answers": [ /* ... */ ] } }

// Response
{
  "score": 9, "accuracy": 0.9, "bestCombo": 6,
  "rank": 132, "percentile": 91.4,
  "tinta": 15,
  "share": "🟩🟩🟨⬜🟩🟩🟩🟨🟩🟩 9/10 · combo 6 · Verbalia 10-nov"  // grid listo para copiar
}
```

### 3.3 Duelo asíncrono — ciclo completo

```
A: POST /duels        {mode:"ASYNC", formatId:"sinonimos", difficulty:3}
   → {duel:{id,status:"WAITING",expiresAt}, seed:null}   // seed se revela al aceptar
A: POST /duels (opponentUserId: B)  → Notification DUEL_INVITE a B
B: POST /duels/:id/accept           → {duel:{status:"ACTIVE"}, seed:"duel:cuid:v1"}
A: juega → POST /duels/:id/submit {transcript} → {result:"pending"}   // guarda su entrada
B: juega → POST /duels/:id/submit {transcript} → {result:"win", tinta:20}
   // el sweeper/último submit resuelve: gana accuracy; desempate durationMs
   // Notificación DUEL_RESULT a ambos + entrada en StatDaily
```

### 3.4 `POST /friends`

```jsonc
// Request — por código de faro o handle
{ "code": "ALBO-3721" }

// Response 201
{ "friendship": { "id": "...", "status": "PENDING" },
  "user": { "handle": "marina-3721", "displayName": "Marina", "avatar": "preset:buhito" } }
```

Errores: `not_found`, `already_friends`, `blocked` (genérico `not_found`
si el otro bloqueó — sin filtrar información).

### 3.5 `POST /fleets/:id/mission/claim`

```jsonc
// Response 200 (idempotente: segunda llamada → 200 {tinta: 0, already: true})
{ "tinta": 30, "already": false }
// 403 fleet_mission_not_done si la flota no cumplió el objetivo
```

## 4. Códigos de error estables

| code | HTTP | Uso |
|---|---|---|
| `unauthorized` / `forbidden` | 401 / 403 | sin sesión / sin permiso (rol, flota) |
| `validation_error` | 400 | zod falló (detalles en `meta`) |
| `not_found` | 404 | genérico (también para bloqueados) |
| `conflict_outdated` | 409 | PUT /progress con base vieja → devuelve `merged` |
| `rate_limited` | 429 | con `Retry-After` |
| `rejected_invalid_transcript` | 422 | anti-trampa: la re-simulación no cuadra |
| `daily_already_played` | 409 | segundo submit del día (sin castigo) |
| `duel_not_joinable` · `duel_expired` | 409/410 | estado del duelo |
| `email_unverified` | 403 | acciones que lo exigen |
| `fleet_full` · `fleet_code_invalid` | 409/404 | |
| `ugc_validation_failed` | 422 | payload de pack no pasa los zod de ejercicios |
