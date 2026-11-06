"use client";

/**
 * Jardín de Tarjetas (SRS) · Tarjeta volteable 3D (Etapa 3).
 * Toca la tarjeta y se voltea sola para revelar el significado:
 * sin botones intermedios, con física de papel. La calificación
 * alimenta el motor de repetición espaciada en el acto.
 */

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { SrsWord } from "@/types";
import { speak, ttsAvailable, sfx } from "@/services/audio";
import { useGameStore } from "@/store/game-store";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";

type Grade = "again" | "hard" | "good" | "easy";

const GRADE_BUTTONS: { grade: Grade; label: string; hint: string; className: string }[] = [
  { grade: "again", label: "No la sabía", hint: "La verás enseguida", className: "bg-destructive text-destructive-foreground hover:bg-destructive/90" },
  { grade: "hard", label: "Casi", hint: "Con esfuerzo", className: "bg-amber-600 text-white hover:bg-amber-600/90" },
  { grade: "good", label: "Bien", hint: "La recordaba", className: "bg-primary text-primary-foreground hover:bg-primary/90" },
  { grade: "easy", label: "Fácil", hint: "Dominio total", className: "bg-[var(--xp)] text-[var(--xp-foreground)] hover:bg-[var(--xp)]/90" },
];

export function FlashcardsSrs(props: useGameProps<SrsWord>) {
  const { item: word, onAnswer, disabled } = props;
  const [revealed, setRevealed] = useState(false);
  const [ttsOk] = useState(() => ttsAvailable());
  const rateCard = useGameStore((s) => s.rateCard);
  const cardRef = useRef<HTMLDivElement>(null);

  const difficultyColor = useMemo(
    () => ({
      1: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
      2: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300",
      3: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
      4: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
      5: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
    })[word.difficulty],
    [word.difficulty],
  );

  const flipCard = () => {
    if (disabled || revealed) return;
    sfx.flip();
    setRevealed(true);
  };

  const handleGrade = (grade: Grade) => {
    // La voz del recuerdo: cada juicio suena distinto.
    if (grade === "again") sfx.wrong(true);
    else if (grade === "easy") sfx.coin();
    else sfx.tap();
    rateCard(word.id, grade);
    onAnswer({
      correct: grade === "again" ? false : null,
      grade,
      userAnswer: grade,
      correctAnswer: word.word,
    });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Tarjeta volteable */}
      <div
        ref={cardRef}
        className="flip-scene flip-scene-tall w-full max-w-lg cursor-pointer select-none focus:outline-none"
        onClick={flipCard}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flipCard();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={
          revealed
            ? `Significado de ${word.word}`
            : `Tarjeta de ${word.word}: toca para voltearla y ver su significado`
        }
        aria-pressed={revealed}
      >
        <div className={cn("flip-card w-full", revealed && "is-flipped")}>
          {/* ===== Cara anterior: la palabra ===== */}
          <div className="flip-face flex-col rounded-3xl border-2 border-primary/30 bg-card px-6 py-6 text-center shadow-lg">
            <div className="flex w-full items-center justify-between gap-2" aria-hidden>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", difficultyColor)}>
                {word.cefr}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{word.pos}</span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <p className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{word.word}</p>
              {ttsOk && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(word.word);
                  }}
                  aria-label={`Escuchar la palabra ${word.word} (síntesis de voz del navegador)`}
                >
                  <Volume2 className="mr-1.5 h-4 w-4" aria-hidden />
                  Escuchar
                </Button>
              )}
            </div>

            {!revealed && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground" aria-hidden>
                <VolumeX className="h-3.5 w-3.5 opacity-50" />
                Toca la tarjeta para voltearla
                <VolumeX className="h-3.5 w-3.5 opacity-50" />
              </p>
            )}
          </div>

          {/* ===== Cara posterior: el significado ===== */}
          <div className="flip-face flip-face-back flex-col rounded-3xl border-2 border-primary/45 bg-card px-6 py-6 text-center shadow-xl">
            <div className="flex w-full items-center justify-between gap-2" aria-hidden>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", difficultyColor)}>
                {word.cefr}
              </span>
              <span className="font-display text-sm font-bold text-primary/80">{word.word}</span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 overflow-y-auto">
              <p className="text-base leading-relaxed sm:text-lg">{word.definition}</p>
              <p className="rounded-2xl bg-secondary px-4 py-3 text-sm italic leading-relaxed text-secondary-foreground">
                «{word.example}»
              </p>
              {word.tags.length > 0 && (
                <p className="flex flex-wrap items-center justify-center gap-1.5">
                  {word.tags.map((t) => (
                    <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      {!revealed ? (
        <Button size="lg" className="w-full max-w-lg font-bold shadow-md" onClick={flipCard}>
          Voltear tarjeta
        </Button>
      ) : (
        <div className="anim-slide-up w-full max-w-lg">
          <p className="mb-2 text-center text-sm font-semibold text-muted-foreground">
            ¿Qué tan bien la recordabas?
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {GRADE_BUTTONS.map((b) => (
              <Button
                key={b.grade}
                size="lg"
                disabled={disabled}
                onClick={() => handleGrade(b.grade)}
                className={cn("flex h-auto flex-col gap-0.5 py-3 font-bold shadow-sm", b.className)}
              >
                <span>{b.label}</span>
                <span className="text-[10px] font-medium opacity-80">{b.hint}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
