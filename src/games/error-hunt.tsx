"use client";

/**
 * Caza de Errores · Paso 1: señalar la palabra sospechosa (o declarar
 * la frase limpia). Paso 2: elegir la corrección correcta.
 */

import { useState } from "react";
import type { ErrorHuntExercise } from "@/types";
import { checkErrorHunt } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";
import { OptionButton } from "./common";

type Step = "find" | "fix";

export function ErrorHunt(props: useGameProps<ErrorHuntExercise>) {
  const { item, onAnswer, disabled } = props;
  const [step, setStep] = useState<Step>("find");
  const [token, setToken] = useState<number | null>(null);
  const [declared, setDeclared] = useState<"none" | null>(null);
  const [fixChosen, setFixChosen] = useState<number | null>(null);

  const finish = (tokenIndex: number | "none", correction: number | null) => {
    const v = checkErrorHunt(item, tokenIndex, correction);
    if (tokenIndex !== "none") setFixChosen(correction);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  const chooseToken = (i: number) => {
    if (disabled || step !== "find") return;
    sfx.tap();
    setToken(i);
    setStep("fix");
  };

  const declareClean = () => {
    if (disabled || step !== "find") return;
    sfx.click();
    setDeclared("none");
    finish("none", null);
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5">
      <p className="text-center text-sm text-muted-foreground">{item.prompt}</p>

      {/* Frase interactiva */}
      <div className="paper-texture w-full rounded-3xl border-2 border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-2 text-xl leading-relaxed sm:text-2xl">
          {item.tokens.map((t, i) => (
            <button
              key={`${item.id}-${i}`}
              type="button"
              disabled={disabled || step === "fix"}
              onClick={() => chooseToken(i)}
              aria-pressed={token === i}
              aria-label={`Palabra ${t}`}
              className={cn(
                "rounded-lg px-1.5 py-0.5 font-semibold transition-all duration-150",
                step === "find" && "hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-sm",
                token === i && "bg-primary/15 underline decoration-primary decoration-2 underline-offset-4",
                declared === "none" && item.errorIndex === -1 && "text-success",
              )}
            >
              {t}
            </button>
          ))}
        </p>
      </div>

      {/* Acciones según el paso */}
      {step === "find" ? (
        <div className="w-full space-y-2.5">
          <Button
            variant="outline"
            size="lg"
            className="w-full font-bold"
            disabled={disabled}
            onClick={declareClean}
          >
            La frase está limpia (no hay error)
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Toca la palabra que te parezca sospechosa, o declara la frase limpia.
          </p>
        </div>
      ) : (
        <div className="anim-slide-up w-full space-y-3">
          <p className="text-center text-sm font-semibold">
            ¿Cómo se escribe bien «{item.tokens[token!]}»?
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {item.options.map((opt, i) => (
              <OptionButton
                key={`${item.id}-fix-${i}`}
                label={<span className="font-display text-base">{opt}</span>}
                state={
                  fixChosen === null
                    ? "idle"
                    : i === item.answerIndex
                      ? "correct"
                      : i === fixChosen
                        ? "wrong"
                        : "idle"
                }
                onClick={() => token !== null && finish(token, i)}
                disabled={disabled}
              />
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full" disabled={disabled} onClick={() => { sfx.back(); setStep("find"); setToken(null); }}>
            Elegir otra palabra
          </Button>
        </div>
      )}
    </div>
  );
}
