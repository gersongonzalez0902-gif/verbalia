"use client";

/**
 * Cronista de la Biblioteca (constructor de párrafos) · Ordenar oraciones
 * tocando para reconstruir el texto completo.
 */

import { useMemo, useState } from "react";
import type { ParagraphExercise } from "@/types";
import { checkParagraph } from "@/engine/validation";
import { createRng, shuffle } from "@/engine/rng";
import { sfx } from "@/services/audio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";

export function ParagraphBuilder(props: useGameProps<ParagraphExercise>) {
  const { item, onAnswer, disabled } = props;

  const shuffled = useMemo(() => {
    let s = shuffle(item.sentences.map((_, i) => i), createRng(item.id));
    if (s.every((v, i) => v === i)) s = s.reverse();
    return s;
  }, [item.id, item.sentences]);

  const [placed, setPlaced] = useState<number[]>([]); // índices originales

  const remaining = shuffled.filter((i) => !placed.includes(i));

  const place = (i: number) => {
    if (disabled || placed.includes(i)) return;
    sfx.deal();
    setPlaced((p) => [...p, i]);
  };

  const remove = (i: number) => {
    if (disabled) return;
    sfx.pop();
    setPlaced((p) => p.filter((x) => x !== i));
  };

  const confirm = () => {
    if (placed.length !== item.sentences.length) return;
    sfx.snap();
    const v = checkParagraph(item, placed);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5">
      <div className="text-center">
        <p className="font-display text-xl font-bold text-primary">{item.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">💡 {item.hint}</p>
      </div>

      {/* Texto en construcción */}
      <div
        className="paper-texture min-h-28 w-full rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-4"
        aria-label="Párrafo en construcción"
      >
        {placed.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Toca las oraciones para colocarlas en orden…
          </p>
        ) : (
          <ol className="space-y-2.5">
            {placed.map((oi) => (
              <li key={oi} className="anim-pop flex items-start gap-3">
                <span className="numeric mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground" aria-hidden>
                  {placed.indexOf(oi) + 1}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(oi)}
                  className="flex-1 rounded-xl bg-card px-3.5 py-2.5 text-left text-sm font-medium leading-relaxed shadow-sm transition hover:border-destructive/50 hover:line-through sm:text-base"
                  aria-label={`Quitar la oración número ${placed.indexOf(oi) + 1}`}
                >
                  {item.sentences[oi]}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Depósito de oraciones */}
      <div className="flex w-full flex-col gap-2.5" role="group" aria-label="Oraciones disponibles">
        {remaining.map((oi) => (
          <button
            key={oi}
            type="button"
            disabled={disabled}
            onClick={() => place(oi)}
            className="anim-pop tap-target w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-left text-sm font-medium leading-relaxed shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-md active:translate-y-0 sm:text-base"
          >
            {item.sentences[oi]}
          </button>
        ))}
      </div>

      <Button
        size="lg"
        className={cn("w-full font-bold shadow-md", placed.length === item.sentences.length && "anim-attention")}
        disabled={disabled || placed.length !== item.sentences.length}
        onClick={confirm}
      >
        Comprobar el párrafo
      </Button>
    </div>
  );
}
