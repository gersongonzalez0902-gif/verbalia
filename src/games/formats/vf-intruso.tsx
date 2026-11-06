"use client";

/**
 * Motores Etapa 3 · «Verdadero o falso» e «El Intruso».
 * Formatos rápidos con decisiones binarias o de cuatro opciones:
 * la clave está en la lectura atenta y la reacción.
 */

import { useRef, useState } from "react";
import type { IntrusoExercise, VfExercise } from "@/types";
import { checkIntruso, checkVf } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { createRng, shuffle } from "@/engine/rng";
import { useGameProps } from "../props";
import { Check, CircleHelp, X } from "lucide-react";

/* ==================== Verdadero o falso ==================== */

export function VfGame(props: useGameProps<VfExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<boolean | null>(null);
  const answeredRef = useRef(false);

  const handle = (v: boolean) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const r = checkVf(item, v);
    setChosen(v);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="paper-texture anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {item.prompt} · {item.cefr}
        </p>
        <p className="mt-3 text-lg leading-relaxed sm:text-xl">{item.statement}</p>
        {item.correction && answered && chosen !== item.answer && (
          <p className="anim-slide-up mt-3 rounded-2xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground">
            Forma correcta: {item.correction}
          </p>
        )}
      </div>

      <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        {([true, false] as const).map((v, i) => {
          const isRight = v === item.answer;
          const state = answered ? (isRight ? "correct" : chosen === v ? "wrong" : "idle") : "idle";
          return (
            <button
              key={String(v)}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(v)}
              aria-label={v ? "Verdadero" : "Falso"}
              aria-pressed={chosen === v}
              style={{ animationDelay: `${i * 80}ms` }}
              className={cn(
                "anim-pop-3d tap-target flex h-24 flex-col items-center justify-center gap-1.5 rounded-3xl border-2 font-display text-lg font-bold transition-all duration-150",
                state === "idle" &&
                  "border-border bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-1 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                state === "correct" && "gloss border-success bg-success/15 text-success shadow-[0_4px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
                state === "wrong" && "anim-shake border-destructive bg-destructive/10 text-destructive shadow-[0_4px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]",
                disabled && state === "idle" && "pointer-events-none opacity-60",
              )}
            >
              {v ? (
                <Check className="h-8 w-8" aria-hidden />
              ) : (
                <X className="h-8 w-8" aria-hidden />
              )}
              {v ? "Verdadero" : "Falso"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==================== El intruso ==================== */

export function IntrusoGame(props: useGameProps<IntrusoExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const answeredRef = useRef(false);

  // Orden estable por ejercicio (determinista: mismo ejercicio, misma mesa).
  // useState perezoso: la barajada se calcula una sola vez, sin leer refs en render.
  const [order] = useState(() => shuffle(item.options.map((_, i) => i), createRng(item.id)));
  const correctPosition = order.indexOf(item.answerIndex);

  const handle = (position: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const r = checkIntruso(item, order[position]);
    setChosen(position);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="paper-texture anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-5 text-center shadow-sm">
        <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <CircleHelp className="h-4 w-4" aria-hidden /> {item.prompt}
        </p>
        {answered && (
          <p className="anim-slide-up mt-1.5 text-sm font-bold text-primary">
            Familia: {item.category}
          </p>
        )}
      </div>

      <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        {order.map((originalIndex, position) => {
          const isRight = originalIndex === item.answerIndex;
          const state = answered ? (isRight ? "correct" : chosen === position ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-${position}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(position)}
              aria-label={`Opción ${position + 1}: ${item.options[originalIndex]}`}
              style={{ animationDelay: `${position * 70}ms` }}
              className={cn(
                "anim-pop-3d tap-target flex min-h-24 flex-col items-center justify-center rounded-3xl border-2 px-3 py-4 font-display text-lg font-bold leading-tight transition-all duration-150 sm:text-xl",
                state === "idle" &&
                  "border-border bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-1 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                state === "correct" && "gloss anim-pop border-success bg-success/15 text-success shadow-[0_4px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
                state === "wrong" && "anim-shake border-destructive bg-destructive/10 text-destructive shadow-[0_4px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]",
                disabled && state === "idle" && "pointer-events-none opacity-60",
              )}
            >
              {item.options[originalIndex]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
