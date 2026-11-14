/**
 * Lógica pura del flujo de navegación (Área 12) — testeable sin React.
 */

import type { Screen } from "@/types";

/** ¿Las dos pantallas son «la misma» a efectos de navegación?
 *  (misma pantalla y, si es un juego, el mismo formato/regla). */
export function sameScreen(a: Screen | null | undefined, b: Screen | null | undefined): boolean {
  if (!a || !b) return false;
  if (a.name !== b.name) return false;
  if (a.name === "game" && b.name === "game") {
    return a.gameId === b.gameId && a.regionId === b.regionId && a.mode === b.mode;
  }
  return true;
}

/** El destino real del «Volver»: el origen recordado cuando existe, es
 *  distinto de la pantalla actual y nunca es una partida (re-entrar en
 *  un juego con la flecha reiniciaría la sesión). Si no, el respaldo
 *  clásico de la pantalla (backTo). */
export function effectiveBackTo(
  lastScreen: Screen | null | undefined,
  backTo: Screen,
  current: Screen | null | undefined,
): Screen {
  if (lastScreen && !sameScreen(lastScreen, current) && lastScreen.name !== "game") {
    return lastScreen;
  }
  return backTo;
}

/** Chip de contexto (breadcrumb minimalista): «vienes de X» solo cuando
 *  el origen recordado manda (si manda el respaldo, la cabecera ya lo
 *  dice con el propio botón). */
export function originChipLabel(
  lastScreen: Screen | null | undefined,
  backTo: Screen,
  current: Screen | null | undefined,
  screenName: (s: Screen) => string,
): string | null {
  if (!lastScreen || lastScreen.name === "game" || sameScreen(lastScreen, current)) return null;
  if (sameScreen(lastScreen, backTo)) return null; // el respaldo ya coincide: nada que descubrir
  return `vienes de ${screenName(lastScreen)}`;
}
