/**
 * Frases del día · VERBALIA.
 * Citas de escritores, proverbios y sabiduría propia del Archipiélago.
 * Rotan con cada navegación: `frasePara(index)` es determinista, de modo
 * que servidor y cliente pintan la misma frase.
 */

import { FRASES_A, type FraseDelDia } from "./frases-a";
import { FRASES_B } from "./frases-b";
import { FRASES_C } from "./frases-c";
import { FRASES_D } from "./frases-d";
import { FRASES_E } from "./frases-e";
import { FRASES_F } from "./frases-f";
import { FRASES_G } from "./frases-g";
import { FRASES_H } from "./frases-h";
import { FRASES_I } from "./frases-i";
import { FRASES_J } from "./frases-j";

export type { FraseDelDia };

export const FRASES: FraseDelDia[] = [
  ...FRASES_A, ...FRASES_B, ...FRASES_C, ...FRASES_D, ...FRASES_E, ...FRASES_F,
  ...FRASES_G, ...FRASES_H, ...FRASES_I, ...FRASES_J,
];

/** Frase estable para un índice de rotación dado (módulo, sin azar). */
export function frasePara(rotation: number): FraseDelDia {
  const i = ((rotation % FRASES.length) + FRASES.length) % FRASES.length;
  return FRASES[i];
}

/** Frase fija del día (determinista por fecha): la misma todo el día. */
export function fraseDelDia(now = new Date()): FraseDelDia {
  const seed = Number(
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`,
  );
  return FRASES[seed % FRASES.length];
}
