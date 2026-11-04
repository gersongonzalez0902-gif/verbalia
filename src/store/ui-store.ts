"use client";

/**
 * Enrutador de pantallas · Sincronizado con location.hash para que el
 * botón atrás del navegador funcione en la SPA de una sola ruta.
 */

import { create } from "zustand";
import type { Screen } from "@/types";

function screenToHash(screen: Screen): string {
  switch (screen.name) {
    case "game":
      return `#/juego/${screen.gameId}/${screen.mode}${screen.regionId ? `/${screen.regionId}` : ""}`;
    default:
      return `#/${screen.name}`;
  }
}

function hashToScreen(hash: string): Screen {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [headRaw, a, b, c] = parts;
  // Alias en español: el juego habla español, sus URLs también.
  const ES_ALIASES: Record<string, string> = {
    inicio: "home",
    mapa: "map",
    perfil: "profile",
    estadisticas: "stats",
    coleccion: "collection",
    errores: "errors",
    misiones: "missions",
    ajustes: "settings",
    biblioteca: "library",
    resultados: "results",
    bienvenida: "welcome",
    evaluacion: "placement",
  };
  const head = ES_ALIASES[headRaw ?? ""] ?? headRaw;
  if (head === "juego" && a) {
    return {
      name: "game",
      gameId: a as Screen & { name: "game" } extends never ? never : string,
      mode: (b ?? "training") as "mission" | "training" | "review" | "placement",
      regionId: c,
    } as unknown as Screen;
  }
  const known = [
    "welcome", "onboarding", "placement", "home", "map", "results",
    "profile", "stats", "collection", "errors", "missions", "settings", "library",
  ];
  if (head && (known as string[]).includes(head)) {
    return { name: head } as Screen;
  }
  return { name: "home" };
}

interface UiStore {
  screen: Screen;
  /** ID de desbloqueo/región abierta en el mapa (hoja lateral). */
  mapSheetRegion: string | null;
  /** Navega a una pantalla (apila en el historial del navegador). */
  navigate: (screen: Screen) => void;
  /** Retrocede una pantalla (si hay historial del navegador). */
  back: () => void;
  syncFromHash: () => void;
  setMapSheetRegion: (id: string | null) => void;
}

export const useUiStore = create<UiStore>((set, get) => ({
  screen: { name: "home" },
  mapSheetRegion: null,

  navigate(screen) {
    const hash = screenToHash(screen);
    if (typeof window !== "undefined" && window.location.hash !== hash) {
      window.location.hash = hash; // dispara hashchange → syncFromHash
    } else {
      set({ screen });
    }
  },

  back() {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) window.history.back();
      else get().navigate({ name: "home" });
    }
  },

  syncFromHash() {
    set({ screen: hashToScreen(window.location.hash) });
  },

  setMapSheetRegion(id) {
    set({ mapSheetRegion: id });
  },
}));

/** Suscribe el enrutador al hash (se llama una vez desde el cliente). */
export function initRouter() {
  if (typeof window === "undefined") return;
  const { syncFromHash, screen } = useUiStore.getState();
  if (!window.location.hash) {
    window.history.replaceState(null, "", screenToHash(screen));
  }
  syncFromHash();
  window.addEventListener("hashchange", syncFromHash);
}
