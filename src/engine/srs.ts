import type { SrsCard, SrsGrade } from "@/types";

/**
 * Motor SRS · SM-2 simplificado y adaptado a sesiones cortas.
 * Puro y determinista: recibe una tarjeta y una calificación,
 * devuelve la tarjeta actualizada.
 */

const DAY_MS = 86_400_000;
export const MIN_EASE = 1.3;
export const MAX_EASE = 2.8;
/** Intervalo (días) a partir del cual una palabra se considera dominada. */
export const MASTERY_INTERVAL_DAYS = 21;
/** Repeticiones correctas mínimas para "aprendida". */
export const LEARNED_REPS = 2;

export function newCard(wordId: string, now: number): SrsCard {
  return {
    wordId,
    ease: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    dueAt: now,
    introducedAt: now,
    lastReviewedAt: null,
    state: "learning",
    updatedAt: now,
  };
}

export function clampEase(ease: number): number {
  return Math.max(MIN_EASE, Math.min(MAX_EASE, ease));
}

/**
 * Calcula la siguiente tarjeta tras una calificación.
 * - again: reintenta en la misma sesión (10 min), baja la facilidad.
 * - hard: intervalo mínimo, pequeña penalización.
 * - good: sigue el intervalo programado.
 * - easy: acelera el intervalo y mejora la facilidad.
 */
export function reviewCard(card: SrsCard, grade: SrsGrade, now: number): SrsCard {
  let { ease, intervalDays } = card;
  let reps = card.reps;
  let lapses = card.lapses;

  switch (grade) {
    case "again":
      ease = clampEase(ease - 0.2);
      reps = 0;
      lapses += 1;
      intervalDays = 0;
      break;
    case "hard":
      ease = clampEase(ease - 0.15);
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
      reps += 1;
      break;
    case "good":
      intervalDays = intervalDays === 0 ? 1 : Math.round(intervalDays * ease);
      reps += 1;
      break;
    case "easy":
      ease = clampEase(ease + 0.15);
      intervalDays =
        intervalDays === 0 ? 3 : Math.round(intervalDays * ease * 1.3);
      reps += 1;
      break;
  }

  // Límite de intervalo razonable (un año)
  intervalDays = Math.min(365, intervalDays);

  const nextDue =
    intervalDays === 0
      ? now + 10 * 60 * 1000 // 10 minutos: reaparece en la sesión actual
      : now + intervalDays * DAY_MS;

  return {
    ...card,
    ease,
    intervalDays,
    reps,
    lapses,
    dueAt: nextDue,
    lastReviewedAt: now,
    state: intervalDays >= 3 ? "review" : "learning",
    updatedAt: now,
  };
}

/** XP de una tarjeta según la calificación (sin decaimiento: es repaso legítimo). */
export function srsGradeXp(grade: SrsGrade): number {
  switch (grade) {
    case "again":
      return 2;
    case "hard":
      return 5;
    case "good":
      return 7;
    case "easy":
      return 9;
  }
}

/** ¿La palabra está aprendida? (repeticiones suficientes). */
export function isLearned(card: SrsCard): boolean {
  return card.reps >= LEARNED_REPS;
}

/** ¿La palabra está dominada? (intervalo largo en revisión). */
export function isMastered(card: SrsCard): boolean {
  return card.state === "review" && card.intervalDays >= MASTERY_INTERVAL_DAYS;
}

export type SrsStatus = "nueva" | "aprendiendo" | "aprendida" | "dominada";

export function cardStatus(card: SrsCard | undefined): SrsStatus {
  if (!card) return "nueva";
  if (isMastered(card)) return "dominada";
  if (isLearned(card)) return "aprendida";
  return "aprendiendo";
}
