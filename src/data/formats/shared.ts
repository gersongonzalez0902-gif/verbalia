import type { Cefr, Difficulty } from "@/types";

/**
 * Utilidades comunes de los packs de formatos nuevos (Etapa 3).
 * Todos los packs son deterministas (sin Math.random ni Date.now)
 * para que servidor y cliente hidraten exactamente igual.
 */

/** MCER orientativo por dificultad interna. */
export const CEFR_BY_DIFFICULTY: Record<Difficulty, Cefr> = {
  1: "A1",
  2: "A2",
  3: "B1",
  4: "B2",
  5: "C1",
};

/** Id secuencial y estable: `prefijo-variante-001`. */
export function fmtId(prefix: string, variant: string, i: number): string {
  return `${prefix}-${variant}-${String(i + 1).padStart(3, "0")}`;
}

/** Recorta una definición larga para caber en una tarjeta. */
export function shortDef(def: string, max = 62): string {
  if (def.length <= max) return def;
  const cut = def.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 30 ? lastSpace : max)}…`;
}
