"use client";

/**
 * Léxico, el búho bibliotecario · Mascota acompañante (v3).
 * SVG ligero con ocho estados de ánimo que la pantalla de juego usa
 * para reaccionar en vivo: parpadea, saluda, celebra, duda y consuela.
 *
 * Paridad PC ↔ móvil (v3): con puntero fino, las pupilas siguen al
 * cursor ( movimiento suave, coalescido por frame ), la burbuja entra
 * desfilando y reacciona al hover; en cualquier dispositivo, tocar a
 * Léxico le saca una ocurrencia. Nunca interrumpe: solo acompañar.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { sfx } from "@/services/audio";

export type LexicoMood = "idle" | "happy" | "cheer" | "think" | "oops" | "wink" | "curioso" | "dormido";

const MOOD_QUIRK: Record<LexicoMood, string> = {
  idle: "anim-bob",
  happy: "anim-bob",
  cheer: "anim-bounce-soft",
  think: "anim-float",
  oops: "anim-wiggle",
  wink: "anim-bob",
  curioso: "anim-bob",
  dormido: "anim-float",
};

/** Ocurrencias al tocar a Léxico (mismo orden determinista por rotación). */
const LEXICO_POKES = [
  "¡Hoo! Un toque suave, por favor: soy de biblioteca.",
  "¿Buscas una palabra perdida? Pregúntame al pasar por el Bosque.",
  "En el Archipiélago hasta las gaviotas leen. Despacio, pero leen.",
  "Mi abuela era un búho de verdad. Yo solo estoy contratado.",
  "Tengo tinta en las plumas: señal de buen oficio.",
  "Un consejo: las palabras difíciles se doman con tres repasos.",
  "¡Hoo-hoo! Ese toque casi me tumba las gafas.",
  "Si ves un error de ortografía por ahí, avisa: los guardianes cobran por corrección.",
];

export function LexicoMascot({
  className,
  size = 92,
  mood = "idle",
  interactive = true,
}: {
  className?: string;
  size?: number;
  mood?: LexicoMood;
  /** ¿Responde al toque con una ocurrencia? (onPoke se dispara si existe) */
  interactive?: boolean;
}) {
  const closedEyes = mood === "happy" || mood === "cheer" || mood === "dormido";
  const wink = mood === "wink";
  const wideEyes = mood === "oops" || mood === "curioso";
  const sleepy = mood === "dormido";

  /* ---------- Ojos que siguen al cursor (solo puntero fino) ---------- */
  const leftPupil = useRef<SVGCircleElement>(null);
  const rightPupil = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [poked, setPoked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let pending: { x: number; y: number } | null = null;
    let tx = 0;
    let ty = 0;
    const apply = () => {
      raf = 0;
      const p = pending;
      pending = null;
      if (!p) return;
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      if (r.width === 0) return;
      // Vector normalizado desde el centro del búho hacia el cursor (±1).
      const nx = Math.max(-1, Math.min(1, ((p.x - (r.left + r.width / 2)) / r.width) * 2.4));
      const ny = Math.max(-1, Math.min(1, ((p.y - (r.top + r.height * 0.42)) / r.height) * 2.4));
      // Movimiento de pupila con inercia suave (lerp).
      tx += (nx - tx) * 0.16;
      ty += (ny - ty) * 0.16;
      const dx = 2.2 * tx;
      const dy = 1.6 * ty;
      if (leftPupil.current) leftPupil.current.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      if (rightPupil.current) rightPupil.current.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      if (Math.abs(nx - tx) + Math.abs(ny - ty) > 0.02) {
        raf = requestAnimationFrame(apply);
      }
    };
    const onMove = (e: PointerEvent) => {
      pending = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mood]);

  const handlePoke = useCallback(() => {
    if (!interactive) return;
    setPoked(true);
    sfx.pop();
    window.setTimeout(() => setPoked(false), 2400);
  }, [interactive]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn(
        "select-none",
        MOOD_QUIRK[mood],
        interactive && "cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95",
        className,
      )}
      role="img"
      aria-label="Léxico, el búho bibliotecario"
      onClick={handlePoke}
    >
      {/* sombra */}
      <ellipse cx="60" cy="111" rx="24" ry="4.5" fill="currentColor" opacity="0.12" />

      {/* alas */}
      {mood === "cheer" ? (
        <>
          <path d="M26 46 C10 38 8 22 20 16 C22 30 28 40 38 46 Z" fill="#3b3480" />
          <path d="M94 46 C110 38 112 22 100 16 C98 30 92 40 82 46 Z" fill="#3b3480" />
        </>
      ) : mood === "oops" ? (
        <>
          <path d="M30 54 C22 62 22 78 32 88 C28 74 30 62 38 56 Z" fill="#3b3480" />
          <path d="M90 54 C98 62 98 78 88 88 C92 74 90 62 82 56 Z" fill="#3b3480" />
        </>
      ) : (
        <>
          <path d="M28 52 C18 66 22 84 34 92 C30 78 32 64 38 56 Z" fill="#3b3480" />
          <path d="M92 52 C102 66 98 84 86 92 C90 78 88 64 82 56 Z" fill="#3b3480" />
        </>
      )}

      {/* cuerpo */}
      <ellipse cx="60" cy="68" rx="34" ry="36" fill="#5750c2" />
      {/* barriga */}
      <ellipse cx="60" cy="77" rx="25" ry="26" fill="#f5efdc" />

      {/* cabeza/plumaje */}
      <path d="M26 48 Q60 20 94 48 Q94 22 60 15 Q26 22 26 48 Z" fill="#6a63d8" />
      {/* mechones */}
      <path d="M44 22 Q46 10 54 16" stroke="#6a63d8" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M76 22 Q74 10 66 16" stroke="#6a63d8" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* ojos */}
      {closedEyes ? (
        <>
          <path d="M34 50 Q45 42 56 50" stroke="#26221c" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M64 50 Q75 42 86 50" stroke="#26221c" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="45" cy="50" r={wideEyes ? 18 : 15.5} fill="#fdf9ee" />
          <circle cx="75" cy="50" r={wideEyes ? 18 : 15.5} fill="#fdf9ee" />
          <g ref={leftPupil as unknown as React.Ref<SVGGElement>}>
            <circle cx={wideEyes ? 45 : 47} cy={wideEyes ? 50 : 52} r={wideEyes ? 8.5 : 7.5} fill="#26221c" />
            <circle cx={wideEyes ? 42 : 49.5} cy={wideEyes ? 45 : 49} r="2.6" fill="#ffffff" />
          </g>
          <g ref={rightPupil as unknown as React.Ref<SVGGElement>}>
            <circle cx={wideEyes ? 75 : 77} cy={wideEyes ? 50 : 52} r={wideEyes ? 8.5 : 7.5} fill="#26221c" />
            <circle cx={wideEyes ? 72 : 79.5} cy={wideEyes ? 45 : 49} r="2.6" fill="#ffffff" />
          </g>
          {/* párpados con parpadeo (solo en idle): transform-box moderno,
              robusto en todos los navegadores de escritorio y móvil) */}
          {mood === "idle" && (
            <>
              <circle cx="45" cy="50" r="16" fill="#6a63d8" className="lexico-lid" style={{ ["--lid-origin" as string]: "45px 34px" }} />
              <circle cx="75" cy="50" r="16" fill="#6a63d8" className="lexico-lid" style={{ ["--lid-origin" as string]: "75px 34px" }} />
            </>
          )}
          {/* guiño */}
          {wink && (
            <path d="M66 50 Q75 44 84 50" stroke="#26221c" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          )}
        </>
      )}

      {/* gafas redondas doradas */}
      <g fill="none" stroke="#e8b64c" strokeWidth="2.8">
        <circle cx="45" cy="50" r="17.5" />
        <circle cx="75" cy="50" r="17.5" />
        <path d="M62.5 50 Q60 46.5 57.5 50" />
        <path d="M27.5 48 L22 44" strokeLinecap="round" />
        <path d="M92.5 48 L98 44" strokeLinecap="round" />
      </g>

      {/* pico */}
      {mood === "cheer" ? (
        <ellipse cx="60" cy="66" rx="6.5" ry="5" fill="#e89b3f" />
      ) : (
        <path d="M60 58 L55 66 L65 66 Z" fill="#e89b3f" />
      )}

      {/* plumitas del pico */}
      <path d="M50 68 Q60 74 70 68 Q66 80 60 80 Q54 80 50 68 Z" fill="#efe7cf" />

      {/* patas */}
      <path d="M50 101 L50 108 M56 101 L56 108 M64 101 L64 108 M70 101 L70 108" stroke="#e8b64c" strokeWidth="3" strokeLinecap="round" />

      {/* libro bajo el ala */}
      <g transform="rotate(-8 88 86)">
        <rect x="76" y="80" width="24" height="17" rx="2" fill="#e46a55" />
        <rect x="87.5" y="80" width="3" height="17" fill="#c2523f" />
        <rect x="79" y="84" width="6" height="1.6" rx="0.8" fill="#f5efdc" opacity="0.85" />
        <rect x="92" y="84" width="6" height="1.6" rx="0.8" fill="#f5efdc" opacity="0.85" />
      </g>

      {/* birrete */}
      <path d="M38 19 L60 6 L82 19 L60 25 Z" fill="#2f2b52" />
      <path d="M80 19 L96 23 L80 25 Z" fill="#2f2b52" />
      <path d="M94 24 L94 32" stroke="#e8b64c" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="94" cy="34" r="2.6" fill="#e8b64c" />

      {/* estrellitas al celebrar */}
      {mood === "cheer" && (
        <>
          <path d="M14 30 l2.2 5 5 2.2 -5 2.2 -2.2 5 -2.2 -5 -5 -2.2 5 -2.2 Z" fill="#ffd166" className="anim-twinkle" />
          <path d="M104 34 l1.8 4 4 1.8 -4 1.8 -1.8 4 -1.8 -4 -4 -1.8 4 -1.8 Z" fill="#ff8fa3" className="anim-twinkle" />
        </>
      )}
      {/* interrogación al pensar */}
      {mood === "think" && (
        <text x="100" y="30" fontSize="16" fontWeight="bold" fill="#e8b64c" fontFamily="system-ui, sans-serif">
          ?
        </text>
      )}
      {/* «¡eh!» al ponerse curioso (Etapa 4) */}
      {mood === "curioso" && (
        <text x="98" y="28" fontSize="15" fontWeight="bold" fill="#e89b3f" fontFamily="system-ui, sans-serif" className="anim-twinkle">
          ¡!
        </text>
      )}
      {/* zzz al dormirse (Etapa 4) */}
      {sleepy && (
        <text x="96" y="26" fontSize="12" fontWeight="bold" fill="#8a86b8" fontFamily="system-ui, sans-serif" className="anim-float">
          z z z
        </text>
      )}
      {/* burbuja de ocurrencia al tocarle */}
      {poked && (
        <g className="anim-pop-3d">
          <rect x="6" y="6" width="86" height="20" rx="9" fill="var(--card, #fff)" stroke="var(--border, #ddd)" strokeWidth="1.2" />
          <path d="M34 26 l5 6 l2 -6 Z" fill="var(--card, #fff)" stroke="var(--border, #ddd)" strokeWidth="1.2" />
          <text x="49" y="19.5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="var(--foreground, #333)" fontFamily="system-ui, sans-serif">
            {LEXICO_POKES[Math.floor(Date.now() / 60000) % LEXICO_POKES.length].slice(0, 42)}
          </text>
        </g>
      )}
    </svg>
  );
}

/** Burbuja de diálogo de Léxico con entrada animada y halo hover (PC). */
export function LexicoBubble({
  text,
  compact = false,
  mood,
  className,
}: {
  text: string;
  compact?: boolean;
  mood?: LexicoMood;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-aurora anim-slide-up flex items-start gap-3 rounded-2xl border border-primary/20 bg-card p-3 pr-4 shadow-sm transition-colors duration-300 hover:border-primary/40",
        compact && "p-2.5",
        className,
      )}
    >
      <LexicoMascot size={compact ? 44 : 56} mood={mood} className="mt-0.5 shrink-0 text-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary/80">Léxico</p>
        <p className={cn("mt-0.5 leading-snug text-muted-foreground", compact ? "text-xs" : "text-sm")}>{text}</p>
      </div>
    </div>
  );
}

/** Mini réplica para HUD de partida: reacciona sin robar espacio. */
export function LexicoMini({ mood, className }: { mood?: LexicoMood; className?: string }) {
  return <LexicoMascot size={40} mood={mood} interactive={false} className={cn("shrink-0", className)} />;
}
