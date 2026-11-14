/**
 * Selecciones inteligentes de la pantalla de Entrenamientos (Área 6) —
 * lógica pura y testeable. Nada de datos nuevos: todo sale del estado
 * que ya existe (habilidades, desbloqueos y última sesión).
 */

import { GAMES, type GameInfo } from "@/data/games";
import type { GameId, SkillId } from "@/types";

/** Habilidad más débil (nivel más bajo); empates resueltos por orden fijo. */
export const SKILL_ORDER: SkillId[] = [
  "vocabulario",
  "gramatica",
  "ortografia",
  "lectura",
  "audicion",
  "expresion",
  "cultura",
];

/** El «reto de hoy»: el formato ABIERTO que entrena la habilidad más
 *  débil del jugador. null si no hay ningún formato abierto. */
export function recommendTraining(
  skills: Partial<Record<SkillId, number>>,
  isOpen: (gameId: GameId) => boolean,
): GameInfo | null {
  let weakest: { skill: SkillId; level: number } | null = null;
  for (const skill of SKILL_ORDER) {
    const level = skills[skill] ?? 2;
    if (!weakest || level < weakest.level) weakest = { skill, level };
  }
  if (!weakest) return null;
  const candidates = Object.values(GAMES).filter((g) => g.skill === weakest.skill && isOpen(g.id));
  if (candidates.length === 0) {
    // La habilidad más débil no tiene formatos abiertos todavía:
    // se recomienda entre los abiertos de cualquier habilidad.
    const any = Object.values(GAMES).filter((g) => isOpen(g.id));
    return any[0] ?? null;
  }
  return candidates[0];
}

/** El formato a retomar: el último jugado si existe y es real. */
export function lastPlayedTraining(
  lastGameId: string | undefined,
): GameInfo | null {
  if (!lastGameId) return null;
  const g = GAMES[lastGameId as GameId];
  return g ?? null;
}
