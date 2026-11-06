import type { GameCore, PlayerProfile } from "@/types";
import { createCore } from "./core";

/**
 * Migración de partidas antiguas (Etapa 4).
 *
 * Los perfiles y núcleos guardados con versiones anteriores del esquema
 * pueden carecer de campos añadidos después (banner, bio, wallet,
 * stats.totalTimeMs, skills.cultura…). Estas dos funciones fusionan el
 * dato guardado con un estado recién creado, de modo que **ningún
 * añadido futuro pueda romper una partida existente**.
 *
 * Son funciones puras: se prueban en tests/engine.test.ts.
 */

export const EMPTY_PROFILE: PlayerProfile = {
  name: "",
  avatar: "owl",
  goal: "leer",
  experience: "principiante",
  gender: "x",
  bio: "",
  banner: "preset:aurora",
  photo: "",
  featuredBadge: "",
  createdAt: 0,
  onboarded: false,
  placementDone: false,
};

/** Rellena los campos ausentes de un perfil guardado. */
export function migrateProfile(raw: Partial<PlayerProfile> | undefined | null): PlayerProfile {
  const p = (raw ?? {}) as Partial<PlayerProfile>;
  return {
    ...EMPTY_PROFILE,
    ...p,
    createdAt: p.createdAt && p.createdAt > 0 ? p.createdAt : Date.now(),
  };
}

/** Fusiona en profundidad un núcleo antiguo con uno recién creado. */
export function migrateCore(raw: Partial<GameCore> | undefined | null): GameCore {
  const fresh = createCore();
  if (!raw) return fresh;
  return {
    ...fresh,
    ...raw,
    skills: { ...fresh.skills, ...raw.skills },
    stats: { ...fresh.stats, ...raw.stats },
    streak: { ...fresh.streak, ...raw.streak },
    missions: {
      daily: { ...fresh.missions.daily, ...raw.missions?.daily },
      weekly: { ...fresh.missions.weekly, ...raw.missions?.weekly },
    },
    wallet: {
      ...fresh.wallet,
      ...raw.wallet,
      owned: Array.isArray(raw.wallet?.owned) ? [...raw.wallet.owned] : [],
    },
  };
}
