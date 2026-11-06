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
// ---- Etapa 3 · duplicación de variedad (packs ampliados) ----
import { TRIVIA_PACK_X } from "./gen/trivia-x";
import { CLOZE_PACK_X } from "./gen/cloze-x";
import { DICTADO_PACK_X } from "./gen/dictado-x";
import { ERRORS_PACK_X } from "./gen/errors-hunt-x";
import { MATICES_PACK_X } from "./gen/matices-x";
import { LECTURA_PACK_X } from "./gen/lectura-x";
import { MINUTO_PACK_X } from "./gen/minuto-x";
import { SINONIMOS_PACK_X } from "./gen/sinonimos-x";
import { HISTORIAS_PACK_X } from "./gen/historias-x";
// ---- Etapa 3 · nuevos formatos (memoria, intruso, sortea, vf, escribe, oye, conecta) ----
import { MEMORIA_PACKS } from "./formats/memoria";
import { INTRUSO_PACKS } from "./formats/intruso";
import { SORTEA_PACKS } from "./formats/sortea";
import { VF_PACKS } from "./formats/verdadero-falso";
import { ESCRIBE_PACKS } from "./formats/escribe";
import { OYE_PACKS } from "./formats/oye";
import { CONECTA_PACKS } from "./formats/conecta";
// ---- Etapa 4 · Forja del Escritor (estilo y retórica) ----
import { FORJA_PACKS } from "./forja";
// ---- Etapa 4 · palabras SRS ampliadas ----
import { SRS_WORDS_B } from "./words-srs-b";

/**
 * Registro central de contenido: agrupa todos los paquetes,
 * valida duplicados de id en desarrollo y expone consultas por juego,
 * habilidad y dificultad.
 */

export const ALL_EXERCISES: Exercise[] = [
  ...TRIVIA_PACK, ...TRIVIA_PACK_X,
  ...PUZZLE_PACK,
  ...CLOZE_PACK, ...CLOZE_PACK_X,
  ...ERRORS_PACK, ...ERRORS_PACK_X,
  ...TILDES_PACK,
  ...PARAGRAPHS_PACK,
  // ---- Etapa 2 ----
  ...DICTADO_PACK, ...DICTADO_PACK_X,
  ...MATICES_PACK, ...MATICES_PACK_X,
  ...LECTURA_PACK, ...LECTURA_PACK_X,
  ...SPRINT_PACK,
  ...SINONIMOS_PACK, ...SINONIMOS_PACK_X,
  ...HISTORIAS_PACK, ...HISTORIAS_PACK_X,
  ...REFRANES_PACK,
  ...MINUTO_PACK, ...MINUTO_PACK_X,
  // ---- Etapa 3 · cinco nuevos por ciudad ----
  ...MEMORIA_PACKS,
  ...INTRUSO_PACKS,
  ...SORTEA_PACKS,
  ...VF_PACKS,
  ...ESCRIBE_PACKS,
  ...OYE_PACKS,
  ...CONECTA_PACKS,
  // ---- Etapa 4 · Forja del Escritor ----
  ...FORJA_PACKS,
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

/** Palabras SRS completas: catálogo original + ampliación de la Etapa 4. */
export const SRS_WORDS_FULL = [...SRS_WORDS, ...SRS_WORDS_B];

export { SRS_WORDS };
