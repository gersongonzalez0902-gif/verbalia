/**
 * Motor de candados ampliados · VERBALIA (final de la Etapa 2)
 * ----------------------------------------------------------------
 * Hay formatos que ya no se abren solo con la llave de su isla:
 * exigen, además, logros cosechados, tinta gastada en el Bazar o un
 * nivel de navegante más alto. Una única fuente de verdad para el
 * catálogo de entrenamientos, la vitrina de inicio y la propia
 * pantalla de juego (que corta el paso con elegancia si alguien
 * llega por un enlace directo).
 */

import type { GameCore, GameId } from "@/types";

/** Requisito extra de un formato, además del nivel de su región. */
export interface ExtraRequirement {
  /** Nivel de navegante exigido (siempre ≥ el de su isla). */
  level?: number;
  /** Logros desbloqueados exigidos. */
  achievements?: number;
  /** Tinta gastada en el Bazar exigida. */
  tintaSpent?: number;
}

/** Contexto de progreso puro que evalúa los candados. */
export interface UnlockContext {
  level: number;
  achievements: number;
  tintaSpent: number;
}

/**
 * Candados extra por formato. Solo se listan los formatos «de
 * colección»: el resto se abre con su isla, sin más vueltas.
 * Los requisitos de nivel son siempre ≥ el de su región, y los de
 * logros/tinta se alcanzan con juego normal (una partida diaria
 * rinde 2-4 logros la primera semana).
 */
export const GAME_REQUIREMENTS: Partial<Record<GameId, ExtraRequirement>> = {
  /* ── Bosque (isla 1): premian la visita al Bazar ── */
  tinder: { tintaSpent: 4 },
  rasca: { tintaSpent: 6 },

  /* ── Fortaleza (isla 3): oficios que piden oficio ── */
  tipeo: { achievements: 4 },
  labpunt: { achievements: 6 },

  /* ── Biblioteca (isla 4): salas reservadas ── */
  jeroglificos: { level: 5 },
  mitos: { achievements: 3 },
  lectura: { achievements: 5 },

  /* ── Puerto (isla 5): micrófonos y ecos finos ── */
  voz: { level: 6 },
  eco: { level: 6 },
  fonetica: { achievements: 4 },

  /* ── Torre (isla 6): relatos largos ── */
  historias: { level: 7 },

  /* ── Observatorio (isla 7): mapas de palabras ── */
  regiones: { achievements: 6 },
  falsosamigos: { tintaSpent: 8 },
};

/** Contexto de desbloqueo derivado del núcleo de progreso. */
export function unlockContext(core: GameCore, level: number): UnlockContext {
  return {
    level,
    achievements: Object.keys(core.achievements ?? {}).length,
    tintaSpent: core.wallet?.spent ?? 0,
  };
}

/** Etiquetas legibles de un requisito (para candados y tooltips). */
export function requirementLabels(req: ExtraRequirement): string[] {
  const labels: string[] = [];
  if (req.level) labels.push(`nivel ${req.level}`);
  if (req.achievements) labels.push(`${req.achievements} logros`);
  if (req.tintaSpent) labels.push(`${req.tintaSpent} de tinta gastada`);
  return labels;
}

/** ¿Cumple el contexto todos los puntos del requisito? */
export function meetsRequirement(req: ExtraRequirement, ctx: UnlockContext): boolean {
  if (req.level !== undefined && ctx.level < req.level) return false;
  if (req.achievements !== undefined && ctx.achievements < req.achievements) return false;
  if (req.tintaSpent !== undefined && ctx.tintaSpent < req.tintaSpent) return false;
  return true;
}

/**
 * Candado completo de un formato: región + requisito extra.
 * Devuelve si está abierto y, si no, los motivos legibles.
 */
export function gameLock(
  gameId: GameId,
  regionLevel: number | undefined,
  ctx: UnlockContext,
): { unlocked: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (regionLevel !== undefined && ctx.level < regionLevel) {
    reasons.push(`nivel ${regionLevel} de navegante`);
  }
  const extra = GAME_REQUIREMENTS[gameId];
  if (extra && !meetsRequirement(extra, ctx)) {
    reasons.push(...requirementLabels(extra));
  }
  return { unlocked: reasons.length === 0, reasons };
}

/** Frase corta del candado para botones y chips («Nivel 5 · 3 logros»). */
export function lockChipText(gameId: GameId, regionLevel: number | undefined): string {
  const parts: string[] = [];
  if (regionLevel !== undefined) parts.push(`Nivel ${regionLevel}`);
  const extra = GAME_REQUIREMENTS[gameId];
  if (extra) {
    if (extra.level) parts.push(`Nivel ${extra.level}`);
    if (extra.achievements) parts.push(`${extra.achievements} logros`);
    if (extra.tintaSpent) parts.push(`${extra.tintaSpent} de tinta`);
  }
  return parts.join(" · ");
}
