/**
 * Servicio de almacenamiento · IndexedDB con espejo en localStorage
 * como respaldo, control de versiones y cola de sincronización futura.
 *
 * Modelo de datos: un único registro con el estado completo del juego
 * (perfil, ajustes, núcleo de progreso y tarjetas SRS), lo que hace
 * trivial la exportación/importación y la futura sincronización.
 */

import type { GameCore, GameSettings, PlayerProfile, SrsCard } from "@/types";

export interface PersistedState {
  version: number;
  profile: PlayerProfile;
  settings: GameSettings;
  core: GameCore;
  srs: Record<string, SrsCard>;
  savedAt: number;
}

const DB_NAME = "verbalia";
const DB_VERSION = 1;
const STORE = "state";
const KEY = "main";
const LS_KEY = "verbalia-state-v1";
export const CURRENT_SCHEMA_VERSION = 1;

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

function lsGet(): PersistedState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

function lsSet(state: PersistedState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* cuota llena: IndexedDB sigue siendo la fuente principal */
  }
}

function lsClear(): void {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* noop */
  }
}

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

  /** Exportación legible para el usuario (privacidad: tus datos son tuyos). */
  export(state: PersistedState): string {
    return JSON.stringify(state, null, 2);
  },

  /** Importa un estado exportado, validando la versión. */
  parseImport(text: string): PersistedState | null {
    try {
      const parsed = JSON.parse(text) as PersistedState;
      if (typeof parsed !== "object" || parsed === null) return null;
      if (!parsed.core || !parsed.profile) return null;
      if (parsed.version > CURRENT_SCHEMA_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  },
};
