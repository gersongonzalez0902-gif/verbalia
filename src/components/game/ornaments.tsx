"use client";

/**
 * Ornaments · Capa decorativa por escena.
 * ----------------------------------------------------------------
 * Cada rincón del Archipiélago deja su rastro en la pantalla:
 * hojas que se mecen en el bosque, engranajes que giran en la
 * ciudad, estrellas que titilan en la biblioteca, burbujas que
 * ascienden en el puerto, brasas en la torre, confeti en las
 * misiones, pentagramas en el mapa y hojas de papel en la
 * biblioteca de reglas.
 *
 * Todo determinista (misma semilla en servidor y cliente) y no
 * interactivo: es atrezzo, no interfaz.
 */

import { useMemo } from "react";
import { useUiStore } from "@/store/ui-store";
import { useGameStore } from "@/store/game-store";
import { levelFromXp } from "@/engine/xp";
import { sceneForScreen } from "@/hooks/use-scene";
import { sceneDef } from "@/lib/scene-theme";

/** Pseudoaleatorio determinista (hidratación estable). */
function prand(i: number, salt = 1): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const PATHS = {
  leaf: "M12 2C7 6 4 10 4 14a8 8 0 0 0 16 0c0-4-3-8-8-12ZM12 6v14",
  gear:
    "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
  spark: "M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z",
  star: "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z",
  bubble: "M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm3.5 5.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2Z",
  page: "M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm9 0v5h5",
  note: "M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3Zm0 0V5l10-2v11m0 0a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z",
};

/** Mapa motivo → piezas SVG con clase de animación. */
const MOTIF_SHAPES: Record<string, { path: string; cls: string; box: number }[]> = {
  leaves: [
    { path: PATHS.leaf, cls: "ornament-leaf", box: 26 },
    { path: PATHS.leaf, cls: "ornament-leaf", box: 20 },
    { path: PATHS.leaf, cls: "ornament-leaf", box: 32 },
    { path: PATHS.leaf, cls: "ornament-leaf", box: 18 },
    { path: PATHS.leaf, cls: "ornament-leaf", box: 24 },
    { path: PATHS.leaf, cls: "ornament-leaf", box: 30 },
  ],
  gears: [
    { path: PATHS.gear, cls: "ornament-gear", box: 40 },
    { path: PATHS.gear, cls: "ornament-gear-rev", box: 28 },
    { path: PATHS.gear, cls: "ornament-gear", box: 52 },
    { path: PATHS.gear, cls: "ornament-gear-rev", box: 34 },
    { path: PATHS.gear, cls: "ornament-gear", box: 24 },
    { path: PATHS.gear, cls: "ornament-gear-rev", box: 46 },
  ],
  sparks: [
    { path: PATHS.spark, cls: "ornament-spark", box: 18 },
    { path: PATHS.spark, cls: "ornament-spark", box: 26 },
    { path: PATHS.spark, cls: "ornament-spark", box: 14 },
    { path: PATHS.spark, cls: "ornament-spark", box: 22 },
    { path: PATHS.spark, cls: "ornament-spark", box: 30 },
    { path: PATHS.spark, cls: "ornament-spark", box: 16 },
  ],
  stars: [
    { path: PATHS.star, cls: "ornament-star", box: 20 },
    { path: PATHS.star, cls: "ornament-star", box: 14 },
    { path: PATHS.star, cls: "ornament-star", box: 28 },
    { path: PATHS.spark, cls: "ornament-twinkle", box: 12 },
    { path: PATHS.star, cls: "ornament-star", box: 16 },
    { path: PATHS.spark, cls: "ornament-twinkle", box: 18 },
  ],
  bubbles: [
    { path: PATHS.bubble, cls: "ornament-bubble", box: 22 },
    { path: PATHS.bubble, cls: "ornament-bubble", box: 14 },
    { path: PATHS.bubble, cls: "ornament-bubble", box: 30 },
    { path: PATHS.bubble, cls: "ornament-bubble", box: 18 },
    { path: PATHS.bubble, cls: "ornament-bubble", box: 26 },
    { path: PATHS.bubble, cls: "ornament-bubble", box: 12 },
  ],
  embers: [
    { path: PATHS.spark, cls: "ornament-ember", box: 10 },
    { path: PATHS.spark, cls: "ornament-ember", box: 14 },
    { path: PATHS.spark, cls: "ornament-ember", box: 8 },
    { path: PATHS.spark, cls: "ornament-ember", box: 12 },
    { path: PATHS.spark, cls: "ornament-ember", box: 16 },
    { path: PATHS.spark, cls: "ornament-ember", box: 9 },
  ],
  confetti: [
    { path: PATHS.spark, cls: "ornament-confetti", box: 14 },
    { path: PATHS.spark, cls: "ornament-confetti", box: 20 },
    { path: PATHS.spark, cls: "ornament-confetti", box: 12 },
    { path: PATHS.spark, cls: "ornament-confetti", box: 24 },
    { path: PATHS.spark, cls: "ornament-confetti", box: 16 },
    { path: PATHS.spark, cls: "ornament-confetti", box: 10 },
  ],
  pages: [
    { path: PATHS.page, cls: "ornament-page", box: 26 },
    { path: PATHS.page, cls: "ornament-page", box: 18 },
    { path: PATHS.page, cls: "ornament-page", box: 32 },
    { path: PATHS.page, cls: "ornament-page", box: 22 },
    { path: PATHS.page, cls: "ornament-page", box: 28 },
    { path: PATHS.page, cls: "ornament-page", box: 16 },
  ],
  notes: [
    { path: PATHS.note, cls: "ornament-note", box: 22 },
    { path: PATHS.note, cls: "ornament-note", box: 16 },
    { path: PATHS.note, cls: "ornament-note", box: 28 },
    { path: PATHS.note, cls: "ornament-note", box: 18 },
    { path: PATHS.note, cls: "ornament-note", box: 24 },
    { path: PATHS.note, cls: "ornament-note", box: 14 },
  ],
  none: [],
};

export function OrnamentLayer({ className }: { className?: string }) {
  const screen = useUiStore((s) => s.screen);
  const level = useGameStore((s) => levelFromXp(s.core.xp));

  const shapes = useMemo(() => {
    const { scene } = sceneForScreen(screen, level);
    const motif = sceneDef(scene as never).motif;
    const defs = MOTIF_SHAPES[motif] ?? [];
    return defs.map((d, i) => ({
      ...d,
      top: 6 + prand(i, 5) * 78,
      left: 3 + prand(i, 11) * 92,
      delay: -(prand(i, 17) * 10),
      dur: 7 + prand(i, 23) * 8,
      opacity: 0.1 + prand(i, 31) * 0.12,
      flip: prand(i, 41) > 0.5,
    }));
  }, [screen, level]);

  if (shapes.length === 0) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className ?? ""}`}
    >
      {shapes.map((s, i) => (
        <svg
          key={`orn-${i}`}
          viewBox={`0 0 24 24`}
          width={s.box * 2}
          height={s.box * 2}
          className={`ornament ${s.cls}`}
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
            transform: s.flip ? "scaleX(-1)" : undefined,
          }}
        >
          <path
            d={s.path}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}
