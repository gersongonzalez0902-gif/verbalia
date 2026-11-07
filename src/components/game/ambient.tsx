"use client";

/**
 * Fondo ambiental del Archipiélago · Capas decorativas no interactivas.
 *
 * - Manchas de color que respiran (primario, XP, mareas)
 * - Polvo de letras ascendiendo (partículas doradas y verdes)
 * - Líneas de marea al pie que derivan lentamente
 * - Acento regional opcional para teñir la escena según la región activa
 *
 * Todo es determinista (fórmula pseudoaleatoria, sin Math.random en render)
 * para que servidor y cliente hidraten exactamente igual. Las animaciones
 * se desactivan solas con prefers-reduced-motion y el ajuste del jugador.
 */

import { cn } from "@/lib/utils";

/** Pseudoaleatorio determinista: misma secuencia en servidor y cliente. */
function prand(i: number, salt = 1): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const BLOBS = [
  { top: "-12%", left: "-10%", size: "46vmin", color: "var(--primary)", opacity: 0.1, delay: "0s", dur: "16s" },
  { top: "18%", right: "-14%", size: "40vmin", color: "var(--xp)", opacity: 0.09, delay: "-6s", dur: "20s" },
  { bottom: "-16%", left: "22%", size: "52vmin", color: "var(--region-puerto)", opacity: 0.1, delay: "-11s", dur: "24s" },
];

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: 4 + prand(i, 3) * 92,
  size: 3 + prand(i, 7) * 4,
  delay: -(prand(i, 11) * 18),
  dur: 13 + prand(i, 17) * 12,
  drift: (prand(i, 23) - 0.5) * 48,
  gold: prand(i, 29) > 0.45,
}));

/** Letras flotantes gigantes al fondo (solo escritorio): el mar de palabras. */
const GHOST_LETTERS = ["A", "Ñ", "E", "R", "Z", "O", "L", "S", "T", "U"];

export function AmbientBackdrop({
  /** Variable CSS de acento regional (p. ej. "--region-bosque"). */
  accentVar,
  className,
}: {
  accentVar?: string;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-0 overflow-hidden", className)}>
      {/* ===== Capas solo escritorio: el fondo cobra vida en pantallas grandes ===== */}
      <div className="hidden lg:block">
        {GHOST_LETTERS.map((ch, i) => (
          <span
            key={`ghost-${ch}`}
            className="ambient-ghost-letter font-display"
            style={{
              left: `${(i * 10.5 + prand(i, 41) * 6) % 96}%`,
              top: `${8 + prand(i, 53) * 76}%`,
              fontSize: `${8 + prand(i, 59) * 7}rem`,
              animationDelay: `${-(prand(i, 61) * 30)}s`,
              animationDuration: `${34 + prand(i, 67) * 22}s`,
            }}
          >
            {ch}
          </span>
        ))}
        <div className="ambient-rays" />
        <svg className="ambient-islands" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden>
          <path d="M0,190 Q120,150 240,175 T480,160 T720,185 T960,155 T1200,180 T1440,165 L1440,220 L0,220 Z" className="ambient-island-fill" />
          <path d="M0,205 Q180,178 360,196 T720,188 T1080,198 T1440,190 L1440,220 L0,220 Z" className="ambient-island-fill ambient-island-near" />
        </svg>
      </div>
      <div className="ambient-vignette hidden lg:block" />
      {/* Manchas de color que respiran */}
      {BLOBS.map((b, i) => (
        <div
          key={`blob-${i}`}
          className="ambient-blob"
          style={{
            top: b.top,
            left: b.left,
            right: b.right,
            bottom: b.bottom,
            width: b.size,
            height: b.size,
            background: i === 1 ? (accentVar ? `var(${accentVar})` : b.color) : b.color,
            opacity: b.opacity,
            animationDelay: b.delay,
            animationDuration: b.dur,
          }}
        />
      ))}

      {/* Polvo de letras ascendiendo */}
      {PARTICLES.map((p, i) => (
        <span
          key={`dust-${i}`}
          className="ambient-dust"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.gold ? "var(--xp)" : "var(--primary)",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}

      {/* Líneas de marea al pie */}
      <svg
        className="ambient-tide"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0 44 Q 150 24 300 44 T 600 44 T 900 44 T 1200 44"
          fill="none"
          stroke="var(--region-puerto)"
          strokeOpacity="0.16"
          strokeWidth="2.5"
        />
        <path
          d="M0 72 Q 150 54 300 72 T 600 72 T 900 72 T 1200 72"
          fill="none"
          stroke="var(--region-puerto)"
          strokeOpacity="0.1"
          strokeWidth="2"
          style={{ animationDelay: "-9s" }}
        />
        <path
          d="M0 100 Q 150 84 300 100 T 600 100 T 900 100 T 1200 100"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.08"
          strokeWidth="2"
          style={{ animationDelay: "-4s" }}
        />
      </svg>
    </div>
  );
}
