"use client";

/**
 * Motor Etapa 3 · «Conecta»: unir columnas por pares.
 * Izquierda fija, derecha barajada; acierto = pareja bloqueada con
 * color; fallo = sacudida amable. Cooperativo, con conteo de fallos.
 */

import { useRef, useState } from "react";
import type { ConectaExercise } from "@/types";
import { checkConecta } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { createRng, shuffle } from "@/engine/rng";
import { useGameProps } from "../props";
import { Link2 } from "lucide-react";

export function ConectaGame(props: useGameProps<ConectaExercise>) {
  const { item, onAnswer, disabled } = props;
  const answeredRef = useRef(false);

  // Columna derecha barajada de forma determinista.
  // useState perezoso: sin leer refs durante el render.
  const [rightOrder] = useState(() =>
    shuffle(
      item.pairs.map((_, i) => i),
      createRng(`conecta-${item.id}`),
    ),
  );

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [connected, setConnected] = useState<Set<number>>(new Set()); // índices de pares conectados
  const [wrongRight, setWrongRight] = useState<number | null>(null); // posición derecha
  const [mistakes, setMistakes] = useState(0);

  const tryFinish = (newConnected: Set<number>) => {
    if (newConnected.size >= item.pairs.length && !answeredRef.current) {
      answeredRef.current = true;
      sfx.coin(true);
      const r = checkConecta(item, mistakes);
      onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
    }
  };

  const clickRight = (position: number) => {
    if (disabled || answeredRef.current) return;
    const pairIndex = rightOrder[position];
    if (connected.has(pairIndex)) return;
    if (selectedLeft === null) {
      sfx.tap();
      return;
    }
    if (selectedLeft === pairIndex) {
      // ¡Acierto!
      sfx.correct(1);
      const next = new Set([...connected, pairIndex]);
      setConnected(next);
      setSelectedLeft(null);
      tryFinish(next);
    } else {
      // Fallo amable.
      sfx.wrong(true);
      setMistakes((m) => m + 1);
      setWrongRight(position);
      setTimeout(() => setWrongRight(null), 700);
    }
  };

  const done = connected.size >= item.pairs.length;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full max-w-2xl items-center justify-between px-1">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Link2 className="h-4 w-4" aria-hidden /> {item.prompt}
        </p>
        <p className="numeric text-xs font-bold text-muted-foreground" aria-live="off">
          {connected.size}/{item.pairs.length} · {mistakes} fallos
        </p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:gap-5">
        {/* Columna izquierda */}
        <ul className="space-y-2.5">
          {item.pairs.map((p, i) => {
            const isConnected = connected.has(i);
            const isSelected = selectedLeft === i;
            return (
              <li key={`${item.id}-L${i}`}>
                <button
                  type="button"
                  disabled={disabled || isConnected || done}
                  onClick={() => {
                    if (selectedLeft === i) {
                      setSelectedLeft(null);
                    } else {
                      sfx.tap();
                      setSelectedLeft(i);
                    }
                  }}
                  aria-label={`Izquierda: ${p.left}${isConnected ? " (conectada)" : ""}`}
                  aria-pressed={isSelected}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className={cn(
                    "anim-pop-3d tap-target flex min-h-16 w-full items-center gap-2 rounded-2xl border-2 px-3.5 py-2.5 text-left font-semibold leading-snug transition-all duration-150",
                    isConnected
                      ? "gloss matched-glow border-success bg-success/15 text-success"
                      : isSelected
                        ? "border-primary bg-primary/10 shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)]"
                        : "border-border bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-0.5 hover:border-primary/50 active:translate-y-1",
                    !isConnected && !isSelected && selectedLeft !== null && "opacity-70",
                  )}
                >
                  {isConnected && (
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full bg-success"
                      style={{ boxShadow: "0 0 8px color-mix(in oklch, var(--success) 60%, transparent)" }}
                      aria-hidden
                    />
                  )}
                  <span className="min-w-0 flex-1">{p.left}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Columna derecha (barajada) */}
        <ul className="space-y-2.5">
          {rightOrder.map((pairIndex, position) => {
            const isConnected = connected.has(pairIndex);
            const isWrong = wrongRight === position;
            return (
              <li key={`${item.id}-R${position}`}>
                <button
                  type="button"
                  disabled={disabled || isConnected || done}
                  onClick={() => clickRight(position)}
                  aria-label={`Derecha: ${item.pairs[pairIndex].right}${isConnected ? " (conectada)" : ""}`}
                  style={{ animationDelay: `${120 + position * 60}ms` }}
                  className={cn(
                    "anim-pop-3d tap-target flex min-h-16 w-full items-center rounded-2xl border-2 px-3.5 py-2.5 text-left font-semibold leading-snug transition-all duration-150",
                    isConnected
                      ? "gloss border-success bg-success/15 text-success"
                      : isWrong
                        ? "anim-shake border-destructive bg-destructive/10 text-destructive"
                        : selectedLeft !== null
                          ? "border-primary/50 bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary)_40%,#000_20%)] hover:-translate-y-0.5"
                          : "border-border bg-card opacity-70 shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                    done && !isConnected && "opacity-50",
                  )}
                >
                  <span className="min-w-0 flex-1">{item.pairs[pairIndex].right}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selectedLeft === null && !done && (
        <p className="text-xs font-semibold text-muted-foreground" role="status">
          Toca un elemento de la izquierda para empezar el puente.
        </p>
      )}
    </div>
  );
}
