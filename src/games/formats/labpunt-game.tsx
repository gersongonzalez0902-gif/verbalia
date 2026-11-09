"use client";

/**
 * Laboratorio de Puntuación (Fortaleza) · Etapa 2 completa
 * ----------------------------------------------------------------
 * Experimento de frascos: la misma frase viaja en tres probetas con
 * distinta puntuación y solo una produce el sentido pedido. Elegir
 * la probeta correcta es descubrir cómo los signos fabrican
 * significado con las mismas palabras.
 */

import { useRef, useState } from "react";
import type { LabPuntExercise } from "@/types";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { useGameProps } from "../props";
import { FlaskConical, Target } from "lucide-react";

export function LabPuntGame(props: useGameProps<LabPuntExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const answeredRef = useRef(false);

  const answer = (i: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    setChosen(i);
    const correct = i === item.answerIndex;
    if (correct) sfx.correct(1);
    else sfx.wrong(true);
    onAnswer({
      correct,
      userAnswer: item.options[i] ?? "—",
      correctAnswer: item.options[item.answerIndex],
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* El objetivo del experimento */}
      <div className="flex w-full max-w-2xl items-start gap-3 rounded-2xl border-2 border-primary/40 bg-primary/10 px-4 py-3">
        <Target className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80">El experimento busca</p>
          <p className="text-sm font-bold sm:text-base">{item.meaning}</p>
        </div>
      </div>

      {/* Las probetas: las tres versiones */}
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <FlaskConical className="h-4 w-4" aria-hidden /> Tres probetas, una verdad
      </p>
      <div className="flex w-full max-w-2xl flex-col gap-3">
        {item.options.map((opt, i) => {
          const state = chosen === null ? "idle" : i === item.answerIndex ? "correct" : chosen === i ? "wrong" : "idle";
          return (
            <button
              key={`${item.id}-opt-${i}`}
              type="button"
              onClick={() => answer(i)}
              disabled={disabled || chosen !== null}
              style={{ animationDelay: `${i * 80}ms` }}
              aria-label={`Probeta ${i + 1}: ${opt}`}
              className={cn(
                "anim-pop-3d tap-target group flex w-full items-center gap-3.5 rounded-2xl border-2 bg-card px-5 py-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-150",
                state === "idle" &&
                  "border-border shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-0.5 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                state === "correct" && "gloss anim-pop border-success bg-success/10 shadow-[0_4px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
                state === "wrong" && "anim-shake border-destructive bg-destructive/10 shadow-[0_4px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]",
                disabled && state === "idle" && "pointer-events-none opacity-60",
              )}
            >
              <span
                className={cn(
                  "numeric flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 font-display text-sm font-black",
                  state === "correct" ? "border-success bg-success/15 text-success" : state === "wrong" ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-muted text-muted-foreground",
                )}
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 font-mono text-base font-bold leading-snug sm:text-lg">{opt}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] font-semibold text-muted-foreground">
        Las tres probetas usan las mismas palabras: solo cambia la puntuación.
      </p>
    </div>
  );
}
