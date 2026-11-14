"use client";

/**
 * Entrenamientos · VERBALIA
 * ----------------------------------------------------------------
 * El catálogo completo de los cien minijuegos del Archipiélago:
 * buscador por nombre, mecánica o región, filtros por habilidad y
 * desbloqueo por nivel de jugador (como las islas del mapa).
 */

import { useMemo, useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { ICONS } from "@/components/game/icons";
import { sfx } from "@/services/audio";
import { GAMES, GAME_IDS, type GameInfo } from "@/data/games";
import { REGIONS, SKILL_COLORS } from "@/data/regions";
import { levelFromXp } from "@/engine/xp";
import { gameLock, lockChipText, unlockContext } from "@/engine/unlocks";
import { SRS_WORDS_FULL } from "@/data/content";
import { totalPoolOf } from "@/data/pool-loader";
import { lastPlayedTraining, recommendTraining } from "@/lib/training-picks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Clock, Lock, Play, Search, Sparkles, Zap } from "lucide-react";
import type { GameId, SkillId } from "@/types";

/** Filtros de habilidad (el orden pinta los chips). */
const SKILL_FILTERS: { id: SkillId | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "vocabulario", label: "Vocabulario" },
  { id: "gramatica", label: "Gramática" },
  { id: "ortografia", label: "Ortografía" },
  { id: "lectura", label: "Lectura" },
  { id: "audicion", label: "Audición" },
  { id: "expresion", label: "Expresión" },
  { id: "cultura", label: "Cultura" },
];

/** Quita tildes y minúsculas para que el buscador perdone acentos. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function TrainingScreen() {
  const core = useGameStore((s) => s.core);
  const navigate = useUiStore((s) => s.navigate);

  const [query, setQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState<SkillId | "todos">("todos");
  const [detail, setDetail] = useState<GameInfo | null>(null);

  /* Nivel del jugador: la misma curva del motor (una sola fuente de verdad). */
  const level = useMemo(() => levelFromXp(core.xp), [core.xp]);

  /** Región (y nivel de desbloqueo) que custodia cada minijuego. */
  const gameRegion = useMemo(() => {
    const map = new Map<GameId, { name: string; unlockLevel: number }>();
    for (const r of REGIONS) {
      for (const g of r.games) {
        if (!map.has(g)) map.set(g, { name: r.name, unlockLevel: r.unlockLevel });
      }
    }
    return map;
  }, []);

  /** Catálogo enriquecido con región, candado y estadísticas.
   *  El candado es de dos vueltas: nivel de la isla + requisito extra
   *  del formato (logros, tinta o nivel) para los formatos de colección. */
  const uctx = useMemo(() => unlockContext(core, level), [core, level]);
  const enriched = useMemo(
    () =>
      GAME_IDS.map((id) => {
        const g = GAMES[id];
        const region = gameRegion.get(id) ?? null;
        const lock = gameLock(id, region?.unlockLevel, uctx);
        const unlocked = !region || lock.unlocked;
        const stat = core.stats.byGame[id];
        const pool = id === "srs" ? SRS_WORDS_FULL.length : totalPoolOf(id);
        return { g, region, unlocked, lock, stat, pool };
      }),
    [core.stats.byGame, gameRegion, uctx],
  );

  const unlockedCount = useMemo(() => enriched.filter((e) => e.unlocked).length, [enriched]);

  /** Reto de hoy (habilidad más débil abierta) y último formato jugado
   *  (Área 6.1 y 6.2): solo estado ya existente, sin esquema nuevo. */
  const isOpen = useMemo(
    () => (id: GameId) => enriched.find((e) => e.g.id === id)?.unlocked ?? false,
    [enriched],
  );
  const recommended = useMemo(
    () => recommendTraining(core.skills, isOpen),
    [core.skills, isOpen],
  );
  const lastPlayed = useMemo(
    () => lastPlayedTraining(useGameStore.getState().lastResult?.record.gameId),
    [],
  );
  const lastPlayedOpen = lastPlayed ? isOpen(lastPlayed.id) : false;

  /** Atajo «/»: enfoca el buscador desde el teclado (Área 6.5). */
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Buscador (nombre, mecánica o región) + filtro de habilidad. */
  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return enriched.filter(({ g, region }) => {
      if (skillFilter !== "todos" && g.skill !== skillFilter) return false;
      if (!q) return true;
      const haystack = norm(`${g.name} ${g.tagline} ${g.instructions} ${region?.name ?? ""}`);
      return haystack.includes(q);
    });
  }, [enriched, query, skillFilter]);

  /** Nº de formatos por habilidad, para que cada chip diga la verdad (6.3). */
  const countBySkill = useMemo(() => {
    const map = new Map<SkillId | "todos", number>();
    for (const { g } of enriched) map.set(g.skill, (map.get(g.skill) ?? 0) + 1);
    map.set("todos", enriched.length);
    return map;
  }, [enriched]);

  const play = (gameId: GameId) => {
    sfx.whoosh();
    navigate({ name: "game", gameId, mode: "training" });
  };

  return (
    <div>
      <ScreenHeader
        title="Entrenamientos"
        subtitle={`${unlockedCount} de ${GAME_IDS.length} formatos abiertos`}
        backTo={{ name: "home" }}
      />

      <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4">
        {/* ===== Intro: el cielo de formatos ===== */}
        <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span
              className="gloss flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
              style={{
                background:
                  "linear-gradient(150deg, color-mix(in oklch, var(--region-bosque) 76%, white 18%), var(--region-bosque))",
              }}
              aria-hidden
            >
              <Sparkles className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="type-h2 leading-tight">{GAME_IDS.length} formas de entrenar la lengua</h2>
              <p className="text-xs leading-snug text-muted-foreground">
                Todos los formatos del Archipiélago en una sola sala: elige el tuyo y salta directo al ejercicio.
                Los formatos se abren al subir de nivel, igual que las islas del mapa.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-secondary/70 px-3 py-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              <span className="numeric text-lg font-black text-primary">{level}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">tu nivel</span>
            </div>
          </div>
        </section>

        {/* ===== Retomar y reto de hoy (Área 6.1 / 6.2) ===== */}
        {(lastPlayedOpen || recommended) && (
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {lastPlayedOpen && lastPlayed && (
              <button
                onClick={() => play(lastPlayed.id)}
                className="card-aurora tap-3d flex items-center gap-3 rounded-2xl border bg-card p-3 text-left transition hover:border-primary/50"
              >
                <span className="gloss flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15" aria-hidden>
                  <Play className="h-5 w-5 text-primary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Retomar</span>
                  <span className="block truncate text-sm font-bold">{lastPlayed.name}</span>
                </span>
                <span className="shrink-0 text-xs font-black text-primary">Seguir →</span>
              </button>
            )}
            {recommended && (
              <button
                onClick={() => play(recommended.id)}
                className="card-aurora tap-3d flex items-center gap-3 rounded-2xl border border-primary/30 bg-card p-3 text-left transition hover:border-primary/60"
              >
                <span className="gloss flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground" aria-hidden>
                  <Zap className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Reto de hoy · tu habilidad más débil</span>
                  <span className="block truncate text-sm font-bold">{recommended.name}</span>
                </span>
                <span className="shrink-0 text-xs font-black text-primary">Entrenar →</span>
              </button>
            )}
          </div>
        )}

        {/* ===== Buscador + filtros ===== */}
        <section aria-label="Buscador de formatos" className="mt-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Buscar por nombre, mecánica o región… (pulsa /)"
              className="h-11 rounded-2xl pl-9 text-sm"
              aria-label="Buscar formato por nombre, mecánica o región"
              aria-describedby="catalog-count"
            />
          </div>
          <div className="scroll-soft -mx-4 mt-2.5 flex gap-1.5 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar por habilidad">
            {SKILL_FILTERS.map((f) => {
              const active = skillFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    sfx.tap();
                    setSkillFilter(f.id);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "tap-target shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {f.label}
                  <span className="numeric ml-1 opacity-70">{countBySkill.get(f.id) ?? 0}</span>
                </button>
              );
            })}
          </div>
          <p id="catalog-count" className="numeric mt-1.5 px-1 text-[11px] text-muted-foreground" aria-live="polite">
            {filtered.length} de {GAME_IDS.length} formatos{skillFilter !== "todos" ? " con el filtro activo" : ""}.
          </p>
        </section>

        {/* ===== Catálogo ===== */}
        {filtered.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Ningún formato coincide con la búsqueda.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 font-bold"
              onClick={() => { sfx.tap(); setQuery(""); setSkillFilter("todos"); }}
            >
              Quitar la búsqueda y el filtro
            </Button>
          </div>
        ) : (
          <ul className="stagger mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ g, region, unlocked, lock, stat, pool }) => {
              const Icon = ICONS[g.icon] ?? Sparkles;
              const color = SKILL_COLORS[g.skill];
              return (
                <li key={g.id}>
                  <div
                    className={cn(
                      "card-aurora tilt-hover group relative flex h-full flex-col gap-2.5 rounded-2xl border p-3.5 transition",
                      unlocked ? "bg-card hover:border-primary/50" : "border-dashed bg-muted/30",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "gloss flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white",
                          !unlocked && "grayscale",
                        )}
                        style={{
                          background: unlocked
                            ? `linear-gradient(150deg, color-mix(in oklch, ${color} 76%, white 18%), ${color})`
                            : `linear-gradient(150deg, color-mix(in oklch, ${color} 40%, #666), color-mix(in oklch, ${color} 20%, #444))`,
                        }}
                        aria-hidden
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold leading-tight">{g.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {region ? region.name : "Formato libre"}
                        </p>
                      </div>
                      {!unlocked && <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
                    </div>

                    <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/90">{g.description}</p>

                    {/* Candado: requisito completo legible (isla + extra) */}
                    {!unlocked && lock.reasons.length > 0 && (
                      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        <Lock className="h-3 w-3 shrink-0" aria-hidden /> Requiere {lock.reasons.join(" · ")}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2">
                      <span className="numeric text-[10px] font-bold text-muted-foreground">
                        {stat ? (
                          <>
                            {stat.plays} {stat.plays === 1 ? "partida" : "partidas"} ·{" "}
                            <span className="text-foreground">
                              {stat.correct}/{stat.answers}
                            </span>{" "}
                            aciertos
                          </>
                        ) : (
                          <>{pool} ejercicios</>
                        )}
                      </span>
                      {unlocked ? (
                        <span className="flex shrink-0 items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs font-bold"
                            onClick={() => {
                              sfx.open();
                              setDetail(g);
                            }}
                          >
                            Info
                          </Button>
                          <Button size="sm" className="h-8 font-bold" onClick={() => play(g.id)}>
                            <Play className="mr-1 h-3.5 w-3.5" aria-hidden /> Jugar
                          </Button>
                        </span>
                      ) : (
                        <span className="flex shrink-0 items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                          <Lock className="h-3 w-3" aria-hidden /> {lockChipText(g.id, region?.unlockLevel)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* ===== Cómo se juega ===== */}
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (open) sfx.open();
          else {
            sfx.close();
            setDetail(null);
          }
        }}
      >
        <DialogContent className="max-h-[85dvh] gap-0 overflow-y-auto rounded-3xl p-5 sm:max-w-md">
          {detail && (
          <GameDetail
            game={detail}
            unlocked={gameLock(detail.id, gameRegion.get(detail.id)?.unlockLevel, uctx).unlocked}
            lockHint={lockChipText(detail.id, gameRegion.get(detail.id)?.unlockLevel)}
            onPlay={() => play(detail.id)}
          />
        )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Ficha del formato dentro del diálogo «cómo se juega». */
function GameDetail({
  game,
  unlocked,
  lockHint,
  onPlay,
}: {
  game: GameInfo;
  unlocked: boolean;
  lockHint: string;
  onPlay: () => void;
}) {
  const Icon = ICONS[game.icon] ?? Sparkles;
  const color = SKILL_COLORS[game.skill];
  const skillLabel = SKILL_FILTERS.find((f) => f.id === game.skill)?.label ?? game.skill;
  const minutes = Math.max(2, Math.round((game.secondsPerItem * (game.timeLimit ? 8 : 10)) / 60));

  return (
    <>
      <DialogHeader className="p-0 text-left">
        <div className="flex items-center gap-3">
          <span
            className="gloss flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{ background: `linear-gradient(150deg, color-mix(in oklch, ${color} 76%, white 18%), ${color})` }}
            aria-hidden
          >
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <DialogTitle className="type-h2 leading-tight">{game.name}</DialogTitle>
            <DialogDescription className="text-xs">{game.tagline}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{game.description}</p>

      <div className="mt-3 rounded-2xl border bg-secondary/50 p-3.5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Cómo se juega</p>
        <p className="mt-1 text-sm leading-relaxed">{game.instructions}</p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Habilidad" value={skillLabel} />
        <MiniStat icon={<Clock className="h-3.5 w-3.5" aria-hidden />} label="Sesión" value={`~${minutes} min`} />
        <MiniStat
          icon={<Zap className="h-3.5 w-3.5" aria-hidden />}
          label="Por ítem"
          value={game.timeLimit ? `${game.timeLimit} s máx.` : "sin prisa"}
        />
      </div>

      {!unlocked && (
        <p className="mt-3 rounded-2xl border border-dashed bg-muted/40 p-3 text-center text-xs font-bold text-muted-foreground">
          Este formato se abre con {lockHint}: juega misiones, cosecha logros y estrena estilo en el Bazar.
        </p>
      )}

      <DialogFooter className="mt-4 p-0">
        <Button
          className="h-11 w-full rounded-2xl text-sm font-bold"
          disabled={!unlocked}
          onClick={onPlay}
        >
          <Play className="mr-1.5 h-4 w-4" aria-hidden />
          {unlocked ? "Empezar entrenamiento" : "Aún bloqueado"}
        </Button>
      </DialogFooter>
    </>
  );
}

function MiniStat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/70 px-2 py-2">
      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-0.5 text-xs font-black text-foreground">{value}</p>
    </div>
  );
}
