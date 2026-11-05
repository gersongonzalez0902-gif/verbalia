"use client";

/**
 * Utilidades compartidas por los minijuegos v3:
 * botón de opción accesible con relieve de juguete y estados visuales.
 * (El estado por ítem se reinicia porque la pantalla de partida remonta
 * cada componente con una key nueva al avanzar de ejercicio.)
 */

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export interface GameAnswerPayload {
  correct: boolean | null;
  grade?: "again" | "hard" | "good" | "easy";
  userAnswer: string;
  correctAnswer: string;
}

export interface GameProps<T> {
  item: T;
  onAnswer: (payload: Omit<GameAnswerPayload, "correct"> & { correct: boolean | null }) => void;
  disabled: boolean;
}

/** Botón de opción con tecla de acceso (1-4) y estados visuales.
 *  Entra escalonado según su índice: la rejilla cobra vida.
 *  Canto inferior que se hunde al pulsar (lenguaje v3). */
export function OptionButton({
  index,
  label,
  state,
  onClick,
  disabled,
  className,
  ariaLabel,
}: {
  index?: number;
  label: React.ReactNode;
  state: "idle" | "chosen" | "correct" | "wrong";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={index !== undefined ? { animationDelay: `${(index % 8) * 55}ms` } : undefined}
      className={cn(
        "anim-pop-3d tap-target group relative flex w-full items-center gap-3 rounded-2xl border-2 bg-card px-4 py-3.5 text-left font-semibold",
        "transition-[transform,box-shadow,border-color,background-color] duration-150",
        state === "idle" &&
          "border-border shadow-[0_3px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-0.5 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
        state === "chosen" &&
          "border-primary bg-primary/10 shadow-[0_3px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)]",
        state === "correct" && "border-success bg-success/10 shadow-[0_3px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
        state === "wrong" &&
          "anim-shake border-destructive bg-destructive/10 shadow-[0_3px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]",
        disabled && state === "idle" && "pointer-events-none opacity-60",
        className,
      )}
    >
      {index !== undefined && (
        <span
          className={cn(
            "numeric gloss flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-black",
            state === "correct" && "bg-success text-success-foreground",
            state === "wrong" && "bg-destructive text-destructive-foreground",
            state === "chosen" && "bg-primary text-primary-foreground",
            state === "idle" && "bg-muted text-muted-foreground",
          )}
          aria-hidden
        >
          {index}
        </span>
      )}
      <span className="min-w-0 flex-1">{label}</span>
      {state === "correct" && (
        <span className="anim-pop shrink-0" aria-hidden>
          <Check className="h-5 w-5 text-success" />
        </span>
      )}
      {state === "wrong" && (
        <span className="shrink-0" aria-hidden>
          <X className="h-5 w-5 text-destructive" />
        </span>
      )}
    </button>
  );
}
