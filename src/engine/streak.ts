import type { GameCore } from "@/types";
import { dateKey } from "./missions";

/**
 * Motor de rachas flexibles.
 * - Un día cuenta con ≥ 1 sesión completada.
 * - Si se rompe la racha pero hay escudos (se apilan hasta 3, ver
 *   MAX_SHIELDS en tienda), se consume uno y la racha sobrevive
 *   sin fricción ni aviso ansioso.
 * - Los escudos se ganan con la misión semanal de constancia o se compran.
 */

export interface StreakOutcome {
  streak: GameCore["streak"];
  /** Se consumió un escudo para salvar la racha. */
  shieldUsed: boolean;
  /** La racha empezó hoy (primera sesión). */
  started: boolean;
}

function daysBetween(fromKey: string, toKey: string): number {
  const a = new Date(`${fromKey}T00:00:00`).getTime();
  const b = new Date(`${toKey}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function updateStreak(core: GameCore, now: Date): StreakOutcome {
  const today = dateKey(now);
  const streak = { ...core.streak };
  let shieldUsed = false;
  let started = false;

  if (streak.lastActiveDay === today) {
    return { streak, shieldUsed, started }; // ya contó hoy
  }

  if (streak.lastActiveDay === null) {
    streak.current = 1;
    started = true;
  } else {
    const gap = daysBetween(streak.lastActiveDay, today);
    if (gap === 1) {
      streak.current += 1;
    } else if (gap > 1 && streak.shields > 0) {
      // Un escudo protege exactamente un día de ausencia consecutivo.
      streak.shields -= 1;
      streak.current += 1;
      shieldUsed = true;
    } else {
      streak.current = 1; // reinicio suave: nunca se resta nada
      started = true;
    }
  }

  streak.lastActiveDay = today;
  streak.best = Math.max(streak.best, streak.current);
  return { streak, shieldUsed, started };
}
