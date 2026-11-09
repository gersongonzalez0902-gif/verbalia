"use client";

/**
 * Jeroglíficos Modernos (Biblioteca) · Etapa 2 completa
 * ----------------------------------------------------------------
 * Un mensaje tal como llega por chat — emojis, cifras homófonas y
 * abreviaturas — presentado en una burbuja de conversación.
 * Descifrarlo es leer la lengua viva de hoy.
 */

import { useRef, useState } from "react";
import type { JeroglificosExercise } from "@/types";
import { sfx } from "@/services/audio";
import { useGameProps } from "../props";
import { OptionButton } from "../common";
import { MessageSquareText } from "lucide-react";

export function JeroglificosGame(props: useGameProps<JeroglificosExercise>) {
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
      {/* Remitente del mensaje */}
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <MessageSquareText className="h-4 w-4" aria-hidden /> Mensaje recibido · {item.cefr}
      </p>

      {/* Burbuja de chat con el jeroglífico */}
      <div className="w-full max-w-2xl">
        <div className="flex justify-start">
          <div
            className="card-aurora anim-pop-3d max-w-[85%] rounded-3xl rounded-bl-md border-2 border-primary/40 bg-card px-6 py-5 shadow-[0_5px_0_0_color-mix(in_oklch,var(--primary)_45%,#000_26%)]"
            aria-label={`Mensaje cifrado: ${item.cipher}`}
          >
            <p className="text-2xl font-black leading-relaxed tracking-wide sm:text-3xl">{item.cipher}</p>
          </div>
        </div>
        <p className="mt-1.5 pl-3 text-[11px] font-semibold text-muted-foreground">
          «Leído a las 00:0{item.difficulty}» · ¿qué dice de verdad?
        </p>
      </div>

      {/* Traducciones candidatas */}
      <div className="flex w-full max-w-2xl flex-col gap-2.5">
        {item.options.map((opt, i) => {
          const state = chosen === null ? "idle" : i === item.answerIndex ? "correct" : chosen === i ? "wrong" : "idle";
          return (
            <OptionButton
              key={`${item.id}-opt-${i}`}
              index={i + 1}
              label={<span className="text-sm leading-snug sm:text-base">{opt}</span>}
              state={state}
              onClick={() => answer(i)}
              disabled={disabled || chosen !== null}
            />
          );
        })}
      </div>
    </div>
  );
}
