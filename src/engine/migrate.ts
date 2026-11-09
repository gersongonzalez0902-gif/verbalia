import type { GameCore, PlayerProfile } from "@/types";
import { createCore } from "./core";
import { dateKey, weekKey } from "./missions";

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
  const core: GameCore = {
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
      lastGiftDay: raw.wallet?.lastGiftDay ?? "",
    },
    arcade: {
      ...fresh.arcade,
      ...raw.arcade,
      unlocked: Array.isArray(raw.arcade?.unlocked) ? [...raw.arcade.unlocked] : [],
      best: { ...raw.arcade?.best },
      plays: { ...raw.arcade?.plays },
      playsByDay: { ...raw.arcade?.playsByDay },
      typing: {
        ...fresh.arcade.typing,
        ...raw.arcade?.typing,
      },
    },
    // Logros desbloqueados cuyas recompensas ya se recogieron (retro-compatible).
    achievementsClaimed: Array.isArray(raw.achievementsClaimed) ? [...raw.achievementsClaimed] : [],
  };
  pruneMissionClaims(core);
  return core;
}

/** Poda los registros de reclamo ajenos al periodo en curso.
 *
 * Desde la revisión de misiones las claves llevan el día/semana pegado
 * («2026-11-09::d-md-xp»), de modo que reclamar ayer no «reclama solo»
 * hoy. Las claves de periodos pasadas ya no valen para nada: fuera.
 * Las claves antiguas sin fecha (formato previo) también se retiran —
 * pertenecen a misiones de días anteriores y solo causaban fantasmas. */
function pruneMissionClaims(core: GameCore): void {
  const now = new Date();
  const today = dateKey(now);
  const wKey = weekKey(now);
  core.missions.daily.claimed = core.missions.daily.claimed.filter(
    (k) => k.startsWith(`${today}::`),
  );
  core.missions.weekly.claimed = core.missions.weekly.claimed.filter(
    (k) => k.startsWith(`${wKey}::`),
  );
}
