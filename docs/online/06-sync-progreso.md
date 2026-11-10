# 06 · Sincronización de progreso

## 1. Modelo de tres piezas

| Pieza | Dónde vive | Qué es |
|---|---|---|
| `ProgressState.payload` | servidor (JSONB) | el `PersistedState` de `storage.ts` (profile + core + srs + settings) |
| Estado local | IndexedDB | la verdad operativa para jugar |
| `StatDaily` + `TintaLedger` | servidor | métricas validadas y economía online |

El cliente juega siempre contra lo local. El servidor es el **espejo de
respaldo y la autoridad** para rankings, recompensas online y multi-dispositivo.

## 2. Cuándo se sincroniza

| Momento | Acción |
|---|---|
| Fin de cada sesión (`onSessionComplete` en `game-store`) | encola `progress/events` (transcripción) + marca `dirty` |
| App vuelve al foco / recupera red | descarga `GET /progress` → si `updatedAt` remoto > base local, merge |
| Timer 5 min si hay `dirty` | `PUT /progress` |
| Logro desbloqueado / compra de tienda | encola (van dentro del payload; no hay eventos separados) |
| `beforeunload` | `navigator.sendBeacon` best-effort |

La **cola offline** ya está prevista en `storage.ts` ("cola de
sincronización futura"):

```ts
interface SyncQueueItem {
  id: string;            // uuid → Idempotency-Key
  kind: "events" | "progress" | "import";
  body: unknown;
  attempts: number;      // backoff exponencial 30s → 2h, máx 12
  createdAt: number;
}
```

Red caída → la cola acumula en IndexedDB y sube al volver. El juego nunca
se detiene por red.

## 3. Políticas de mezcla por sección del payload

El payload se mezcla **por secciones**, no como blob:

| Sección | Política | Detalle |
|---|---|---|
| `core.xp` | `max` de las ramas | el XP no puede bajar; el farmeo se frena con caps server, no aquí |
| `core.stats.*` (contadores y mapas por día) | **suma de deltas** | el cliente envía `deltasSince(baseUpdatedAt)`; el servidor suma. Si no hay delta calculable (dispositivo sin base) → max |
| `core.stats.bestComboEver`, `streak.best` | `max` | |
| `core.achievements` | **unión**, timestamp mínimo | un logro nunca se pierde |
| `core.srs` (tarjetas) | **LWW por tarjeta** con `updatedAt` de tarjeta | hay que añadir `updatedAt` a `SrsCard` (cambio pequeño en tipos) |
| `core.wallet.tinta` | **server-authoritative** | balance = `SUM(TintaLedger)`; el cliente lo recibe. Ver §4 |
| `core.missions` | LWW por `dayKey`/`weekKey` | |
| `core.errors`, `seenExercises` | unión (recorte a límites actuales) | |
| `profile.*`, `settings.*` | LWW global (última escritura gana) | `updatedAt` decide |
| `sessions` (historial) | unión por `id`, recorte al máximo actual | |

Contrato de `PUT /progress`:

```jsonc
// Request
{ "baseUpdatedAt": "2026-11-09T18:22:01Z",        // en qué base se derivó
  "payload": { /* estado completo local */ },
  "deltas": { "stats": { "2026-11-10": {"xp": 46, "answers": 12, "correct": 10} } } }

// 200 — servidor mezcló y devuelve el estado canónico
{ "merged": { /* payload canónico */ }, "updatedAt": "..." }

// 409 conflict_outdated — la base local era más vieja que el remoto
//   el cliente APLICA el merged que llega (el servidor ya mezcló su payload)
```

Regla de oro: **el servidor devuelve siempre un estado mezclado válido**
(aunque haya conflicto); el cliente nunca tiene que resolver nada solo.
Todo el algoritmo vive en `src/server/services/merge.ts` como **función
pura** `mergePayload(local, remote, deltas)` → testeable en Vitest con
escenarios (ver 09-integracion.md §Testing).

## 4. Tinta: libro mayor, no campo editable

- Las fuentes online (reto diario, duelos, flotas, torneos, UGC) escriben
  **entradas** con `refId` idempotente.
- Las compras del Bazar local (marcos, banners) cuando hay cuenta:
  `POST /progress/events`-style → `SPEND_SHOP` con `refId: shop:<itemId>:<ts>`.
  El precio lo valida el servidor contra el catálogo (`engine/shop.ts`
  importado por el servidor).
- Migración inicial: `MIGRATION` con el saldo local como entrada única.
- El cliente muestra `tintaLocalPendiente` (offline) + `tintaServidor`;
  la tienda descuenta primero lo pendiente de subir. Doble gasto imposible:
  la compra crea la entrada con `refId` único.

## 5. Importación inicial (jugadores actuales)

`POST /progress/import` (una vez, idempotente):

1. Cliente envía su `PersistedState` actual.
2. Servidor: si `ProgressState` no existe → lo crea tal cual + entrada
   `MIGRATION` de tinta.
3. Si existe (ya había algo online) → `mergePayload(imported, existing, null)`
   con políticas de §3 → devuelve canónico.
4. El cliente guarda el canónico y limpia su cola.

Anti-abuso: import requiere sesión con email verificado, RL 3/día, y
los importes no otorgan XP de ranking (StatDaily empieza en 0: el ranking
se gana jugando conectado, no importando años de juego offline — decisión
de diseño deliberada para evitar "puntos heredados").

## 6. Multi-dispositivo simultáneo

- Dos dispositivos jugando a la vez: cada uno sube deltas; los contadores
  suman, las tarjetas SRS resuelven LWW. Escenario raro; el sistema degrada
  con elegancia (peor caso: duplica una sesión en stats → el outlier job
  ve un patrón de "dos dispositivos activos" y no lo castiga).
- Pantalla de ajustes muestra "Última sincronización hace X" y botón
  "Sincronizar ahora" (pull+push manual) para tranquilidad del usuario.
