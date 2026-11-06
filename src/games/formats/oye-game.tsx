"use client";

/**
 * Motor Etapa 3 · «Oye»: escucha (TTS) y elige la escritura correcta.
 * Repite la escucha cuantas veces haga falta: aquí manda el oído.
 */

import { useEffect, useRef, useState } from "react";
import type { OyeExercise } from "@/types";
import { checkOye } from "@/engine/validation";
import { speak, ttsAvailable, sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { createRng, shuffle } from "@/engine/rng";
import { useGameProps } from "../props";
import { Volume2 } from "lucide-react";

export function OyeGame(props: useGameProps<OyeExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<string | null>(null);
  const [ttsOk] = useState(() => ttsAvailable());
  const answeredRef = useRef(false);

  // Baraja estable: la correcta y las trampas, sin Math.random.
  // useState perezoso: sin leer refs durante el render.
  const [options] = useState(() =>
    shuffle([item.word, ...item.wrongs], createRng(`oye-${item.id}`)),
  );

  // Primera escucha al montar (si el navegador puede hablar).
  useEffect(() => {
    if (ttsOk) {
      const t = setTimeout(() => speak(item.word), 350);
      return () => clearTimeout(t);
    }
  }, [item.word, ttsOk]);

  const handle = (opt: string) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const r = checkOye(item, opt);
    setChosen(opt);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  const answered = chosen !== null;
  const isPhrase = item.word.split(" ").length > 1;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Altavoz protagonista */}
      <button
        type="button"
        onClick={() => { sfx.click(); speak(item.word); }}
        disabled={disabled}
        aria-label={`Escuchar de nuevo${ttsOk ? "" : " (tu navegador no ofrece voz: lee las opciones)"}`}
        className="anim-pop-3d tap-target chip-icon group flex h-24 w-24 items-center justify-center rounded-full border-2 shadow-[0_6px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)] transition-all duration-150 hover:-translate-y-1 active:translate-y-1 active:shadow-[0_2px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)]"
      >
        <Volume2 className="h-11 w-11 transition group-hover:scale-110" aria-hidden />
      </button>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {ttsOk
          ? "Toca el altavoz para repetir la escucha"
          : "Sin voz disponible: fíjate en las opciones"}
      </p>

      {/* Opciones de escritura */}
      <div className={cn("grid w-full max-w-xl gap-2.5", isPhrase ? "grid-cols-1" : "grid-cols-2")}>
        {options.map((opt, i) => {
          const isRight = opt === item.word;
          const state = answered ? (isRight ? "correct" : chosen === opt ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-opt-${i}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(opt)}
              style={{ animationDelay: `${i * 70}ms` }}
              className={cn(
                "anim-pop-3d tap-target flex min-h-16 items-center justify-center rounded-2xl border-2 px-4 py-3.5 font-semibold leading-snug transition-all duration-150",
                isPhrase ? "text-center text-base" : "font-display text-xl",
                state === "idle" &&
                  "border-border bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-0.5 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                state === "correct" && "gloss anim-pop border-success bg-success/15 text-success shadow-[0_4px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
                state === "wrong" && "anim-shake border-destructive bg-destructive/10 text-destructive shadow-[0_4px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]",
                disabled && state === "idle" && "pointer-events-none opacity-60",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
