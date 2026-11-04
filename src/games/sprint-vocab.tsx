"use client";

/**
 * Sprint de Vocabulario (Bosque) · Palabra + 4 definiciones en 10 s.
 * Patrón de tiempo idéntico al de Trivia (agotado = fallo con
 * explicación, nunca castigo duro).
 */

import { useEffect, useRef, useState } from "react";
import type { SprintExercise } from "@/types";
import { checkOptionIndex } from "@/engine/validation";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";
import { OptionButton } from "./common";

const TIME_LIMIT_S = 10;

export function SprintVocab(props: useGameProps<SprintExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_S);
  const [timedOut, setTimedOut] = useState(false);
  const answeredRef = useRef(false);

  const onAnswerRef = useRef(onAnswer);
  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  useEffect(() => {
    if (disabled || answeredRef.current || timeLeft <= 0) return;
    const t = setTimeout(() => {
      if (answeredRef.current) return;
      if (timeLeft === 1) {
        answeredRef.current = true;
        setTimedOut(true);
        onAnswerRef.current({
          correct: false,
          userAnswer: "sin respuesta",
          correctAnswer: item.options[item.answerIndex],
        });
      } else {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, disabled, item.options, item.answerIndex]);

  const handle = (i: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    const v = checkOptionIndex(item, i);
    setChosen(i);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  const answered = chosen !== null || timedOut;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Barra de tiempo */}
      <div
        className="h-2.5 w-full max-w-lg overflow-hidden rounded-full bg-muted"
        role="timer"
        aria-label={`Tiempo restante: ${Math.max(0, timeLeft)} segundos`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-1000 ease-linear",
            timeLeft > 4 ? "bg-primary" : timeLeft > 2 ? "bg-amber-500" : "bg-destructive",
          )}
          style={{ width: `${(Math.max(0, timeLeft) / TIME_LIMIT_S) * 100}%` }}
        />
      </div>
      <p className="numeric text-xs font-bold text-muted-foreground" aria-hidden>
        {Math.max(0, timeLeft)}s
      </p>

      {/* La palabra */}
      <div className="paper-texture w-full max-w-lg rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.prompt}</p>
        <p className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{item.word}</p>
      </div>

      {timedOut && (
        <p className="text-sm font-semibold text-destructive" role="status">
          ¡Se acabó el tiempo! La definición correcta era «{item.options[item.answerIndex]}».
        </p>
      )}

      {/* Definiciones */}
      <div className="grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
        {item.options.map((opt, i) => (
          <OptionButton
            key={`${item.id}-${i}`}
            index={i + 1}
            label={<span className="text-sm leading-snug sm:text-base">{opt}</span>}
            state={
              answered
                ? i === item.answerIndex
                  ? "correct"
                  : i === chosen
                    ? "wrong"
                    : "idle"
                : "idle"
            }
            onClick={() => handle(i)}
            disabled={disabled || answered}
          />
        ))}
      </div>
    </div>
  );
}
