"use client";

/**
 * Tarjetas Rasca-Rasca (Bosque) · Etapa 2 completa
 * ----------------------------------------------------------------
 * La palabra duerme bajo una capa de celdas doradas: se raya con el
 * dedo (o el ratón) y, al 55 % rascado, la tarjeta se abre del todo
 * y nace la pregunta de definición. Accesible: «Rascar» revela
 * con un toque y las flechas responden por teclado.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RascaExercise } from "@/types";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { createRng, shuffle } from "@/engine/rng";
import { useGameProps } from "../props";
import { OptionButton } from "../common";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Celdas del rascado (12 × 4 = 48 celdas). */
const COLS = 12;
const ROWS = 4;
const REVEAL_AT = 0.55;

export function RascaGame(props: useGameProps<RascaExercise>) {
  const { item, onAnswer, disabled } = props;
  const [scratched, setScratched] = useState<Set<number>>(() => new Set());
  const [revealed, setRevealed] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const answeredRef = useRef(false);
  const countRef = useRef(0);

  // Opciones barajadas de forma estable (la correcta cambia de sitio).
  const [options] = useState(() => {
    const indexed = item.options.map((label, i) => ({ label, correct: i === item.answerIndex }));
    return shuffle(indexed, createRng(`rasca-${item.id}`));
  });

  const total = COLS * ROWS;
  const progress = useMemo(() => scratched.size / total, [scratched, total]);

  const scratchCell = useCallback((clientX: number, clientY: number) => {
    const card = cardRef.current;
    if (!card || revealed) return;
    const rect = card.getBoundingClientRect();
    const col = Math.floor(((clientX - rect.left) / rect.width) * COLS);
    const row = Math.floor(((clientY - rect.top) / rect.height) * ROWS);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
    if (!scratched.has(row * COLS + col)) {
      const next = new Set(scratched);
      next.add(row * COLS + col);
      // Un poco de ruido de dibujo: una celda vecina se suelta sola.
      const drift = Math.random() < 0.5 ? 1 : -1;
      const ncol = col + drift;
      if (ncol >= 0 && ncol < COLS) next.add(row * COLS + ncol);
      countRef.current = next.size;
      setScratched(next);
      // Al llegar al umbral, la tarjeta se abre entera con un golpe seco.
      if (countRef.current / total >= REVEAL_AT) {
        setRevealed(true);
        sfx.flip();
      }
    }
  }, [revealed, scratched, total]);

  // Arrastre continuo con puntero (dedo o ratón).
  const drawing = useRef(false);
  useEffect(() => {
    const move = (e: PointerEvent) => drawing.current && scratchCell(e.clientX, e.clientY);
    const up = () => (drawing.current = false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [scratchCell]);

  // Teclado: la tarjeta también se rasca con «R» o Intro.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!revealed && (e.key === "r" || e.key === "R" || e.key === "Enter")) setRevealed(true);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [revealed]);

  const answer = (i: number) => {
    if (disabled || answeredRef.current || !revealed) return;
    answeredRef.current = true;
    const opt = options[i];
    setChosen(i);
    sfx.tap();
    onAnswer({
      correct: opt.correct,
      userAnswer: opt.label,
      correctAnswer: item.options[item.answerIndex],
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* La tarjeta rascable */}
      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-label={revealed ? `La palabra oculta era ${item.word}` : "Tarjeta rascable: arrastra el dedo para rascarla"}
        onPointerDown={(e) => {
          drawing.current = true;
          scratchCell(e.clientX, e.clientY);
        }}
        onKeyDown={(e) => e.key === "Enter" && !revealed && setRevealed(true)}
        className="paper-texture relative h-44 w-full max-w-xl cursor-pointer touch-none select-none overflow-hidden rounded-3xl border-2 border-border shadow-[0_6px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]"
      >
        {/* Palabra oculta */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{item.prompt}</p>
          <p className="text-center font-display text-3xl font-black leading-tight sm:text-4xl">{item.word}</p>
          <p className="text-xs font-semibold text-muted-foreground">
            {revealed ? "Ahora elige su definición" : "Rasca para ver la palabra"}
          </p>
        </div>
        {/* Capa de rascar */}
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }} aria-hidden>
          {Array.from({ length: total }, (_, i) => {
            const gone = revealed || scratched.has(i);
            return (
              <div
                key={i}
                className={cn(
                  "transition-opacity duration-200",
                  gone ? "pointer-events-none opacity-0" : "opacity-100",
                )}
                style={{
                  /* Mezclas al 100 % (opacas): si las porcentajes de
                     color-mix no suman 100 %, el resultado es translúcido
                     y la palabra se adivina por detrás. */
                  background:
                    (i * 7 + 3) % 3 === 0
                      ? "color-mix(in oklch, var(--primary) 34%, #000)"
                      : "color-mix(in oklch, var(--primary) 20%, #000)",
                  boxShadow: gone ? "none" : "inset 0 0 0 1px rgba(0,0,0,0.06)",
                }}
              />
            );
          })}
        </div>
        {/* Brillo de la capa mientras se rasca */}
        {!revealed && (
          <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center" aria-hidden>
            <p className="rounded-full bg-foreground/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
              Rasca con el dedo · {Math.min(100, Math.round(progress * 100))}%
            </p>
          </div>
        )}
      </div>

      {/* Accesibilidad: rascar con un toque */}
      {!revealed && (
        <Button
          variant="outline"
          className="font-bold"
          onClick={() => { sfx.deal(); setRevealed(true); }}
          disabled={disabled}
        >
          <Sparkles className="mr-2 h-4 w-4" aria-hidden /> Rascar de un toque
        </Button>
      )}

      {/* Definiciones: solo se responden con la palabra a la vista */}
      {revealed && (
        <div className="flex w-full max-w-xl flex-col gap-2.5">
          {options.map((opt, i) => {
            const state = chosen === null ? "idle" : opt.correct ? "correct" : chosen === i ? "wrong" : "idle";
            return (
              <OptionButton
                key={`${item.id}-opt-${i}`}
                index={i + 1}
                label={<span className="text-sm leading-snug sm:text-base">{opt.label}</span>}
                state={state}
                onClick={() => answer(i)}
                disabled={disabled || chosen !== null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
