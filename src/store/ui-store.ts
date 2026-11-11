"use client";

/**
 * Enrutador de pantallas · Sincronizado con location.hash para que el
 * botón atrás del navegador funcione en la SPA de una sola ruta.
 */

import { create } from "zustand";
import type { Screen } from "@/types";
import { GAMES } from "@/data/games";

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
    cuenta: "account",
    musica: "music",
    estacion: "music",
    biblioteca: "library",
    tienda: "shop",
    bazar: "shop",
    juegos: "arcade",
    salon: "arcade",
    arcade: "arcade",
    frases: "frases",
    bitacora: "frases",
    citas: "frases",
    entrenar: "training",
    entrenamientos: "training",
    escritura: "writing",
    taller: "writing",
    mecanografia: "writing",
    legal: "legal",
    privacidad: "legal",
    resultados: "results",
    bienvenida: "welcome",
    evaluacion: "placement",
  };
  const head = ES_ALIASES[headRaw ?? ""] ?? headRaw;
  if (head === "juego" && a) {
    // Validación: un gameId o modo desconocido en la URL (enlaces viejos,
    // typos) lleva a inicio en vez de dejar la pantalla en blanco.
    const gameId = a as Screen & { name: "game" } extends never ? never : string;
    const mode = (b ?? "training") as "mission" | "training" | "review" | "placement";
    const modeOk = ["mission", "training", "review", "placement"].includes(mode);
    if (!(gameId in GAMES) || !modeOk) return { name: "home" };
    return {
      name: "game",
      gameId,
      mode,
      regionId: c,
    } as unknown as Screen;
  }
  const known = [
    "welcome", "onboarding", "placement", "home", "map", "results",
    "profile", "stats", "collection", "errors", "missions", "settings", "account", "music", "shop", "library", "arcade", "frases", "training", "writing", "legal",
  ];
  if (head && (known as string[]).includes(head)) {
    return { name: head } as Screen;
  }
  return { name: "home" };
}

interface UiStore {
  screen: Screen;
  /** ¿Está sonando la estación de música del jugador? (silencia la música generativa) */
  stationPlaying: boolean;
  /** Contador de navegaciones: rota la frase del día en cada salto. */
  navCount: number;
  /** Giros manuales de la frase del día (botón «Otra frase»). */
  fraseSpin: number;
  /** ID de desbloqueo/región abierta en el mapa (hoja lateral). */
  mapSheetRegion: string | null;
  /** Palabra que debe entrar sí o sí en el próximo entrenamiento SRS (Palabra del Día). */
  srsFocusWordId: string | null;
  /** Navega a una pantalla (apila en el historial del navegador). */
  navigate: (screen: Screen) => void;
  /** Hace girar la frase del día manualmente. */
  rotateFrase: () => void;
  /** Retrocede una pantalla (si hay historial del navegador). */
  back: () => void;
  syncFromHash: () => void;
  setMapSheetRegion: (id: string | null) => void;
  setStationPlaying: (v: boolean) => void;
  setSrsFocusWordId: (id: string | null) => void;
}

export const useUiStore = create<UiStore>((set, get) => ({
  screen: { name: "home" },
  stationPlaying: false,
  navCount: 0,
  fraseSpin: 0,
  mapSheetRegion: null,
  srsFocusWordId: null,

  navigate(screen) {
    const hash = screenToHash(screen);
    if (typeof window !== "undefined" && window.location.hash !== hash) {
      window.location.hash = hash; // dispara hashchange → syncFromHash
    } else {
      set((s) => ({ screen, navCount: s.navCount + 1 }));
    }
  },

  back() {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) window.history.back();
      else get().navigate({ name: "home" });
    }
  },

  rotateFrase() {
    set((s) => ({ fraseSpin: s.fraseSpin + 1 }));
  },

  syncFromHash() {
    set((s) => ({ screen: hashToScreen(window.location.hash), navCount: s.navCount + 1 }));
  },

  setMapSheetRegion(id) {
    set({ mapSheetRegion: id });
  },

  setStationPlaying(v) {
    set({ stationPlaying: v });
  },

  setSrsFocusWordId(id) {
    set({ srsFocusWordId: id });
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
