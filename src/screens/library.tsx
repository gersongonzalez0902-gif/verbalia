"use client";

/**
 * Biblioteca de contenidos · Dos pestañas: contenido disponible con
 * progreso real, y hoja de ruta honesta de todas las etapas
 * (los 25 módulos del catálogo + los 26 innovadores).
 */

import { useMemo } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { GAMES, GAME_IDS } from "@/data/games";
import { packStats } from "@/data/content";
import { CORE_MECHANICS, INNOVATIVE_MODULES, STAGE_LABELS, STAGE_DESCRIPTIONS } from "@/data/roadmap";
import { getIcon } from "@/components/game/icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library, Map, Play } from "lucide-react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import type { Stage } from "@/types";

export function LibraryScreen() {
  const core = useGameStore((s) => s.core);
  const navigate = useUiStore((s) => s.navigate);

  const packs = useMemo(
    () =>
      GAME_IDS.map((gid) => {
        const g = GAMES[gid];
        const stats = packStats(gid);
        const played = core.stats.byGame[gid]?.plays ?? 0;
        return { gid, g, stats, played };
      }),
    [core.stats.byGame],
  );

  const stages: Stage[] = [1, 2, 3, 4];

  return (
    <div>
      <ScreenHeader title="Biblioteca de contenidos" subtitle="Qué hay hoy y qué está de camino" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-3xl px-4 pb-28">
        <Tabs defaultValue="contenido" onValueChange={() => sfx.tap()} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contenido" className="font-bold">
              <Library className="mr-1.5 h-4 w-4" aria-hidden /> Contenido
            </TabsTrigger>
            <TabsTrigger value="ruta" className="font-bold">
              <Map className="mr-1.5 h-4 w-4" aria-hidden /> Hoja de ruta
            </TabsTrigger>
          </TabsList>

          {/* ===== Contenido disponible ===== */}
          <TabsContent value="contenido" className="mt-4 space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Paquetes de contenido de la Etapa 1, organizados por minijuego. Todos los ejercicios son
              originales de VerbalIA y están clasificados por dificultad (A1 a C2).
            </p>

            <ul className="grid gap-3 sm:grid-cols-2" aria-label="Paquetes de contenido">
              {packs.map(({ gid, g, stats, played }) => {
                const Icon = getIcon(g.icon);
                return (
                  <li key={gid} className="card-aurora flex flex-col rounded-3xl border bg-card p-5">
                    <div className="flex items-center gap-3">
                      <span className="chip-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-base font-bold leading-tight">{g.name}</p>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{g.tagline}</p>
                      </div>
                    </div>

                    <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">{g.description}</p>

                    {/* Distribución por dificultad */}
                    <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Ejercicios por nivel">
                      {[1, 2, 3, 4, 5].map((d) =>
                        stats.byDifficulty[d] ? (
                          <span
                            key={d}
                            className={cn(
                              "numeric rounded-full px-2 py-0.5 text-[10px] font-bold",
                              d <= 2 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : d === 3 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                            )}
                          >
                            {["A1", "A2", "B1", "B2", "C2"][d - 1]}: {stats.byDifficulty[d]}
                          </span>
                        ) : null,
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                      <span className="text-xs text-muted-foreground">
                        {gid === "srs" ? "48 palabras vivas" : `${stats.total} ejercicios`} · {played} partidas
                      </span>
                      <Button size="sm" onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: gid, mode: "training" }); }}>
                        <Play className="mr-1 h-3.5 w-3.5" aria-hidden />
                        Jugar
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="rounded-2xl bg-secondary px-4 py-3 text-xs leading-relaxed text-secondary-foreground">
              📖 Todo el contenido (lecturas, leyendas y ejemplos) es de autoría original de VerbalIA o
              adaptación libre de tradición oral, sin material protegido por derechos de autor.
            </p>
          </TabsContent>

          {/* ===== Hoja de ruta ===== */}
          <TabsContent value="ruta" className="mt-4 space-y-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Esta es la hoja de ruta completa del producto:{" "}
              <strong className="text-foreground">{CORE_MECHANICS.length} mecánicas del catálogo</strong> y{" "}
              <strong className="text-foreground">{INNOVATIVE_MODULES.length} módulos innovadores</strong>,
              cada uno con su etapa asignada. Nada se pierde: lo que no está hoy tiene su lugar y su fecha de viaje.
            </p>

            {stages.map((stage) => {
              const coreMods = CORE_MECHANICS.filter((m) => m.stage === stage);
              const innovMods = INNOVATIVE_MODULES.filter((m) => m.stage === stage);
              const isCurrent = stage === 1;
              return (
                <section key={stage} aria-labelledby={`stage-${stage}`} className={cn("card-aurora rounded-3xl border p-5", isCurrent ? "border-primary/50 bg-primary/5" : "bg-card")}>
                  <div className="flex items-center justify-between gap-3">
                    <h2 id={`stage-${stage}`} className="font-display text-lg font-bold">
                      {STAGE_LABELS[stage]}
                    </h2>
                    <span
                      className={cn(
                        "gloss rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isCurrent ? "disponible" : "previsto"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{STAGE_DESCRIPTIONS[stage]}</p>

                  <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
                    {[...coreMods, ...innovMods].map((m) => (
                      <div
                        key={m.name}
                        className={cn(
                          "flex items-start gap-2.5 rounded-xl p-2.5",
                          m.status === "listo" ? "bg-success/10" : "bg-muted/50",
                        )}
                      >
                        <span className="mt-0.5 shrink-0 text-sm" aria-hidden>
                          {m.status === "listo" ? "✅" : "🧭"}
                        </span>
                        <div className="min-w-0">
                          <p className={cn("text-xs font-bold leading-snug", m.status !== "listo" && "text-muted-foreground")}>
                            {m.name}
                          </p>
                          <p className="text-[11px] leading-snug text-muted-foreground">{m.description}</p>
                        </div>
                      </div>
                    ))}
                    {coreMods.length + innovMods.length === 0 && (
                      <p className="text-xs text-muted-foreground">Los módulos de esta etapa se detallan en la Etapa anterior.</p>
                    )}
                  </div>
                </section>
              );
            })}

            <p className="text-xs leading-relaxed text-muted-foreground">
              Transparencia: nada de lo marcado como «previsto» se simula en la interfaz. Las regiones
              Puerto de las Voces y Torre de la Expresión se muestran bloqueadas en el mapa hasta que
              su contenido exista de verdad.
            </p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
