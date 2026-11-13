/**
 * Pruebas del motor de sincronización · Ola 1.1 · `bun test`.
 *
 * Dos niveles:
 * 1. `sync-plan.ts` (puro): el ciclo de arranque de sesión, la política
 *    de fullSync (incluido el agujero arreglado: base desconocida + barco
 *    con datos + sin dirty ⇒ adoptar el remoto) y el debounce coalescido.
 * 2. Ciclo `syncOnLogin` de extremo a extremo con `@/lib/api-client`
 *    mockeado (única pieza de red; ningún otro test lo importa): barco
 *    vacío→sube en silencio, barco con datos→adopta/une, 403→fallback PUT,
 *    una sola vez por usuario y arranque.
 *
 * El storage real se usa tal cual con un localStorage en memoria (la cola
 * offline queda vacía sin IndexedDB, que también es lo que pasa en el
 * navegador si no lo soporta).
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  createDebouncedScheduler,
  planFullSync,
  planLoginSync,
} from "@/services/sync-plan";
import { createCore } from "@/engine/core";
import { EMPTY_PROFILE } from "@/engine/migrate";
import type { PersistedState } from "@/services/storage";
import type { PlayerProfile } from "@/types";

/* ============================== Entorno de test ============================== */

/* localStorage en memoria (loadSyncMeta/saveSyncMeta/markSyncDirty lo usan). */
const lsBacking = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => lsBacking.get(k) ?? null,
  setItem: (k: string, v: string) => void lsBacking.set(k, String(v)),
  removeItem: (k: string) => void lsBacking.delete(k),
};
/* Bun define `navigator` sin `onLine`: el sync creería que no hay red. */
(globalThis.navigator as { onLine?: boolean }).onLine = true;

/* ---------- Mock de la API: única pieza de red del ciclo ---------- */

type RecordedCall = { path: string; input?: unknown };

const apiState: {
  remote: { version: number; payload: unknown; updatedAt: string } | null;
  importResult: { merged: unknown; updatedAt: string } | null;
  importStatus: number;
  putResult: { status: 200 | 409; merged: unknown; updatedAt: string } | null;
  getThrows: boolean;
} = {
  remote: null,
  importResult: null,
  importStatus: 200,
  putResult: null,
  getThrows: false,
};

const calls: RecordedCall[] = [];

mock.module("@/lib/api-client", () => {
  class ApiError extends Error {
    constructor(
      readonly code: string,
      message: string,
      readonly status: number,
    ) {
      super(message);
      this.name = "ApiError";
    }
  }
  return {
    ApiError,
    api: {
      auth: {
        // Ningún test llega aquí, pero el mock debe compilar como el real.
        me: async () => ({ user: null }),
      },
      progress: {
        async get() {
          calls.push({ path: "GET /progress" });
          if (apiState.getThrows) throw new ApiError("network", "sin red", 0);
          return apiState.remote;
        },
        async put(input: { baseUpdatedAt?: string | null; payload: unknown; deltas: unknown }) {
          calls.push({ path: "PUT /progress", input });
          if (!apiState.putResult) throw new ApiError("server", "sin respuesta", 500);
          return apiState.putResult;
        },
        async importPayload(payload: unknown) {
          calls.push({ path: "POST /progress/import", input: payload });
          if (apiState.importStatus === 403) {
            throw new ApiError("email_unverified", "verifica tu correo", 403);
          }
          return apiState.importResult ?? { merged: payload, updatedAt: new Date().toISOString() };
        },
      },
    },
  };
});

/* ---------- Importaciones dinámicas (resuelven ya con el mock) ---------- */

type SyncModule = typeof import("@/services/sync");
type GameStoreModule = typeof import("@/store/game-store");
type OnlineStoreModule = typeof import("@/store/online-store");
type UiStoreModule = typeof import("@/store/ui-store");
type StorageModule = typeof import("@/services/storage");

let syncPromise: Promise<SyncModule> | null = null;
const syncModule = () => (syncPromise ??= import("@/services/sync"));
let gamePromise: Promise<GameStoreModule> | null = null;
const gameModule = () => (gamePromise ??= import("@/store/game-store"));
let onlinePromise: Promise<OnlineStoreModule> | null = null;
const onlineModule = () => (onlinePromise ??= import("@/store/online-store"));
let uiPromise: Promise<UiStoreModule> | null = null;
const uiModule = () => (uiPromise ??= import("@/store/ui-store"));
let storagePromise: Promise<StorageModule> | null = null;
const storageModule = () => (storagePromise ??= import("@/services/storage"));

/* ---------- Fábricas de estados y usuarios ---------- */

let clock = 0;
function iso(): string {
  clock += 60_000;
  return new Date(Date.UTC(2026, 10, 13, 12, 0, 0) + clock).toISOString();
}

function makeProfile(name: string): PlayerProfile {
  return { ...EMPTY_PROFILE, name, onboarded: true, placementDone: true, createdAt: 123_456 };
}

/** Estado PersistedState válido (el ciclo lo adopta vía migrate*). */
function makeState(name: string, xp: number): PersistedState {
  const core = createCore();
  core.xp = xp;
  return {
    version: 1,
    profile: makeProfile(name),
    settings: {} as PersistedState["settings"],
    core,
    srs: {},
    savedAt: Date.now(),
  };
}

function makeUser(id: string) {
  return {
    id,
    email: `${id}@correo.com`,
    displayName: id,
    handle: `${id}-0001`,
    farocode: "ALBO-0000",
    emailVerified: true,
    role: "USER",
    status: "ACTIVE",
    createdAt: iso(),
  };
}

/** Prepara dispositivo: hidratado, con o sin bitácora local. */
async function setLocal(opts: { hasProfile: boolean; name?: string; xp?: number }) {
  const { useGameStore } = await gameModule();
  const core = createCore();
  core.xp = opts.xp ?? 500;
  useGameStore.setState({
    hydrated: true,
    hasProfile: opts.hasProfile,
    profile: opts.hasProfile ? makeProfile(opts.name ?? "Marina") : EMPTY_PROFILE,
    core,
    srs: {},
    lastResult: null,
  });
}

async function setUser(id: string) {
  const { useOnlineStore } = await onlineModule();
  useOnlineStore.setState({ user: makeUser(id), authChecked: true, syncing: false });
}

function paths(): string[] {
  return calls.map((c) => c.path);
}

function resetApi() {
  apiState.remote = null;
  apiState.importResult = null;
  apiState.importStatus = 200;
  apiState.putResult = null;
  apiState.getThrows = false;
}

beforeEach(async () => {
  calls.length = 0;
  lsBacking.clear();
  resetApi();
  await setLocal({ hasProfile: false });
  const { useUiStore } = await uiModule();
  useUiStore.setState({ screen: { name: "welcome" }, navCount: 0 });
  const { useOnlineStore } = await onlineModule();
  useOnlineStore.setState({ user: null, authChecked: false, syncing: false, lastAuthError: null });
});

/* ============================== 1 · planLoginSync (puro) ============================== */

describe("sync-plan · planLoginSync (ciclo de arranque de sesión)", () => {
  test("barco vacío + bitácora local → sube en silencio", () => {
    expect(
      planLoginSync({ hasRemote: false, baseUpdatedAt: null, hasLocalLog: true }),
    ).toBe("upload-fresh");
  });

  test("barco con datos + bitácora local → une y adopta", () => {
    expect(
      planLoginSync({ hasRemote: true, baseUpdatedAt: null, hasLocalLog: true }),
    ).toBe("import-merge");
  });

  test("barco con datos + dispositivo limpio → adopta el remoto", () => {
    expect(
      planLoginSync({ hasRemote: true, baseUpdatedAt: null, hasLocalLog: false }),
    ).toBe("adopt-remote");
  });

  test("barco vacío + sin bitácora → nada (una cuenta nueva no ensucia el barco)", () => {
    expect(
      planLoginSync({ hasRemote: false, baseUpdatedAt: null, hasLocalLog: false }),
    ).toBe("none");
  });

  test("base ya reconocida → fullSync normal, tenga o no barco/bitácora", () => {
    expect(planLoginSync({ hasRemote: true, baseUpdatedAt: "T", hasLocalLog: true })).toBe("full-sync");
    expect(planLoginSync({ hasRemote: true, baseUpdatedAt: "T", hasLocalLog: false })).toBe("full-sync");
    expect(planLoginSync({ hasRemote: false, baseUpdatedAt: "T", hasLocalLog: true })).toBe("full-sync");
    expect(planLoginSync({ hasRemote: false, baseUpdatedAt: "T", hasLocalLog: false })).toBe("full-sync");
  });
});

/* ============================== 2 · planFullSync (puro) ============================== */

describe("sync-plan · planFullSync (política de cada fullSync)", () => {
  test("ARREGLO Ola 1.1: base desconocida + barco con datos + sin dirty → adopta el remoto", () => {
    // Antes este caso caía en "none": el dispositivo nunca recibía el barco.
    expect(
      planFullSync({ hasRemote: true, remoteNewer: false, dirty: false, baseUpdatedAt: null }),
    ).toBe("adopt-remote");
    expect(
      planFullSync({ hasRemote: true, remoteNewer: true, dirty: false, baseUpdatedAt: null }),
    ).toBe("adopt-remote");
  });

  test("comportamiento clásico intacto: barco más nuevo adopta, dirty sube, todo al día no hace nada", () => {
    // Remoto más nuevo y sin cambios locales → adoptar.
    expect(planFullSync({ hasRemote: true, remoteNewer: true, dirty: false, baseUpdatedAt: "T" })).toBe("adopt-remote");
    // Cambios locales (o barco vacío o base vieja) → PUT.
    expect(planFullSync({ hasRemote: true, remoteNewer: true, dirty: true, baseUpdatedAt: "T" })).toBe("push");
    expect(planFullSync({ hasRemote: true, remoteNewer: false, dirty: true, baseUpdatedAt: "T" })).toBe("push");
    expect(planFullSync({ hasRemote: true, remoteNewer: false, dirty: true, baseUpdatedAt: null })).toBe("push");
    expect(planFullSync({ hasRemote: false, remoteNewer: false, dirty: true, baseUpdatedAt: null })).toBe("push");
    expect(planFullSync({ hasRemote: false, remoteNewer: false, dirty: false, baseUpdatedAt: null })).toBe("push");
    // Todo al día → solo anotar última sincronización.
    expect(planFullSync({ hasRemote: true, remoteNewer: false, dirty: false, baseUpdatedAt: "T" })).toBe("none");
  });
});

/* ============================== 3 · Debounce coalescido (puro) ============================== */

describe("sync-plan · createDebouncedScheduler (subida rápida ~4 s)", () => {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  test("una ráfaga de ediciones seguidas produce UNA sola ejecución", async () => {
    let runs = 0;
    const quick = createDebouncedScheduler(() => void runs++, 25);
    expect(quick.pending).toBe(false);
    quick.schedule();
    quick.schedule();
    quick.schedule();
    quick.schedule();
    expect(quick.pending).toBe(true);
    await sleep(70);
    expect(runs).toBe(1);
    expect(quick.pending).toBe(false);
  });

  test("cancel evita la ejecución programada", async () => {
    let runs = 0;
    const quick = createDebouncedScheduler(() => void runs++, 25);
    quick.schedule();
    quick.cancel();
    expect(quick.pending).toBe(false);
    await sleep(70);
    expect(runs).toBe(0);
  });
});

/* ============================== 4 · Ciclo syncOnLogin (integración) ============================== */

describe("sync.ts · syncOnLogin (ciclo automático, sin botones)", () => {
  test("barco vacío + bitácora local → sube en silencio, adopta y reconoce la base", async () => {
    const { syncOnLogin } = await syncModule();
    const { useGameStore } = await gameModule();
    const { loadSyncMeta } = await storageModule();
    await setUser("u-sube");
    await setLocal({ hasProfile: true, name: "Marina", xp: 500 });
    const merged = makeState("Marina", 500);
    const updatedAt = iso();
    apiState.remote = null;
    apiState.importResult = { merged, updatedAt };

    await syncOnLogin();

    // Sube la bitácora por import (una vez) y no toca el PUT.
    expect(paths()).toEqual(["GET /progress", "POST /progress/import"]);
    const importInput = calls[1].input as PersistedState;
    expect(importInput.profile.name).toBe("Marina");
    // Adopta el merged y reconoce la base: a partir de aquí, fullSync normal.
    expect(useGameStore.getState().hasProfile).toBe(true);
    expect(useGameStore.getState().profile.name).toBe("Marina");
    const meta = loadSyncMeta();
    expect(meta.baseUpdatedAt).toBe(updatedAt);
    expect(meta.dirty).toBe(false);
    expect(meta.lastSyncedAt).not.toBeNull();
  });

  test("corre UNA sola vez por usuario y arranque; syncNow fuerza el ciclo completo", async () => {
    const { syncOnLogin, syncNow } = await syncModule();
    const { loadSyncMeta } = await storageModule();
    await setUser("u-una-vez");
    await setLocal({ hasProfile: true, name: "Marina" });
    const updatedAt = iso();
    apiState.importResult = { merged: makeState("Marina", 500), updatedAt };

    await syncOnLogin();
    const afterFirst = calls.length;
    // Segundo intento en el mismo arranque: nada nuevo (ni GET).
    await syncOnLogin();
    expect(calls.length).toBe(afterFirst);
    // El barco ya conoce la bitácora (el mock refleja el import).
    apiState.remote = { version: 1, payload: makeState("Marina", 500), updatedAt };
    // "Sincronizar ahora": botón manual de tranquilidad que fuerza el ciclo.
    // Con la base ya reconocida el ciclo es un fullSync (GET; todo al día).
    await syncNow();
    expect(paths()).toEqual(["GET /progress", "POST /progress/import", "GET /progress", "GET /progress"]);
    expect(loadSyncMeta().baseUpdatedAt).toBe(updatedAt);
  });

  test("barco con datos + dispositivo limpio → adopta el remoto tal cual y aterriza en el mapa", async () => {
    const { syncOnLogin } = await syncModule();
    const { useGameStore } = await gameModule();
    const { useUiStore } = await uiModule();
    const { loadSyncMeta } = await storageModule();
    await setUser("u-adopta");
    await setLocal({ hasProfile: false });
    const updatedAt = iso();
    apiState.remote = { version: 1, payload: makeState("Farera", 900), updatedAt };

    await syncOnLogin();

    // Ni import ni PUT: el remoto se adopta directo (el agujero histórico).
    expect(paths()).toEqual(["GET /progress"]);
    expect(useGameStore.getState().hasProfile).toBe(true);
    expect(useGameStore.getState().profile.name).toBe("Farera");
    expect(useGameStore.getState().core.xp).toBe(900);
    expect(loadSyncMeta().baseUpdatedAt).toBe(updatedAt);
    // La cuenta ya jugada entra directo al mapa, sin onboarding ni portada.
    expect(useUiStore.getState().screen.name).toBe("home");
  });

  test("barco con datos + bitácora local → une barco y dispositivo, adopta el resultado", async () => {
    const { syncOnLogin } = await syncModule();
    const { useGameStore } = await gameModule();
    const { loadSyncMeta } = await storageModule();
    await setUser("u-une");
    await setLocal({ hasProfile: true, name: "Marina", xp: 500 });
    apiState.remote = { version: 1, payload: makeState("Marina-PC", 1200), updatedAt: iso() };
    const mergedUpdated = iso();
    apiState.importResult = { merged: makeState("Unida", 1700), updatedAt: mergedUpdated };

    await syncOnLogin();

    expect(paths()).toEqual(["GET /progress", "POST /progress/import"]);
    expect(useGameStore.getState().profile.name).toBe("Unida");
    expect(useGameStore.getState().core.xp).toBe(1700);
    expect(loadSyncMeta().baseUpdatedAt).toBe(mergedUpdated);
    // Con bitácora local no hay navegación forzada: el usuario sigue donde estaba.
  });

  test("import 403 (correo sin verificar) → fallback PUT normal con la base del remoto", async () => {
    const { syncOnLogin } = await syncModule();
    const { useGameStore } = await gameModule();
    const { loadSyncMeta } = await storageModule();
    await setUser("u-403");
    await setLocal({ hasProfile: true, name: "Marina", xp: 500 });
    const remoteUpdated = iso();
    apiState.remote = { version: 1, payload: makeState("PC", 800), updatedAt: remoteUpdated };
    apiState.importStatus = 403;
    const putUpdated = iso();
    apiState.putResult = { status: 200, merged: makeState("Unida-403", 1300), updatedAt: putUpdated };

    await syncOnLogin();

    expect(paths()).toEqual(["GET /progress", "POST /progress/import", "PUT /progress"]);
    const putInput = calls[2].input as { baseUpdatedAt: string | null };
    // El PUT usa la base del remoto para que el servidor mezcle (nunca machaque).
    expect(putInput.baseUpdatedAt).toBe(remoteUpdated);
    expect(useGameStore.getState().profile.name).toBe("Unida-403");
    expect(loadSyncMeta().baseUpdatedAt).toBe(putUpdated);
  });

  test("cuenta nueva sin datos → no sube nada (el barco queda limpio) y navega al onboarding", async () => {
    const { syncOnLogin } = await syncModule();
    const { useGameStore } = await gameModule();
    const { useUiStore } = await uiModule();
    const { loadSyncMeta } = await storageModule();
    await setUser("u-nueva");
    await setLocal({ hasProfile: false });
    apiState.remote = null;

    await syncOnLogin();

    expect(paths()).toEqual(["GET /progress"]);
    expect(useGameStore.getState().hasProfile).toBe(false);
    expect(loadSyncMeta().baseUpdatedAt).toBeNull();
    expect(useUiStore.getState().screen.name).toBe("onboarding");
  });

  test("sin red al abrir: el ciclo no marca nada y el reintento sube al volver", async () => {
    const { syncOnLogin } = await syncModule();
    const { loadSyncMeta } = await storageModule();
    await setUser("u-reintento");
    await setLocal({ hasProfile: true, name: "Marina" });
    apiState.getThrows = true;

    await syncOnLogin();
    expect(loadSyncMeta().baseUpdatedAt).toBeNull();

    // Vuelve la red: el ciclo (que quedó pendiente) corre y sube en silencio.
    apiState.getThrows = false;
    apiState.importResult = { merged: makeState("Marina", 500), updatedAt: iso() };
    await syncOnLogin();
    expect(paths()).toEqual(["GET /progress", "GET /progress", "POST /progress/import"]);
  });

  test("base ya reconocida → fullSync de siempre (adopta el remoto más nuevo, sin import)", async () => {
    const { syncOnLogin } = await syncModule();
    const { useGameStore } = await gameModule();
    const { saveSyncMeta } = await storageModule();
    await setUser("u-base-vieja");
    await setLocal({ hasProfile: true, name: "Local", xp: 300 });
    const baseOld = iso();
    saveSyncMeta({ baseUpdatedAt: baseOld, lastSyncedAt: Date.now(), dirty: false, snapshot: null });
    const remoteUpdated = iso();
    apiState.remote = { version: 1, payload: makeState("Barco", 400), updatedAt: remoteUpdated };

    await syncOnLogin();

    // Ciclo (GET) + fullSync (GET): nunca import ni PUT en este caso.
    expect(paths()).toEqual(["GET /progress", "GET /progress"]);
    expect(useGameStore.getState().profile.name).toBe("Barco");
    expect(useGameStore.getState().core.xp).toBe(400);
  });

  test("espera la hidratación local antes de decidir (no confunde 'sin bitácora')", async () => {
    const { syncOnLogin } = await syncModule();
    const { useGameStore } = await gameModule();
    await setUser("u-hidratacion");
    // Sin hidratar todavía: la bitácora aparece 300 ms después.
    useGameStore.setState({ hydrated: false, hasProfile: false });
    setTimeout(() => {
      void setLocal({ hasProfile: true, name: "Tarde", xp: 100 });
    }, 300);
    apiState.importResult = { merged: makeState("Tarde", 100), updatedAt: iso() };

    await syncOnLogin();

    // Esperó a la hidratación y subió la bitácora (no la confundió con un dispositivo limpio).
    expect(paths()).toEqual(["GET /progress", "POST /progress/import"]);
    const importInput = calls[1].input as PersistedState;
    expect(importInput.profile.name).toBe("Tarde");
  });
});

/* ============================== 5 · fullSync arreglado (regresión) ============================== */

describe("sync.ts · fullSync (agujero base desconocida)", () => {
  test("sesión válida + base null + barco con datos + dirty=false → ADOPTA el remoto (antes: nada)", async () => {
    const { fullSync } = await syncModule();
    const { useGameStore } = await gameModule();
    const { loadSyncMeta } = await storageModule();
    await setUser("u-fullsync");
    await setLocal({ hasProfile: true, name: "Local", xp: 10 });
    const updatedAt = iso();
    apiState.remote = { version: 1, payload: makeState("Remoto", 300), updatedAt };

    await fullSync();

    // Exactamente el caso del diagnóstico: ahora el dispositivo recibe el barco.
    expect(paths()).toEqual(["GET /progress"]);
    expect(useGameStore.getState().profile.name).toBe("Remoto");
    expect(loadSyncMeta().baseUpdatedAt).toBe(updatedAt);
    expect(loadSyncMeta().dirty).toBe(false);
  });
});
