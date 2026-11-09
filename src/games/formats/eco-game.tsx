"use client";

/**
 * Eco del Mar (Puerto) · Etapa 2 completa
 * ----------------------------------------------------------------
 * Escucha el modelo con la voz del navegador, grábate con el
 * micrófono, escúchate y compárate con honestidad: la checklist
 * decide la grade (como el Reto del Minuto). La grabación vive
 * solo en memoria durante el ítem y se libera al salir: nada
 * se guarda, nada se envía.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { EcoExercise } from "@/types";
import { checkEco } from "@/engine/validation";
import { speak, ttsAvailable, sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { useGameProps } from "../props";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CircleStop, Ear, Mic, Play, Square } from "lucide-react";

const MAX_MS = 12_000;

export function EcoGame(props: useGameProps<EcoExercise>) {
  const { item, onAnswer, disabled } = props;
  const [ttsOk] = useState(() => ttsAvailable());
  const [phase, setPhase] = useState<"idle" | "recording" | "reviewed">("idle");
  const [recMs, setRecMs] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(() => item.criteria.map(() => false));
  const [micDenied, setMicDenied] = useState(false);
  const [canRecord, setCanRecord] = useState(true);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);
  const startedAtRef = useRef<number>(0);
  const answeredRef = useRef(false);

  // Limpieza total al desmontar: la grabación no sobrevive al ítem.
  useEffect(() => {
    return () => {
      if (mediaRef.current && mediaRef.current.state === "recording") mediaRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const playModel = () => {
    if (!ttsOk) return;
    sfx.click();
    speak(item.sentence);
  };

  const startRecording = async () => {
    if (disabled || phase === "recording" || !canRecord) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      mediaRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const ms = Date.now() - startedAtRef.current;
        setRecMs(ms);
        setHasRecording(true);
        setPhase("reviewed");
        streamRef.current?.getTracks().forEach((t) => t.stop());
        sfx.buoy();
      };
      rec.start();
      startedAtRef.current = Date.now();
      setPhase("recording");
      sfx.go();
    } catch {
      // Sin micrófono o sin permiso: modo «de oído».
      setMicDenied(true);
      setCanRecord(false);
      setPhase("reviewed");
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state === "recording") mediaRef.current.stop();
  };

  // Corte de seguridad: la grabación no pasa de 12 s.
  useEffect(() => {
    if (phase !== "recording") return;
    const id = setTimeout(stopRecording, MAX_MS);
    return () => clearTimeout(id);
  }, [phase]);

  const playRecording = () => {
    if (!hasRecording) return;
    sfx.click();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    audioUrlRef.current = URL.createObjectURL(blob);
    const audio = new Audio(audioUrlRef.current);
    void audio.play();
  };

  const finish = useCallback(() => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    const checked = checks.filter(Boolean).length;
    const r = checkEco(item, hasRecording ? recMs : 0, checked, hasRecording);
    sfx.stamp();
    onAnswer({ correct: r.correct, grade: r.grade, userAnswer: r.userAnswer, correctAnswer: r.correctAnswer });
  }, [checks, hasRecording, item, onAnswer, recMs]);

  const canFinish = checks.some(Boolean) || hasRecording;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* El modelo */}
      <div className="paper-texture anim-pop-3d w-full max-w-xl rounded-3xl border-2 border-border bg-card p-6 text-center shadow-[0_6px_0_0_color-mix(in_oklch,var(--border)_62%,#000_14%)]">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">La frase del mar · {item.cefr}</p>
        <p className="mt-2.5 font-display text-2xl font-black leading-snug sm:text-3xl">{item.sentence}</p>
        <Button
          variant="outline"
          className="mt-4 font-bold"
          onClick={playModel}
          disabled={disabled || !ttsOk}
          aria-label="Escuchar el modelo"
        >
          <Ear className="mr-2 h-4 w-4" aria-hidden /> Escuchar el modelo
        </Button>
        {!ttsOk && (
          <p className="mt-2 text-[11px] font-bold text-muted-foreground">
            Sin voz del navegador: lee la frase con tus propios ojos de faro.
          </p>
        )}
      </div>

      {/* Grabación */}
      <div className="flex flex-col items-center gap-2">
        {phase === "recording" ? (
          <button
            type="button"
            onClick={stopRecording}
            aria-label="Parar la grabación"
            className="tap-target flex h-24 w-24 items-center justify-center rounded-full border-2 border-destructive bg-destructive/15 text-destructive shadow-[0_6px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)] transition-all active:translate-y-1 active:shadow-[0_2px_0_0_color-mix(in_oklch,var(--destructive)_48%,#000_30%)]"
          >
            <CircleStop className="h-10 w-10 animate-pulse" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={hasRecording ? playRecording : startRecording}
            disabled={disabled}
            aria-label={hasRecording ? "Escuchar tu grabación" : "Grabar tu voz"}
            className={cn(
              "tap-target flex h-24 w-24 items-center justify-center rounded-full border-2 shadow-[0_6px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)] transition-all duration-150",
              hasRecording
                ? "border-success/60 bg-success/15 text-success hover:-translate-y-1 active:translate-y-1"
                : "border-primary/60 bg-primary/10 text-primary hover:-translate-y-1 active:translate-y-1 active:shadow-[0_2px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_28%)]",
            )}
          >
            {hasRecording ? <Play className="h-10 w-10" aria-hidden /> : <Mic className="h-10 w-10" aria-hidden />}
          </button>
        )}
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {phase === "recording"
            ? "Grabando… pulsa para parar"
            : hasRecording
              ? "Grábate de nuevo o escúchate"
              : micDenied
                ? "Sin micrófono: evalúate de oído"
                : "Toca el micrófono y lee la frase"}
        </p>
      </div>

      {/* Checklist honesta */}
      <div className="flex w-full max-w-xl flex-col gap-2.5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Autoevaluación honesta — marca solo lo cumplido
        </p>
        {item.criteria.map((crit, i) => (
          <label
            key={`${item.id}-crit-${i}`}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm font-semibold transition-colors",
              checks[i] && "border-primary/50 bg-primary/10",
              disabled && "pointer-events-none opacity-60",
            )}
          >
            <Checkbox
              checked={checks[i]}
              onCheckedChange={(v) => {
                if (disabled || answeredRef.current) return;
                sfx.tap();
                setChecks((prev) => prev.map((c, j) => (j === i ? Boolean(v) : c)));
              }}
              aria-label={crit}
            />
            {crit}
          </label>
        ))}
      </div>

      <Button size="lg" className="font-bold" onClick={finish} disabled={disabled || !canFinish} aria-label="Terminar la autoevaluación">
        <Square className="mr-2 h-4 w-4" aria-hidden /> Guardar eco honesto
      </Button>
      <p className="text-[11px] font-semibold text-muted-foreground">
        La grabación vive solo en este ítem: al avanzar, se disuelve como la espuma.
      </p>
    </div>
  );
}
