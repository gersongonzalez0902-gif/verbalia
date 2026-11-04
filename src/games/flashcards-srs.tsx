"use client";

/**
 * Jardín de Tarjetas (SRS) · Mostrar palabra → valorarse con sinceridad.
 * La calificación alimenta el motor de repetición espaciada en el acto.
 * Botón opcional de lectura en voz alta según disponibilidad del navegador.
 */

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { SrsWord } from "@/types";
import { speak, ttsAvailable } from "@/services/audio";
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

  const difficultyColor = useMemo(
    () => ({
      1: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
      2: "bg-lime-100 text-lime-800 dark:bg-lime-900/50 dark:text-lime-300",
      3: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
      4: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
      5: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
    })[word.difficulty],
    [word.difficulty],
  );

  const handleGrade = (grade: Grade) => {
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
      {/* Tarjeta */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-3xl border-2 border-primary/25 bg-card p-6 text-center shadow-lg transition-shadow",
          revealed && "shadow-xl",
        )}
      >
        <div className="flex items-center justify-between gap-2" aria-hidden>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", difficultyColor)}>
            {word.cefr}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{word.pos}</span>
        </div>

        <p className="font-display mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{word.word}</p>

        {ttsOk && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-muted-foreground"
            onClick={() => speak(word.word)}
            aria-label={`Escuchar la palabra ${word.word} (síntesis de voz del navegador)`}
          >
            <Volume2 className="mr-1.5 h-4 w-4" aria-hidden />
            Escuchar
          </Button>
        )}

        {revealed ? (
          <div className="anim-pop mt-5 space-y-3 border-t pt-5">
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
        ) : (
          <div className="mt-5 flex flex-col items-center gap-2 text-muted-foreground">
            <VolumeX className="h-5 w-5 opacity-40" aria-hidden />
            <p className="text-sm">Piensa en su significado y compruébalo.</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      {!revealed ? (
        <Button size="lg" className="w-full max-w-lg font-bold shadow-md" onClick={() => setRevealed(true)}>
          Mostrar significado
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
