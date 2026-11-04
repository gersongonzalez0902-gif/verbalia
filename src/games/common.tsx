"use client";

/**
 * Utilidades compartidas por los minijuegos:
 * botón de opción accesible con estados visuales.
 * (El estado por ítem se reinicia porque la pantalla de partida remonta
 * cada componente con una key nueva al avanzar de ejercicio.)
 */

import { cn } from "@/lib/utils";

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

/** Botón de opción con tecla de acceso (1-4) y estados visuales. */
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
      className={cn(
        "tap-target group relative flex w-full items-center gap-3 rounded-2xl border-2 bg-card px-4 py-3.5 text-left font-semibold shadow-sm transition-all duration-150",
        "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm",
        state === "idle" && "border-border hover:border-primary/60",
        state === "chosen" && "border-primary bg-primary/10",
        state === "correct" && "border-success bg-success/10",
        state === "wrong" && "anim-shake border-destructive bg-destructive/10",
        disabled && "pointer-events-none opacity-80",
        className,
      )}
    >
      {index !== undefined && (
        <span
          className={cn(
            "numeric flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-black",
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
    </button>
  );
}
