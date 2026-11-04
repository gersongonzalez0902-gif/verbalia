"use client";

/**
 * Lectura Inmersiva (Biblioteca) · Texto con lectura sincronizada:
 * cada frase se ilumina mientras la lee la voz del navegador.
 * Sin voz: lectura visual tranquila con resaltado manual.
 * Al terminar, pregunta de comprensión.
 */

import { useEffect, useRef, useState } from "react";
import type { LecturaExercise } from "@/types";
import { checkOptionIndex } from "@/engine/validation";
import { speak, ttsAvailable, sfx } from "@/services/audio";
import { Button } from "@/components/ui/button";
import { Play, Square, BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";
import { OptionButton } from "./common";

export function LecturaInmersiva(props: useGameProps<LecturaExercise>) {
  const { item, onAnswer, disabled } = props;
  const [ttsOk] = useState(() => ttsAvailable());
  const [line, setLine] = useState(-1); // -1: sin empezar
  const [reading, setReading] = useState(false);
  const [phase, setPhase] = useState<"lectura" | "pregunta">("lectura");
  const [chosen, setChosen] = useState<number | null>(null);
  const cancelled = useRef(false);

  // Limpieza al desmontar (nunca dejar una voz hablando).
  useEffect(() => {
    return () => {
      cancelled.current = true;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const readFrom = (start: number) => {
    if (!ttsOk) {
      setLine(start);
      setReading(true);
      return;
    }
    cancelled.current = false;
    setReading(true);
    setLine(start);

    const readNext = (i: number) => {
      if (cancelled.current) return;
      if (i >= item.lines.length) {
        setReading(false);
        return;
      }
      setLine(i);
      const ok = speak(item.lines[i]);
      if (!ok) {
        // Sin voz a mitad de camino: sigue en modo visual.
        setReading(false);
        return;
      }
      // La voz del navegador no siempre avisa al terminar: estima
      // una duración prudente (palabras × ritmo) y encadena.
      const words = item.lines[i].split(" ").length;
      const ms = Math.max(1800, words * 380) + 350;
      setTimeout(() => readNext(i + 1), ms);
    };
    readNext(start);
  };

  const stop = () => {
    cancelled.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setReading(false);
  };

  const toQuestion = () => {
    stop();
    setPhase("pregunta");
    sfx.click();
  };

  const handle = (i: number) => {
    if (disabled || chosen !== null) return;
    const v = checkOptionIndex(item, i);
    setChosen(i);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      <div className="flex items-center gap-2 self-start text-primary">
        <BookOpenText className="h-5 w-5" aria-hidden />
        <p className="font-display text-lg font-bold">{item.title}</p>
      </div>

      {/* Texto con resaltado por frase */}
      <div className="paper-texture w-full rounded-3xl border-2 border-border bg-card p-6 shadow-sm" aria-label="Texto de lectura">
        <div className="space-y-3">
          {item.lines.map((l, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled || phase === "pregunta"}
              onClick={() => readFrom(i)}
              aria-label={`Leer desde la frase ${i + 1}`}
              className={cn(
                "block w-full rounded-xl px-2.5 py-1.5 text-left text-base leading-relaxed transition-colors duration-300 sm:text-lg",
                line === i
                  ? "bg-primary/15 font-semibold text-foreground"
                  : "text-foreground/80 hover:bg-primary/5",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {phase === "lectura" ? (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {reading ? (
            <Button variant="outline" size="lg" className="font-bold" onClick={stop} disabled={disabled}>
              <Square className="mr-2 h-4 w-4" aria-hidden />
              Pausar
            </Button>
          ) : (
            <Button size="lg" className="font-bold shadow-md" onClick={() => readFrom(0)} disabled={disabled}>
              <Play className="mr-2 h-5 w-5" aria-hidden />
              {line >= 0 ? "Seguir leyendo" : ttsOk ? "Leer en voz alta" : "Empezar lectura"}
            </Button>
          )}
          <Button size="lg" variant="secondary" className="font-bold" onClick={toQuestion} disabled={disabled}>
            Responder la pregunta
          </Button>
        </div>
      ) : (
        <div className="anim-slide-up flex w-full flex-col items-center gap-4">
          <p className="text-center font-display text-lg font-bold">{item.question}</p>
          <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
            {item.options.map((opt, i) => (
              <OptionButton
                key={`${item.id}-q-${i}`}
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
      )}
    </div>
  );
}
