import type { GameId } from "@/types";
import { REGION_BY_ID } from "./regions";

/**
 * Sistema de desbloqueo alternativo · «Llaves del Archipiélago».
 * ----------------------------------------------------------------
 * No todos los retos se abren con su isla: los formatos «premium»
 * exigen algo más (nivel, tinta o un logro) y cualquier requisito
 * cumplido abre la puerta. Las mecánicas insignia de cada región
 * (srs, trivia, puzzle, errores, dictado…) siguen abriéndose con
 * la isla para no romper las misiones de los recién llegados.
 */

export interface GameUnlockRule {
  /** Nivel de jugador que abre el formato (independiente de la isla). */
  level: number;
  /** Precio en tinta para abrirlo a mano en el catálogo de entrenamientos. */
  tinta: number;
  /** Logro que también lo abre (si se consigue, la puerta cede sola). */
  achievement?: string;
}

export const GAME_UNLOCKS: Partial<Record<GameId, GameUnlockRule>> = {
  /* ---------- Bosque del Vocabulario (isla NV 1) ---------- */
  abecedario: { level: 3, tinta: 25 },
  "memoria-bosque": { level: 4, tinta: 40 },
  "vf-bosque": { level: 4, tinta: 35 },
  "intruso-bosque": { level: 5, tinta: 40, achievement: "ac-palabras-25" },
  "escribe-bosque": { level: 5, tinta: 45 },
  acentos: { level: 5, tinta: 40 },
  "conecta-bosque": { level: 6, tinta: 45 },
  silabas: { level: 6, tinta: 40, achievement: "ac-palabras-50" },
  "oye-bosque": { level: 7, tinta: 50 },
  analogias: { level: 8, tinta: 55 },
  colocaciones: { level: 9, tinta: 55 },
  grados: { level: 9, tinta: 55 },
  polisemia: { level: 10, tinta: 60, achievement: "ac-palabras-50" },
  derivadas: { level: 10, tinta: 60 },
  familias: { level: 11, tinta: 60 },

  /* ---------- Ciudad de la Gramática (isla NV 3) ---------- */
  "sortea-ciudad": { level: 5, tinta: 45 },
  "vf-ciudad": { level: 5, tinta: 45 },
  concordancia: { level: 5, tinta: 45 },
  "escribe-ciudad": { level: 6, tinta: 50 },
  "conecta-ciudad": { level: 6, tinta: 50 },
  serestar: { level: 7, tinta: 50 },
  porpara: { level: 7, tinta: 50 },
  "intruso-ciudad": { level: 8, tinta: 50, achievement: "ac-5-juegos" },
  genero: { level: 8, tinta: 55 },
  subjuntivo: { level: 9, tinta: 60 },
  tiempos: { level: 9, tinta: 60 },
  pronombres: { level: 10, tinta: 60 },
  relativos: { level: 10, tinta: 60 },
  estilo: { level: 11, tinta: 65 },
  pasiva: { level: 11, tinta: 65 },

  /* ---------- Fortaleza de la Ortografía (isla NV 4) ---------- */
  bv: { level: 6, tinta: 45 },
  gj: { level: 7, tinta: 45 },
  "sortea-fortaleza": { level: 7, tinta: 50, achievement: "ac-cazador-errores" },
  "vf-fortaleza": { level: 7, tinta: 50 },
  hach: { level: 8, tinta: 50 },
  "escribe-fortaleza": { level: 8, tinta: 55 },
  "oye-fortaleza": { level: 9, tinta: 55 },
  lly: { level: 9, tinta: 50 },
  csz: { level: 10, tinta: 50 },
  "memoria-fortaleza": { level: 10, tinta: 55 },
  homofonos: { level: 11, tinta: 55 },
  puntuacion: { level: 12, tinta: 60 },
  mayusculas: { level: 12, tinta: 60 },
  cifras: { level: 13, tinta: 60 },

  /* ---------- Biblioteca Infinita (isla NV 6) ---------- */
  titulo: { level: 8, tinta: 50 },
  "vf-biblioteca": { level: 8, tinta: 50 },
  "conecta-biblioteca": { level: 9, tinta: 55 },
  idea: { level: 9, tinta: 55 },
  "intruso-biblioteca": { level: 10, tinta: 55, achievement: "ac-lector-atento" },
  "memoria-biblioteca": { level: 11, tinta: 55 },
  "sortea-biblioteca": { level: 11, tinta: 55 },
  secuencia: { level: 11, tinta: 55 },
  vocabctx: { level: 12, tinta: 60 },
  resumen: { level: 12, tinta: 60 },
  tono: { level: 12, tinta: 60 },
  proposito: { level: 13, tinta: 60 },
  inferencia: { level: 13, tinta: 60 },

  /* ---------- Puerto de las Voces (isla NV 8) ---------- */
  "oye-puerto": { level: 10, tinta: 55, achievement: "ac-oido-marino" },
  "vf-puerto": { level: 11, tinta: 55 },
  "sortea-puerto": { level: 11, tinta: 55 },
  entonacion: { level: 12, tinta: 60 },
  "conecta-puerto": { level: 13, tinta: 60 },
  "oye-acento": { level: 13, tinta: 60 },
  "memoria-puerto": { level: 14, tinta: 60 },
  oyenumero: { level: 14, tinta: 60 },

  /* ---------- Torre de la Expresión (isla NV 10) ---------- */
  "vf-torre": { level: 12, tinta: 60 },
  "escribe-torre": { level: 12, tinta: 55 },
  "conecta-torre": { level: 13, tinta: 60 },
  "sortea-torre": { level: 13, tinta: 60 },
  iniciadores: { level: 14, tinta: 60, achievement: "ac-cuentacuentos" },
  "memoria-torre": { level: 15, tinta: 60 },
  cierre: { level: 15, tinta: 60 },

  /* ---------- Observatorio de la Palabra (isla NV 12) ---------- */
  "conecta-observatorio": { level: 14, tinta: 65 },
  "sortea-observatorio": { level: 14, tinta: 65 },
  falsosamigos: { level: 15, tinta: 65 },
  "memoria-observatorio": { level: 16, tinta: 65 },
  "intruso-observatorio": { level: 16, tinta: 65, achievement: "ac-etimologo" },

  /* ---------- Forja del Escritor (isla NV 15) ---------- */
  conectores: { level: 17, tinta: 70 },
  ironia: { level: 18, tinta: 70, achievement: "ac-forja-1" },
  titulos: { level: 18, tinta: 70 },
};

export interface UnlockState {
  unlocked: boolean;
  /** ¿Se abrió con la isla (nivel de región) y no exige nada más? */
  byRegion: boolean;
  /** Motivo legible del candado (para la UI). */
  reason: string | null;
  /** Regla premium vigente (para el botón de compra con tinta). */
  rule: GameUnlockRule | null;
  /** ¿El jugador ya compró este formato con tinta? */
  purchased: boolean;
}

/** Estado de desbloqueo completo de un formato. */
export function unlockStateFor(
  gameId: GameId,
  opts: { level: number; purchasedGames: string[]; achievements: Record<string, number> },
): UnlockState {
  const region = Object.values(REGION_BY_ID).find((r) => r.games.includes(gameId));
  const regionLevel = region?.unlockLevel ?? 1;
  const purchased = opts.purchasedGames.includes(gameId);
  const rule = GAME_UNLOCKS[gameId] ?? null;

  if (purchased) {
    return { unlocked: true, byRegion: false, reason: null, rule, purchased: true };
  }
  if (rule && rule.achievement && opts.achievements[rule.achievement]) {
    return { unlocked: true, byRegion: false, reason: null, rule, purchased: false };
  }
  if (opts.level >= regionLevel && (!rule || opts.level >= rule.level)) {
    return { unlocked: true, byRegion: true, reason: null, rule, purchased: false };
  }
  if (rule && opts.level >= rule.level) {
    return { unlocked: true, byRegion: false, reason: null, rule, purchased: false };
  }

  // Cerrado: explica el camino más corto.
  const needs: string[] = [];
  if (opts.level < regionLevel) needs.push(`isla NV ${regionLevel}`);
  if (rule && opts.level < rule.level) needs.push(`nivel ${rule.level}`);
  const reason = needs.length > 0 ? needs.join(" o ") : null;
  return { unlocked: false, byRegion: false, reason, rule, purchased: false };
}
