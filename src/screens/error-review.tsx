"use client";

/**
 * Cuaderno de errores 2.0 · Registro de respuestas falladas con su
 * explicación, repaso dirigido y filtro por habilidad (Etapa 4).
 */

import { useMemo, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { EmptyState } from "@/components/game/widgets";
import { GAMES } from "@/data/games";
import { SKILL_LABELS } from "@/data/regions";
import { Button } from "@/components/ui/button";
import { NotebookPen, Undo2 } from "lucide-react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import type { SkillId } from "@/types";

export function ErrorReviewScreen() {
  const core = useGameStore((s) => s.core);
  const navigate = useUiStore((s) => s.navigate);
  const [skillFilter, setSkillFilter] = useState<SkillId | "todas">("todas");

  // Deduplica por ejercicio (la última vez que se falló).
  const errors = useMemo(() => {
    const seen = new Set<string>();
    return core.errors.filter((e) => {
      if (seen.has(e.exerciseId)) return false;
      seen.add(e.exerciseId);
      return true;
    });
  }, [core.errors]);

  // Habilidades presentes en el cuaderno (solo las que tienen errores).
  const presentSkills = useMemo(() => {
    const set = new Set<SkillId>();
    for (const e of errors) set.add(e.skill);
    return ["todas" as const, ...[...set]];
  }, [errors]);

  const filtered = useMemo(
    () => (skillFilter === "todas" ? errors : errors.filter((e) => e.skill === skillFilter)),
    [errors, skillFilter],
  );

  return (
    <div>
      <ScreenHeader title="Cuaderno de errores" subtitle={`${filtered.length} de ${errors.length} ejercicios para repasar`} backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-28">
        {errors.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<NotebookPen />}
              title="Cuaderno en blanco"
              description="Aquí apuntamos cada ejercicio fallado para que lo reintentes con calma. Fallar es información: cada error te acerca a la siguiente palabra."
            />
          </div>
        ) : (
          <>
            <div className="card-aurora relative mt-4 flex flex-col items-start gap-3 overflow-hidden rounded-3xl border border-primary/30 bg-card p-4 sm:flex-row sm:items-center">
              <span aria-hidden className="anim-float-diag absolute -right-3 -top-4 text-5xl opacity-20 select-none">📝</span>
              <div className="relative min-w-0 flex-1">
                <p className="font-display text-lg font-bold">Repaso dirigido</p>
                <p className="text-sm text-muted-foreground">
                  Reintenta tus errores más recientes. XP casi completo: aprender de ellos vale más que repetir lo fácil.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: "trivia", mode: "review" }); }}
              >
                <Undo2 className="mr-2 h-4 w-4" aria-hidden />
                Practicar ({Math.min(10, errors.length)})
              </Button>
            </div>

            {/* Filtro por habilidad (Etapa 4) */}
            {presentSkills.length > 2 && (
              <div className="scroll-soft mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por habilidad">
                {presentSkills.map((s) => (
                  <button
                    key={s}
                    onClick={() => { sfx.tap(); setSkillFilter(s); }}
                    aria-pressed={skillFilter === s}
                    className={cn(
                      "tap-target shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition active:translate-y-0.5",
                      skillFilter === s
                        ? "gloss border-primary bg-primary text-primary-foreground shadow-[0_3px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_30%)]"
                        : "tap-3d border-border bg-card text-muted-foreground",
                    )}
                  >
                    {s === "todas" ? "Todas" : SKILL_LABELS[s]}
                  </button>
                ))}
              </div>
            )}

            <ul className="stagger mt-4 space-y-2.5" aria-label="Lista de errores">
              {filtered.map((e) => {
                const game = GAMES[e.type];
                return (
                  <li key={`${e.exerciseId}-${e.at}`} className="card-aurora rounded-2xl border bg-card p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary">{game?.name ?? e.type}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(e.at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <p className="mt-1.5 text-sm">
                      Tu respuesta: <span className="font-semibold text-destructive">{e.userAnswer}</span>
                      {e.userAnswer !== e.correctAnswer && (
                        <>
                          {" "}· Correcta: <span className="font-semibold text-success">{e.correctAnswer}</span>
                        </>
                      )}
                    </p>
                    <p className="mt-2 rounded-xl bg-secondary px-3 py-2 text-xs leading-relaxed text-secondary-foreground">
                      📖 {e.explanation}
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
