"use client";

/**
 * Motor de sincronización · 06-sync-progreso.md §2.
 *
 * Cuándo se sincroniza:
 * - Fin de sesión (onSessionComplete): encola events + marca dirty (game-store).
 * - App al foco / recupera red: pull (GET /progress) → si el remoto es más
 *   nuevo, PUT con base → se adopta el merged (el servidor siempre mezcla).
 * - Timer 5 min si hay dirty: PUT.
 * - beforeunload/pagehide: PUT best-effort (fetch keepalive).
 *
 * La cola offline (storage.syncQueue) sube con backoff 30 s → 2 h, máx 12
 * intentos; los rechazos permanentes del servidor (400/404/409/422) se
 * retiran de la cola. El juego NUNCA se detiene por la red.
 */

import { api, ApiError } from "@/lib/api-client";
import { useGameStore } from "@/store/game-store";
import { useOnlineStore } from "@/store/online-store";
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

const IMPORT_DISMISSED_PREFIX = "verbalia-import-done:";
const SYNC_INTERVAL_MS = 5 * 60_000;

function isPersistedState(value: unknown): value is PersistedState {
  const v = value as PersistedState | null;
  return Boolean(v && typeof v === "object" && v.profile && v.core);
}

function importDoneKey(): string | null {
  const user = useOnlineStore.getState().user;
  return user ? `${IMPORT_DISMISSED_PREFIX}${user.id}` : null;
}

function isImportDone(): boolean {
  const key = importDoneKey();
  if (!key || typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function markImportDone(): void {
  const key = importDoneKey();
  if (!key || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, "1");
  } catch {
    /* noop */
  }
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

/* ============================== Sync completo (pull + push) ============================== */

/**
 * Sincroniza: si el remoto es más nuevo y no hay cambios locales, adopta el
 * remoto; si hay dirty (o no hay remoto), PUT con base + deltas y adopta el
 * merged (200 o 409: el servidor SIEMPRE devuelve el estado unido).
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

    if (remote && remoteNewer && !meta.dirty) {
      // El barco tenía novedades y aquí no hay nada pendiente: adoptar tal cual.
      if (isPersistedState(remote.payload)) {
        await adoptMerged(remote.payload);
        acknowledge(remote.updatedAt, remote.payload);
      }
    } else if (meta.dirty || !remote || remoteNewer) {
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

/* ============================== Import (02 §7) ============================== */

/** "Subir y unir": importa la bitácora local y adopta el estado unido. */
export async function importLocalProgress(): Promise<boolean> {
  const online = useOnlineStore.getState();
  if (!online.user) return false;

  const payload = currentPayload();
  try {
    const res = await api.progress.importPayload(payload);
    if (isPersistedState(res.merged)) {
      await adoptMerged(res.merged);
      acknowledge(res.updatedAt, res.merged);
    }
    // La cola de "progress" queda cubierta por el import (06 §5.4).
    await syncQueue.clear("progress");
    markImportDone();
    online.dismissImport();
    await drainQueue();
    return true;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 401)) {
      throw err; // email sin verificar / sesión: lo cuenta la pantalla
    }
    throw err;
  }
}

/** "Empezar de cero": no se sube la bitácora (el local queda intacto). */
export async function skipImport(): Promise<void> {
  markImportDone();
  useOnlineStore.getState().dismissImport();
}

/** Aviso post-login: ¿hay bitácora local y el barco aún no la conoce? */
export async function checkImportPrompt(): Promise<void> {
  const online = useOnlineStore.getState();
  if (!online.user) return;

  // Espera a que el estado local hidrate (máx. ~10 s).
  for (let i = 0; i < 20 && !useGameStore.getState().hydrated; i++) {
    await new Promise((r) => setTimeout(r, 500));
  }
  const game = useGameStore.getState();
  if (!game.hydrated || !game.hasProfile) return;
  if (isImportDone()) return;

  let remote: Awaited<ReturnType<typeof api.progress.get>>;
  try {
    remote = await api.progress.get();
  } catch {
    return; // sin red: se preguntará en el próximo arranque con red
  }
  const meta = loadSyncMeta();
  // Barco vacío, o este dispositivo nunca ha sincronizado con la cuenta.
  if (remote === null || meta.baseUpdatedAt === null) {
    online.askImport();
  }
}

/* ============================== Init (una vez por pestaña) ============================== */

let initialized = false;

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

/** Monta la capa online: sesión, listeners de red/foco, timer de 5 min. */
export function initSync(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  void useOnlineStore
    .getState()
    .refreshUser()
    .then(() => checkImportPrompt())
    .catch(() => null);

  window.addEventListener("online", () => {
    void fullSync();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void fullSync();
  });
  window.addEventListener("pagehide", flushBeforeHide);
  window.setInterval(() => {
    const meta = loadSyncMeta();
    if (meta.dirty) void fullSync();
  }, SYNC_INTERVAL_MS);
}

/** Tras login/registro desde la pantalla de cuenta. */
export async function afterLogin(): Promise<void> {
  await checkImportPrompt();
  void fullSync();
}

/** "Sincronizar ahora" manual (tranquilidad del usuario · 06 §6). */
export async function syncNow(): Promise<void> {
  await fullSync();
}
