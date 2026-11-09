"use client";

/**
 * Dictado por Voz (Puerto) · Etapa 2 completa
 * ----------------------------------------------------------------
 * El micrófono escribe por ti: lee la frase en voz alta y el
 * reconocimiento del navegador la transcribe en vivo. Si el
 * navegador no ofrece reconocimiento (o el permiso se niega), el
 * juego recae en escritura a mano con la misma frase: el faro
 * siempre deja una linterna de reserva.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { VozExercise } from "@/types";
import { checkVoz } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { useGameProps } from "../props";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Keyboard, Mic, MicOff, RefreshCw } from "lucide-react";

/* ---------------- Tipos mínimos del reconocimiento de voz ---------------- */
interface SRAlternative { transcript: string; }
interface SRResult { 0: SRAlternative; isFinal: boolean; length: number; }
interface SREvent { resultIndex: number; results: { length: number; [i: number]: SRResult }; }
interface SRErrorEvent { error: string; }
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SRCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const MAX_ATTEMPTS = 2;

export function VozGame(props: useGameProps<VozExercise>) {
  const { item, onAnswer, disabled } = props;
  const [supported] = useState(() => getRecognitionCtor() !== null);
  const [manual, setManual] = useState(false); // modo escritura a mano
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [typed, setTyped] = useState("");
  const [answered, setAnswered] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const answeredRef = useRef(false);

  useEffect(() => {
    return () => {
      recRef.current?.abort();
      recRef.current = null;
    };
  }, []);

  const finish = useCallback(
    (finalText: string) => {
      if (answeredRef.current) return;
      answeredRef.current = true;
      setAnswered(true);
      const r = checkVoz(item, finalText);
      if (r.correct) sfx.correct(1);
      else sfx.wrong(true);
      onAnswer({ correct: r.correct, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
    },
    [item, onAnswer],
  );

  const startListening = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || answeredRef.current || listening) return;
    setMicError(null);
    setHeard("");
    try {
      const rec = new Ctor();
      recRef.current = rec;
      rec.lang = "es-ES";
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;
      rec.onresult = (e) => {
        let text = "";
        let finalText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          text += res[0].transcript;
          if (res.isFinal) finalText += res[0].transcript;
        }
        setHeard(text.trim());
        if (finalText.trim()) {
          const clean = finalText.trim();
          rec.stop();
          const r = checkVoz(item, clean);
          if (r.correct) {
            finish(clean);
          } else {
            // Un intento de cortesía antes de contar el fallo.
            const next = attempts + 1;
            setAttempts(next);
            if (next >= MAX_ATTEMPTS) finish(clean);
            else {
              sfx.wrong(true);
              setHeard(clean);
            }
          }
        }
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setMicError("El micrófono necesita tu permiso. Puedes escribir la frase a mano.");
          setManual(true);
        } else if (e.error === "no-speech") {
          setMicError("No se oyó nada. Acércate un poco y reintenta.");
        } else {
          setMicError("El oído del navegador falló. Escribe la frase a mano o reintenta.");
        }
        setListening(false);
      };
      rec.onend = () => setListening(false);
      rec.start();
      setListening(true);
      sfx.buoy();
    } catch {
      setMicError("No se pudo encender el micrófono en este navegador.");
      setManual(true);
      setListening(false);
    }
  };

  const submitManual = () => {
    if (answeredRef.current || !typed.trim()) return;
    finish(typed);
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* La frase a pronunciar */}
      <div className="paper-texture anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-6 text-center shadow-[0_6px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {item.prompt} · pista: {item.hint}
        </p>
        <p className="mt-2.5 font-display text-2xl font-black leading-snug sm:text-3xl">{item.sentence}</p>
      </div>

      {/* Micrófono / modo manual */}
      {!(supported && !manual) ? (
        <div className="flex w-full max-w-xl flex-col items-center gap-3">
          <p className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground">
            <Keyboard className="h-4 w-4 shrink-0" aria-hidden />
            {supported
              ? "Modo manual: escribe la frase tal como la pronunciarías."
              : "Este navegador no escucha micrófonos: escribe la frase a mano."}
          </p>
          <div className="flex w-full items-center gap-2.5">
            <Input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitManual()}
              disabled={disabled}
              aria-label="Escribe la frase"
              placeholder="Escríbela exacta…"
              maxLength={90}
              className="h-12 rounded-2xl text-base font-semibold"
            />
            <Button size="lg" onClick={submitManual} disabled={disabled || !typed.trim()} className="font-bold" aria-label="Comprobar">
              Comprobar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={listening ? () => recRef.current?.stop() : startListening}
            disabled={disabled}
            aria-label={listening ? "Parar de escuchar" : "Hablar: leer la frase en voz alta"}
            className={cn(
              "tap-target flex h-24 w-24 items-center justify-center rounded-full border-2 shadow-[0_6px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)] transition-all duration-150",
              listening
                ? "border-destructive bg-destructive/15 text-destructive"
                : "border-primary/60 bg-primary/10 text-primary hover:-translate-y-1 active:translate-y-1 active:shadow-[0_2px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)]",
            )}
          >
            {listening ? <MicOff className="h-10 w-10" aria-hidden /> : <Mic className="h-10 w-10" aria-hidden />}
          </button>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {listening ? "Escuchando… lee con calma" : "Toca el micrófono y lee la frase"}
          </p>
        </div>
      )}

      {/* Transcripción en vivo */}
      {heard && (
        <p className={cn(
          "anim-pop max-w-xl rounded-2xl px-4 py-2.5 text-center text-base font-bold",
          answered ? "bg-success/15 text-success" : "bg-secondary text-secondary-foreground",
        )}>
          «{heard}»
          {!answered && attempts > 0 && (
            <span className="ml-2 text-xs font-semibold text-muted-foreground">
              · reintenta ({attempts}/{MAX_ATTEMPTS})
            </span>
          )}
        </p>
      )}

      {micError && (
        <p className="flex items-center gap-2 text-sm font-bold text-destructive">
          <MicOff className="h-4 w-4 shrink-0" aria-hidden /> {micError}
        </p>
      )}

      {/* Rescate: pasar a escritura a mano */}
      {supported && !manual && !answered && (
        <Button
          variant="ghost"
          className="text-xs font-bold text-muted-foreground"
          onClick={() => { recRef.current?.abort(); setListening(false); setManual(true); sfx.click(); }}
          disabled={disabled}
        >
          <Keyboard className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Prefiero escribirla
        </Button>
      )}
      {manual && supported && !answered && (
        <Button
          variant="ghost"
          className="text-xs font-bold text-muted-foreground"
          onClick={() => { setManual(false); sfx.click(); }}
          disabled={disabled}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Volver al micrófono
        </Button>
      )}
      <p className="text-[11px] font-semibold text-muted-foreground">
        La voz se procesa en tu propio navegador: nada viaja a ningún servidor.
      </p>
    </div>
  );
}
