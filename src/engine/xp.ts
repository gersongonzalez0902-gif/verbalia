/**
 * Motor de progresión · XP, niveles y rangos.
 * Curva exigente (ajustada a la revisión de dificultad): subir de
 * nivel n a n+1 cuesta 130 + (n-1)·55 XP. Las primeras islas se
 * sientan cerca, pero cada zarpazo nuevo exige más navegación.
 */

export const MAX_LEVEL = 60;

/** XP necesario para pasar del nivel n al n+1. */
export function xpForLevelUp(level: number): number {
  return 130 + (level - 1) * 55;
}

/** XP acumulado total necesario para alcanzar un nivel dado. */
export function cumulativeXpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevelUp(l);
  return total;
}

/** Nivel de jugador a partir del XP acumulado. */
export function levelFromXp(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (level < MAX_LEVEL && remaining >= xpForLevelUp(level)) {
    remaining -= xpForLevelUp(level);
    level++;
  }
  return level;
}

/** XP actual dentro del nivel y umbral para el siguiente. */
export function levelProgress(xp: number): { level: number; into: number; needed: number } {
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) return { level, into: 0, needed: 0 };
  const into = xp - cumulativeXpForLevel(level);
  return { level, into, needed: xpForLevelUp(level) };
}

export interface RankInfo {
  minLevel: number;
  name: string;
  description: string;
  /** Variantes por género para el tratamiento elegido (m/f/x). */
  names?: { m: string; f: string; x: string };
}

export const RANKS: RankInfo[] = [
  { minLevel: 1, name: "Aprendiz de Palabras", description: "Recién llegad@ al Archipiélago." },
  {
    minLevel: 3,
    name: "Explorador del Archipiélago",
    description: "Ya lees el mapa sin ayuda.",
    names: { m: "Explorador del Archipiélago", f: "Exploradora del Archipiélago", x: "Explorador·a del Archipiélago" },
  },
  { minLevel: 6, name: "Navegante de Historias", description: "Las corrientes del lenguaje te son favorables." },
  {
    minLevel: 10,
    name: "Guardián de las Palabras",
    description: "El vocabulario te obedece (casi) siempre.",
    names: { m: "Guardián de las Palabras", f: "Guardiana de las Palabras", x: "Guardian·a de las Palabras" },
  },
  { minLevel: 15, name: "Cronista del Archipiélago", description: "Tus frases ya tienen mareas propias." },
  { minLevel: 20, name: "Maestre del Lenguaje", description: "Dominio, oficio y una pizca de garbo." },
  { minLevel: 25, name: "Leyenda de VerbalIA", description: "Tu nombre está tallado en el faro principal." },
  {
    minLevel: 30,
    name: "Almirante del Lenguaje",
    description: "Las siete regiones saludan al pasar.",
    names: { m: "Almirante del Lenguaje", f: "Almiranta del Lenguaje", x: "Almirante·a del Lenguaje" },
  },
  { minLevel: 36, name: "Guardián del Códice Infinito", description: "La Forja trabaja a tu nombre." },
  { minLevel: 42, name: "Faro Vivo", description: "Tu luz guía a toda la flota del idioma." },
  { minLevel: 50, name: "Mito del Archipiélago", description: "Los mapas nuevos se dibujan contigo." },
  {
    minLevel: 60,
    name: "Palabra Eterna",
    description: "Nivel máximo: el idioma te adoptó como propia letra.",
    names: { m: "Palabra Eterna", f: "Palabra Eterna", x: "Palabra Eterna" },
  },
];

/** Nombre del rango adaptado al género elegido por el jugador. */
export function rankName(rank: RankInfo, gender?: "m" | "f" | "x"): string {
  if (rank.names && gender) return rank.names[gender];
  return rank.name;
}

export function rankForLevel(level: number): RankInfo {
  let rank = RANKS[0];
  for (const r of RANKS) if (level >= r.minLevel) rank = r;
  return rank;
}

/* ==================== Habilidades y MCER ==================== */

/** Nivel MCER orientativo a partir del nivel de habilidad (1-10). */
export function cefrFromSkill(skillLevel: number): "A1" | "A2" | "B1" | "B2" | "C1" | "C2" {
  if (skillLevel < 2) return "A1";
  if (skillLevel < 3) return "A2";
  if (skillLevel < 5) return "B1";
  if (skillLevel < 7) return "B2";
  if (skillLevel < 8.5) return "C1";
  return "C2";
}

/** Dificultad objetivo (1-5) para un nivel de habilidad dado.
 * Bandas uniformes de 1.8 puntos: d1 [1, 2.8) … d5 [8.2, 10]. */
export function targetDifficulty(skillLevel: number): 1 | 2 | 3 | 4 | 5 {
  const d = 1 + Math.floor((skillLevel - 1) / 1.8);
  return Math.max(1, Math.min(5, d)) as 1 | 2 | 3 | 4 | 5;
}

/** Etiqueta de dominio por habilidad (para el perfil). */
export function skillMasteryLabel(skillLevel: number): string {
  if (skillLevel < 2) return "Primeros pasos";
  if (skillLevel < 3.5) return "En construcción";
  if (skillLevel < 5.5) return "Sólido";
  if (skillLevel < 7.5) return "Avanzado";
  return "Notable";
}

/** Ajuste del nivel de habilidad tras una respuesta. */
export function applySkillDelta(current: number, correct: boolean, difficulty: number): number {
  const delta = correct ? 0.1 + 0.02 * difficulty : -(0.16 + 0.02 * (6 - difficulty));
  return Math.max(1, Math.min(10, +(current + delta).toFixed(3)));
}
