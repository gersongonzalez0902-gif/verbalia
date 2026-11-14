"use client";

/**
 * Sistema de escena · el corazón sensorial de VERBALIA.
 * ----------------------------------------------------------------
 * Cada pantalla declara su personalidad: paleta (matiz) y ornamentos.
 * El Inicio hereda la región donde el jugador está avanzando, así que
 * el juego cambia de cara conforme se avanza por el Archipiélago.
 * El sonido, en cambio, es UNO en todas partes (Ola E · 5): ambiente
 * de estudio igual en portada, mapa, regiones y juegos.
 *
 * - applySceneTheme: rota el matiz de la paleta (claro/oscuro/lectura).
 * - setSceneMusic: el ambiente único (el identificador ya no decide).
 * - initAudioUnlock: el navegador exige un gesto para el audio.
 */

import { useEffect } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { applySceneTheme, themeForScreen } from "@/lib/scene-theme";
import { initAudioUnlock, setSceneMusic, stopSceneMusic, setMusicVolume, setSfxVolume } from "@/services/audio";
import { levelFromXp } from "@/engine/xp";
import type { Screen } from "@/types";

/** Escena visual (y matiz) que corresponde a la pantalla activa. */
export function sceneForScreen(screen: Screen, level: number): { scene: string; hue?: number } {
  const regionId = screen.name === "game" ? screen.regionId : undefined;
  return themeForScreen(screen.name, level, regionId);
}

/** Suscribe la pantalla activa al sistema sensorial (tema + ambiente). */
export function useSceneSystem() {
  const screen = useUiStore((s) => s.screen);
  const level = useGameStore((s) => levelFromXp(s.core.xp));
  const musicVolume = useGameStore((s) => s.settings.musicVolume);
  const sfxVolume = useGameStore((s) => s.settings.sfxVolume);
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

  // Tema visual + ambiente único por pantalla.
  useEffect(() => {
    const regionId = screen.name === "game" ? screen.regionId : undefined;
    const { scene, hue } = themeForScreen(screen.name, level, regionId);
    applySceneTheme(scene, hue);
    // El ambiente es el mismo en todas partes; solo se calla si el
    // jugador tiene su propia estación sonando (o en la pantalla de
    // música, donde se elige qué oír).
    if (stationPlaying || screen.name === "music") {
      stopSceneMusic();
    } else {
      setSceneMusic("estudio");
    }
  }, [screen, level, stationPlaying]);
}
