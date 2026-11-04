"use client";

/**
 * Tribunal de las Tildes · Elegir la sílaba que carga con la tilde,
 * o declarar que la palabra no la lleva. La frase da el contexto.
 */

import { useState } from "react";
import type { TildeExercise } from "@/types";
import { checkTildes } from "@/engine/validation";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";
import { OptionButton } from "./common";

export function TildeCourt(props: useGameProps<TildeExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);

  const handle = (i: number) => {
    if (disabled || chosen !== null) return;
    const v = checkTildes(item, i);
    setChosen(i);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  const optionState = (i: number) => {
    if (chosen === null) return "idle" as const;
    if (i === item.answerSyllable) return "correct" as const;
    if (i === chosen) return "wrong" as const;
    return "idle" as const;
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5">
      <p className="text-center text-sm text-muted-foreground">{item.prompt}</p>

      {/* Frase de contexto con la palabra señalada */}
      <div className="paper-texture w-full rounded-3xl border-2 border-border bg-card p-5 text-center shadow-sm sm:p-6">
        <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {item.sentence.split(item.word).map((seg, i, arr) => (
            <span key={i}>
              {seg}
              {i < arr.length - 1 && (
                <span className="font-bold text-foreground">{item.word}</span>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Palabra en sílabas */}
      <div aria-label={`Palabra ${item.word} dividida en sílabas`}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {item.syllables.map((syl, i) => (
            <span
              key={`${item.id}-${i}`}
              className={cn(
                "font-display rounded-xl border-2 px-3 py-1 text-2xl font-bold",
                i === item.answerSyllable && chosen !== null
                  ? "border-success bg-success/10 text-success"
                  : i === chosen && chosen !== item.answerSyllable
                    ? "anim-shake border-destructive bg-destructive/10 text-destructive"
                    : "border-border",
              )}
              aria-hidden
            >
              {syl}
            </span>
          ))}
        </div>
      </div>

      {/* Botones de decisión (los mismos chips, ahora como botones accesibles) */}
      <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3" role="group" aria-label="Elegir sílaba con tilde">
        {item.syllables.map((syl, i) => (
          <OptionButton
            key={`${item.id}-btn-${i}`}
            label={<span className="font-display">«{syl}»</span>}
            state={optionState(i)}
            onClick={() => handle(i)}
            disabled={disabled || chosen !== null}
          />
        ))}
        <OptionButton
          key={`${item.id}-btn-none`}
          label={<span className="font-display">No lleva tilde</span>}
          state={optionState(-1)}
          onClick={() => handle(-1)}
          disabled={disabled || chosen !== null}
        />
      </div>
    </div>
  );
}
