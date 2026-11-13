"use client";

/**
 * Motor de sincronización · 06-sync-progreso.md §2.
 *
 * Cuándo se sincroniza:
 * - ARRANQUE DE SESIÓN, `syncOnLogin()` (Ola 1.1, una vez por usuario y
 *   pestaña): tras login/registro y al abrir la app con cookie válida, la
 *   bitácora local y el barco se unen SOLOS y en silencio, sin botones ni
 *   modales: barco vacío + bitácora local → sube en silencio (POST
 *   /progress/import; si el correo no está verificado → fallback PUT);
 *   barco con datos + bitácora local → une y adopta; barco con datos +
 *   dispositivo limpio → adopta el remoto (nunca "no hacer nada").
 * - Ediciones de perfil/ajustes: debounce ~4 s (coalescido) → PUT.
 * - Fin de sesión (onSessionComplete): encola events + marca dirty (game-store).
 * - App al foco / recupera red / timer 5 min si hay dirty: fullSync().
 * - beforeunload/pagehide: PUT best-effort (fetch keepalive).
 *
 * La cola offline (storage.syncQueue) sube con backoff 30 s → 2 h, máx 12
 * intentos; los rechazos permanentes del servidor (400/404/409/422) se
 * retiran de la cola. El juego NUNCA se detiene por la red y ningún error
 * de sync se enseña al usuario.
 */

import { api, ApiError } from "@/lib/api-client";
import { useGameStore } from "@/store/game-store";
import { useOnlineStore } from "@/store/online-store";
import { useUiStore } from "@/store/ui-store";
import {
  computeDeltas,
  CURRENT_SCHEMA_VERSION,
  isDeadLetter,
  loadSyncMeta,
  nextAttemptAt,
  saveSyncMeta,
  snapshotOfStats,
  syncQueue,
  type PersistedState,
} from "@/services/storage";
import {
  createDebouncedScheduler,
  planFullSync,
  planLoginSync,
  type FullSyncAction,
} from "@/services/sync-plan";

const SYNC_INTERVAL_MS = 5 * 60_000;
const QUICK_SYNC_DEBOUNCE_MS = 4_000;
/** Máx. ~10 s esperando la hidratación del estado local en el arranque. */
const HYDRATION_WAIT_MS = 10_000;

type RemoteProgress = Awaited<ReturnType<typeof api.progress.get>>;

function isPersistedState(value: unknown): value is PersistedState {
  const v = value as PersistedState | null;
  return Boolean(v && typeof v === "object" && v.profile && v.core);
}

/** Estado local actual como payload de sincronización. */
function currentPayload(): PersistedState {
  const { profile, settings, core, srs } = useGameStore.getState();
  return {
    version: CURRENT_SCHEMA_VERSION,
    profile,
    settings,
    core,
    srs,
    savedAt: Date.now(),
  };
}

/** Acepta el estado canónico del servidor como estado local. */
async function adoptMerged(merged: unknown): Promise<void> {
  if (!isPersistedState(merged)) return;
  await useGameStore.getState().adoptSyncedState(merged);
}

function acknowledge(updatedAt: string, payload: PersistedState): void {
  saveSyncMeta({
    baseUpdatedAt: updatedAt,
    lastSyncedAt: Date.now(),
    dirty: false,
    snapshot: snapshotOfStats(payload.core?.stats),
  });
}

/* ============================== Drain de la cola ============================== */

/** Sube la cola offline (backoff 30 s → 2 h, máx 12 intentos). */
export async function drainQueue(): Promise<void> {
  const { user } = useOnlineStore.getState();
  if (!user) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  const items = await syncQueue.all();
  for (const item of items) {
    if (isDeadLetter(item)) {
      await syncQueue.remove(item.id); // 12 intentos: retiro silencioso
      continue;
    }
    if (Date.now() < nextAttemptAt(item)) continue; // aún en backoff
    try {
      if (item.kind === "events") {
        const body = item.body as { session?: unknown };
        if (body?.session) await api.progress.postEvent(body.session, item.id);
      } else if (item.kind === "import") {
        const body = item.body as { payload?: unknown };
        if (body?.payload) await api.progress.importPayload(body.payload);
      }
      await syncQueue.remove(item.id);
    } catch (err) {
      const permanent =
        err instanceof ApiError && [400, 404, 409, 422].includes(err.status);
      if (permanent) {
        // El servidor lo rechazó para siempre: fuera de la cola.
        await syncQueue.remove(item.id);
      } else {
        // Red caída / 5xx / 429 / 401 (sesión caducada): backoff.
        await syncQueue.bump(item);
      }
    }
  }
}

/* ============================== Push (PUT con base + deltas) ============================== */

/**
 * PUT /progress contra `remote` (o base local) y adopción del canónico.
 * 200 y 409 devuelven el estado unido: siempre se adopta (06 §3).
 */
async function pushAndAdopt(remote: RemoteProgress): Promise<void> {
  const meta = loadSyncMeta();
  const payload = currentPayload();
  const deltas = computeDeltas(useGameStore.getState().core.stats, meta.snapshot);
  const res = await api.progress.put({
    baseUpdatedAt: remote?.updatedAt ?? meta.baseUpdatedAt,
    payload,
    deltas,
  });
  if (isPersistedState(res.merged)) {
    await adoptMerged(res.merged);
    acknowledge(res.updatedAt, res.merged);
  } else if (remote) {
    // Sin merged legible: al menos reconocemos la base.
    saveSyncMeta({ ...meta, lastSyncedAt: Date.now() });
  }
}

/* ============================== Sync completo (pull + push) ============================== */

/**
 * fullSync: pull del remoto y aplicación de la política de planFullSync
 * (adopt-remote / push / none). Con base reconocida y barco más nuevo
 * adopta tal cual; con cambios locales (o barco vacío) hace PUT con base
 * + deltas y adopta el merged (200 o 409: el servidor SIEMPRE une).
 */
export async function fullSync(): Promise<void> {
  const online = useOnlineStore.getState();
  if (!online.user) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  online.setSyncing(true);
  try {
    const remote = await api.progress.get(); // null si el barco está vacío
    const meta = loadSyncMeta();
    const remoteNewer = Boolean(remote && meta.baseUpdatedAt && remote.updatedAt > meta.baseUpdatedAt);

    const action: FullSyncAction = planFullSync({
      hasRemote: remote !== null,
      remoteNewer,
      dirty: meta.dirty,
      baseUpdatedAt: meta.baseUpdatedAt,
    });

    if (action === "adopt-remote" && remote && isPersistedState(remote.payload)) {
      // El barco tenía novedades (o base desconocida) y aquí no hay nada
      // pendiente: adoptar tal cual.
      await adoptMerged(remote.payload);
      acknowledge(remote.updatedAt, remote.payload);
    } else if (action === "push") {
      await pushAndAdopt(remote);
    } else {
      saveSyncMeta({ ...meta, lastSyncedAt: Date.now() });
    }

    await drainQueue();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      // Sesión caducada: modo local de siempre, sin errores en cara.
      useOnlineStore.getState().setUser(null);
      return;
    }
    // Red caída: silencio; la cola y el timer reintentan.
  } finally {
    useOnlineStore.getState().setSyncing(false);
  }
}

/* ============================== Ciclo de arranque de sesión (Ola 1.1) ============================== */

/**
 * Import en silencio del estado local: une barco + bitácora y adopta el
 * resultado. Fallback para cuentas con correo sin verificar (el POST
 * /progress/import responde 403): PUT normal, que no exige verificación.
 * Devuelve true si la bitácora quedó a bordo.
 */
async function importLocalProgress(remote: RemoteProgress): Promise<boolean> {
  try {
    const res = await api.progress.importPayload(currentPayload());
    if (isPersistedState(res.merged)) {
      await adoptMerged(res.merged);
      acknowledge(res.updatedAt, res.merged);
    }
    // La cola de "progress" queda cubierta por el import (06 §5.4).
    await syncQueue.clear("progress");
    await drainQueue();
    return true;
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      // Correo sin verificar: el import está vetado, pero el PUT no
      // (misma mezcla server-side; la tinta entra como MIGRATION igual).
      await pushAndAdopt(remote);
      await syncQueue.clear("progress");
      await drainQueue();
      return true;
    }
    throw err;
  }
}

/** Usuario cuyo ciclo de arranque YA corrió en esta pestaña. */
let loginCycleFor: string | null = null;

/**
 * Ciclo de arranque de sesión: UNO por usuario y pestaña, en silencio y
 * sin ningún modal ni botón (sustituye al antiguo "Subir y unir").
 * - Se llama tras login/registro (afterLogin) y al abrir la app con cookie
 *   válida (initSync); el timer de 5 min lo reintenta si quedó pendiente.
 * - Tras el primer ciclo, baseUpdatedAt queda reconocido: los siguientes
 *   pasos de esta pestaña usan fullSync normal.
 * - Si la cuenta traía progreso y este dispositivo no tenía perfil, la
 *   navegación pasa sola al mapa (sin onboarding); si la cuenta es nueva,
 *   el usuario aterriza en el onboarding para crear su perfil con normalidad.
 */
export async function syncOnLogin(): Promise<void> {
  const online = useOnlineStore.getState();
  const user = online.user;
  if (!user || loginCycleFor === user.id) return;

  // Esperar la hidratación local: sin ella no sabemos si hay bitácora.
  const deadline = Date.now() + HYDRATION_WAIT_MS;
  while (!useGameStore.getState().hydrated && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 250));
  }
  const game = useGameStore.getState();
  if (!game.hydrated) return;

  let remote: RemoteProgress;
  try {
    remote = await api.progress.get();
  } catch {
    return; // sin red / 5xx: reintenta el timer; nada en cara.
  }

  const meta = loadSyncMeta();
  const plan = planLoginSync({
    hasRemote: remote !== null,
    baseUpdatedAt: meta.baseUpdatedAt,
    hasLocalLog: game.hasProfile,
  });

  try {
    switch (plan) {
      case "none":
        break; // barco vacío + sin bitácora: nada que hacer.
      case "full-sync":
        await fullSync();
        break;
      case "adopt-remote":
        if (remote && isPersistedState(remote.payload)) {
          await adoptMerged(remote.payload);
          acknowledge(remote.updatedAt, remote.payload);
        }
        await drainQueue();
        break;
      case "upload-fresh":
      case "import-merge":
        await importLocalProgress(remote);
        break;
    }
    loginCycleFor = user.id; // ciclo completado (o nada por hacer).
  } catch {
    // Silencio total: el timer reintenta el ciclo, el foco/online el resto.
    return;
  }

  // Transición de entrada (solo cuando el dispositivo no tenía perfil):
  // la cuenta ya jugada aterriza en el mapa; la cuenta nueva, en el
  // onboarding. Nunca parpadea la portada: el ciclo ya adoptó el estado.
  if (!game.hasProfile) {
    const landed = useGameStore.getState().hasProfile;
    if (landed) useUiStore.getState().navigate({ name: "home" });
    else useUiStore.getState().navigate({ name: "onboarding" });
  }
}

/* ============================== Init (una vez por pestaña) ============================== */

let initialized = false;

/**
 * Subida rápida de perfil/ajustes: debounce ~4 s, coalescido (una sola
 * subida tras una ráfaga de ediciones). El timer de 5 min, el foco, el
 * online y el pagehide se quedan igual.
 */
const quickSync = createDebouncedScheduler(() => {
  if (!useOnlineStore.getState().user) return;
  if (loadSyncMeta().dirty) void fullSync();
}, QUICK_SYNC_DEBOUNCE_MS);

/** Best-effort al cerrar la pestaña (fetch keepalive ≈ sendBeacon con cabeceras). */
function flushBeforeHide(): void {
  const online = useOnlineStore.getState();
  const meta = loadSyncMeta();
  if (!online.user || !meta.dirty) return;
  try {
    const payload = currentPayload();
    const deltas = computeDeltas(useGameStore.getState().core.stats, meta.snapshot);
    void fetch("/api/v1/progress", {
      method: "PUT",
      keepalive: true,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "x-verbalia-csrf": "1",
      },
      body: JSON.stringify({ baseUpdatedAt: meta.baseUpdatedAt, payload, deltas }),
    }).catch(() => {
      /* best-effort */
    });
  } catch {
    /* best-effort */
  }
}

/** Monta la capa online: sesión, ciclo de arranque, listeners y timers. */
export function initSync(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  void useOnlineStore
    .getState()
    .refreshUser()
    .then(() => syncOnLogin())
    .catch(() => null);

  // Subida rápida al cambiar perfil o ajustes (debounce coalescido ~4 s).
  useGameStore.subscribe((state, prev) => {
    if (state.profile !== prev.profile || state.settings !== prev.settings) {
      quickSync.schedule();
    }
  });

  window.addEventListener("online", () => {
    void fullSync();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void fullSync();
  });
  window.addEventListener("pagehide", flushBeforeHide);
  window.setInterval(() => {
    const { user } = useOnlineStore.getState();
    // El timer también reintenta un ciclo de arranque que quedó pendiente
    // (red caída al abrir la app); si no, su papel de siempre: flush del dirty.
    if (user && loginCycleFor !== user.id) void syncOnLogin();
    else if (loadSyncMeta().dirty) void fullSync();
  }, SYNC_INTERVAL_MS);
}

/** Tras login/registro desde la pantalla de cuenta: el ciclo corre solo. */
export async function afterLogin(): Promise<void> {
  await syncOnLogin();
}

/** "Sincronizar ahora" manual: fuerza el ciclo completo (tranquilidad). */
export async function syncNow(): Promise<void> {
  loginCycleFor = null; // fuerza el ciclo de arranque aunque ya hubiera corrido
  await syncOnLogin();
}
