"use client";

/**
 * Duelo de Tipeo (Fortaleza) · Etapa 2 completa
 * ----------------------------------------------------------------
 * El faro enciende la mecha: escribe la frase exacta (tildes, signos,
 * mayúsculas) antes de que la mecha se consuma. Coloreado carácter a
 * carácter, SFX de teclado por letra y métricas honestas (PPM y
 * precisión) en la misma respuesta. La velocidad se premia solo si
 * la frase sale limpia.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { TipeoExercise } from "@/types";
import { checkTipeo } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { useGameProps } from "../props";
import { Button } from "@/components/ui/button";
import { Keyboard, Timer, Zap } from "lucide-react";

/** Cuánto dura la mecha además del objetivo (margen de juego). */
const FUSE_MARGIN = 1.6;

export function TipeoGame(props: useGameProps<TipeoExercise>) {
  const { item, onAnswer, disabled } = props;
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [now, setNow] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const limitMs = item.targetSeconds * 1000 * FUSE_MARGIN;

  // La mecha corre mientras el duelo está encendido.
  useEffect(() => {
    if (startedAt === null || submitted) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [startedAt, submitted]);

  const elapsed = startedAt !== null ? Math.max(0, now - startedAt) : 0;
  const fuse = Math.max(0, 1 - elapsed / limitMs);

  const submit = () => {
    if (disabled || submitted || !typed.trim()) return;
    setSubmitted(true);
    const ms = startedAt !== null ? Date.now() - startedAt : 0;
    const r = checkTipeo(item, typed, ms);
    if (r.correct) sfx.correct(2);
    else sfx.wrong(true);
    onAnswer({
      correct: r.correct,
      userAnswer: `${r.userAnswer} · ${Math.round(r.metrics.wpm)} ppm · ${Math.round(r.metrics.accuracy * 100)} %`,
      correctAnswer: item.sentence,
    });
  };

  const handleChange = (value: string) => {
    if (submitted) return;
    if (startedAt === null && value.length > 0) {
      setStartedAt(Date.now());
      sfx.go();
    }
    // SFX de teclado: una tecla por letra, un golpe de palabra al espacio.
    if (value.length > typed.length) {
      value.slice(typed.length).split("").forEach((c) => (c === " " ? sfx.typeWord() : sfx.typeKey()));
    }
    setTyped(value);
    // Frase completa: el duelo se entrega solo, sin botón extra.
    if (value.length >= item.sentence.length) {
      window.setTimeout(submit, 120);
    }
  };

  // Dibujo carácter a carácter: verde exacto, rojo desvío, gris pendiente.
  const chars = useMemo(() => {
    const out: { ch: string; state: "ok" | "bad" | "todo" }[] = [];
    const len = Math.max(item.sentence.length, typed.length);
    for (let i = 0; i < len; i++) {
      const target = item.sentence[i] ?? "";
      const mine = typed[i];
      if (mine === undefined) out.push({ ch: target, state: "todo" });
      else if (mine === target) out.push({ ch: target === " " ? "␣" : target, state: "ok" });
      else out.push({ ch: target === " " ? "␣" : target, state: "bad" });
    }
    return out;
  }, [item.sentence, typed]);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Meta y sabor del duelo */}
      <div className="flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border-2 border-border bg-card px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Keyboard className="h-4 w-4" aria-hidden /> {item.flavor === "trabalenguas" ? "Trabalenguas" : item.flavor === "cita" ? "Cita del mar" : "Frase"}
        </span>
        <span className="flex items-center gap-2 text-xs font-bold text-primary">
          <Timer className="h-4 w-4" aria-hidden /> meta {item.targetSeconds} s
        </span>
      </div>

      {/* Frase objetivo coloreada */}
      <div
        className="paper-texture w-full max-w-xl rounded-3xl border-2 border-border bg-card p-5 shadow-[0_5px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]"
        aria-label={`Frase a copiar: ${item.sentence}`}
      >
        <p className="flex flex-wrap font-mono text-base leading-loose sm:text-lg">
          {chars.map((c, i) => (
            <span
              key={i}
              className={cn(
                "rounded px-[1px] transition-colors",
                c.state === "ok" && "bg-success/20 text-success",
                c.state === "bad" && "bg-destructive/20 text-destructive line-through decoration-2",
                c.state === "todo" && "text-muted-foreground",
              )}
              aria-hidden
            >
              {c.ch === " " ? "\u00A0" : c.ch}
            </span>
          ))}
        </p>
      </div>

      {/* La mecha */}
      <div className="flex w-full max-w-xl items-center gap-3" aria-label={`Tiempo restante: ${Math.max(0, Math.ceil((limitMs - elapsed) / 1000))} segundos`}>
        <Zap className={cn("h-5 w-5 shrink-0", fuse < 0.3 ? "text-destructive" : "text-primary")} aria-hidden />
        <div className="h-3 flex-1 overflow-hidden rounded-full border border-border bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-100",
              fuse > 0.5 ? "bg-success" : fuse > 0.25 ? "bg-primary" : "bg-destructive",
            )}
            style={{ width: `${fuse * 100}%` }}
          />
        </div>
        <span className="numeric w-12 text-right text-sm font-bold">{Math.max(0, Math.ceil((limitMs - elapsed) / 1000))}s</span>
      </div>

      {/* Entrada del duelo */}
      {!submitted ? (
        <div className="anim-slide-up flex w-full max-w-xl items-center gap-2.5">
          <input
            ref={inputRef}
            autoFocus
            value={typed}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            disabled={disabled}
            aria-label="Escribe la frase exacta"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={item.sentence.length + 12}
            className="h-12 w-full rounded-2xl border-2 border-border bg-card px-4 font-mono text-base font-semibold shadow-[0_4px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)] outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/70"
            placeholder="Toca aquí y empieza el duelo…"
          />
          <Button size="lg" onClick={submit} disabled={disabled || !typed.trim()} className="font-bold" aria-label="Terminar el duelo">
            ¡Duelo!
          </Button>
        </div>
      ) : (
        <p className="anim-pop text-sm font-bold text-muted-foreground">La mecha se apagó: mira tu precisión en el resumen.</p>
      )}
      <p className="text-[11px] font-semibold text-muted-foreground">
        Copia la frase exacta: tildes, signos y mayúsculas también juegan.
      </p>
    </div>
  );
}
