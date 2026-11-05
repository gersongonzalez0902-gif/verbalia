"use client";

/**
 * Reto del Minuto (Torre) · Escritura libre de 60 segundos con
 * autoevaluación honesta por criterios. No hay corrección automática
 * (y así se declara en la UI): el esfuerzo cuenta, el juicio es tuyo.
 */

import { useEffect, useRef, useState } from "react";
import type { MinutoExercise } from "@/types";
import { checkMinuto } from "@/engine/validation";
import { sfx, setClockActive, setTension } from "@/services/audio";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PenLine, Timer, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";

const TOTAL_S = 60;

export function RetoMinuto(props: useGameProps<MinutoExercise>) {
  const { item, onAnswer, disabled } = props;
  const [phase, setPhase] = useState<"preparado" | "escribiendo" | "revisando">("preparado");
  const [timeLeft, setTimeLeft] = useState(TOTAL_S);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState<boolean[]>(item.criteria.map(() => false));
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const doneRef = useRef(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const finishWriting = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    sfx.chime();
    setPhase("revisando");
  };

  // Cuenta atrás mientras se escribe.
  useEffect(() => {
    if (phase !== "escribiendo" || doneRef.current) return;
    if (timeLeft <= 0) {
      // Fuera del render: el cierre se notifica de forma asíncrona.
      const t = setTimeout(() => finishWriting(), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      // Reloj en contratiempo: arranca sutil y aprieta en el último tramo.
      setTension(0.08 + 0.92 * (1 - (timeLeft - 1) / TOTAL_S));
      if (timeLeft <= 10) sfx.tick(timeLeft <= 3);
      else if (timeLeft % 5 === 0) sfx.tock();
      setTimeLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // El reloj solo respira mientras se escribe.
  useEffect(() => {
    if (phase === "escribiendo") {
      setClockActive(true);
      setTension(0.08);
    } else {
      setClockActive(false);
      setTension(0);
    }
    return () => {
      setClockActive(false);
      setTension(0);
    };
  }, [phase]);

  const start = () => {
    if (disabled) return;
    sfx.go();
    setPhase("escribiendo");
    setTimeLeft(TOTAL_S);
    setTimeout(() => areaRef.current?.focus(), 50);
  };

  const submit = () => {
    if (disabled) return;
    const checkedCount = checked.filter(Boolean).length;
    const v = checkMinuto(item, wordCount, checkedCount);
    onAnswer({
      correct: v.correct,
      grade: v.grade,
      userAnswer: v.userAnswer,
      correctAnswer: v.correctAnswer,
    });
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      {/* Consigna */}
      <div className="paper-texture w-full rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
        <p className="flex items-start gap-2.5 text-base leading-relaxed sm:text-lg">
          <PenLine className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span>{item.challenge}</span>
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Meta: {item.wordGoal} palabras
        </p>
      </div>

      {phase === "preparado" && (
        <>
          <p className="max-w-md text-center text-sm text-muted-foreground">{item.prompt}</p>
          <Button size="lg" className="font-bold shadow-md" onClick={start} disabled={disabled}>
            <Timer className="mr-2 h-5 w-5" aria-hidden />
            Empezar el minuto
          </Button>
        </>
      )}

      {phase === "escribiendo" && (
        <>
          {/* Cuenta atrás */}
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
            role="timer"
            aria-label={`Tiempo restante: ${timeLeft} segundos`}
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-1000 ease-linear",
                timeLeft > 15 ? "bg-primary" : timeLeft > 5 ? "bg-amber-500" : "bg-destructive",
              )}
              style={{ width: `${(timeLeft / TOTAL_S) * 100}%` }}
            />
          </div>
          <p className="numeric text-sm font-bold text-muted-foreground" aria-hidden>
            {timeLeft}s · {wordCount} palabras
          </p>

          <Textarea
            ref={areaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe sin levantar el lápiz…"
            className="min-h-44 rounded-2xl border-2 text-base leading-relaxed"
            aria-label="Tu texto libre"
            spellCheck={false}
          />

          <Button size="lg" variant="secondary" className="font-bold" onClick={finishWriting} disabled={disabled}>
            Ya está, lo reviso
          </Button>
        </>
      )}

      {phase === "revisando" && (
        <div className="anim-slide-up flex w-full flex-col items-center gap-4">
          {/* Texto escrito (solo lectura) */}
          <div className="w-full rounded-3xl border-2 border-border bg-card p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Tu texto · {wordCount} palabras
            </p>
            <p className="max-h-44 overflow-y-auto whitespace-pre-wrap text-base leading-relaxed">
              {text.trim() || "— (no escribiste nada: también es información) —"}
            </p>
          </div>

          {/* Autoevaluación */}
          <div className="w-full rounded-3xl border-2 border-primary/40 bg-primary/5 p-5">
            <p className="mb-3 text-center font-display text-base font-bold">
              Relee tu texto con honestidad:
            </p>
            <ul className="space-y-3">
              {item.criteria.map((c, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug sm:text-base">
                    <Checkbox
                      checked={checked[i]}
                      onCheckedChange={(v) => {
                        sfx.toggle();
                        setChecked((arr) => arr.map((x, j) => (j === i ? v === true : x)));
                      }}
                      disabled={disabled}
                      aria-label={c}
                    />
                    <span>{c}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <Button size="lg" className="font-bold shadow-md" onClick={submit} disabled={disabled}>
            <CheckCircle2 className="mr-2 h-5 w-5" aria-hidden />
            Guardar mi reto
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Sin corrección automática: aquí el juicio honesto es el que aprende.
          </p>
        </div>
      )}
    </div>
  );
}
