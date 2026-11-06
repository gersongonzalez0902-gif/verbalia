"use client";

/**
 * Motores Etapa 4 · «Forja del Escritor».
 * Cinco formatos de estilo y retórica: metáforas, registro, conectores,
 * ironía y censura de redundancias. Fuego, yunque y mucho cuidado con
 * cada palabra.
 */

import { useRef, useState } from "react";
import type {
  ConectoresExercise,
  IroniaExercise,
  MetaforasExercise,
  RegistroExercise,
  TitulosExercise,
} from "@/types";
import { checkCensura, checkForjaOption, checkIronia } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { createRng, shuffle } from "@/engine/rng";
import { useGameProps } from "../props";
import {
  CircleHelp,
  Eraser,
  FlameKindling,
  Link2,
  MessagesSquare,
  Quote,
  Smile,
} from "lucide-react";

/* ==================== Forja de Metáforas ==================== */

export function MetaforasGame(props: useGameProps<MetaforasExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const answeredRef = useRef(false);
  const [order] = useState(() => shuffle(item.options.map((_, i) => i), createRng(item.id)));

  const handle = (position: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const r = checkForjaOption(item, order[position]);
    setChosen(position);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  const answered = chosen !== null;
  const [before, after] = item.stem.split("___");

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="paper-texture anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
        <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <FlameKindling className="h-4 w-4 text-primary" aria-hidden /> {item.prompt}
        </p>
        <p className="mt-3 text-lg leading-relaxed sm:text-xl">
          {before}
          <span className="mx-1 rounded-lg border-b-4 border-primary/70 px-2 font-display font-bold text-primary">
            ¿imagen?
          </span>
          {after}
        </p>
      </div>

      <div className="grid w-full max-w-xl gap-3">
        {order.map((originalIndex, position) => {
          const isRight = originalIndex === item.answerIndex;
          const state = answered ? (isRight ? "correct" : chosen === position ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-${position}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(position)}
              style={{ animationDelay: `${position * 70}ms` }}
              className={cn(
                "anim-pop-3d tap-target rounded-2xl border-2 px-4 py-3.5 text-left font-display text-base font-bold leading-snug transition-all duration-150 sm:text-lg",
                state === "idle" &&
                  "border-border bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-1 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                state === "correct" && "gloss anim-pop border-success bg-success/15 text-success shadow-[0_4px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
                state === "wrong" && "anim-shake border-destructive bg-destructive/10 text-destructive shadow-[0_4px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]",
                disabled && state === "idle" && "pointer-events-none opacity-60",
              )}
            >
              {item.options[originalIndex]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==================== Registro Correcto ==================== */

const REGISTER_STYLES: Record<string, { label: string; chip: string }> = {
  formal: { label: "Registro formal", chip: "border-primary/40 bg-primary/10 text-primary" },
  coloquial: { label: "Registro coloquial", chip: "border-secondary/50 bg-secondary text-secondary-foreground" },
  neutro: { label: "Registro neutro", chip: "border-border bg-muted text-foreground" },
};

export function RegistroGame(props: useGameProps<RegistroExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const answeredRef = useRef(false);

  const handle = (index: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const r = checkForjaOption(item, index);
    setChosen(index);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  const answered = chosen !== null;
  const reg = REGISTER_STYLES[item.register] ?? REGISTER_STYLES.neutro;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-5 shadow-sm">
        <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <MessagesSquare className="h-4 w-4" aria-hidden /> {item.prompt}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", reg.chip)}>{reg.label}</span>
        </div>
        <p className="mt-3 text-center text-sm font-semibold leading-relaxed sm:text-base">
          {item.context}
        </p>
      </div>

      <div className="grid w-full max-w-xl gap-3">
        {item.options.map((opt, index) => {
          const isRight = index === item.answerIndex;
          const state = answered ? (isRight ? "correct" : chosen === index ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-${index}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(index)}
              style={{ animationDelay: `${index * 70}ms` }}
              className={cn(
                "anim-pop-3d tap-target rounded-2xl rounded-br-md border-2 px-4 py-3.5 text-left text-sm leading-snug transition-all duration-150 sm:text-base",
                state === "idle" &&
                  "border-border bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-1 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                state === "correct" && "gloss anim-pop border-success bg-success/15 text-success shadow-[0_4px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
                state === "wrong" && "anim-shake border-destructive bg-destructive/10 text-destructive shadow-[0_4px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]",
                disabled && state === "idle" && "pointer-events-none opacity-60",
              )}
            >
              «{opt}»
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==================== Taller de Conectores ==================== */

export function ConectoresGame(props: useGameProps<ConectoresExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const answeredRef = useRef(false);

  const handle = (index: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const r = checkForjaOption(item, index);
    setChosen(index);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  const answered = chosen !== null;
  const [before, after] = item.sentence.split("___");

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="paper-texture anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
        <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Link2 className="h-4 w-4" aria-hidden /> {item.prompt}
        </p>
        <p className="mt-3 text-lg leading-relaxed sm:text-xl">
          {before}
          <span className="mx-1 rounded-lg border-b-4 border-primary/70 px-2 font-display font-bold text-primary">
            ¿conector?
          </span>
          {after}
        </p>
      </div>

      <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        {item.options.map((opt, index) => {
          const isRight = index === item.answerIndex;
          const state = answered ? (isRight ? "correct" : chosen === index ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-${index}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(index)}
              aria-label={`Conector: ${opt}`}
              aria-pressed={chosen === index}
              style={{ animationDelay: `${index * 80}ms` }}
              className={cn(
                "anim-pop-3d tap-target flex min-h-20 items-center justify-center rounded-3xl border-2 px-3 py-3 font-display text-base font-bold leading-tight transition-all duration-150 sm:text-lg",
                state === "idle" &&
                  "border-border bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-1 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                state === "correct" && "gloss border-success bg-success/15 text-success shadow-[0_4px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
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

/* ==================== Detector de Ironía ==================== */

export function IroniaGame(props: useGameProps<IroniaExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<"literal" | "ironico" | null>(null);
  const answeredRef = useRef(false);

  const handle = (v: "literal" | "ironico") => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const r = checkIronia(item, v);
    setChosen(v);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-5 text-center shadow-sm">
        <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Smile className="h-4 w-4" aria-hidden /> {item.prompt}
        </p>
        <p className="mt-3 font-display text-xl font-bold leading-relaxed sm:text-2xl">
          «{item.statement}»
        </p>
        <p className="anim-slide-up mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Quote className="h-3 w-3" aria-hidden /> {item.context}
        </p>
      </div>

      <div className="grid w-full max-w-xl grid-cols-2 gap-3">
        {(["literal", "ironico"] as const).map((v, i) => {
          const isRight = v === item.answer;
          const state = answered ? (isRight ? "correct" : chosen === v ? "wrong" : "idle") : "idle";
          return (
            <button
              key={v}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(v)}
              aria-label={v === "ironico" ? "Con ironía" : "Sentido literal"}
              aria-pressed={chosen === v}
              style={{ animationDelay: `${i * 80}ms` }}
              className={cn(
                "anim-pop-3d tap-target flex h-24 flex-col items-center justify-center gap-1 rounded-3xl border-2 font-display text-base font-bold transition-all duration-150 sm:text-lg",
                state === "idle" &&
                  "border-border bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-1 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
                state === "correct" && "gloss border-success bg-success/15 text-success shadow-[0_4px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]",
                state === "wrong" && "anim-shake border-destructive bg-destructive/10 text-destructive shadow-[0_4px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]",
                disabled && state === "idle" && "pointer-events-none opacity-60",
              )}
            >
              {v === "ironico" ? "Dicho con ironía" : "Sentido literal"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==================== Censura del Editor ==================== */

export function CensuraGame(props: useGameProps<TitulosExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | "limpio" | null>(null);
  const answeredRef = useRef(false);

  const handle = (index: number | "limpio") => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const r = checkCensura(item, index);
    setChosen(index);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="paper-texture anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
        <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Eraser className="h-4 w-4" aria-hidden /> {item.prompt}
        </p>
        <p className="mt-4 flex flex-wrap items-baseline justify-center gap-x-1.5 gap-y-2 text-lg leading-relaxed sm:text-xl">
          {item.tokens.map((tok, i) => {
            const isRight = i === item.answerIndex;
            const state = answered ? (isRight ? "correct" : chosen === i ? "wrong" : "idle") : "idle";
            return (
              <button
                key={`${item.id}-tk-${i}`}
                type="button"
                disabled={disabled || answered}
                onClick={() => handle(i)}
                aria-label={`Palabra: ${tok}`}
                aria-pressed={chosen === i}
                className={cn(
                  "tap-target rounded-xl border-2 px-2.5 py-1 transition-all duration-150",
                  state === "idle" && "border-transparent hover:border-primary/60 hover:bg-primary/5 active:scale-95",
                  state === "correct" && "anim-pop border-destructive bg-destructive/15 text-destructive line-through",
                  state === "wrong" && "anim-shake border-primary/70 bg-primary/10",
                  disabled && state === "idle" && "pointer-events-none opacity-70",
                )}
              >
                {tok}
              </button>
            );
          })}
        </p>
        {answered && typeof chosen === "number" && chosen === item.answerIndex && (
          <p className="anim-slide-up mt-2 text-xs font-bold text-success">
            El editor tacha: la idea ya estaba dicha.
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={disabled || answered}
        onClick={() => handle("limpio")}
        aria-label="Sin censura: el texto está limpio"
        aria-pressed={chosen === "limpio"}
        className={cn(
          "anim-pop-3d tap-target flex h-24 w-full max-w-xl flex-col items-center justify-center gap-1.5 rounded-3xl border-2 font-display text-base font-bold transition-all duration-150",
          chosen === "limpio"
            ? "gloss border-success bg-success/15 text-success shadow-[0_4px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]"
            : "border-border bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-1 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <CircleHelp className="h-8 w-8" aria-hidden />
        Sin censura: el texto está limpio
      </button>
    </div>
  );
}
