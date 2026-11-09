import type { Exercise, SkillId } from "@/types";
import { TRIVIA_PACK } from "./trivia";
import { CLOZE_PACK } from "./cloze";
import { TILDES_PACK } from "./tildes";
import { ERRORS_PACK } from "./errors-hunt";
import { PUZZLE_PACK } from "./puzzles";
import { PARAGRAPHS_PACK } from "./paragraphs";
import { SPRINT_PACK } from "./sprint";
import { SRS_WORDS } from "./words-srs";
import { SRS_WORDS_C1 } from "./gen/words-srs-c1";
import { SRS_WORDS_D1 } from "./gen/words-srs-d1";
import { SRS_WORDS_E1 } from "./gen/words-srs-e1";
// ---- Packs perezosos: dictados, historias, sinónimos, matices, refranes… ----
// Los packs grandes de los juegos de Etapa 2+ ya NO se importan aquí: viven
// en grupos «pk-*» de pool-loader.ts y llegan con import() dinámico al
// entrar al minijuego. content.ts queda solo con el núcleo inmediato
// (evaluación inicial + primeros juegos) y el paquete inicial adelgaza
// cientos de KB.
// ---- Etapa 3 · nuevos formatos (memoria, intruso, sortea, vf, escribe, oye, conecta) ----
import { MEMORIA_PACKS } from "./formats/memoria";
import { INTRUSO_PACKS } from "./formats/intruso";
import { SORTEA_PACKS } from "./formats/sortea";
import { VF_PACKS } from "./formats/verdadero-falso";
import { ESCRIBE_PACKS } from "./formats/escribe";
import { OYE_PACKS } from "./formats/oye";
import { CONECTA_PACKS } from "./formats/conecta";
// (CONECTA_BOSQUE_X se carga bajo demanda: grupo pk-conecta.)
// ---- Etapa 4 · Forja del Escritor (estilo y retórica) ----
import { FORJA_PACKS } from "./forja";
// ---- Etapa 4 · palabras SRS ampliadas ----
import { SRS_WORDS_B } from "./words-srs-b";
// ---- Mega-7 · 45 minijuegos nuevos (hasta 100) ----
import {
  ABECEDARIO_PACK,
  ACENTOS_PACK,
  ANALOGIAS_PACK,
  COLOCACIONES_PACK,
  DEFINICIONES_PACK,
  DERIVADAS_PACK,
  FAMILIAS_PACK,
  GRADOS_PACK,
  POLISEMIA_PACK,
  SILABAS_PACK,
} from "./formats/mega7-a";
import {
  CONCORDANCIA_PACK,
  ESTILO_PACK,
  GENERO_PACK,
  PASIVA_PACK,
  PORPARA_PACK,
  PRONOMBRES_PACK,
  RELATIVOS_PACK,
  SERESTAR_PACK,
  SUBJUNTIVO_PACK,
  TIEMPOS_PACK,
} from "./formats/mega7-b";
import {
  BV_PACK,
  CIFRAS_PACK,
  CSZ_PACK,
  GJ_PACK,
  HACH_PACK,
  HOMOFONOS_PACK,
  LLY_PACK,
  MAYUSCULAS_PACK,
  PUNTUACION_PACK,
} from "./formats/mega7-c";
import {
  CIERRE_PACK,
  DESCRIPCIONES_PACK,
  ENTONACION_PACK,
  FALSOS_PACK,
  IDEA_PACK,
  INFERENCIA_PACK,
  INICIADORES_PACK,
  OYE_ACENTO_PACK,
  OYE_NUM_PACK,
  PROPOSITO_PACK,
  REGIONES_PACK,
  RESUMEN_PACK,
  SECUENCIA_PACK,
  TITULO_PACK,
  TONO_PACK,
  VOCABCTX_PACK,
} from "./formats/mega7-d";

/** Packs Mega-7 agrupados (los 45 juegos nuevos). */
export const MEGA7_PACKS: Exercise[] = [
  ...ACENTOS_PACK, ...SILABAS_PACK, ...ANALOGIAS_PACK, ...COLOCACIONES_PACK,
  ...GRADOS_PACK, ...POLISEMIA_PACK, ...DERIVADAS_PACK, ...FAMILIAS_PACK,
  ...ABECEDARIO_PACK, ...DEFINICIONES_PACK,
  ...CONCORDANCIA_PACK, ...SERESTAR_PACK, ...PORPARA_PACK, ...SUBJUNTIVO_PACK,
  ...TIEMPOS_PACK, ...PRONOMBRES_PACK, ...RELATIVOS_PACK, ...ESTILO_PACK,
  ...PASIVA_PACK, ...GENERO_PACK,
  ...BV_PACK, ...GJ_PACK, ...HACH_PACK, ...LLY_PACK, ...CSZ_PACK,
  ...HOMOFONOS_PACK, ...PUNTUACION_PACK, ...MAYUSCULAS_PACK, ...CIFRAS_PACK,
  ...TITULO_PACK, ...IDEA_PACK, ...RESUMEN_PACK, ...TONO_PACK,
  ...INFERENCIA_PACK, ...SECUENCIA_PACK, ...PROPOSITO_PACK, ...VOCABCTX_PACK,
  ...ENTONACION_PACK, ...OYE_ACENTO_PACK, ...OYE_NUM_PACK,
  ...INICIADORES_PACK, ...CIERRE_PACK, ...DESCRIPCIONES_PACK,
  ...REGIONES_PACK, ...FALSOS_PACK,
];

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
  // ---- Etapa 2 · núcleo inmediato (sprint); el resto llega bajo demanda ----
  ...SPRINT_PACK,
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
  // ---- Mega-7 · 45 minijuegos nuevos ----
  ...MEGA7_PACKS,
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
export const SRS_WORDS_FULL = [...SRS_WORDS, ...SRS_WORDS_B, ...SRS_WORDS_C1, ...SRS_WORDS_D1, ...SRS_WORDS_E1];

export { SRS_WORDS };
