/**
 * Servicio de almacenamiento · IndexedDB con espejo en localStorage
 * como respaldo, control de versiones y COLA DE SINCRONIZACIÓN online.
 *
 * Modelo de datos: un único registro con el estado completo del juego
 * (perfil, ajustes, núcleo de progreso y tarjetas SRS), lo que hace
 * trivial la sincronización por cuenta (todo el estado viaja junto).
 *
 * Cola offline (06-sync-progreso.md §2): SyncQueueItem {id, kind, body,
 * attempts, createdAt} en un almacén propio de IndexedDB; backoff
 * exponencial 30 s → 2 h, máx. 12 intentos; el id del item es el
 * Idempotency-Key del POST (los reintentos no duplican recompensas).
 */

import type { AnswerRecord, GameCore, GameSettings, PlayerProfile, SessionResult, SrsCard, SessionSpec } from "@/types";

export interface PersistedState {
  version: number;
  profile: PlayerProfile;
  settings: GameSettings;
  core: GameCore;
  srs: Record<string, SrsCard>;
  savedAt: number;
}

/* ============================== Cola de sincronización ============================== */

export interface SyncQueueItem {
  id: string; // uuid → Idempotency-Key
  kind: "events" | "progress" | "import";
  body: unknown;
  attempts: number; // backoff exponencial 30s → 2h, máx 12
  createdAt: number;
}

const DB_NAME = "verbalia";
const DB_VERSION = 2; // v2: almacén "sync-queue"
const STORE = "state";
const QUEUE_STORE = "sync-queue";
const KEY = "main";
const LS_KEY = "verbalia-state-v1";
const QUEUE_LS_KEY = "verbalia-sync-queue-v1";
export const CURRENT_SCHEMA_VERSION = 1;

/* ---------- Backoff puro (tests) ---------- */

export const BACKOFF_BASE_MS = 30_000;
export const BACKOFF_MAX_MS = 2 * 60 * 60 * 1000;
export const BACKOFF_MAX_ATTEMPTS = 12;

/** Retardo tras el intento n (1-indexado): 30 s · 60 s · 2 m · … · tope 2 h. */
export function backoffDelayMs(attempts: number): number {
  const n = Math.max(1, attempts);
  return Math.min(BACKOFF_BASE_MS * 2 ** (n - 1), BACKOFF_MAX_MS);
}

/** Cuándo se puede reintentar el item: createdAt + suma de retardos ya esperados. */
export function nextAttemptAt(item: SyncQueueItem): number {
  let t = item.createdAt;
  for (let k = 0; k < item.attempts; k++) t += backoffDelayMs(k + 1);
  return t;
}

/** ¿El item ya agotó sus 12 intentos? (se retira de la cola). */
export function isDeadLetter(item: SyncQueueItem): boolean {
  return item.attempts >= BACKOFF_MAX_ATTEMPTS;
}

/* ---------- Metadatos de sync (localStorage) ---------- */

export interface StatsSnapshot {
  xpByDay: Record<string, number>;
  correctByDay: Record<string, number>;
  sessionsByDay: Record<string, number>;
  totalAnswers: number;
  totalCorrect: number;
  totalSessions: number;
  totalTimeMs: number;
  answerTimeSumMs: number;
}

export interface SyncMeta {
  /** updatedAt remoto reconocido como base local (ISO). */
  baseUpdatedAt: string | null;
  /** Instante del último sync completo (epoch ms). */
  lastSyncedAt: number | null;
  /** ¿Hay cambios locales sin subir? */
  dirty: boolean;
  /** Foto de stats en la base reconocida (para calcular deltas). */
  snapshot: StatsSnapshot | null;
}

const SYNC_META_KEY = "verbalia-sync-meta";

export function emptySyncMeta(): SyncMeta {
  return { baseUpdatedAt: null, lastSyncedAt: null, dirty: false, snapshot: null };
}

export function loadSyncMeta(): SyncMeta {
  if (typeof localStorage === "undefined") return emptySyncMeta();
  try {
    const raw = localStorage.getItem(SYNC_META_KEY);
    if (!raw) return emptySyncMeta();
    const parsed = JSON.parse(raw) as Partial<SyncMeta>;
    return {
      baseUpdatedAt: parsed.baseUpdatedAt ?? null,
      lastSyncedAt: parsed.lastSyncedAt ?? null,
      dirty: Boolean(parsed.dirty),
      snapshot: parsed.snapshot ?? null,
    };
  } catch {
    return emptySyncMeta();
  }
}

export function saveSyncMeta(meta: SyncMeta): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch {
    /* cuota llena: el sync degradará a max-merge (sin deltas) */
  }
}

export function markSyncDirty(): void {
  const meta = loadSyncMeta();
  if (!meta.dirty) saveSyncMeta({ ...meta, dirty: true });
}

/** Foto de stats para calcular deltas desde la base reconocida. */
export function snapshotOfStats(stats: GameCore["stats"] | undefined): StatsSnapshot {
  return {
    xpByDay: { ...(stats?.xpByDay ?? {}) },
    correctByDay: { ...(stats?.correctByDay ?? {}) },
    sessionsByDay: { ...(stats?.sessionsByDay ?? {}) },
    totalAnswers: stats?.totalAnswers ?? 0,
    totalCorrect: stats?.totalCorrect ?? 0,
    totalSessions: stats?.totalSessions ?? 0,
    totalTimeMs: stats?.totalTimeMs ?? 0,
    answerTimeSumMs: stats?.answerTimeSumMs ?? 0,
  };
}

/** Deltas desde la foto de la base: {stats: por día, scalars}. null si no hay foto. */
export function computeDeltas(
  stats: GameCore["stats"] | undefined,
  snap: StatsSnapshot | null,
): { stats: Record<string, { xp?: number; correct?: number; sessions?: number }>; scalars: Record<string, number> } | null {
  if (!snap) return null;
  const out: Record<string, { xp?: number; correct?: number; sessions?: number }> = {};
  const add = (day: string, key: "xp" | "correct" | "sessions", value: number) => {
    if (value <= 0) return;
    (out[day] ??= {})[key] = ((out[day] ??= {})[key] ?? 0) + value;
  };
  for (const [day, xp] of Object.entries(stats?.xpByDay ?? {})) {
    add(day, "xp", (xp ?? 0) - (snap.xpByDay[day] ?? 0));
  }
  for (const [day, c] of Object.entries(stats?.correctByDay ?? {})) {
    add(day, "correct", (c ?? 0) - (snap.correctByDay[day] ?? 0));
  }
  for (const [day, s] of Object.entries(stats?.sessionsByDay ?? {})) {
    add(day, "sessions", (s ?? 0) - (snap.sessionsByDay[day] ?? 0));
  }
  const scalars: Record<string, number> = {};
  const scalar = (key: string, now: number, base: number) => {
    const d = now - base;
    if (d > 0) scalars[key] = d;
  };
  scalar("totalAnswers", stats?.totalAnswers ?? 0, snap.totalAnswers);
  scalar("totalCorrect", stats?.totalCorrect ?? 0, snap.totalCorrect);
  scalar("totalSessions", stats?.totalSessions ?? 0, snap.totalSessions);
  scalar("totalTimeMs", stats?.totalTimeMs ?? 0, snap.totalTimeMs);
  scalar("answerTimeSumMs", stats?.answerTimeSumMs ?? 0, snap.answerTimeSumMs);
  if (Object.keys(out).length === 0 && Object.keys(scalars).length === 0) return null;
  return { stats: out, scalars };
}

/* ============================== IndexedDB ============================== */

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        // v2: almacén de la cola de sincronización.
        if (!db.objectStoreNames.contains(QUEUE_STORE)) db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function idbGet(): Promise<PersistedState | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as PersistedState) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet(state: PersistedState): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(state, KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function idbClear(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/* ---------- Cola: IndexedDB con espejo en localStorage (robustez) ---------- */

function queueLsLoad(): SyncQueueItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(QUEUE_LS_KEY) ?? "[]") as SyncQueueItem[];
  } catch {
    return [];
  }
}

function queueLsSave(items: SyncQueueItem[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(QUEUE_LS_KEY, JSON.stringify(items.slice(-200)));
  } catch {
    /* cuota llena: IndexedDB sigue siendo la fuente principal */
  }
}

async function queueIdbAll(): Promise<SyncQueueItem[]> {
  const db = await openDb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(QUEUE_STORE, "readonly");
      const req = tx.objectStore(QUEUE_STORE).getAll();
      req.onsuccess = () => resolve((req.result as SyncQueueItem[]) ?? []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

async function queueIdbPut(item: SyncQueueItem): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(QUEUE_STORE, "readwrite");
      tx.objectStore(QUEUE_STORE).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function queueIdbDelete(id: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(QUEUE_STORE, "readwrite");
      tx.objectStore(QUEUE_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function queueIdbClear(kind?: SyncQueueItem["kind"]): Promise<void> {
  const items = await queueIdbAll();
  for (const item of items) {
    if (!kind || item.kind === kind) await queueIdbDelete(item.id);
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const syncQueue = {
  /** Encola un item (id = Idempotency-Key futuro). */
  async enqueue(kind: SyncQueueItem["kind"], body: unknown): Promise<SyncQueueItem> {
    const item: SyncQueueItem = { id: uuid(), kind, body, attempts: 0, createdAt: Date.now() };
    await queueIdbPut(item);
    queueLsSave([...queueLsLoad(), item]);
    return item;
  },
  async all(): Promise<SyncQueueItem[]> {
    const items = await queueIdbAll();
    return items.sort((a, b) => a.createdAt - b.createdAt);
  },
  async remove(id: string): Promise<void> {
    await queueIdbDelete(id);
    queueLsSave(queueLsLoad().filter((i) => i.id !== id));
  },
  /** Registra un intento fallido (backoff crece con attempts). */
  async bump(item: SyncQueueItem): Promise<void> {
    await queueIdbPut({ ...item, attempts: item.attempts + 1 });
  },
  /** Limpia la cola (todo o solo un kind). */
  async clear(kind?: SyncQueueItem["kind"]): Promise<void> {
    await queueIdbClear(kind);
    queueLsSave(kind ? queueLsLoad().filter((i) => i.kind !== kind) : []);
  },
  async size(): Promise<number> {
    return (await this.all()).length;
  },
};

/* ---------- Encola el evento de sesión (onSessionComplete del game-store) ---------- */

/** Índice de la opción elegida dentro del ejercicio (−1 si no aplica). */
function choiceIndexOf(a: AnswerRecord): number {
  const opts = (a.exercise as { options?: string[] } | undefined)?.options;
  if (!Array.isArray(opts)) return -1;
  const idx = opts.indexOf(a.userAnswer);
  return idx >= 0 ? idx : -1;
}

/** El gameId dominante de la sesión (las misiones mezclan formatos). */
function dominantGameId(answers: AnswerRecord[], spec: SessionSpec): string {
  if (spec.gameId) return spec.gameId;
  const counts = new Map<string, number>();
  for (const a of answers) counts.set(a.gameId, (counts.get(a.gameId) ?? 0) + 1);
  let best = "mision";
  let bestN = 0;
  for (const [g, n] of counts) {
    if (n > bestN) {
      best = g;
      bestN = n;
    }
  }
  return best;
}

/**
 * Encola `progress/events` al completar una sesión (transcripción + resultado).
 * La evaluación inicial no sube (no da XP). Fire-and-forget: el juego nunca
 * se espera por la red.
 */
export async function enqueueSessionEvent(
  spec: SessionSpec,
  answers: AnswerRecord[],
  durationMs: number,
  result: SessionResult,
): Promise<void> {
  if (spec.mode === "placement" || answers.length === 0) return;
  const body = {
    session: {
      formatId: dominantGameId(answers, spec),
      origin: "freeplay",
      seed: spec.seed ?? null,
      durationMs,
      transcript: {
        answers: answers.map((a, i) => ({
          i,
          choice: choiceIndexOf(a),
          ms: Math.max(0, Math.round(a.timeMs ?? 0)),
        })),
      },
      result: {
        xp: result.xpTotal,
        correct: result.correctCount,
        total: result.totalCount,
        bestCombo: result.bestCombo,
        accuracy: result.accuracy ?? undefined,
      },
    },
  };
  await syncQueue.enqueue("events", body);
}

/* ============================== localStorage (respaldo) ============================== */

function lsGet(): PersistedState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

function lsSet(state: PersistedState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* cuota llena: IndexedDB sigue siendo la fuente principal */
  }
}

function lsClear(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* noop */
  }
}

/* ============================== API del almacenamiento ============================== */

export const storage = {
  /** Carga el estado (IndexedDB primero, localStorage como respaldo). */
  async load(): Promise<PersistedState | null> {
    const fromIdb = await idbGet();
    if (fromIdb) return fromIdb;
    return lsGet();
  },

  /** Guarda en IndexedDB y espeja en localStorage. */
  async save(state: PersistedState): Promise<void> {
    const payload = { ...state, savedAt: Date.now() };
    await idbSet(payload);
    lsSet(payload);
  },

  async clear(): Promise<void> {
    await idbClear();
    lsClear();
  },
};
