import { describe, expect, test } from "bun:test";
import { createOnlineStatus, offlineNotice } from "@/lib/online-status";

/**
 * Área 4.4 · estado de error en línea: la Cuenta dice la verdad sobre
 * la red antes de intentar nada. La capa es testeable sin navegador
 * real: un EventTarget de mentira basta.
 */

class FakeWin {
  navigator = { onLine: true };
  private listeners = new Map<string, Set<EventListener>>();
  addEventListener = (type: string, fn: EventListener) => {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(fn);
  };
  removeEventListener = (type: string, fn: EventListener) => {
    this.listeners.get(type)?.delete(fn);
  };
  emit(type: "online" | "offline") {
    for (const fn of this.listeners.get(type) ?? []) fn(new Event(type));
  }
}

describe("Área 4.4 · estado de red de la Cuenta", () => {
  test("arranca con el valor honesto de navigator.onLine", () => {
    const win = new FakeWin();
    win.navigator.onLine = false;
    expect(createOnlineStatus(win).online).toBe(false);
    win.navigator.onLine = true;
    expect(createOnlineStatus(win).online).toBe(true);
  });

  test("online/offline del navegador actualizan el estado y a los suscritos", () => {
    const win = new FakeWin();
    const status = createOnlineStatus(win);
    const seen: boolean[] = [];
    status.subscribe((v) => seen.push(v));
    win.emit("offline");
    expect(status.online).toBe(false);
    win.emit("online");
    expect(status.online).toBe(true);
    expect(seen).toEqual([false, true]);
  });

  test("cancelar la suscripción deja de recibir avisos", () => {
    const win = new FakeWin();
    const status = createOnlineStatus(win);
    const seen: boolean[] = [];
    const stop = status.subscribe((v) => seen.push(v));
    stop();
    win.emit("offline");
    expect(status.online).toBe(false);
    expect(seen).toEqual([]);
  });

  test("el aviso sin conexión dice que la cuenta necesita red y el juego no", () => {
    const txt = offlineNotice();
    expect(txt).toContain("Sin conexión");
    expect(txt).toContain("el juego sigue completo sin ella");
  });
});
