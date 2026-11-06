"use client";

/**
 * Motor Etapa 3 · «Clasifica» (sortea): enunciado + cubos.
 * Cubos con color regional que reciben la respuesta con una caída.
 */

import { useRef, useState } from "react";
import type { SorteaExercise } from "@/types";
import { checkSortea } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { useGameProps } from "../props";
import { Inbox } from "lucide-react";

const BUCKET_HUES = ["--region-bosque", "--region-ciudad", "--region-torre", "--region-observatorio"];

export function SorteaGame(props: useGameProps<SorteaExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const answeredRef = useRef(false);

  const handle = (bucketIndex: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    const r = checkSortea(item, bucketIndex);
    if (r.correct) sfx.correct(1);
    else sfx.wrong(true);
    setChosen(bucketIndex);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  const answered = chosen !== null;
  const wide = item.buckets.length <= 2;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* El enunciado cae desde arriba */}
      <div
        className="paper-texture anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm"
        role="status"
      >
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {item.prompt} · {item.cefr}
        </p>
        <p className="font-display mt-2.5 text-xl font-bold leading-snug sm:text-2xl">
          {item.statement}
        </p>
      </div>

      {/* Los cubos */}
      <div className={cn("grid w-full max-w-xl gap-3", wide ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
        {item.buckets.map((bucket, i) => {
          const isRight = i === item.answerIndex;
          const state = answered ? (isRight ? "correct" : chosen === i ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-bucket-${i}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(i)}
              aria-label={`Clasificar en: ${bucket}`}
              style={{ animationDelay: `${120 + i * 90}ms` }}
              className={cn(
                "anim-pop-3d tap-target flex min-h-20 items-center justify-center gap-2.5 rounded-3xl border-2 px-4 py-4 font-display text-base font-bold transition-all duration-150 sm:text-lg",
                state === "idle" &&
                  "border-border bg-card shadow-[0_5px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-1 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                state === "correct" && "gloss anim-pop border-success bg-success/15 text-success shadow-[0_5px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
                state === "wrong" && "anim-shake border-destructive bg-destructive/10 text-destructive shadow-[0_5px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]",
                disabled && state === "idle" && "pointer-events-none opacity-60",
              )}
            >
              <Inbox
                className="h-5 w-5 shrink-0"
                style={{ color: `var(${BUCKET_HUES[i % BUCKET_HUES.length]})` }}
                aria-hidden
              />
              <span className="leading-tight">{bucket}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
