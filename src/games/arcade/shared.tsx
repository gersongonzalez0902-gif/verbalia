"use client";

/**
 * El Salón de Juegos · Piezas comunes de UI.
 * Panel de partida con marcador, temporizador, vidas y la gran
 * pantalla de resultados (puntuación → XP y tinta del navegante).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/game/widgets";
import { getIcon } from "@/components/game/icons";
import {
  ChevronLeft,
  Coins,
  Flame,
  Heart,
  RotateCcw,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import type { ArcadeGameDef } from "@/engine/arcade";

export interface ArcadeGameProps {
  def: ArcadeGameDef;
  /** Récord personal antes de esta partida. */
  best: number;
  /** Termina la partida y registra la puntuación. */
  onFinish: (score: number, extra?: { subtitle?: string }) => void;
  /** Cierra la partida sin registrar. */
  onExit: () => void;
}

/* ============================ panel de juego ============================ */

export function ArcadePanel({
  def,
  onExit,
  score,
  timeLeft,
  timeMax,
  lives,
  livesMax = 3,
  round,
  roundMax,
  children,
  accentVar = "--region-biblioteca",
}: {
  def: ArcadeGameDef;
  onExit: () => void;
  score?: number;
  timeLeft?: number;
  timeMax?: number;
  lives?: number;
  livesMax?: number;
  round?: number;
  roundMax?: number;
  children: React.ReactNode;
  accentVar?: string;
}) {
  const Icon = getIcon(def.icon);
  const urgent = timeLeft !== undefined && timeMax !== undefined && timeLeft <= 5;

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-4 pb-4">
      {/* Cabecera del juego */}
      <header className="flex items-center gap-2.5 pt-1 pb-3">
        <button
          onClick={() => { sfx.back(); onExit(); }}
          aria-label="Salir de la partida"
          className="tap-target flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border bg-card text-foreground transition hover:border-primary/50"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <span
          className="gloss flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: `linear-gradient(150deg, color-mix(in oklch, var(${accentVar}) 76%, white 18%), var(${accentVar}))` }}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display truncate text-base font-bold leading-tight">{def.name}</h2>
          <p className="truncate text-[11px] text-muted-foreground">{def.tagline}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {lives !== undefined && (
            <span className="flex items-center gap-0.5" aria-label={`${lives} vidas`}>
              {Array.from({ length: livesMax }, (_, i) => (
                <Heart
                  key={i}
                  className={cn("h-4 w-4 transition-all", i < lives ? "fill-current text-[--region-torre]" : "text-muted-foreground/30")}
                  aria-hidden
                />
              ))}
            </span>
          )}
          {score !== undefined && (
            <span className="numeric chip-icon flex items-center gap-1 rounded-xl px-2.5 py-1 text-sm font-black">
              <Trophy className="h-3.5 w-3.5" aria-hidden />
              {score}
            </span>
          )}
        </div>
      </header>

      {/* Barra de tiempo / ronda */}
      {(timeLeft !== undefined || round !== undefined) && (
        <div className="mb-3">
          {timeLeft !== undefined && timeMax !== undefined ? (
            <div className="groove h-2.5 overflow-hidden rounded-full">
              <div
                className={cn("h-full rounded-full transition-[width] duration-1000 ease-linear", urgent ? "anim-glow" : "")}
                style={{
                  width: `${Math.max(0, Math.min(1, timeLeft / timeMax)) * 100}%`,
                  background: urgent
                    ? "var(--region-torre)"
                    : `linear-gradient(90deg, var(${accentVar}), color-mix(in oklch, var(${accentVar}) 60%, white 25%))`,
                }}
              />
            </div>
          ) : (
            <div className="groove h-2.5 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${roundMax ? (round! / roundMax) * 100 : 0}%`,
                  background: `var(${accentVar})`,
                }}
              />
            </div>
          )}
          <div className="mt-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {timeLeft !== undefined ? (
              <span className={cn("numeric flex items-center gap-1", urgent && "text-[--region-torre]")}>
                <Timer className="h-3 w-3" aria-hidden /> {Math.ceil(Math.max(0, timeLeft))}s
              </span>
            ) : <span />}
            {round !== undefined && roundMax !== undefined && (
              <span className="numeric">Ronda {round}/{roundMax}</span>
            )}
          </div>
        </div>
      )}

      {/* Zona de juego */}
      <main className="card-aurora anim-rise relative flex-1 overflow-hidden rounded-3xl border bg-card p-4">
        {children}
      </main>
    </div>
  );
}

/* ========================== fin de partida ========================== */

export interface FinishInfo {
  score: number;
  xp: number;
  tinta: number;
  isRecord: boolean;
  best: number;
  subtitle?: string;
}

export function GameOverPanel({
  info,
  onReplay,
  onExit,
  extraAction,
}: {
  info: FinishInfo;
  onReplay: () => void;
  onExit: () => void;
  extraAction?: React.ReactNode;
}) {
  useEffect(() => {
    if (info.score > 0) sfx.sessionEnd();
  }, [info.score]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-2 text-center">
      <div className="relative">
        <ProgressRing value={Math.min(1, info.score / Math.max(60, info.best || 60))} size={132} stroke={11}>
          <span className="numeric font-display text-3xl font-black">{info.score}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">puntos</span>
        </ProgressRing>
        {info.isRecord && (
          <span className="anim-bob absolute -right-6 -top-3 rotate-12 rounded-full bg-[var(--xp)] px-2.5 py-1 text-[10px] font-black text-black shadow-lg">
            ¡RÉCORD!
          </span>
        )}
      </div>

      {info.subtitle && <p className="max-w-xs text-sm leading-snug text-muted-foreground">{info.subtitle}</p>}

      <div className="grid w-full max-w-xs grid-cols-2 gap-2.5">
        <div className="card-aurora flex items-center gap-2 rounded-2xl border bg-card p-3">
          <Zap className="h-5 w-5 shrink-0 text-[--xp]" aria-hidden />
          <div className="text-left">
            <p className="numeric text-base font-black leading-none">+{info.xp}</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">XP</p>
          </div>
        </div>
        <div className="card-aurora flex items-center gap-2 rounded-2xl border bg-card p-3">
          <Coins className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div className="text-left">
            <p className="numeric text-base font-black leading-none">+{info.tinta}</p>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">tinta</p>
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button className="font-bold" onClick={() => { sfx.go(); onReplay(); }}>
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
          Otra partida
        </Button>
        {extraAction}
        <Button variant="outline" onClick={() => { sfx.back(); onExit(); }}>
          Volver al salón
        </Button>
      </div>

      <p className="numeric text-[11px] text-muted-foreground">
        Récord personal: {Math.max(info.best, info.score)}
      </p>
    </div>
  );
}

/* ============================ utilidades ============================ */

/** Temporizador de cuenta atrás en segundos (con pausa automática al desmontar). */
export function useCountdown(seconds: number, running: boolean, onEnd?: () => void) {
  const [left, setLeft] = useState(seconds);
  const ended = useRef(false);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    setLeft(seconds);
    ended.current = false;
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((v) => {
        if (v <= 0.1) {
          if (!ended.current) {
            ended.current = true;
            endRef.current?.();
          }
          return 0;
        }
        return v - 0.1;
      });
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  return left;
}

/** Cronómetro ascendente en milisegundos. */
export function useStopwatch(running: boolean) {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t0 = performance.now() - ms;
    const id = setInterval(() => setMs(performance.now() - t0), 50);
    return () => clearInterval(id);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps
  return ms;
}

/** Intervalo con callback estable: evita re-crear temporizadores. */
export function useInterval(cb: () => void, ms: number | null) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

/** Mezcla determinista ligera para tableros (Fisher-Yates con Math.random). */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Botón táctil grande estilo arcade. */
export function BigChoice({
  children,
  onClick,
  variant = "card",
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "card" | "primary" | "ghost";
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "tap-3d tap-target select-none rounded-2xl border px-4 py-3 text-base font-bold transition active:scale-95 disabled:opacity-40",
        variant === "primary" && "gloss border-transparent text-primary-foreground",
        variant === "card" && "border-border bg-card hover:border-primary/50",
        variant === "ghost" && "border-dashed bg-transparent text-muted-foreground hover:text-foreground",
        className,
      )}
      style={variant === "primary" ? { background: "var(--primary)" } : undefined}
    >
      {children}
    </button>
  );
}

/** Mensaje flotante de feedback («+10», «¡Fallo!»…). */
export function FlashMsg({ msg, tone }: { msg: string | null; tone: "ok" | "ko" }) {
  if (!msg) return null;
  return (
    <span
      key={msg}
      className={cn(
        "anim-pop pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-black shadow-md",
        tone === "ok" ? "bg-[var(--xp)] text-black" : "bg-[--region-torre] text-white",
      )}
    >
      {msg}
    </span>
  );
}

/** Letras/piezas grandes para tableros. */
export function TileButton({
  onClick,
  disabled,
  className,
  style,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  ariaLabel?: string;
}) {
  const handle = useCallback(() => {
    if (!disabled) onClick();
  }, [disabled, onClick]);
  return (
    <button
      onClick={handle}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "tap-target flex items-center justify-center rounded-xl border-2 font-black transition active:scale-90",
        "border-transparent",
        className,
      )}
      style={style}
    >
      {children}
    </button>
  );
}

/** Icono de combo para el HUD. */
export function ComboBadge({ combo }: { combo: number }) {
  if (combo < 2) return null;
  return (
    <span className="anim-pop numeric flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-black text-primary">
      <Flame className="h-3 w-3" aria-hidden /> ×{combo}
    </span>
  );
}
