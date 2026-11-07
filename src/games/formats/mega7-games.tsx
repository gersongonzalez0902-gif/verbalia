"use client";

/**
 * Mega-7 · Motores de los 45 minijuegos nuevos (hasta 100 juegos).
 * ----------------------------------------------------------------
 * Ocho mecánicas distintas compartidas por los nuevos formatos:
 * - EligeGame: contexto + opciones (30 juegos de 4 regiones).
 * - OrdenaGame: ordenar tocando en secuencia (grados, sílabas, abecedario).
 * - ClasificaGame: clasificar en 3 cubos (acentos, entonación).
 * - EscribeLibreGame: teclear la palabra (definiciones, derivadas).
 * - MultiGame: marcar TODAS las correctas (familias, mayúsculas).
 * - GrafiaGame: duelo de grafías (b/v, g/j, h, y/ll, c/s/z).
 * - OyeAcentoGame: escuchar y marcar la sílaba tónica.
 * - OyeNumeroGame: escuchar cifras y elegir la correcta.
 */

import { useEffect, useRef, useState } from "react";
import type {
  ClasificaExercise,
  EligeExercise,
  EscribeLibreExercise,
  GrafiaExercise,
  MultiExercise,
  OyeAcentoExercise,
  OyeNumeroExercise,
  OrdenaExercise,
} from "@/types";
import { checkOptionIndex, checkEscribe } from "@/engine/validation";
import { sfx, speak, ttsAvailable } from "@/services/audio";
import { cn } from "@/lib/utils";
import { createRng, shuffle } from "@/engine/rng";
import { useGameProps } from "../props";
import { Check, Eraser, ListOrdered, Play, Volume2, X } from "lucide-react";

/* ============================ Estilos compartidos ============================ */

const OPT_BASE =
  "anim-pop-3d tap-target flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3.5 font-semibold leading-snug transition-all duration-150 text-left";
const OPT_IDLE =
  "border-border bg-card shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] hover:-translate-y-1 hover:border-primary/60 active:translate-y-1 active:shadow-[0_1px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]";
const OPT_CORRECT = "gloss border-success bg-success/15 text-success shadow-[0_4px_0_0_color-mix(in_oklch,var(--success)_52%,#000_26%)]";
const OPT_WRONG = "anim-shake border-destructive bg-destructive/10 text-destructive shadow-[0_4px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]";

function optionClass(state: "idle" | "correct" | "wrong", disabled: boolean) {
  return cn(
    OPT_BASE,
    state === "idle" && OPT_IDLE,
    state === "correct" && OPT_CORRECT,
    state === "wrong" && OPT_WRONG,
    disabled && state === "idle" && "pointer-events-none opacity-60",
  );
}

function PromptCard({ prompt, cefr, children }: { prompt: string; cefr: string; children?: React.ReactNode }) {
  return (
    <div className="paper-texture anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-5 text-center shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {prompt} · {cefr}
      </p>
      {children}
    </div>
  );
}

/* ============================ 1 · Elige (30 juegos) ============================ */

export function EligeGame(props: useGameProps<EligeExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const answeredRef = useRef(false);

  // Baraja determinista de las opciones (para que la correcta baile).
  const [order] = useState(() => shuffle(item.options.map((_, i) => i), createRng(`el-${item.id}`)));
  const correctPos = order.indexOf(item.answerIndex);
  const isLong = item.options.some((o) => o.length > 26);

  const handle = (position: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const r = checkOptionIndex(item, order[position]);
    setChosen(position);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <PromptCard prompt={item.prompt} cefr={item.cefr}>
        {item.context && (
          <p className={cn("mt-3 leading-relaxed", isLong ? "text-base" : "text-lg")}>
            {item.context.includes("«___»")
              ? item.context.split("«___»").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="mx-1 rounded-lg bg-primary/15 px-2 font-black text-primary">___</span>}
                  </span>
                ))
              : item.context}
          </p>
        )}
        <p className="mt-1.5 text-sm font-bold text-primary">{item.question}</p>
      </PromptCard>

      <div className={cn("grid w-full max-w-xl gap-2.5", item.options.length <= 2 ? "grid-cols-2" : isLong ? "grid-cols-1" : "grid-cols-2")}>
        {order.map((originalIndex, position) => {
          const state = answered ? (originalIndex === item.answerIndex ? "correct" : chosen === position ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-${position}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(position)}
              style={{ animationDelay: `${position * 70}ms` }}
              className={cn(optionClass(state, disabled), "min-h-16 justify-center text-center", item.options.length <= 2 && "font-display text-lg")}
            >
              {item.options[originalIndex]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ 2 · Ordena (3 juegos) ============================ */

export function OrdenaGame(props: useGameProps<OrdenaExercise>) {
  const { item, onAnswer, disabled } = props;
  const answeredRef = useRef(false);
  const [picked, setPicked] = useState<number[]>([]);

  // Baraja determinista de los ítems.
  const [order] = useState(() => shuffle(item.items.map((_, i) => i), createRng(`or-${item.id}`)));
  const [correctOrder] = useState(() => item.items.map((_, i) => i));

  const remaining = order.filter((originalIndex) => !picked.includes(originalIndex));

  const tap = (originalIndex: number) => {
    if (disabled || answeredRef.current) return;
    sfx.tap();
    const next = [...picked, originalIndex];
    setPicked(next);
    // ¿Ya está completo?
    if (next.length === item.items.length) {
      const correct = next.every((v, i) => v === correctOrder[i]);
      answeredRef.current = true;
      onAnswer({
        correct,
        userAnswer: next.map((i) => item.items[i]).join(" → "),
        correctAnswer: item.items.join(" → "),
      });
    }
  };

  const undoLast = () => {
    if (disabled || answeredRef.current) return;
    sfx.back();
    setPicked((p) => p.slice(0, -1));
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <PromptCard prompt={item.prompt} cefr={item.cefr}>
        <p className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-primary">
          <ListOrdered className="h-4 w-4" aria-hidden /> {item.criteria}
        </p>
        {/* Secuencia construida */}
        <div className="mt-3 flex min-h-14 flex-wrap items-center justify-center gap-2 rounded-2xl bg-secondary/70 px-3 py-2.5">
          {picked.length === 0 && <span className="text-xs font-semibold text-muted-foreground">Toca los elementos en orden…</span>}
          {picked.map((originalIndex, i) => (
            <span
              key={i}
              className="anim-pop-3d flex items-center gap-1.5 rounded-xl border bg-card px-3 py-1.5 font-bold shadow-sm"
            >
              <span className="numeric text-[10px] text-muted-foreground">{i + 1}</span>
              {item.items[originalIndex]}
            </span>
          ))}
        </div>
      </PromptCard>

      {/* Fichas por ordenar */}
      <div className="flex w-full max-w-xl flex-wrap justify-center gap-2.5">
        {remaining.map((originalIndex, i) => (
          <button
            key={`${item.id}-rem-${originalIndex}`}
            type="button"
            disabled={disabled}
            onClick={() => tap(originalIndex)}
            style={{ animationDelay: `${i * 70}ms` }}
            className={cn(optionClass("idle", disabled), "anim-pop-3d min-h-14 text-base")}
          >
            {item.items[originalIndex]}
          </button>
        ))}
      </div>

      {picked.length > 0 && !answeredRef.current && (
        <button onClick={undoLast} className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground">
          <Eraser className="h-3.5 w-3.5" aria-hidden /> Deshacer último
        </button>
      )}
    </div>
  );
}

/* ============================ 3 · Clasifica (2 juegos) ============================ */

export function ClasificaGame(props: useGameProps<ClasificaExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const answeredRef = useRef(false);

  const handle = (bucketIndex: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const correct = bucketIndex === item.answerIndex;
    setChosen(bucketIndex);
    onAnswer({
      correct,
      userAnswer: item.buckets[bucketIndex],
      correctAnswer: item.buckets[item.answerIndex],
    });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <PromptCard prompt={item.prompt} cefr={item.cefr}>
        <p className="font-display mt-3 text-3xl font-black leading-tight">{item.item}</p>
      </PromptCard>

      <div className="grid w-full max-w-xl grid-cols-3 gap-2.5">
        {item.buckets.map((bucket, i) => {
          const state = answered ? (i === item.answerIndex ? "correct" : chosen === i ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-${i}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(i)}
              style={{ animationDelay: `${i * 80}ms` }}
              className={cn(optionClass(state, disabled), "min-h-20 flex-col justify-center font-display text-base")}
            >
              {bucket}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ 4 · Escribe libre (2 juegos) ============================ */

export function EscribeLibreGame(props: useGameProps<EscribeLibreExercise>) {
  const { item, onAnswer, disabled } = props;
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<"pending" | "correct" | "wrong">("pending");
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (disabled || result !== "pending" || !typed.trim()) return;
    const r = checkEscribe(item, typed);
    setResult(r.correct ? "correct" : "wrong");
    onAnswer({ correct: r.correct, userAnswer: typed.trim(), correctAnswer: item.word });
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <PromptCard prompt={item.prompt} cefr={item.cefr}>
        <p className="mt-3 text-lg leading-relaxed">{item.clue}</p>
        {item.hint && showHint && (
          <p className="anim-slide-up mt-2 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">
            💡 {item.hint}
          </p>
        )}
      </PromptCard>

      <div
        className={cn(
          "flex w-full max-w-md items-center gap-2 rounded-2xl border-2 bg-card p-2 transition",
          result === "correct" && "border-success",
          result === "wrong" && "anim-shake border-destructive",
          result === "pending" && "border-border",
        )}
      >
        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          disabled={disabled || result !== "pending"}
          placeholder="Escribe aquí la palabra…"
          aria-label="Respuesta escrita"
          className="h-12 flex-1 bg-transparent px-3 text-lg font-semibold outline-none placeholder:text-muted-foreground/60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || result !== "pending" || !typed.trim()}
          className="tap-target flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-black text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)] transition active:translate-y-1 active:shadow-none disabled:opacity-50"
        >
          <Play className="h-4 w-4" aria-hidden /> Enviar
        </button>
      </div>

      {result === "pending" && item.hint && (
        <button onClick={() => { sfx.tap(); setShowHint((h) => !h); }} className="text-xs font-bold text-muted-foreground underline-offset-2 hover:underline">
          {showHint ? "Ocultar pista" : "Ver pista"}
        </button>
      )}
      {result === "wrong" && (
        <p className="anim-slide-up rounded-2xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground">
          La palabra era: <b>{item.word}</b>
        </p>
      )}
    </div>
  );
}

/* ============================ 5 · Multi (2 juegos) ============================ */

export function MultiGame(props: useGameProps<MultiExercise>) {
  const { item, onAnswer, disabled } = props;
  const [marked, setMarked] = useState<number[]>([]);
  const answeredRef = useRef(false);
  const [verdict, setVerdict] = useState<null | boolean>(null);

  const toggle = (i: number) => {
    if (disabled || answeredRef.current) return;
    sfx.tap();
    setMarked((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]));
  };

  const confirm = () => {
    if (disabled || answeredRef.current) return;
    const correct =
      marked.length === item.answerIndexes.length && item.answerIndexes.every((i) => marked.includes(i));
    answeredRef.current = true;
    setVerdict(correct);
    onAnswer({
      correct,
      userAnswer: marked.map((i) => item.options[i]).join(" + "),
      correctAnswer: item.answerIndexes.map((i) => item.options[i]).join(" + "),
    });
  };

  const done = verdict !== null;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <PromptCard prompt={item.prompt} cefr={item.cefr}>
        {item.statement && <p className="mt-3 text-lg font-bold leading-snug">{item.statement}</p>}
        <p className="mt-1.5 text-sm text-muted-foreground">Marca exactamente {item.answerIndexes.length} opciones.</p>
      </PromptCard>

      <div className="grid w-full max-w-xl grid-cols-2 gap-2.5">
        {item.options.map((opt, i) => {
          const isRight = item.answerIndexes.includes(i);
          const state = done ? (isRight ? "correct" : marked.includes(i) ? "wrong" : "idle") : marked.includes(i) ? "correct" : "idle";
          return (
            <button
              key={`${item.id}-${i}`}
              type="button"
              disabled={disabled || done}
              onClick={() => toggle(i)}
              style={{ animationDelay: `${i * 70}ms` }}
              className={cn(optionClass(state, disabled), "min-h-16 justify-center text-center")}
            >
              {done || marked.includes(i) ? (
                <span className="flex items-center gap-1.5">
                  {isRight ? <Check className="h-4 w-4" aria-hidden /> : marked.includes(i) ? <X className="h-4 w-4" aria-hidden /> : null}
                  {opt}
                </span>
              ) : (
                opt
              )}
            </button>
          );
        })}
      </div>

      {!done && (
        <button
          type="button"
          onClick={confirm}
          disabled={disabled || marked.length !== item.answerIndexes.length}
          className="tap-target rounded-2xl bg-primary px-6 py-3 font-black text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)] transition active:translate-y-1 active:shadow-none disabled:opacity-50"
        >
          Confirmar ({marked.length}/{item.answerIndexes.length})
        </button>
      )}
    </div>
  );
}

/* ============================ 6 · Duelo de grafías (5 juegos) ============================ */

export function GrafiaGame(props: useGameProps<GrafiaExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const answeredRef = useRef(false);

  const handle = (i: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const correct = i === item.answerIndex;
    setChosen(i);
    onAnswer({
      correct,
      userAnswer: item.options[i],
      correctAnswer: item.options[item.answerIndex],
    });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <PromptCard prompt={item.prompt} cefr={item.cefr}>
        <p className="mt-3 text-xl leading-relaxed">
          {item.sentence.split("«___»").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span
                  className={cn(
                    "mx-1.5 inline-block min-w-16 rounded-lg border-2 border-dashed px-2.5 py-0.5 font-black",
                    answered ? "border-solid border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  {answered ? item.word : "¿?"}
                </span>
              )}
            </span>
          ))}
        </p>
      </PromptCard>

      <div className="flex flex-wrap justify-center gap-3">
        {item.options.map((opt, i) => {
          const state = answered ? (i === item.answerIndex ? "correct" : chosen === i ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-${i}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(i)}
              style={{ animationDelay: `${i * 80}ms` }}
              className={cn(optionClass(state, disabled), "min-w-28 min-h-16 justify-center font-display text-xl")}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ 7 · Oye: sílaba tónica ============================ */

export function OyeAcentoGame(props: useGameProps<OyeAcentoExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const [ttsOk] = useState(() => ttsAvailable());
  const answeredRef = useRef(false);

  useEffect(() => {
    if (ttsOk) {
      const t = setTimeout(() => speak(item.word), 350);
      return () => clearTimeout(t);
    }
  }, [item.word, ttsOk]);

  const handle = (syllableIndex: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const correct = syllableIndex === item.answerSyllable;
    setChosen(syllableIndex);
    onAnswer({
      correct,
      userAnswer: item.syllables[syllableIndex],
      correctAnswer: item.syllables[item.answerSyllable],
    });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <button
        type="button"
        onClick={() => { sfx.click(); speak(item.word); }}
        disabled={disabled}
        aria-label="Escuchar la palabra otra vez"
        className="anim-pop-3d tap-target chip-icon flex h-24 w-24 items-center justify-center rounded-full border-2 shadow-[0_6px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)] transition-all duration-150 hover:-translate-y-1 active:translate-y-1"
      >
        <Volume2 className="h-11 w-11" aria-hidden />
      </button>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {ttsOk ? "Escucha y marca la sílaba fuerte" : "Sin voz: fíjate en las sílabas escritas"}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {item.syllables.map((syl, i) => {
          const state = answered ? (i === item.answerSyllable ? "correct" : chosen === i ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-${i}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(i)}
              style={{ animationDelay: `${i * 90}ms` }}
              className={cn(optionClass(state, disabled), "min-h-16 min-w-20 justify-center font-display text-2xl")}
            >
              {syl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ 8 · Oye: números ============================ */

export function OyeNumeroGame(props: useGameProps<OyeNumeroExercise>) {
  const { item, onAnswer, disabled } = props;
  const [chosen, setChosen] = useState<number | null>(null);
  const [ttsOk] = useState(() => ttsAvailable());
  const answeredRef = useRef(false);

  useEffect(() => {
    if (ttsOk) {
      const t = setTimeout(() => speak(item.speech), 350);
      return () => clearTimeout(t);
    }
  }, [item.speech, ttsOk]);

  const handle = (i: number) => {
    if (disabled || answeredRef.current) return;
    answeredRef.current = true;
    sfx.tap();
    const correct = i === item.answerIndex;
    setChosen(i);
    onAnswer({
      correct,
      userAnswer: item.options[i],
      correctAnswer: item.options[item.answerIndex],
    });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <button
        type="button"
        onClick={() => { sfx.click(); speak(item.speech); }}
        disabled={disabled}
        aria-label="Escuchar el número otra vez"
        className="anim-pop-3d tap-target chip-icon flex h-24 w-24 items-center justify-center rounded-full border-2 shadow-[0_6px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)] transition-all duration-150 hover:-translate-y-1 active:translate-y-1"
      >
        <Volume2 className="h-11 w-11" aria-hidden />
      </button>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {ttsOk ? "Escucha y elige lo que oíste" : "Sin voz disponible en este navegador"}
      </p>

      <div className="grid w-full max-w-md grid-cols-1 gap-2.5">
        {item.options.map((opt, i) => {
          const state = answered ? (i === item.answerIndex ? "correct" : chosen === i ? "wrong" : "idle") : "idle";
          return (
            <button
              key={`${item.id}-${i}`}
              type="button"
              disabled={disabled || answered}
              onClick={() => handle(i)}
              style={{ animationDelay: `${i * 80}ms` }}
              className={cn(optionClass(state, disabled), "numeric min-h-16 justify-center font-display text-xl")}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
