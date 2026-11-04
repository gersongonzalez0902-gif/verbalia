import type { Exercise, SkillId } from "@/types";
import { TRIVIA_PACK } from "./trivia";
import { CLOZE_PACK } from "./cloze";
import { TILDES_PACK } from "./tildes";
import { ERRORS_PACK } from "./errors-hunt";
import { PUZZLE_PACK } from "./puzzles";
import { PARAGRAPHS_PACK } from "./paragraphs";
import { DICTADO_PACK } from "./dictado";
import { MATICES_PACK } from "./matices";
import { LECTURA_PACK } from "./lectura";
import { SPRINT_PACK } from "./sprint";
import { SINONIMOS_PACK } from "./sinonimos";
import { HISTORIAS_PACK } from "./historias";
import { REFRANES_PACK } from "./refranes";
import { MINUTO_PACK } from "./minuto";
import { SRS_WORDS } from "./words-srs";

/**
 * Registro central de contenido: agrupa todos los paquetes,
 * valida duplicados de id en desarrollo y expone consultas por juego,
 * habilidad y dificultad.
 */

export const ALL_EXERCISES: Exercise[] = [
  ...TRIVIA_PACK,
  ...PUZZLE_PACK,
  ...CLOZE_PACK,
  ...ERRORS_PACK,
  ...TILDES_PACK,
  ...PARAGRAPHS_PACK,
  // ---- Etapa 2 ----
  ...DICTADO_PACK,
  ...MATICES_PACK,
  ...LECTURA_PACK,
  ...SPRINT_PACK,
  ...SINONIMOS_PACK,
  ...HISTORIAS_PACK,
  ...REFRANES_PACK,
  ...MINUTO_PACK,
];

export const EXERCISES_BY_ID: Record<string, Exercise> = ALL_EXERCISES.reduce(
  (acc, e) => {
    if (acc[e.id]) {
      throw new Error(`ID de ejercicio duplicado: ${e.id}`);
    }
    acc[e.id] = e;
    return acc;
  },
  {} as Record<string, Exercise>,
);

export const EXERCISES_BY_GAME = ALL_EXERCISES.reduce(
  (acc, e) => {
    (acc[e.type] ||= []).push(e);
    return acc;
  },
  {} as Record<string, Exercise[]>,
);

export function exercisesByGameAndDifficulty(game: string, minD: number, maxD: number): Exercise[] {
  return (EXERCISES_BY_GAME[game] ?? []).filter((e) => e.difficulty >= minD && e.difficulty <= maxD);
}

export function exercisesBySkill(skill: SkillId): Exercise[] {
  return ALL_EXERCISES.filter((e) => e.skill === skill);
}

/* ==================== Evaluación inicial (placement) ==================== */

export interface PlacementItem {
  exerciseId: string;
  skill: SkillId;
}

/**
 * Ocho ítems fijos que cubren las cuatro habilidades entrenables en
 * la Etapa 1, con dificultad creciente (1 → 4).
 */
export const PLACEMENT_ITEMS: PlacementItem[] = [
  { exerciseId: "tv-s01", skill: "vocabulario" }, // d1 trivia (sustantivo)
  { exerciseId: "ti-04", skill: "ortografia" }, // d1 tildes (café)
  { exerciseId: "pz-05", skill: "gramatica" }, // d2 puzzle (subordinada)
  { exerciseId: "cz-05", skill: "lectura" }, // d2 cloze lector (conector de contraste)
  { exerciseId: "tv-a06", skill: "vocabulario" }, // d3 trivia (adjetivo)
  { exerciseId: "cz-08", skill: "gramatica" }, // d3 cloze (ojalá + subjuntivo)
  { exerciseId: "eh-06", skill: "ortografia" }, // d3 errores (hubo impersonal)
  { exerciseId: "pg-04", skill: "lectura" }, // d4 párrafos (leyenda)
];

export const PLACEMENT_EXERCISES: Exercise[] = PLACEMENT_ITEMS.map(
  (p) => EXERCISES_BY_ID[p.exerciseId],
);

/** Distribución de dificultades por paquete (para la Biblioteca de contenidos). */
export function packStats(game: string): { total: number; byDifficulty: Record<number, number> } {
  const list = EXERCISES_BY_GAME[game] ?? [];
  const byDifficulty: Record<number, number> = {};
  for (const e of list) byDifficulty[e.difficulty] = (byDifficulty[e.difficulty] ?? 0) + 1;
  return { total: list.length, byDifficulty };
}

export { SRS_WORDS };
