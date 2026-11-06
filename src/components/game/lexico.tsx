"use client";

/**
 * Léxico, el búho bibliotecario · Mascota acompañante (v2, Etapa 3).
 * SVG ligero con seis estados de ánimo que la pantalla de juego usa
 * para reaccionar en vivo: parpadea, saluda, celebra, duda y consuela.
 * Nunca interrumpe: solo acompañar.
 */

import { cn } from "@/lib/utils";

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

export function LexicoMascot({
  className,
  size = 92,
  mood = "idle",
}: {
  className?: string;
  size?: number;
  mood?: LexicoMood;
}) {
  const closedEyes = mood === "happy" || mood === "cheer" || mood === "dormido";
  const wink = mood === "wink";
  const wideEyes = mood === "oops" || mood === "curioso";
  const sleepy = mood === "dormido";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn("select-none", MOOD_QUIRK[mood], className)}
      role="img"
      aria-label="Léxico, el búho bibliotecario"
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
          <circle cx={wideEyes ? 45 : 47} cy={wideEyes ? 50 : 52} r={wideEyes ? 8.5 : 7.5} fill="#26221c" />
          <circle cx={wideEyes ? 75 : 77} cy={wideEyes ? 50 : 52} r={wideEyes ? 8.5 : 7.5} fill="#26221c" />
          <circle cx={wideEyes ? 42 : 49.5} cy={wideEyes ? 45 : 49} r="2.6" fill="#ffffff" />
          <circle cx={wideEyes ? 72 : 79.5} cy={wideEyes ? 45 : 49} r="2.6" fill="#ffffff" />
          {/* párpados con parpadeo (solo en idle) */}
          {mood === "idle" && (
            <>
              <circle cx="45" cy="50" r="16" fill="#6a63d8" style={{ transformOrigin: "45px 34px", animation: "blink 6s infinite" }} />
              <circle cx="75" cy="50" r="16" fill="#6a63d8" style={{ transformOrigin: "75px 34px", animation: "blink 6s infinite" }} />
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
    </svg>
  );
}

/** Burbuja de diálogo de Léxico con cierre manual y estado de ánimo. */
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
        "flex items-start gap-3 rounded-2xl border border-primary/20 bg-card p-3 pr-4 shadow-sm",
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
  return <LexicoMascot size={40} mood={mood} className={cn("shrink-0", className)} />;
}
