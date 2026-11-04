"use client";

/**
 * Puentes de Palabras (puzzle sintáctico) · Ordenar fragmentos tocando.
 * Alternativa completa al arrastre: funciona con dedo, ratón y teclado.
 */

import { useMemo, useState } from "react";
import type { PuzzleExercise } from "@/types";
import { checkPuzzle } from "@/engine/validation";
import { createRng, shuffle } from "@/engine/rng";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";

export function SyntaxPuzzle(props: useGameProps<PuzzleExercise>) {
  const { item, onAnswer, disabled } = props;

  // Baraja índices únicos (robusto incluso con fragmentos repetidos).
  const shuffled = useMemo(() => {
    let s = shuffle(item.chunks.map((_, i) => i), createRng(item.id));
    if (s.every((v, i) => v === i)) s = s.reverse();
    return s;
  }, [item.id, item.chunks]);

  const [placed, setPlaced] = useState<number[]>([]); // índices originales

  const remaining = useMemo(
    () => shuffled.filter((oi) => !placed.includes(oi)),
    [shuffled, placed],
  );

  const place = (oi: number) => {
    if (disabled || placed.includes(oi)) return;
    setPlaced((p) => [...p, oi]);
  };

  const remove = (oi: number) => {
    if (disabled) return;
    setPlaced((p) => p.filter((x) => x !== oi));
  };

  const confirm = () => {
    if (placed.length !== item.chunks.length) return;
    const v = checkPuzzle(item, placed);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="max-w-lg text-center text-sm text-muted-foreground">{item.prompt}</p>

      {/* Zona de construcción */}
      <div
        className="min-h-20 w-full max-w-lg rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-3"
        aria-label="Orden en construcción"
      >
        {placed.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">
            Toca los fragmentos en el orden correcto…
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {placed.map((oi) => (
              <button
                key={oi}
                type="button"
                disabled={disabled}
                onClick={() => remove(oi)}
                className="anim-pop tap-target rounded-xl border-2 border-primary bg-card px-3 py-2 font-semibold shadow-sm transition hover:border-destructive/60 hover:line-through"
                aria-label={`Quitar «${item.chunks[oi]}»`}
              >
                {item.chunks[oi]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Depósito de fragmentos */}
      <div className="flex w-full max-w-lg flex-wrap items-center justify-center gap-2" role="group" aria-label="Fragmentos disponibles">
        {remaining.map((oi) => (
          <button
            key={oi}
            type="button"
            disabled={disabled}
            onClick={() => place(oi)}
            className="anim-pop tap-target rounded-xl border-2 border-border bg-card px-3.5 py-2.5 font-semibold shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-md active:translate-y-0"
          >
            {item.chunks[oi]}
          </button>
        ))}
      </div>

      <Button
        size="lg"
        className={cn("w-full max-w-lg font-bold shadow-md", placed.length === item.chunks.length && "anim-glow")}
        disabled={disabled || placed.length !== item.chunks.length}
        onClick={confirm}
      >
        Comprobar oración
      </Button>
    </div>
  );
}
