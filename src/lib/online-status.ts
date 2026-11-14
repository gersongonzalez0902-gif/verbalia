/**
 * Estado de red del navegador, en una capa pequeña y testeable (Área 4.4).
 * La pantalla Cuenta lo usa para decir la verdad: si no hay red, el
 * formulario de cuenta se avisa antes de intentarlo y el juego sigue
 * completo sin conexión (regla de oro 1).
 */

export interface OnlineStatus {
  /** ¿Hay red según el navegador? (primer valor: navigator.onLine). */
  readonly online: boolean;
  /** Cambia cuando el navegador emite online/offline. */
  subscribe(listener: (online: boolean) => void): () => void;
}

export function createOnlineStatus(win: {
  navigator: { onLine: boolean };
  addEventListener: EventTarget["addEventListener"];
  removeEventListener: EventTarget["removeEventListener"];
}): OnlineStatus {
  let current = win.navigator.onLine;
  const listeners = new Set<(online: boolean) => void>();

  const set = (e: Event) => {
    current = e.type === "online";
    for (const l of listeners) l(current);
  };

  const subscribe = (listener: (online: boolean) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  win.addEventListener("online", set);
  win.addEventListener("offline", set);

  return { get online() { return current; }, subscribe };
}

/** Texto honesto del aviso sin conexión (Área 4.4): cuenta necesita red;
 *  el juego no. */
export function offlineNotice(): string {
  return "Sin conexión con el barco ahora mismo. La cuenta necesita internet, pero el juego sigue completo sin ella.";
}
