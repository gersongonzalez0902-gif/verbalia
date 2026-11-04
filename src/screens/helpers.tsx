"use client";

/** Helpers compartidos por las pantallas. */

import type { Screen, SessionMode, GameId, RegionId } from "@/types";
import { useUiStore } from "@/store/ui-store";

/** Parámetros de ruta cuando la pantalla activa es un juego. */
export interface GameRouteParams {
  gameId: GameId;
  mode: SessionMode;
  regionId?: RegionId;
}

/** Lee los parámetros del juego desde la pantalla activa del router. */
export function useRouterParams(): GameRouteParams {
  const screen = useUiStore((s) => s.screen);
  if (screen.name === "game") {
    return { gameId: screen.gameId, mode: screen.mode, regionId: screen.regionId };
  }
  // Valores por defecto: entrenamiento de tarjetas.
  return { gameId: "srs", mode: "training" };
}

export function isScreen<T extends Screen["name"]>(screen: Screen, name: T): boolean {
  return screen.name === name;
}
