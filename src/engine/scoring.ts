import type { AnswerRecord, Difficulty } from "@/types";

/**
 * Motor de puntuación.
 * El XP premia el acierto, la dificultad, el combo y la velocidad,
 * y desincentiva el farmeo (decaimiento por repetición reciente y
 * tope diario suave). Los errores también dan un mínimo de XP de
 * esfuerzo: castigar no enseña.
 */

/** Tope diario de XP a ritmo completo; a partir de aquí, XP a mitad.
 *  Bajado de 600 a 400 en la revisión de dificultad: constancia > farmeo,
 *  y ninguna isla se gana en una sola sentada. */
export const DAILY_XP_SOFT_CAP = 400;
/** Ventana (ms) en la que repetir un ejercicio rinde XP reducido. */
export const REPEAT_WINDOW_MS = 3 * 86_400_000;
/** Multiplicador para ejercicios vistos hace poco (anti-farmeo). */
export const REPEAT_FACTOR = 0.25;

export interface ItemXpResult {
  xp: number;
  base: number;
  comboBonus: number;
  capped: number;
}

export interface ScoreContext {
  difficulty: Difficulty;
  correct: boolean | null;
  grade?: AnswerRecord["grade"];
  timeMs: number;
  /** Combo actual (respuestas correctas consecutivas, incluida esta). */
  combo: number;
  /** El ejercicio ya se vio hace poco (decae el XP). */
  seenRecently: boolean;
  /** XP ganado hoy hasta ahora (para el tope suave). */
  xpToday: number;
  /** ¿La actividad es contrarreloj? (bonus de velocidad) */
  timed: boolean;
}

export function itemXp(ctx: ScoreContext): ItemXpResult {
  let base: number;

  if (ctx.correct === null) {
    // Tarjeta SRS: XP fijo por calificación.
    base = ctx.grade ? { again: 2, hard: 5, good: 7, easy: 9 }[ctx.grade] : 5;
  } else if (ctx.correct) {
    base = 6 + ctx.difficulty * 3; // 9 (d1) … 21 (d5)
    if (ctx.timed) {
      if (ctx.timeMs < 5000) base *= 1.15;
      else if (ctx.timeMs < 9000) base *= 1.05;
    }
    base = Math.round(base);
  } else {
    base = 2; // XP de esfuerzo: participar ya enseña.
  }

  const comboBonus =
    ctx.correct === false ? 0 : Math.round(base * Math.min(ctx.combo, 6) * 0.06);

  let xp = base + comboBonus;

  if (ctx.seenRecently && ctx.correct !== null) xp = Math.round(xp * REPEAT_FACTOR);

  // Tope diario suave: más allá del cap, el XP rinde al 50 %.
  let capped = 0;
  if (ctx.xpToday + xp > DAILY_XP_SOFT_CAP) {
    const fullPart = Math.max(0, DAILY_XP_SOFT_CAP - ctx.xpToday);
    capped = xp - fullPart;
    xp = fullPart + Math.round((xp - fullPart) / 2);
  }

  return { xp, base, comboBonus, capped };
}

/** Bonus de final de sesión por buen dominio (exactitud ≥ 80 % o repaso SRS). */
export function completionBonus(accuracy: number | null, total: number): number {
  if (total < 5) return 0;
  if (accuracy === null) return 10 + Math.round(total * 1.5); // repaso de tarjetas
  if (accuracy >= 0.8) return 10 + Math.round(total * 1.5);
  if (accuracy >= 0.5) return 5; // constancia con margen de mejora
  return 0;
}

/** Mejor combo de una sesión a partir del historial de aciertos. */
export function bestComboFrom(answers: AnswerRecord[]): number {
  let best = 0;
  let current = 0;
  for (const a of answers) {
    if (a.correct === true || (a.correct === null && a.grade && a.grade !== "again")) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}
