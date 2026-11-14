/**
 * Ayudas puras de la pantalla de Perfil (Área 5) — testeables sin DOM.
 */

/** Nombre visible: tope de caracteres compartido entre UI y guardado. */
export const PROFILE_NAME_MAX = 20;
/** Bio: tope de caracteres compartido entre UI y guardado. */
export const PROFILE_BIO_MAX = 160;

/** ¿El borrador de nombre es válido para guardar? (recortado, no vacío). */
export function isProfileNameValid(draft: string): boolean {
  return draft.trim().length > 0;
}

/** Media honesta por sesión: null cuando no hay sesiones (evita NaN). */
export function sessionAverages(
  totalTimeMs: number,
  totalSessions: number,
): { avgMinutes: number; ok: boolean } {
  if (!totalSessions || totalSessions <= 0 || !totalTimeMs || totalTimeMs <= 0) {
    return { avgMinutes: 0, ok: false };
  }
  return { avgMinutes: Math.round((totalTimeMs / totalSessions) / 60_000), ok: true };
}

/** «Hace X» para la última sincronización con el barco. null → «nunca». */
export function syncAgoLabel(lastSyncedAt: number | null | undefined, now = Date.now()): string {
  if (!lastSyncedAt) return "nunca";
  const s = Math.floor((now - lastSyncedAt) / 1000);
  if (s < 60) return "hace un momento";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}
