"use client";

/**
 * Sabiduría Popular (Torre) · Significado real de refranes y modismos.
 * Muestra la variante regional: el español es un continente de voces.
 */

import { useState } from "react";
import type { RefranesExercise } from "@/types";
import { checkOptionIndex } from "@/engine/validation";
import { Globe2 } from "lucide-react";
import { useGameProps } from "./props";
import { OptionButton } from "./common";

export function SabiduriaPopular(props: useGameProps<RefranesExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);

  const handle = (i: number) => {
    if (disabled || chosen !== null) return;
    const v = checkOptionIndex(item, i);
    setChosen(i);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5">
      <p className="text-center text-sm text-muted-foreground">{item.prompt}</p>

      {/* El dicho */}
      <div className="paper-texture w-full rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
        <p className="font-display text-2xl font-bold italic leading-snug sm:text-3xl">
          «{item.saying}»
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Globe2 className="h-3.5 w-3.5" aria-hidden />
          {item.region}
        </p>
      </div>

      {/* Significados */}
      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {item.options.map((opt, i) => (
          <OptionButton
            key={`${item.id}-${i}`}
            index={i + 1}
            label={<span className="text-sm leading-snug sm:text-base">{opt}</span>}
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
