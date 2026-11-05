"use client";

/**
 * Dictado del Faro (Puerto) · Escuchar (o leer) y escribir la frase.
 * - Voz del navegador (speechSynthesis) con hasta 3 escuchas.
 * - Sin voz: modo alternativo honesto «copia y acentúa» (el texto
 *   se muestra escrito y el reto ortográfico se mantiene).
 * - La corrección es estricta con tildes/eñes/signos de apertura y
 *   tolerante con mayúsculas, espacios y el punto final.
 */

import { useMemo, useRef, useState } from "react";
import type { DictadoExercise } from "@/types";
import { checkDictado, dictadoDiff } from "@/engine/validation";
import { speak, ttsAvailable, sfx } from "@/services/audio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, VolumeX, RotateCcw, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGameProps } from "./props";

const MAX_PLAYS = 3;

export function DictadoFaro(props: useGameProps<DictadoExercise>) {
  const { item, onAnswer, disabled } = props;
  const [ttsOk] = useState(() => ttsAvailable());
  const [typed, setTyped] = useState("");
  const [plays, setPlays] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [diff, setDiff] = useState<ReturnType<typeof dictadoDiff> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const play = () => {
    if (disabled || plays >= MAX_PLAYS) return;
    sfx.pop();
    setPlays((p) => p + 1);
    if (ttsOk) {
      speak(item.sentence);
    } else {
      // Sin voz: muestra el texto un instante (modo «copia y acentúa»).
      setRevealed(true);
    }
  };

  const confirm = () => {
    if (disabled || revealed) return;
    sfx.snap();
    const v = checkDictado(item, typed);
    setDiff(dictadoDiff(typed, item.sentence));
    setRevealed(true);
    onAnswer({ correct: v.correct, userAnswer: v.userAnswer, correctAnswer: v.correctAnswer });
  };

  const hint = useMemo(() => item.hint, [item.hint]);

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5">
      <p className="text-center text-sm text-muted-foreground">
        {ttsOk ? item.prompt : "Sin voz del navegador: modo «copia y acentúa». Escribe el texto con su ortografía exacta."}
      </p>

      {/* Reproductor del faro */}
      <div className="paper-texture flex w-full items-center justify-between gap-3 rounded-3xl border-2 border-border bg-card p-5 shadow-sm">
        <Button
          size="lg"
          className="font-bold shadow-md"
          onClick={play}
          disabled={disabled || plays >= MAX_PLAYS || (revealed && !ttsOk)}
          aria-label={ttsOk ? `Escuchar la frase (quedan ${MAX_PLAYS - plays} escuchas)` : "Mostrar el texto"}
        >
          {ttsOk ? <Volume2 className="mr-2 h-5 w-5" aria-hidden /> : <VolumeX className="mr-2 h-5 w-5" aria-hidden />}
          {ttsOk ? (plays === 0 ? "Escuchar" : `Repetir (${plays}/${MAX_PLAYS})`) : "Mostrar texto"}
        </Button>
        <p className="numeric text-xs font-bold text-muted-foreground" aria-hidden>
          {ttsOk ? `${Math.max(0, MAX_PLAYS - plays)} escuchas` : "sin voz"}
        </p>
        {ttsOk ? (
          <span className="flex items-end gap-1" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={cn("w-1.5 rounded-full bg-primary/70", plays > 0 && "anim-sound-bar")}
                style={{ height: `${8 + ((i * 7) % 18)}px`, animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </span>
        ) : null}
      </div>

      {/* Texto visible (modo sin voz o tras responder) */}
      {(revealed || (!ttsOk && plays > 0)) && (
        <div
          className="anim-slide-up w-full rounded-3xl border-2 border-primary/40 bg-primary/5 p-5 text-center text-lg font-semibold leading-relaxed"
          aria-live="polite"
        >
          {item.sentence}
        </div>
      )}

      {/* Entrada */}
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          confirm();
        }}
      >
        <Input
          ref={inputRef}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={disabled || revealed}
          placeholder="Escribe la frase exacta…"
          className="h-14 rounded-2xl border-2 text-lg font-medium"
          aria-label="Tu dictado"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </form>

      {/* Pista */}
      <div className="flex items-center gap-2">
        {!revealed ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint((h) => !h)}
              disabled={disabled}
              className="text-muted-foreground"
            >
              <Lightbulb className="mr-1.5 h-4 w-4" aria-hidden />
              {showHint ? "Ocultar pista" : "Pista"}
            </Button>
            <Button
              size="lg"
              className="min-w-32 font-bold shadow-md"
              onClick={confirm}
              disabled={disabled || typed.trim().length === 0}
            >
              Comprobar
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" className="pointer-events-none text-muted-foreground" aria-hidden tabIndex={-1}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Corrección abajo
          </Button>
        )}
      </div>

      {showHint && !revealed && (
        <p className="anim-pop text-sm italic text-muted-foreground" role="status">
          💡 {hint}
        </p>
      )}

      {/* Diff palabra a palabra */}
      {diff && (
        <div className="anim-slide-up w-full rounded-3xl border-2 border-border bg-card p-5" aria-label="Comparación con la frase correcta">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Tu frase, palabra a palabra
          </p>
          <p className="flex flex-wrap justify-center gap-1.5 text-lg font-semibold">
            {diff.map((t, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-md px-1.5 py-0.5",
                  t.status === "ok" && "text-success",
                  t.status === "wrong" && "bg-destructive/15 text-destructive underline decoration-destructive decoration-2 underline-offset-4",
                  t.status === "missing" && "bg-[var(--xp)]/15 text-[var(--xp)] line-through",
                  t.status === "extra" && "bg-muted text-muted-foreground line-through",
                )}
              >
                {t.word}
                <span className="sr-only">
                  {t.status === "missing" ? " (faltaba)" : t.status === "extra" ? " (sobraba)" : t.status === "wrong" ? " (mal escrita)" : ""}
                </span>
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
