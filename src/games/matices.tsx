"use client";

/**
 * Ecos del Puerto (Puerto) · Identificar el tono o la intención.
 * Con voz: solo audio (texto oculto). Sin voz: texto visible
 * claramente etiquetado (la pista pragmática sigue siendo real).
 */

import { useState } from "react";
import type { MaticesExercise } from "@/types";
import { checkOptionIndex } from "@/engine/validation";
import { speak, ttsAvailable } from "@/services/audio";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";
import { OptionButton } from "./common";

const MAX_PLAYS = 3;

export function EcosPuerto(props: useGameProps<MaticesExercise>) {
  const { item, onAnswer, disabled } = props;
  const [ttsOk] = useState(() => ttsAvailable());
  const [plays, setPlays] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [textShown, setTextShown] = useState(false);

  const play = () => {
    if (disabled || plays >= MAX_PLAYS || chosen !== null) return;
    setPlays((p) => p + 1);
    if (ttsOk) speak(item.sentence);
  };

  const handle = (i: number) => {
    if (disabled || chosen !== null) return;
    const v = checkOptionIndex(item, i);
    setChosen(i);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5">
      <p className="text-center text-sm text-muted-foreground">{item.prompt}</p>

      {/* Eco */}
      <div className="paper-texture w-full rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            className="font-bold shadow-md"
            onClick={play}
            disabled={disabled || plays >= MAX_PLAYS || answered}
            aria-label={ttsOk ? `Escuchar el eco (quedan ${MAX_PLAYS - plays} escuchas)` : "Escuchar el eco"}
          >
            {ttsOk ? <Volume2 className="mr-2 h-5 w-5" aria-hidden /> : <VolumeX className="mr-2 h-5 w-5" aria-hidden />}
            {ttsOk ? (plays === 0 ? "Escuchar" : `Repetir (${plays}/${MAX_PLAYS})`) : "Voz no disponible"}
          </Button>

          <span className="flex items-end gap-1" aria-hidden>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={cn("w-1.5 rounded-full bg-primary/70", plays > 0 && !answered && "anim-sound-bar")}
                style={{ height: `${10 + ((i * 9) % 22)}px`, animationDelay: `${i * 0.13}s` }}
              />
            ))}
          </span>

          {/* Texto: visible si no hay voz, si se pidió leer o si ya se respondió */}
          {(textShown || !ttsOk || answered) && (
            <p
              className="anim-pop mt-1 rounded-2xl bg-secondary px-4 py-3 text-center text-lg font-semibold italic leading-relaxed text-secondary-foreground"
              aria-live="polite"
            >
              «{item.sentence}»
            </p>
          )}

          {ttsOk && !answered && !textShown && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTextShown(true)}
              disabled={disabled}
              className="text-muted-foreground"
            >
              <Eye className="mr-1.5 h-4 w-4" aria-hidden />
              Prefiero leerla
            </Button>
          )}
          {!ttsOk && (
            <p className="text-center text-xs text-muted-foreground">
              Tu navegador no ofrece voz: el tono se lee en las palabras y los signos.
            </p>
          )}
        </div>
      </div>

      {/* Intenciones */}
      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {item.options.map((opt, i) => (
          <OptionButton
            key={`${item.id}-${i}`}
            index={i + 1}
            label={<span className="font-display text-base">{opt}</span>}
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
