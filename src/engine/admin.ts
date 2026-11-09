/**
 * Modo AdminG · llave maestra de pruebas de VerbalIA.
 * ----------------------------------------------------------------
 * Un perfil registrado con el nombre «AdminG» (no distingue
 * mayúsculas) se convierte en navegante de pruebas: nivel máximo,
 * tinta effectively infinita y todo el archipiélago abierto, para
 * poder recorrer y testear cada rincón del juego sin grind.
 *
 * El estado se activa al crear el perfil O al renombrarse a AdminG,
 * y se detecta en cualquier pantalla con isAdminName(profile.name).
 */

export const ADMIN_NAME = "adming";

/** ¿Este nombre de navegante es el administrador de pruebas? */
export function isAdminName(name?: string | null): boolean {
  return typeof name === "string" && name.trim().toLowerCase() === ADMIN_NAME;
}

/** Bóveda de tinta del admin: cifra tan alta que ninguna compra la agota. */
export const ADMIN_TINTA = 9_999_999;

/** Marca humana para las pantallas (se muestra «∞» en vez del número). */
export const ADMIN_TINTA_LABEL = "∞";
