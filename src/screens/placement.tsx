"use client";

/**
 * Evaluación inicial · Intro a la «prueba del faro» de 8 ítems calibrados.
 * Se puede saltar (nivel inicial suave). La partida en sí ocurre en la
 * pantalla de juego (mode=placement); al terminarla, el motor fija las
 * habilidades de partida.
 */

import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui-store";
import { useGameStore } from "@/store/game-store";
import { LexicoBubble } from "@/components/game/lexico";
import { LEXICO_ONBOARDING } from "@/data/companion";
import { PLACEMENT_ITEMS, EXERCISES_BY_ID } from "@/data/content";
import { GAMES } from "@/data/games";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Clock, SkipForward } from "lucide-react";

export function PlacementScreen() {
  const navigate = useUiStore((s) => s.navigate);
  const skipPlacement = useGameStore((s) => s.skipPlacement);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-5 py-8">
      <div className="anim-slide-up space-y-6 text-center">
        <div className="relative mx-auto w-fit">
          <img src="/icon.svg" alt="" className="mx-auto h-16 w-16 rounded-2xl shadow-md" />
          <span className="anim-float absolute -right-4 -top-3 text-xl" aria-hidden>🧭</span>
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold">La prueba del faro</h1>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            Ocho preguntas rápidas para calibrar tu nivel de partida en{" "}
            <strong className="text-foreground">vocabulario, gramática, ortografía y lectura</strong>.
            No hay nota: solo luz para tu faro.
          </p>
        </div>

        <LexicoBubble mood="think" text={LEXICO_ONBOARDING.placement} />

        <ul className="mx-auto max-w-sm space-y-2 text-left text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            Dura entre 2 y 3 minutos
          </li>
          <li className="flex items-center gap-2">
            <SkipForward className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            Puedes saltarla: empezaremos suave y el motor se adaptará solo
          </li>
        </ul>

        <div className="space-y-2.5">
          <Button
            size="lg"
            className="h-13 w-full text-base"
            onClick={() => { sfx.go(); navigate({ name: "game", gameId: "trivia", mode: "placement" }); }}
          >
            Empezar la evaluación
          </Button>
          <Button
            variant="ghost"
            className="w-full font-semibold text-muted-foreground"
            onClick={() => {
              sfx.back();
              skipPlacement();
              navigate({ name: "home" });
            }}
          >
            Saltar por ahora
          </Button>
        </div>
      </div>

      {/* Detalle honesto del contenido de la prueba (transparencia) */}
      <details className="card-aurora mt-8 rounded-2xl border bg-card px-4 py-3 text-sm" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) sfx.page(); }}>
        <summary className="cursor-pointer font-semibold">¿Qué incluye la evaluación?</summary>
        <ul className="mt-3 space-y-2">
          {PLACEMENT_ITEMS.map((p) => {
            const ex = EXERCISES_BY_ID[p.exerciseId];
            return (
              <li key={p.exerciseId} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{GAMES[ex.type].name}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-bold",
                    ex.difficulty <= 2
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : ex.difficulty === 3
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                  )}
                >
                  Nivel {ex.cefr}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Los niveles MCER son orientativos: VerbalIA no certifica oficialmente el dominio de un idioma.
        </p>
      </details>
    </div>
  );
}
