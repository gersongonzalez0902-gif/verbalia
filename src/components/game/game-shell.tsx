"use client";

/**
 * Carcasa común de partida: HUD superior (salir, progreso, combo, XP vivo,
 * Léxico reaccionando) y solapado de retroalimentación con explicación
 * pedagógica y la mascota celebrando o consolando.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Info, XCircle, Zap } from "lucide-react";
import { sfx } from "@/services/audio";
import { useGameStore } from "@/store/game-store";
import { LexicoMini, type LexicoMood } from "@/components/game/lexico";

export function GameHud({
  title,
  current,
  total,
  combo,
  sessionXp,
  onExit,
  mood,
}: {
  title: string;
  current: number;
  total: number;
  combo: number;
  sessionXp: number;
  onExit: () => void;
  /** Estado de ánimo de Léxico en vivo (reacciona al combo y a los fallos). */
  mood?: LexicoMood;
}) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <header className="hero-band safe-top sticky top-0 z-30 overflow-hidden border-b bg-[var(--surface-glass)] backdrop-blur-lg">
      <span className="hero-sheen" aria-hidden />
      <div className="relative mx-auto flex max-w-3xl items-center gap-2.5 px-4 py-2.5">
        <LexicoMini mood={mood} className="tap-target -ml-1 rounded-full transition-transform" />
        <button
          onClick={onExit}
          aria-label="Abandonar sesión"
          className="tap-3d tap-target flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-card text-muted-foreground transition hover:text-foreground"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="line-clamp-2 text-xs font-bold leading-tight uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="numeric shrink-0 text-xs font-bold text-muted-foreground" aria-live="off">
              {Math.min(current + 1, total)} / {total}
            </p>
          </div>
          <div
            className="groove bar-shimmer mt-1.5 h-2.5 w-full overflow-hidden rounded-full"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso de la sesión"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(180deg, color-mix(in oklch, var(--primary) 76%, white 18%), var(--primary) 55%, color-mix(in oklch, var(--primary) 82%, #000 16%))",
              }}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {combo >= 2 && (
            <span
              className="anim-pop gloss flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black"
              style={{ background: "color-mix(in oklch, var(--xp) 22%, transparent)", color: "var(--xp)" }}
              aria-label={`Combo de ${combo}`}
            >
              <Zap className="h-3.5 w-3.5" aria-hidden />
              <span className="numeric">{combo}</span>
            </span>
          )}
          <span
            className="gloss numeric rounded-full px-2.5 py-1 text-xs font-black"
            style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}
            aria-label={`${sessionXp} XP en esta sesión`}
          >
            {sessionXp} XP
          </span>
        </div>
      </div>
    </header>
  );
}

export interface FeedbackPayload {
  kind: "correct" | "incorrect" | "info";
  title: string;
  correctAnswer?: string;
  explanation: string;
}

export function FeedbackOverlay({
  feedback,
  onContinue,
  isLast,
}: {
  feedback: FeedbackPayload | null;
  onContinue: () => void;
  isLast: boolean;
}) {
  // Enter/Espacio para continuar (accesibilidad de teclado).
  useEffect(() => {
    if (!feedback) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onContinue();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [feedback, onContinue]);

  if (!feedback) return null;

  const isCorrect = feedback.kind === "correct";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-3 backdrop-blur-[3px] sm:items-center"
      role="alertdialog"
      aria-modal="true"
      aria-label={isCorrect ? "Respuesta correcta" : "Respuesta incorrecta"}
    >
      <div
        className={cn(
          "card-aurora anim-pop-3d w-full max-w-lg overflow-hidden rounded-3xl border-2 bg-card",
          isCorrect ? "border-success" : "border-destructive/70",
        )}
        style={{ boxShadow: "0 18px 40px -18px color-mix(in oklch, #000 55%, transparent)" }}
      >
        <div
          className={cn(
            "flex items-center gap-3 px-5 py-4",
            isCorrect ? "bg-success/10" : "bg-destructive/10",
          )}
        >
          <LexicoMini
            mood={isCorrect ? "cheer" : "oops"}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="type-h2 leading-tight">
              {isCorrect ? "¡Muy bien!" : feedback.title}
            </p>
            {!isCorrect && feedback.correctAnswer && (
              <p className="mt-0.5 text-sm text-foreground">
                <span className="font-semibold">Respuesta correcta:</span>{" "}
                {feedback.correctAnswer}
              </p>
            )}
          </div>
          {isCorrect ? (
            <CheckCircle2 className="h-7 w-7 shrink-0 text-success" aria-hidden />
          ) : (
            <XCircle className="anim-shake h-7 w-7 shrink-0 text-destructive" aria-hidden />
          )}
        </div>
        <div className="flex items-start gap-2.5 border-t bg-muted/40 px-5 py-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <p className="text-sm leading-relaxed text-muted-foreground">{feedback.explanation}</p>
        </div>
        <div className="px-5 pb-4">
          <Button onClick={onContinue} className="w-full tap-target font-bold" size="lg" autoFocus>
            {isLast ? "Ver resultados" : "Continuar"}
            <kbd className="ml-2 hidden rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-bold sm:inline">
              ↵
            </kbd>
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Confirmación de abandono de sesión con avance parcial. */
export function ExitConfirmDialog({
  open,
  answered,
  total,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  answered: number;
  total: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>¿Abandonar la sesión?</DialogTitle>
          <DialogDescription>
            {answered > 0
              ? `Llevas ${answered} de ${total} respuestas. Si sales ahora, guardaremos lo jugado hasta aquí.`
              : "Aún no has respondido nada. Podrás volver cuando quieras: el Archipiélago no se mueve."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1 font-bold">
            Seguir jugando
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1 font-bold">
            Salir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Notificación flotante de XP ganado por ítem. */
export function XpToast({ xp, show }: { xp: number; show: boolean }) {
  if (!show) return null;
  return (
    <span className="anim-xp numeric pointer-events-none absolute -top-2 right-2 z-20 rounded-full bg-[var(--xp)] px-2 py-0.5 text-xs font-black text-[var(--xp-foreground)] shadow">
      +{xp}
    </span>
  );
}

/** Reproduce los efectos según los ajustes; seguro de llamar en eventos. */
export function useSoundEffects() {
  const sound = useGameStore((s) => s.settings.sound);
  const [canPlay, setCanPlay] = useState(false);
  useEffect(() => {
    // Desbloquea el AudioContext con el primer gesto.
    const unlock = () => setCanPlay(true);
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);
  return {
    correct: () => canPlay && sound && sfx.correct(),
    wrong: () => canPlay && sound && sfx.wrong(),
    levelUp: () => canPlay && sound && sfx.levelUp(),
    achievement: () => canPlay && sound && sfx.achievement(),
    combo: (n: number) => canPlay && sound && sfx.combo(n),
    navigate: () => canPlay && sound && sfx.navigate(),
    unlock: () => canPlay && sound && sfx.unlock(),
    sessionEnd: () => canPlay && sound && sfx.sessionEnd(),
    tick: () => canPlay && sound && sfx.tick(),
    flip: () => canPlay && sound && sfx.flip(),
    streak: () => canPlay && sound && sfx.streak(),
  };
}
