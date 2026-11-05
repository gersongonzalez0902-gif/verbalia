"use client";

/**
 * Trivia Relámpago · Clasificar la palabra destacada en 12 segundos.
 * El tiempo agotado cuenta como fallo con explicación (nunca castigo duro).
 * El estado se reinicia por ítem porque la partida remonta el componente
 * con una key nueva al avanzar.
 */

import { useEffect, useRef, useState } from "react";
import type { TriviaExercise } from "@/types";
import { checkTrivia } from "@/engine/validation";
import { GRAMMAR_CLASSES } from "@/data/games";
import { sfx, setClockActive, setTension } from "@/services/audio";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";
import { OptionButton } from "./common";

const TIME_LIMIT_S = 12;

export function TriviaSprint(props: useGameProps<TriviaExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_S);
  const [timedOut, setTimedOut] = useState(false);
  const answeredRef = useRef(false);

  // Ref estable del callback para no reiniciar la cuenta atrás
  // cuando GameScreen recrea el handler.
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  // El Gran Reloj en contratiempo: se enciende con el ítem y aprieta
  // la tensión conforme la arena se agota.
  useEffect(() => {
    setClockActive(true);
    setTension(0.12);
    return () => {
      setClockActive(false);
      setTension(0);
    };
  }, []);

  const parts = item.sentence.split(/(\*[^*]+\*)/g).filter(Boolean);

  // Cuenta atrás: solo actualiza estado desde el callback del temporizador.
  useEffect(() => {
    if (disabled || answeredRef.current || timeLeft <= 0) return;
    const t = setTimeout(() => {
      if (answeredRef.current) return;
      if (timeLeft === 1) {
        // Se acabó el tiempo: cuenta como fallo con explicación.
        answeredRef.current = true;
        setTimedOut(true);
        onAnswerRef.current({
          correct: false,
          userAnswer: "sin respuesta",
          correctAnswer: item.answer,
        });
      } else {
        // El reloj en contratiempo aprieta: cada segundo la tensión sube.
        setTension(0.12 + 0.88 * (1 - (timeLeft - 1) / TIME_LIMIT_S));
        if (timeLeft <= 4) sfx.tick(timeLeft <= 2);
        else sfx.tock();
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, disabled, item.answer]);

  const handle = (id: string) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const v = checkTrivia(item, id);
    setChosen(id);
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
            timeLeft > 5 ? "bg-primary" : timeLeft > 2 ? "bg-amber-500" : "bg-destructive",
          )}
          style={{ width: `${(Math.max(0, timeLeft) / TIME_LIMIT_S) * 100}%` }}
        />
      </div>
      <p className="numeric text-xs font-bold text-muted-foreground" aria-hidden>
        {Math.max(0, timeLeft)}s
      </p>

      {/* Frase con la palabra destacada */}
      <div className="paper-texture w-full max-w-lg rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
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

      {timedOut && (
        <p className="text-sm font-semibold text-destructive" role="status">
          ¡Se acabó el tiempo! La palabra era «{item.sentence.match(/\*([^*]+)\*/)?.[1]}».
        </p>
      )}

      {/* Categorías gramaticales */}
      <div className="grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
        {GRAMMAR_CLASSES.map((c, i) => (
          <OptionButton
            key={c.id}
            index={i + 1}
            label={
              <span className="flex flex-col">
                <span className="font-display text-base">{c.label}</span>
                <span className="text-xs font-normal text-muted-foreground">{c.example}</span>
              </span>
            }
            state={
              answered && chosen === c.id
                ? chosen === item.answer
                  ? "correct"
                  : "wrong"
                : answered && c.id === item.answer
                  ? "correct"
                  : "idle"
            }
            onClick={() => handle(c.id)}
            disabled={disabled || answered}
          />
        ))}
      </div>
    </div>
  );
}
