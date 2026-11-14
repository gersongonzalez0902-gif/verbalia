/**
 * Ficha «Tus datos en este aparato» (Área 16) — resumen puro y testeable
 * de lo que vive en el dispositivo. La UI solo lo pinta.
 */

export interface LocalDataInput {
  /** Palabras plantadas en el jardín (SRS). */
  gardenWords: number;
  /** XP acumulado. */
  xp: number;
  /** Sesiones completadas en el historial. */
  historySessions: number;
  /** Ejercicios vistos (dedupe de repeticiones). */
  seenExercises: number;
  /** Bytes ocupados según navigator.storage.estimate (si el navegador lo dice). */
  storageBytes: number | null;
  /** Última sincronización con el barco (epoch ms o null). */
  lastSyncedAt: number | null;
  /** ¿Hay cuenta (los datos también viven en el servidor)? */
  hasAccount: boolean;
}

export interface LocalDataLine {
  label: string;
  value: string;
}

/** Formateo honesto de bytes (KB/MB con una decimal; nada si no se sabe). */
export function formatBytes(bytes: number | null): string | null {
  if (bytes === null || bytes < 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Las líneas de la ficha, listas para pintar. */
export function localDataLines(input: LocalDataInput): LocalDataLine[] {
  const lines: LocalDataLine[] = [
    { label: "Palabras en el jardín", value: `${input.gardenWords}` },
    { label: "XP acumulado", value: `${input.xp}` },
    { label: "Sesiones en el historial", value: `${input.historySessions}` },
    { label: "Ejercicios ya vistos", value: `${input.seenExercises}` },
  ];
  const size = formatBytes(input.storageBytes);
  if (size) lines.push({ label: "Espacio ocupado", value: size });
  lines.push({
    label: "Última sincronización",
    value: input.hasAccount
      ? input.lastSyncedAt
        ? "con el barco ya al día"
        : "pendiente de la primera"
      : "sin cuenta: solo vive aquí",
  });
  return lines;
}

/** La copia del jugador con cuenta está en el servidor: la del aparato se
 *  puede borrar sin miedo. Sin cuenta, borrar es perderlo todo. */
export function wipeWarning(hasAccount: boolean): string {
  return hasAccount
    ? "Tu bitácora sigue a salvo en el barco: al iniciar sesión de nuevo, todo vuelve."
    : "Sin cuenta, esta bitácora solo vive aquí: si la borras, se pierde para siempre.";
}
