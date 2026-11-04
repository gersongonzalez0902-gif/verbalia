"use client";

/**
 * Batalla de Sinónimos (Bosque) · Sinónimo/antónimo en contexto.
 * La palabra destacada se resalta igual que en Trivia.
 */

import { useState } from "react";
import type { SinonimosExercise } from "@/types";
import { checkOptionIndex } from "@/engine/validation";
import { useGameProps } from "./props";
import { OptionButton } from "./common";

export function BatallaSinonimos(props: useGameProps<SinonimosExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);

  const handle = (i: number) => {
    if (disabled || chosen !== null) return;
    const v = checkOptionIndex(item, i);
    setChosen(i);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  const parts = item.sentence.split(/(\*[^*]+\*)/g).filter(Boolean);

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5">
      <p className="text-center text-sm text-muted-foreground">
        {item.prompt} <span className="font-bold text-foreground">({item.relation})</span>
      </p>

      {/* Frase con la palabra destacada */}
      <div className="paper-texture w-full rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
        <p className="text-lg leading-relaxed sm:text-xl">
          {parts.map((p, i) => {
            if (p.startsWith("*") && p.endsWith("*")) {
              return (
                <mark
                  key={i}
                  className="anim-glow rounded-md bg-[var(--xp)]/25 px-1.5 py-0.5 font-display font-bold text-foreground"
                >
                  {p.slice(1, -1)}
                </mark>
              );
            }
            return <span key={i}>{p}</span>;
          })}
        </p>
      </div>

      {/* Opciones */}
      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
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
