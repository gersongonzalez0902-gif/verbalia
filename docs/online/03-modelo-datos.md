# 03 · Modelo de datos: recorrido y decisiones

El esquema completo está en `schema.prisma`. Aquí el *porqué* de cada dominio
y las decisiones que afectan a cómo se consulta y se limpia.

## 1. Principios

1. **Una sola verdad por cosa**: el progreso íntegro vive en `ProgressState`
   (espejo del IndexedDB); las métricas que alimentan rankings y flotas viven
   en `StatDaily` (solo de sesiones validadas). No se deduce una de la otra.
2. **Agregados, no eventos salvo donde importa**: el juego local es
   event-sourced de facto (el payload); el servidor solo necesita día a día.
   Excepción: la **tinta** sí es libro mayor (`TintaLedger`) porque es
   economía transferible y necesita idempotencia y auditoría.
3. **Contenido sensible con caducidad**: transcripciones de duelos/reto
   diario se purgan a los 30 días (solo quedan los números).
4. **Borrado sin romper rankings**: las filas estadísticas sobreviven al
   usuario anonimizado (el ranking histórico no colapsa).

## 2. Dominios y relaciones clave

```
User ──1:1── ProgressState          (progreso íntegro, JSON)
User ──1:N── StatDaily              (métricas diarias validadas)
User ──1:N── TintaLedger            (economía idempotente)
User ──N:M── User                   (Friendship, UserBlock)
User ──N:M── Duel  (DuelParticipant)
User ──N:M── Fleet (FleetMember) ── FleetMission / FleetPost
User ──1:N── GhostRun               (fantasmas propios)
User ──1:N── UgcPack ── UgcRating
User ──1:N── Report (como reportante) · AuditLog (como actor)
User ──1:N── Notification
DailyChallenge ──1:N── DailyChallengeEntry
Tournament ──1:N── TournamentEntry
```

## 3. Decisiones por tabla (las no obvias)

| Tabla | Decisión | Por qué |
|---|---|---|
| `User.handle` | único, autogenerado `slug-nnnn`, editable | Identidad estable sin exponer email; evita colisiones de displayName |
| `User.farocode` | único, formato `AAAA-NNNN` sin caracteres ambiguos (sin 0/O, 1/I) | UX de escribirlo en voz o por papel en clase |
| `Session` | guarda `tokenHash`, `lastSeenAt`, `deviceHint` | Presencia de "faros" y gestión de dispositivos sin almacenar IPs completas |
| `ProgressState.payload` | JSONB del `PersistedState` v1 actual | Reutiliza el modelo local tal cual; la evolución de schema ya tiene `migrate.ts` |
| `StatDaily.byGame` | JSONB `{gameId: {plays, correct}}` | Misiones de flota por formato sin tabla aparte |
| `TintaLedger.@@unique([userId, refId])` | idempotencia por referencia | Reintentos de red no duplican recompensas; `refId=null` para ajustes manuales |
| `DailyChallenge` materializada | fila por día con seed | Auditable y estable aunque cambie el código (nunca recalculas el pasado) |
| `Duel.winnerId` | nullable en `Duel` | Empates reales; desempate por tiempo ya está en `DuelParticipant.durationMs` |
| `GhostRun.isPublic` | opt-in por run | Público global o solo amigos; el autor controla cada fantasma |
| `FleetPost.kind=QUICKMSG` | sin cuerpo libre obligatorio | Comunicación sin chat: frases predefinidas en español |
| `UgcPack.correctSum/intentSum` | rating implícito | "El pack ayudó a acertar el 82%" — más honesto que estrellas solas |
| `Report` | sin FK al objetivo (polimórfico) | Un reporte apunta a UGC, perfil, post o duelo |
| `AuditLog` | actor nullable (`SetNull`) | La auditoría sobrevive al borrado de la cuenta del moderador |

## 4. Índices que sostienen las consultas calientes

| Consulta | Índice |
|---|---|
| Ranking semanal global por XP | `StatDaily(day, xp)` filtrando por rango de días en la query |
| Ranking de flota | join `FleetMember × StatDaily` por `day` |
| Bandeja de duelos activos | `Duel(status, expiresAt)` + `DuelParticipant(userId)` |
| Cola de moderación | `UgcPack(status, type)` |
| Notificaciones no leídas | `Notification(userId, readAt, createdAt)` |
| Buscar pack publicado | `UgcPack(status, type)` + orden por `correctSum/intentSum` |

Para el ranking semanal se agrega en la query (`GROUP BY userId SUM(xp)`)
sobre 7 filas/usuario — sin necesidad de materializar. Si escala, snapshot
semanal en una tabla `LeaderboardSnapshot` (cabe en una tarde).

## 5. Retención y limpieza (cron)

| Dato | Vida | Acción |
|---|---|---|
| `transcript` en DuelParticipant / DailyChallengeEntry | 30 días | `UPDATE ... SET transcript = NULL` |
| Duelos `EXPIRED` con solo 1 participante | 90 días | delete (mantiene estadísticas agregadas del otro) |
| Notification leídas | 60 días | delete |
| VerificationToken expirados | barrido horario | delete |
| GhostRun sin replay en 180 días | 180 días | delete (opt-out del autor) |
| FleetPost | 90 días | archive/delete (los RECORD se convierten en logros del perfil si aplica) |

## 6. Migraciones y evolución

- `prisma migrate dev` en desarrollo; `migrate deploy` en producción (CI).
- `ProgressState.version` + el `engine/migrate.ts` existente gobiernan la
  forma del payload JSON; el esquema de tablas es estable por diseño.
- Semilla de desarrollo: `prisma/seed.ts` con 20 usuarios fake, flota, duelos
  y un pack UGC para probar pantallas sin jugar 40 horas.
