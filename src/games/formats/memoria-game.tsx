"use client";

/**
 * Motor Etapa 3 · «Memoria de pares»: tablero de tarjetas volteables.
 * Volteo físico 3D, emparejamiento por parejas y conteo de intentos.
 * Cooperativo: se resuelve siempre; el mérito está en los intentos.
 */

import { useRef, useState } from "react";
import type { MemoriaExercise } from "@/types";
import { checkMemoria } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { createRng, shuffle } from "@/engine/rng";
import { useGameProps } from "../props";

interface Card {
  key: string;
  text: string;
  pairId: number;
  isWord: boolean;
}

export function MemoriaGame(props: useGameProps<MemoriaExercise>) {
  const { item, onAnswer, disabled } = props;
  const answeredRef = useRef(false);

  // Mazo determinista: izquierda (palabra) y derecha (pareja) barajadas juntas.
  const deck = useRef<Card[]>(
    shuffle(
      item.pairs.flatMap((p, pairId) => [
        { key: `L${pairId}`, text: p.left, pairId, isWord: true },
        { key: `R${pairId}`, text: p.right, pairId, isWord: false },
      ]),
      createRng(`memoria-${item.id}`),
    ),
  );
  const totalPairs = item.pairs.length;

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [wrongPair, setWrongPair] = useState<number[]>([]);
  const lockRef = useRef(false);

  const tryFinish = (newMatched: Set<number>, newAttempts: number) => {
    if (newMatched.size >= totalPairs && !answeredRef.current) {
      answeredRef.current = true;
      sfx.coin(true);
      const r = checkMemoria(item, newAttempts);
      onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
    }
  };

  const flip = (index: number) => {
    if (disabled || lockRef.current) return;
    if (matched.has(index) || flipped.includes(index)) return;
    sfx.flip();

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [a, b] = nextFlipped;
      setAttempts((n) => n + 1);
      const newAttempts = attempts + 1;
      if (deck.current[a].pairId === deck.current[b].pairId) {
        // ¡Pareja!
        lockRef.current = true;
        setTimeout(() => {
          const nextMatched = new Set([...matched, a, b]);
          setMatched(nextMatched);
          setFlipped([]);
          lockRef.current = false;
          sfx.correct(1);
          tryFinish(nextMatched, newAttempts);
        }, 420);
      } else {
        // Fallo: se voltean de nuevo.
        lockRef.current = true;
        setWrongPair([a, b]);
        sfx.wrong(true);
        setTimeout(() => {
          setFlipped([]);
          setWrongPair([]);
          lockRef.current = false;
        }, 820);
      }
    }
  };

  const solved = matched.size >= totalPairs * 2;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full max-w-2xl items-center justify-between px-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {item.prompt}
        </p>
        <p className="numeric text-xs font-bold text-muted-foreground" aria-live="off">
          {matched.size / 2}/{totalPairs} pares · {attempts} intentos
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-4 gap-2.5 sm:gap-3">
        {deck.current.map((card, i) => {
          const isUp = flipped.includes(i) || matched.has(i);
          const isWrong = wrongPair.includes(i);
          const isMatched = matched.has(i);
          return (
            <button
              key={`${item.id}-${card.key}`}
              type="button"
              onClick={() => flip(i)}
              disabled={disabled || solved}
              aria-label={
                isUp
                  ? `Tarjeta: ${card.text}${isMatched ? " (emparejada)" : ""}`
                  : "Tarjeta boca abajo"
              }
              style={{ animationDelay: `${(i % 8) * 45}ms` }}
              className={cn(
                "flip-scene anim-pop-3d aspect-[3/4] w-full transition-transform duration-150",
                !isUp && !solved && "hover:-translate-y-1 active:translate-y-1",
                isMatched && "matched-glow",
              )}
            >
              <div className={cn("flip-card", isUp && "is-flipped")}>
                {/* Reverso (patrón) */}
                <div className="flip-face card-back-pattern border-2 border-primary/40 shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary)_45%,#000_30%)]">
                  <span className="font-display text-2xl font-black text-white/85 select-none" aria-hidden>
                    ✦
                  </span>
                </div>
                {/* Cara (contenido) */}
                <div
                  className={cn(
                    "flip-face flip-face-back border-2 px-1.5 text-center shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                    isMatched
                      ? "border-success bg-success/15"
                      : isWrong
                        ? "anim-shake border-destructive bg-destructive/10"
                        : "border-primary/50 bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "line-clamp-4 leading-tight",
                      card.isWord
                        ? "font-display text-sm font-bold sm:text-base"
                        : "text-[11px] sm:text-xs",
                      isMatched ? "text-success" : "text-foreground",
                    )}
                  >
                    {card.text}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
