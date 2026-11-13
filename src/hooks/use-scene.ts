"use client";

/**
 * Sistema de escena · el corazón sensorial de VERBALIA.
 * ----------------------------------------------------------------
 * Cada pantalla declara su personalidad: paleta (matiz), música de
 * archivo por escena (loops reales con fundido cruzado) y
 * ornamentos. El Inicio hereda la región donde el
 * jugador está avanzando, así que el juego cambia de cara — y de
 * banda sonora — conforme se avanza por el Archipiélago.
 *
 * - applySceneTheme: rota el matiz de la paleta (claro/oscuro/lectura).
 * - setSceneMusic: loop real por escena (public/music) con fundido.
 * - initAudioUnlock: el navegador exige un gesto para el audio.
 */

import { useEffect } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { applySceneTheme, themeForScreen } from "@/lib/scene-theme";
import { initAudioUnlock, setSceneMusic, stopSceneMusic, setMusicVolume, setSfxVolume } from "@/services/audio";
import { levelFromXp } from "@/engine/xp";
import type { Screen } from "@/types";

/** Regiones con identidad musical propia. */
const MUSIC_REGIONS = ["bosque", "ciudad", "fortaleza", "biblioteca", "puerto", "torre", "observatorio"];

/** Traduce la pantalla activa a la escena musical que le corresponde. */
export function musicSceneFor(screen: Screen, level: number): string {
  const activeRegion = (() => {
    // La región más avanzada define la música del Inicio.
    const table = ["bosque", "ciudad", "fortaleza", "biblioteca", "puerto", "torre"];
    return table[Math.min(Math.max(level - 1, 0), table.length - 1)] ?? "bosque";
  })();

  if (screen.name === "game") {
    return MUSIC_REGIONS.includes(screen.regionId ?? "") ? screen.regionId! : activeRegion;
  }
  switch (screen.name) {
    case "home":
      return activeRegion;
    case "results":
      return "results";
    case "welcome":
    case "onboarding":
      return "welcome";
    case "placement":
      return "placement";
    case "map":
      return "map";
    case "missions":
      return "missions";
    case "collection":
      return "collection";
    case "errors":
      return "errors";
    case "stats":
      return "stats";
    case "profile":
      return "profile";
    case "library":
      return "library";
    case "settings":
      return "settings";
    case "music":
      return "station";
    case "arcade":
      return "arcade";
    case "frases":
      return "library";
    case "training":
      return activeRegion;
    case "writing":
      return "arcade";
    case "legal":
      return "library";
    default:
      return activeRegion;
  }
}

/** Escena visual (y matiz) que corresponde a la pantalla activa. */
export function sceneForScreen(screen: Screen, level: number): { scene: string; hue?: number } {
  const regionId = screen.name === "game" ? screen.regionId : undefined;
  return themeForScreen(screen.name, level, regionId);
}

/** Suscribe la pantalla activa al sistema sensorial (tema + música). */
export function useSceneSystem() {
  const screen = useUiStore((s) => s.screen);
  const level = useGameStore((s) => levelFromXp(s.core.xp));
  const musicVolume = useGameStore((s) => s.settings.musicVolume);
  const sfxVolume = useGameStore((s) => s.settings.sfxVolume);
  const musicInGames = useGameStore((s) => s.settings.musicInGames);
  const stationPlaying = useUiStore((s) => s.stationPlaying);

  // Desbloqueo del AudioContext con el primer gesto del jugador.
  useEffect(() => {
    initAudioUnlock();
  }, []);

  // Volúmenes persisted → motor de audio.
  useEffect(() => {
    setMusicVolume(musicVolume);
  }, [musicVolume]);
  useEffect(() => {
    setSfxVolume(sfxVolume);
  }, [sfxVolume]);

  // Tema visual + banda sonora por pantalla.
  useEffect(() => {
    const regionId = screen.name === "game" ? screen.regionId : undefined;
    const { scene, hue } = themeForScreen(screen.name, level, regionId);
    applySceneTheme(scene, hue);
    // En partida: la música del menú se calla (salvo que el jugador la quiera).
    // Con la estación sonando: manda la música del jugador.
    const silenceScene =
      (screen.name === "game" && !musicInGames) || stationPlaying || screen.name === "music";
    if (silenceScene) {
      stopSceneMusic();
    } else {
      setSceneMusic(musicSceneFor(screen, level));
    }
  }, [screen, level, musicInGames, stationPlaying]);
}
