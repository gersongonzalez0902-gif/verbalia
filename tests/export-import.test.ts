/**
 * Pruebas de la Ola 1.2 · copia de la bitácora sin cuenta.
 *
 * Dos exigencias del plan (PROMPT E · 1):
 * (a) export→import en ciclo completo restaura perfil y progreso;
 * (b) JSON inválido o incompleto devuelve false sin corromper nada.
 *
 * El storage real se usa tal cual con un localStorage en memoria; en bun
 * no hay IndexedDB (igual que en un navegador viejo): el espejo
 * localStorage queda como única fuente y la cola de sync en vacío.
 * El zustand del game-store no toca red ni audio en este ciclo.
 */

import { beforeEach, describe, expect, test } from "bun:test";

/* localStorage en memoria (storage.save/markSyncDirty lo usan). */
const lsBacking = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => lsBacking.get(k) ?? null,
  setItem: (k: string, v: string) => void lsBacking.set(k, String(v)),
  removeItem: (k: string) => void lsBacking.delete(k),
};

import { useGameStore } from "@/store/game-store";
import { createCore } from "@/engine/core";
import { CURRENT_SCHEMA_VERSION } from "@/services/storage";
import type { PlayerProfile, SrsCard } from "@/types";

function profileNamed(name: string): PlayerProfile {
  return {
    name,
    avatar: "gaviota",
    goal: "leer",
    experience: "intermedio",
    gender: "f",
    bio: "",
    banner: "preset:aurora",
    photo: "",
    featuredBadge: "",
    createdAt: 1_700_000_000_000,
    onboarded: true,
    placementDone: true,
  };
}

function card(wordId: string, reps: number): SrsCard {
  return {
    wordId,
    ease: 2.5,
    intervalDays: reps,
    reps,
    lapses: 0,
    dueAt: 1_700_000_000_000 + reps * 86_400_000,
    firstSeenAt: 1_700_000_000_000,
  } as SrsCard;
}

/** Estado «Ana»: el que se exporta y debe volver intacto tras importar. */
function seedAna() {
  useGameStore.setState({
    profile: profileNamed("Ana"),
    hasProfile: true,
    core: { ...createCore(), xp: 1234, streak: { current: 7, shields: 1, lastDay: "2026-11-13" } },
    srs: { w1: card("w1", 3), w2: card("w2", 1) },
    lastResult: null,
  });
}

/** Copia sin el sello de tiempo: exportJson() pone savedAt = ahora, y
 *  comparar dos exports seguidos solo difiere en ese sello. */
function snapshot(): Omit<ReturnType<typeof JSON.parse>, never> {
  const { savedAt: _savedAt, ...rest } = JSON.parse(useGameStore.getState().exportJson()) as Record<string, unknown>;
  return rest;
}

beforeEach(() => {
  seedAna();
});

describe("Ola 1.2 · copia sin cuenta (exportJson/importJson)", () => {
  test("(a) ciclo completo: export → import restaura perfil y progreso", async () => {
    const store = useGameStore.getState();
    const text = store.exportJson();

    // La copia es JSON legible con el esqueleto completo.
    const parsed = JSON.parse(text) as Record<string, unknown>;
    expect(parsed.version).toBe(CURRENT_SCHEMA_VERSION);
    expect((parsed.profile as PlayerProfile).name).toBe("Ana");
    expect((parsed.core as { xp: number }).xp).toBe(1234);

    // El navegador "de destino" tiene otra partida (Otro, sin tarjetas).
    useGameStore.setState({
      profile: { ...profileNamed("Otro"), onboarded: false, placementDone: false },
      hasProfile: false,
      core: createCore(),
      srs: {},
    });
    expect(useGameStore.getState().profile.name).toBe("Otro");
    expect(useGameStore.getState().core.xp).not.toBe(1234);

    // Se importa la copia de Ana: el estado vuelve tal cual estaba.
    const ok = await useGameStore.getState().importJson(text);
    expect(ok).toBe(true);
    const restored = useGameStore.getState();
    expect(restored.profile.name).toBe("Ana");
    expect(restored.profile.onboarded).toBe(true);
    expect(restored.profile.placementDone).toBe(true);
    expect(restored.hasProfile).toBe(true);
    expect(restored.core.xp).toBe(1234);
    expect(restored.core.streak.current).toBe(7);
    expect(Object.keys(restored.srs).sort()).toEqual(["w1", "w2"]);
    expect(restored.srs.w1.reps).toBe(3);
  });

  test("(b) JSON inválido devuelve false sin corromper nada", async () => {
    const before = snapshot();
    const ok = await useGameStore.getState().importJson("{esto no es json");
    expect(ok).toBe(false);
    expect(snapshot()).toEqual(before);
  });

  test("(b) JSON válido pero incompleto (sin core ni profile) devuelve false y no toca nada", async () => {
    const before = snapshot();
    const incomplete = JSON.stringify({
      version: CURRENT_SCHEMA_VERSION,
      srs: {},
      savedAt: Date.now(),
    });
    const ok = await useGameStore.getState().importJson(incomplete);
    expect(ok).toBe(false);
    expect(useGameStore.getState().profile.name).toBe("Ana");
    expect(useGameStore.getState().core.xp).toBe(1234);
    expect(snapshot()).toEqual(before);
  });

  test("(b) copia de una versión futura se rechaza sin corromper nada", async () => {
    const before = snapshot();
    const future = JSON.stringify({
      version: CURRENT_SCHEMA_VERSION + 1,
      profile: profileNamed("Viajera del futuro"),
      settings: {},
      core: createCore(),
      srs: {},
      savedAt: Date.now(),
    });
    const ok = await useGameStore.getState().importJson(future);
    expect(ok).toBe(false);
    expect(useGameStore.getState().profile.name).toBe("Ana");
    expect(snapshot()).toEqual(before);
  });
});
