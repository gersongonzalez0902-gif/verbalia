"use client";

/**
 * Pantalla de resultados · Anillo de exactitud, desglose de XP,
 * celebración de nivel y logros, repaso de explicaciones y acciones.
 */

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { levelProgress, rankForLevel } from "@/engine/xp";
import { ACHIEVEMENTS_BY_ID } from "@/data/achievements";
import { GAMES } from "@/data/games";
import { Confetti, LevelBadge, ProgressRing, XpBar } from "@/components/game/widgets";
import { TintaBubble } from "@/components/game/tinta";
import { tintaResultQuip } from "@/data/companion";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trophy, Sparkles, Flame, Shield, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "@/services/audio";

export function ResultsScreen() {
  const result = useGameStore((s) => s.lastResult);
  const core = useGameStore((s) => s.core);
  const navigate = useUiStore((s) => s.navigate);
  const celebratedRef = useRef(false);

  const { level, into, needed } = levelProgress(core.xp);
  const rank = rankForLevel(level);
  const isNewPlayer = result?.record.mode === "placement";

  // Celebración única (sonido) con guardián en ref: efecto puro,
  // sin estado intermedio.
  useEffect(() => {
    if (!result) return;
    if (celebratedRef.current) return;
    celebratedRef.current = true;
    // Fanfarria de cierre: cálida si dominaste la sesión, amable si no.
    const acc = result.accuracy;
    if (acc === null || acc >= 0.7) sfx.sessionWin();
    else sfx.sessionEnd();
    if (result.leveledUp || result.newAchievements.length > 0) {
      // Un destello extra tras la fanfarria.
      setTimeout(() => sfx.levelUp(), 700);
    }
  }, [result]);

  if (!result) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">No hay resultados que mostrar.</p>
        <Button onClick={() => navigate({ name: "home" })} className="font-bold">Ir al inicio</Button>
      </div>
    );
  }

  const accuracyPct = result.accuracy !== null ? Math.round(result.accuracy * 100) : null;
  const quip = tintaResultQuip(result.accuracy, result.record.mode);
  const minutes = Math.max(1, Math.round(result.record.durationMs / 60000));

  return (
    <div className="mx-auto w-full max-w-lg px-5 py-6">
      {result.leveledUp && <Confetti pieces={42} />}

      {/* Cabecera */}
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {isNewPlayer ? "Evaluación completada" : "Sesión completada"}
        </p>
        <h1 className="font-display mt-1 text-3xl font-bold">
          {result.accuracy === null
            ? "Jardín regado"
            : accuracyPct !== null && accuracyPct >= 80
              ? "¡Gran sesión!"
              : "Sesión completada"}
        </h1>
      </div>

      {/* Anillo de exactitud + XP */}
      <div className="mt-6 flex flex-col items-center gap-5">
        {result.accuracy !== null ? (
          <ProgressRing value={result.accuracy} size={150} stroke={13} label="Exactitud">
            <span className="numeric font-display text-4xl font-bold">{accuracyPct}%</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              exactitud
            </span>
          </ProgressRing>
        ) : (
          <ProgressRing value={1} size={150} stroke={13} label="Tarjetas repasadas">
            <span className="numeric font-display text-4xl font-bold">{result.totalCount}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              tarjetas
            </span>
          </ProgressRing>
        )}

        <div className="anim-pop gloss flex items-center gap-2 rounded-2xl px-5 py-2.5" style={{ background: "color-mix(in oklch, var(--xp) 16%, transparent)" }}>
          <Sparkles className="h-5 w-5 text-[var(--xp)]" aria-hidden />
          <span className="numeric font-display text-2xl font-bold text-[var(--xp)]">+{result.xpTotal} XP</span>
        </div>

        {result.accuracy !== null && (
          <p className="text-sm text-muted-foreground">
            {result.correctCount} de {result.totalCount} respuestas correctas · {minutes} min
            {result.bestCombo >= 3 && (
              <>
                {" "}· mejor combo <span className="numeric font-bold text-[var(--xp)]">{result.bestCombo}</span>
              </>
            )}
          </p>
        )}
      </div>

      {/* Subida de nivel */}
      {result.leveledUp && (
        <div className="card-aurora anim-slide-up mt-6 flex items-center gap-4 rounded-3xl border-2 border-[var(--xp)]/60 bg-card p-4">
          <LevelBadge level={level} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold">¡Subiste al nivel {level}!</p>
            <p className="text-sm text-muted-foreground">Rango: {rank.name}</p>
          </div>
          <Award className="anim-twinkle h-8 w-8 shrink-0 text-[var(--xp)]" aria-hidden />
        </div>
      )}

      {/* Nivel actual y barra */}
      <div className="card-aurora mt-5 flex items-center gap-3 rounded-2xl border bg-card p-4">
        <LevelBadge level={level} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-bold">{rank.name}</p>
            <p className="numeric text-xs text-muted-foreground">{into}/{needed} XP</p>
          </div>
          <XpBar into={into} needed={needed} className="mt-1.5" />
        </div>
      </div>

      {/* Logros nuevos */}
      {result.newAchievements.length > 0 && (
        <div className="anim-slide-up mt-4 space-y-2">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Trophy className="h-4 w-4 text-[var(--xp)]" aria-hidden />
            {result.newAchievements.length === 1 ? "Logro desbloqueado" : "Logros desbloqueados"}
          </p>
          {result.newAchievements.map((id) => {
            const def = ACHIEVEMENTS_BY_ID[id];
            if (!def) return null;
            return (
              <div key={id} className="flex items-center gap-3 rounded-2xl border border-[var(--xp)]/40 bg-[var(--xp)]/5 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--xp)]/20 text-lg" aria-hidden>🏅</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{def.name}</p>
                  <p className="text-xs text-muted-foreground">{def.description}</p>
                </div>
                <span className="numeric ml-auto shrink-0 text-xs font-bold text-[var(--xp)]">+{def.xpReward} XP</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Misiones completadas + escudo */}
      {(result.missionsCompleted.length > 0 || result.shieldUsed) && (
        <div className="mt-4 space-y-2">
          {result.missionsCompleted.map((id) => (
            <p key={id} className="card-aurora flex items-center gap-2 rounded-2xl border bg-card px-4 py-2.5 text-sm font-semibold">
              <Zap className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              Misión diaria completada: recompensa reclamada
            </p>
          ))}
          {result.shieldUsed && (
            <p className="card-aurora flex items-center gap-2 rounded-2xl border border-primary/40 bg-card px-4 py-2.5 text-sm font-semibold">
              <Shield className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              Un Escudo de Racha protegió tu racha de hoy
            </p>
          )}
        </div>
      )}

      {/* Tope diario suave (transparencia) */}
      {result.xpBreakdown.capped > 15 && (
        <p className="mt-4 rounded-2xl bg-secondary px-4 py-2.5 text-xs leading-relaxed text-secondary-foreground">
          Hoy has superado el ritmo de XP diario (600). El XP extra se reduce a la mitad para premiar el
          descanso tanto como el juego: mañana rinde al 100 % otra vez.
        </p>
      )}

      {/* Tinta comenta */}
      <TintaBubble text={quip} className="mt-6" />

      {/* Repaso de explicaciones */}
      {result.answers.length > 0 && (
        <Accordion type="single" collapsible className="card-aurora mt-5 rounded-2xl border bg-card px-4">
          <AccordionItem value="review" className="border-0">
            <AccordionTrigger className="py-3 text-sm font-bold">
              Repasar las explicaciones ({result.answers.length})
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-3">
              {result.answers.map((a, i) => {
                const ex = "exercise" in a && a.exercise;
                const gameName = GAMES[a.gameId]?.name ?? "Tarjeta";
                return (
                  <div key={`${a.itemId}-${i}`} className="rounded-xl bg-muted/50 p-3 text-xs leading-relaxed">
                    <p className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-bold">{gameName}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-bold",
                          a.correct === true ? "bg-success/15 text-success" : a.correct === false ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {a.correct === true ? "correcta" : a.correct === false ? "fallada" : `tarjeta: ${a.grade}`}
                      </span>
                    </p>
                    {ex && "prompt" in ex && <p className="mb-1 font-semibold">{ex.prompt}</p>}
                    {a.correct === false && (
                      <p className="mb-1">
                        Tu respuesta: <span className="font-semibold">{a.userAnswer}</span> · Correcta:{" "}
                        <span className="font-semibold">{a.correctAnswer}</span>
                      </p>
                    )}
                    {ex && <p className="text-muted-foreground">{ex.explanation}</p>}
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Acciones */}
      <div className="mt-6 flex flex-col gap-2.5 pb-4">
        {isNewPlayer ? (
          <Button size="xl" onClick={() => { sfx.whoosh(); navigate({ name: "home" }); }}>
            Explorar mi archipiélago
          </Button>
        ) : (
          <>
            <Button size="xl" onClick={() => { sfx.whoosh(); navigate({ name: "home" }); }}>
              Volver al inicio
            </Button>
            <Button variant="outline" size="lg" onClick={() => { sfx.click(); navigate({ name: "map" }); }}>
              Elegir otra región
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
