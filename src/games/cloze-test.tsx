"use client";

/**
 * Puentes de Contexto (cloze) · Completar el hueco de un texto breve.
 */

import { useState } from "react";
import type { ClozeExercise } from "@/types";
import { checkCloze } from "@/engine/validation";
import { useGameProps } from "./props";
import { OptionButton } from "./common";

export function ClozeTest(props: useGameProps<ClozeExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);

  const handle = (i: number) => {
    if (disabled || chosen !== null) return;
    const v = checkCloze(item, i);
    setChosen(i);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  const segments = item.text.split("___");

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5">
      <p className="text-center text-sm text-muted-foreground">{item.prompt}</p>

      {/* Texto con hueco */}
      <div className="paper-texture w-full rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
        <p className="text-lg leading-loose sm:text-xl">
          {segments[0]}
          <span
            className="mx-1 inline-flex min-w-16 items-center justify-center rounded-lg border-b-4 border-primary px-2 pb-0.5 pt-1 font-display font-bold text-primary"
            aria-label="Espacio a completar"
          >
            {chosen !== null ? item.options[chosen] : "?"}
          </span>
          {segments[1]}
        </p>
      </div>

      {/* Opciones */}
      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3">
        {item.options.map((opt, i) => (
          <OptionButton
            key={`${item.id}-${i}`}
            index={i + 1}
            label={<span className="font-display text-base">{opt}</span>}
            state={
              chosen !== null
                ? i === item.answerIndex
                  ? "correct"
                  : i === chosen
                    ? "wrong"
                    : "idle"
                : "idle"
            }
            onClick={() => handle(i)}
            disabled={disabled || chosen !== null}
          />
        ))}
      </div>
    </div>
  );
}
