"use client";

/**
 * Tinder de Sinónimos (Bosque) · Etapa 2 completa
 * ----------------------------------------------------------------
 * La tarjeta B se desliza sobre la fija A: a la derecha si la pareja
 * es intercambiable, a la izquierda si es una trampa. El gesto es
 * físico (arrastra y suelta) y también hay botones y flechas: el
 * gesto rápido nunca es requisito para jugar bien.
 */

import { useEffect, useRef, useState } from "react";
import type { TinderExercise } from "@/types";
import { checkTinder } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { useGameProps } from "../props";
import { Button } from "@/components/ui/button";
import { Heart, HeartCrack, HeartHandshake } from "lucide-react";

/** Desplazamiento (px) que confirma la decisión al soltar. */
const SWIPE_THRESHOLD = 96;

export function TinderGame(props: useGameProps<TinderExercise>) {
  const { item, onAnswer, disabled } = props;
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const startRef = useRef<number | null>(null);
  const answeredRef = useRef(false);

  const decide = (saidYes: boolean) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    const r = checkTinder(item, saidYes);
    setChosen(saidYes);
    setDx(saidYes ? 420 : -420);
    sfx.slide();
    if (saidYes === item.isSynonym) sfx.correct(1);
    else sfx.wrong(true);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  // Teclado: flecha derecha = sí, flecha izquierda = no.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") decide(true);
      if (e.key === "ArrowLeft") decide(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [disabled, item]);

  const onDown = (clientX: number) => {
    if (disabled || answeredRef.current) return;
    startRef.current = clientX;
    setDragging(true);
  };
  const onMove = (clientX: number) => {
    if (startRef.current === null) return;
    setDx(clientX - startRef.current);
  };
  const onUp = () => {
    if (startRef.current === null) return;
    startRef.current = null;
    setDragging(false);
    if (dx >= SWIPE_THRESHOLD) decide(true);
    else if (dx <= -SWIPE_THRESHOLD) decide(false);
    else setDx(0);
  };

  // Tinte romántico o de alerta según el lado al que se estira.
  const tilt = Math.max(-9, Math.min(9, dx / 14));
  const yesMood = dx > 24;
  const noMood = dx < -24;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Consigna */}
      <p className="text-center text-sm font-bold text-muted-foreground">
        ¿Se pueden cambiar la corbata en casi cualquier frase?
      </p>

      {/* Tablero de la pareja */}
      <div className="relative flex w-full max-w-md select-none items-center justify-center">
        {/* Palabra A: fija, con pedestal */}
        <div className="paper-texture anim-pop-3d absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fija</p>
          <p className="font-display text-lg font-black sm:text-xl">{item.wordA}</p>
        </div>

        {/* Tarjeta B deslizante */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`¿${item.wordB} es intercambiable con ${item.wordA}? Arrastra a la derecha para sí, a la izquierda para no`}
          onPointerDown={(e) => onDown(e.clientX)}
          onPointerMove={(e) => onMove(e.clientX)}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") decide(true);
            if (e.key === "ArrowLeft") decide(false);
          }}
          style={{
            transform: `translateX(${dx}px) rotate(${tilt}deg)`,
            transition: dragging ? "none" : "transform 260ms cubic-bezier(.2,.9,.3,1.2)",
          }}
          className="card-aurora relative z-20 ml-auto mr-2 w-44 cursor-grab touch-none rounded-3xl border-2 border-primary/50 bg-card p-4 text-center shadow-[0_8px_0_0_color-mix(in_oklch,var(--primary)_45%,#000_28%)] active:cursor-grabbing sm:w-52"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">¿Equivalente?</p>
          <p className="mt-1 font-display text-xl font-black sm:text-2xl">{item.wordB}</p>
          <div
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black transition-colors",
              yesMood ? "bg-success text-success-foreground" : noMood ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground",
            )}
            aria-hidden
          >
            {yesMood ? <Heart className="h-3.5 w-3.5" /> : noMood ? <HeartCrack className="h-3.5 w-3.5" /> : <HeartHandshake className="h-3.5 w-3.5" />}
            {yesMood ? "Sí, equivalen" : noMood ? "No, trampa" : "Desliza"}
          </div>
        </div>
      </div>

      {/* Botones de decisión (gesto nunca obligatorio) */}
      {chosen === null && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="min-w-32 border-destructive/50 font-bold text-destructive"
            onClick={() => decide(false)}
            disabled={disabled}
            aria-label="No son intercambiables: deslizar a la izquierda"
          >
            <HeartCrack className="mr-2 h-5 w-5" aria-hidden /> No
          </Button>
          <Button
            size="lg"
            className="min-w-32 font-bold"
            onClick={() => decide(true)}
            disabled={disabled}
            aria-label="Sí son intercambiables: deslizar a la derecha"
          >
            <Heart className="mr-2 h-5 w-5" aria-hidden /> Sí
          </Button>
        </div>
      )}
      <p className="text-[11px] font-semibold text-muted-foreground">
        Arrastra la tarjeta, usa las flechas del teclado o los botones: todas valen igual.
      </p>
    </div>
  );
}
