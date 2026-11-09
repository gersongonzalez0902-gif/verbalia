"use client";

/**
 * Laboratorio de Fonética Visual (Puerto) · Etapa 2 completa
 * ----------------------------------------------------------------
 * Dos cartas de sonido con ondas animadas: una palabra sonará y hay
 * que decir cuál. El laboratorio dibuja la forma del contraste y,
 * al corregir, explica el truco de boca que las separa. Sin TTS, la
 * ficha de «forma del sonido» se muestra para seguir jugando.
 */

import { useEffect, useRef, useState } from "react";
import type { FoneticaExercise } from "@/types";
import { checkFonetica } from "@/engine/validation";
import { speak, ttsAvailable, sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { useGameProps } from "../props";
import { Button } from "@/components/ui/button";
import { Ear, Play, Waves } from "lucide-react";

export function FoneticaGame(props: useGameProps<FoneticaExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const [ttsOk] = useState(() => ttsAvailable());
  const [plays, setPlays] = useState(0);
  const answeredRef = useRef(false);

  // La primera escucha llega sola (si el navegador puede hablar).
  useEffect(() => {
    if (!ttsOk || !item.pair[item.answerIndex]) return;
    const t = setTimeout(() => {
      speak(item.pair[item.answerIndex]);
      setPlays((p) => p + 1);
    }, 450);
    return () => clearTimeout(t);
  }, [item.id, ttsOk]);

  const replay = () => {
    if (!ttsOk || answeredRef.current) return;
    sfx.click();
    speak(item.pair[item.answerIndex]);
    setPlays((p) => p + 1);
  };

  const answer = (i: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    const r = checkFonetica(item, i);
    setChosen(i);
    sfx.tap();
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Altavoz del laboratorio */}
      <Button
        variant="outline"
        size="lg"
        className="h-20 w-20 rounded-full font-bold"
        onClick={replay}
        disabled={disabled || !ttsOk}
        aria-label={ttsOk ? "Repetir la escucha" : "Este navegador no ofrece voz"}
      >
        <Ear className="h-9 w-9" aria-hidden />
      </Button>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {ttsOk
          ? plays <= 1
            ? "Sonó una sola palabra… ¿cuál de las dos?"
            : `Escuchas: ${plays} · elige con calma`
          : "Sin voz en este navegador: juega con la forma del sonido"}
      </p>

      {/* Las dos cartas de sonido */}
      <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
        {item.pair.map((word, i) => {
          const state = chosen === null ? "idle" : i === item.answerIndex ? "correct" : chosen === i ? "wrong" : "idle";
          return (
            <button
              key={`${item.id}-card-${i}`}
              type="button"
              onClick={() => answer(i)}
              disabled={disabled || chosen !== null}
              style={{ animationDelay: `${i * 90}ms` }}
              aria-label={ttsOk ? `¿Sonó «${word}»?` : `Elegir «${word}» según la forma descrita`}
              className={cn(
                "anim-pop-3d tap-target group flex flex-col items-center gap-3 rounded-3xl border-2 bg-card px-4 py-5 transition-[transform,box-shadow,border-color,background-color] duration-150",
                state === "idle" &&
                  "border-border shadow-[0_5px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-1 hover:border-primary/60 active:translate-y-1 active:shadow-[0_2px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                state === "correct" && "gloss anim-pop border-success bg-success/10 shadow-[0_5px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
                state === "wrong" && "anim-shake border-destructive bg-destructive/10 shadow-[0_5px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]",
                disabled && state === "idle" && "pointer-events-none opacity-60",
              )}
            >
              {/* La palabra */}
              <span className="font-display text-2xl font-black sm:text-3xl">{word}</span>
              {/* Onda visual del sonido */}
              <span className="flex h-10 items-end gap-1" aria-hidden>
                {[0.4, 0.9, 0.55, 1, 0.7, 0.35, 0.85].map((h, j) => (
                  <span
                    key={j}
                    className={cn(
                      "h-full w-1.5 origin-bottom rounded-full transition-colors",
                      state === "correct" ? "bg-success/80" : state === "wrong" ? "bg-destructive/80" : "bg-primary/70",
                    )}
                    style={{
                      height: `${h * 100}%`,
                      animation: `sound-bar ${0.9 + (j % 3) * 0.22}s ease-in-out ${(i * 0.13 + j * 0.06).toFixed(2)}s infinite alternate`,
                    }}
                  />
                ))}
              </span>
              {/* Etiqueta de carta */}
              <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                <Waves className="h-3.5 w-3.5" aria-hidden /> {i === 0 ? "Carta A" : "Carta B"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sin TTS: la ficha de forma del sonido guía la elección */}
      {!ttsOk && (
        <p className="max-w-xl rounded-2xl bg-secondary px-4 py-2.5 text-center text-sm font-bold text-secondary-foreground">
          Forma del sonido: {item.shape}
        </p>
      )}
      {ttsOk && (
        <p className="text-[11px] font-semibold text-muted-foreground">
          Puedes repetir la escucha con el altavoz: manda el oído, no la prisa.
        </p>
      )}
    </div>
  );
}
