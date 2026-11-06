"use client";

/**
 * Motor Etapa 3 · «Escribe la palabra»: pista + escritura con ayuda.
 * Muestra el hueco de letras en vivo, pista opcional y validación
 * con el motor (estricta en Fortaleza, tolerante con tildes fuera).
 */

import { useRef, useState } from "react";
import type { EscribeExercise } from "@/types";
import { checkEscribe } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { useGameProps } from "../props";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, Send } from "lucide-react";

export function EscribeGame(props: useGameProps<EscribeExercise>) {
  const { item, onAnswer, disabled } = props;
  const [typed, setTyped] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const answeredRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (disabled || answeredRef.current || !typed.trim()) return;
    answeredRef.current = true;
    sfx.tap();
    const r = checkEscribe(item, typed);
    if (r.correct) sfx.correct(1);
    else sfx.wrong(true);
    setRevealed(true);
    onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  };

  // Máscara de letras: huecos hasta responder.
  const mask = revealed
    ? item.word
    : item.word
        .split("")
        .map((c) => (c === " " ? "·" : "_"))
        .join("");

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Pista */}
      <div className="paper-texture anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-6 text-center shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {item.prompt} · {item.cefr}
        </p>
        <p className="mt-2.5 text-lg leading-relaxed sm:text-xl">{item.clue}</p>
      </div>

      {/* La palabra oculta (número de letras) */}
      <div className="flex items-center gap-2" aria-label={`${item.word.length} caracteres`}>
        {mask.split("").map((c, i) => (
          <span
            key={i}
            className={cn(
              "numeric flex h-9 w-7 items-center justify-center rounded-lg border-2 font-display text-lg font-bold",
              revealed
                ? c === "_"
                  ? "border-border bg-muted text-muted-foreground"
                  : i < typed.length
                    ? "border-success bg-success/15 text-success"
                    : "border-primary/60 bg-primary/10 text-primary"
                : "border-dashed border-border bg-muted/60 text-muted-foreground",
            )}
            aria-hidden
          >
            {c === "·" ? " " : c === "_" ? "" : c.toUpperCase()}
          </span>
        ))}
      </div>

      {/* Entrada */}
      {!revealed ? (
        <div className="anim-slide-up flex w-full max-w-xl items-center gap-2.5">
          <Input
            ref={inputRef}
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            disabled={disabled}
            placeholder="Escribe aquí…"
            aria-label="Escribe la palabra"
            maxLength={40}
            className="h-12 rounded-2xl text-base font-semibold"
          />
          <Button size="lg" onClick={submit} disabled={disabled || !typed.trim()} className="font-bold" aria-label="Comprobar">
            <Send className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      ) : (
        <p className="anim-pop text-lg font-bold">
          {typed.trim().toLowerCase() === item.word.toLowerCase() ? (
            <span className="text-success">¡{item.word}!</span>
          ) : (
            <span className="text-destructive">Era «{item.word}»</span>
          )}
        </p>
      )}

      {/* Pista */}
      {!revealed && item.hint && (
        <div className="flex w-full max-w-xl items-center justify-between gap-3">
          {showHint ? (
            <p className="anim-pop w-full rounded-2xl bg-secondary px-4 py-2.5 text-center text-sm font-bold text-secondary-foreground">
              Pista: {item.hint}
            </p>
          ) : (
            <Button
              variant="outline"
              className="mx-auto font-bold"
              onClick={() => { sfx.flip(); setShowHint(true); }}
              disabled={disabled}
            >
              <Lightbulb className="mr-2 h-4 w-4" aria-hidden />
              Pedir pista
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
