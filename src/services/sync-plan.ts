/**
 * Decisiones puras del motor de sincronización · sin efectos ni imports.
 *
 * El "qué hacer" del sync vive aquí como funciones puras para poder
 * testearlo sin red, sin stores y sin navegador (06-sync-progreso.md §2):
 * - `planLoginSync`: el ciclo de arranque de sesión (Ola 1.1) decide entre
 *   subir la bitácora en silencio, unir barco+dispositivo, adoptar el
 *   remoto o caer en el sync normal.
 * - `planFullSync`: la política de cada fullSync (adoptar remoto vs push),
 *   incluido el arreglo del agujero "base desconocida + barco con datos +
 *   sin cambios locales" que antes NO adoptaba el remoto.
 * - `createDebouncedScheduler`: el debounce de ~4 s para que varias
 *   ediciones de perfil/ajustes seguidas suban como UNA sola sincronización.
 */

/* ============================== Ciclo de arranque de sesión ============================== */

export type LoginSyncPlan =
  /** Barco vacío y bitácora local: subir en silencio (import; PUT si 403). */
  | "upload-fresh"
  /** Barco con datos y bitácora local: unir ambos y adoptar (import). */
  | "import-merge"
  /** Barco con datos y dispositivo limpio: adoptar el remoto tal cual. */
  | "adopt-remote"
  /** Este dispositivo ya conoce la base de la cuenta: sync normal. */
  | "full-sync"
  /** Barco vacío y sin bitácora local: nada que sincronizar. */
  | "none";

/**
 * Plan del ciclo de arranque de sesión (UNO por usuario y pestaña).
 *
 * - `baseUpdatedAt !== null` → este dispositivo ya sincronizó con la cuenta
 *   alguna vez: todo lo demás es fullSync de siempre.
 * - `baseUpdatedAt === null` → este dispositivo nunca vio esta cuenta:
 *   el barco y la bitácora local se unen solos, sin preguntar nada.
 *   - Barco vacío + bitácora local → la bitácora sube en silencio.
 *   - Barco con datos + bitácora local → se unen y se adopta el resultado.
 *   - Barco con datos + sin bitácora → el remoto se adopta tal cual
 *     (el agujero histórico de fullSync: nunca caer en "no hacer nada").
 *   - Barco vacío + sin bitácora → nada (una cuenta nueva no ensucia el barco
 *     con un estado vacío).
 */
export function planLoginSync(input: {
  /** ¿El barco (servidor) tiene estado guardado para esta cuenta? */
  hasRemote: boolean;
  /** `syncMeta.baseUpdatedAt` local (null = nunca sincronizó esta cuenta aquí). */
  baseUpdatedAt: string | null;
  /** ¿Hay bitácora local jugada (perfil onboarded en este dispositivo)? */
  hasLocalLog: boolean;
}): LoginSyncPlan {
  if (input.baseUpdatedAt !== null) return "full-sync";
  if (!input.hasRemote) return input.hasLocalLog ? "upload-fresh" : "none";
  return input.hasLocalLog ? "import-merge" : "adopt-remote";
}

/* ============================== Política de cada fullSync ============================== */

export type FullSyncAction =
  /** El barco tiene novedades (o base desconocida) y aquí no hay nada pendiente: adoptar. */
  | "adopt-remote"
  /** Hay cambios locales (o barco vacío / base más vieja): PUT con base + deltas. */
  | "push"
  /** Todo al día: solo anotar la última sincronización. */
  | "none";

/**
 * Qué hace un fullSync según el estado relativo barco↔dispositivo.
 *
 * Arreglo Ola 1.1: con `baseUpdatedAt === null` (dispositivo con sesión
 * válida que nunca reconoció la base de la cuenta), barco con datos y sin
 * cambios locales, el plan antiguo caía en "none" y el dispositivo NUNCA
 * recibía los datos del barco. Ahora: adopt-remote.
 */
export function planFullSync(input: {
  /** ¿El barco tiene estado guardado? */
  hasRemote: boolean;
  /** ¿El remoto es más nuevo que la base local reconocida? */
  remoteNewer: boolean;
  /** ¿Hay cambios locales sin subir? */
  dirty: boolean;
  /** Base local reconocida (null = este dispositivo no la conoce aún). */
  baseUpdatedAt: string | null;
}): FullSyncAction {
  if (input.hasRemote && !input.dirty && (input.baseUpdatedAt === null || input.remoteNewer)) {
    return "adopt-remote";
  }
  if (input.dirty || !input.hasRemote || input.remoteNewer) return "push";
  return "none";
}

/* ============================== Debounce coalescido ============================== */

/**
 * Planificador con debounce: N llamadas seguidas dentro de la ventana
 * producen UNA sola ejecución `delayMs` después de la última. El motor de
 * sync lo usa para que las ediciones de perfil/ajustes suban en segundos
 * sin ametrallar el servidor (Ola 1.1, punto 1.3).
 */
export function createDebouncedScheduler(
  fn: () => void | Promise<void>,
  delayMs: number,
): { schedule: () => void; cancel: () => void; readonly pending: boolean } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    schedule() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void fn();
      }, delayMs);
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
    },
    get pending() {
      return timer !== null;
    },
  };
}
