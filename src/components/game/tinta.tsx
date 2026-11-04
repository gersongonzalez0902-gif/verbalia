"use client";

/**
 * Tinta, la lechuza bibliotecaria · Personaje acompañante.
 * SVG ligero con parpadeo y balanceo suaves (CSS, sin librerías).
 * Habla solo cuando se le invita: nunca interrumpe una partida.
 */

import { cn } from "@/lib/utils";

export function TintaOwl({ className, size = 92 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn("anim-bob select-none", className)}
      role="img"
      aria-label="Tinta, la lechuza bibliotecaria"
    >
      {/* sombra */}
      <ellipse cx="60" cy="110" rx="26" ry="5" fill="currentColor" opacity="0.12" />
      {/* cuerpo */}
      <ellipse cx="60" cy="66" rx="34" ry="38" fill="#3d6b57" />
      <ellipse cx="60" cy="74" rx="26" ry="28" fill="#f1ead6" />
      {/* alas */}
      <path d="M28 52 C18 66 22 84 34 92 C30 78 32 64 38 56 Z" fill="#2f5443" />
      <path d="M92 52 C102 66 98 84 86 92 C90 78 88 64 82 56 Z" fill="#2f5443" />
      {/* cabeza/plumaje */}
      <path d="M26 46 Q60 18 94 46 Q94 20 60 14 Q26 20 26 46 Z" fill="#4a7c64" />
      {/* ojos */}
      <g>
        <circle cx="45" cy="50" r="16" fill="#fdf9ee" />
        <circle cx="75" cy="50" r="16" fill="#fdf9ee" />
        <circle cx="47" cy="52" r="7.5" fill="#26221c" />
        <circle cx="77" cy="52" r="7.5" fill="#26221c" />
        <circle cx="49.5" cy="49" r="2.6" fill="#ffffff" />
        <circle cx="79.5" cy="49" r="2.6" fill="#ffffff" />
        {/* párpados (parpadeo) */}
        <circle cx="45" cy="50" r="16.5" fill="#4a7c64" style={{ transformOrigin: "45px 34px", animation: "blink 6s infinite" }} />
        <circle cx="75" cy="50" r="16.5" fill="#4a7c64" style={{ transformOrigin: "75px 34px", animation: "blink 6s infinite" }} />
      </g>
      {/* gafas redondas */}
      <g fill="none" stroke="#d9a441" strokeWidth="2.6">
        <circle cx="45" cy="50" r="17.5" />
        <circle cx="75" cy="50" r="17.5" />
        <path d="M62.5 50 Q60 47 57.5 50" />
      </g>
      {/* pico */}
      <path d="M60 58 L55 66 L65 66 Z" fill="#e0a63f" />
      {/* plumitas del pico */}
      <path d="M50 68 Q60 74 70 68 Q66 80 60 80 Q54 80 50 68 Z" fill="#e8dfc8" />
      {/* patas */}
      <path d="M50 101 L50 108 M56 101 L56 108 M64 101 L64 108 M70 101 L70 108" stroke="#d9a441" strokeWidth="3" strokeLinecap="round" />
      {/* libro bajo el ala */}
      <g transform="rotate(-8 88 86)">
        <rect x="76" y="80" width="24" height="17" rx="2" fill="#c96f4a" />
        <rect x="87.5" y="80" width="3" height="17" fill="#a85638" />
        <rect x="79" y="84" width="6" height="1.6" rx="0.8" fill="#f1ead6" opacity="0.85" />
        <rect x="92" y="84" width="6" height="1.6" rx="0.8" fill="#f1ead6" opacity="0.85" />
      </g>
      {/* birrete de bibliotecaria */}
      <path d="M40 20 L60 8 L80 20 L60 26 Z" fill="#3d3a33" />
      <path d="M78 20 L92 24 L78 26 Z" fill="#3d3a33" />
      <circle cx="88" cy="25" r="2.2" fill="#e0a63f" />
    </svg>
  );
}

/** Burbuja de diálogo de Tinta con cierre manual. */
export function TintaBubble({
  text,
  compact = false,
  className,
}: {
  text: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-primary/20 bg-card p-3 pr-4 shadow-sm",
        compact && "p-2.5",
        className,
      )}
    >
      <TintaOwl size={compact ? 44 : 56} className="mt-0.5 shrink-0 text-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary/80">
          Tinta
        </p>
        <p className={cn("mt-0.5 leading-snug text-muted-foreground", compact ? "text-xs" : "text-sm")}>
          {text}
        </p>
      </div>
    </div>
  );
}
