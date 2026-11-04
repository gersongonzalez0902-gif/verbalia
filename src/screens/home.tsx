"use client";

/**
 * Dashboard · Saludo, objetivo diario, racha, misiones del día,
 * sesión recomendada y accesos a regiones y entrenamientos.
 */

import { useMemo } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { levelProgress, rankForLevel } from "@/engine/xp";
import { dailyProgress, dateKey } from "@/engine/missions";
import { REGIONS } from "@/data/regions";
import { GAMES, GAME_IDS } from "@/data/games";
import { SRS_WORDS } from "@/data/words-srs";
import { dueCards } from "@/engine/session";
import { ProgressRing, XpBar, LevelBadge, StreakBadge } from "@/components/game/widgets";
import { TintaBubble } from "@/components/game/tinta";
import { TINTA_GREETINGS, TINTA_TIPS } from "@/data/companion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createRng } from "@/engine/rng";
import {
  BookOpen,
  ChevronRight,
  Library,
  NotebookPen,
  Play,
  Settings as SettingsIcon,
  Sprout,
  ChartColumn,
} from "lucide-react";
import { getIcon } from "@/components/game/icons";

export function HomeScreen() {
  const { profile, core, srs, settings } = useGameStore();
  const navigate = useUiStore((s) => s.navigate);

  const { level, into, needed } = levelProgress(core.xp);
  const rank = rankForLevel(level);
  const today = dateKey(new Date());
  const xpToday = core.stats.xpByDay[today] ?? 0;
  const goalPct = Math.min(1, xpToday / settings.dailyGoalXp);

  const due = useMemo(() => dueCards({ srs, now: Date.now() }), [srs]);

  const missions = useMemo(() => dailyProgress(core, today), [core, today]);

  const greeting = useMemo(() => {
    const ctx = {
      streak: core.streak.current,
      xpToday,
      dailyGoal: settings.dailyGoalXp,
      hasErrors: core.errors.length,
      dueCards: due.length,
    };
    return TINTA_GREETINGS.find((g) => g.condition(ctx)) ?? TINTA_GREETINGS[TINTA_GREETINGS.length - 1];
  }, [core, xpToday, settings.dailyGoalXp, due.length]);

  // Consejo de Tinta: uno al día, determinista.
  const dailyTip = useMemo(() => {
    const rng = createRng(`tip-${today}`);
    const idx = Math.floor(rng() * TINTA_TIPS.length);
    return TINTA_TIPS[idx];
  }, [today]);

  const unlockedRegions = REGIONS.filter((r) => r.games.length > 0 && level >= r.unlockLevel);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-8 pt-4 lg:pt-6">
      {/* ===== Cabecera ===== */}
      <header className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {rank.name}
          </p>
          <h1 className="font-display truncate text-2xl font-bold leading-tight">
            ¡Hola, {profile.name}!
          </h1>
        </div>
        <StreakBadge current={core.streak.current} shields={core.streak.shields} />
        <LevelBadge level={level} size="md" />
        <button
          onClick={() => navigate({ name: "settings" })}
          aria-label="Ajustes"
          className="tap-target flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <SettingsIcon className="h-5 w-5" aria-hidden />
        </button>
      </header>

      {/* Barra de nivel */}
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-sm">
        <span className="numeric rounded-lg bg-primary/10 px-2 py-1 text-xs font-black text-primary">NV {level}</span>
        <XpBar into={into} needed={needed} className="flex-1" />
        <span className="numeric shrink-0 text-xs font-bold text-muted-foreground">
          {into}/{needed}
        </span>
      </div>

      {/* ===== Tinta ===== */}
      <TintaBubble text={greeting.text({ name: profile.name, streak: core.streak.current, dueCards: due.length })} className="mt-4" />

      {/* ===== Objetivo diario + sesión recomendada ===== */}
      <section className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr]" aria-labelledby="goal-title">
        <div className="flex items-center justify-center">
          <ProgressRing value={goalPct} size={124} stroke={11} label="Objetivo diario de XP">
            <span className="numeric font-display text-2xl font-bold">{xpToday}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              de {settings.dailyGoalXp} XP
            </span>
          </ProgressRing>
        </div>
        <div className="flex flex-col justify-center gap-2.5">
          <h2 id="goal-title" className="font-display text-lg font-bold">
            {goalPct >= 1 ? "¡Objetivo del día cumplido! 🎉" : "Tu aventura de hoy"}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {due.length >= 5
              ? `El jardín te espera: ${due.length} tarjetas vencidas piden riego.`
              : "Una sesión de 3 a 5 minutos basta para mover el mapa."}
          </p>
          <Button
            size="lg"
            className="anim-glow h-13 rounded-2xl font-display text-base font-bold shadow-lg"
            onClick={() => navigate({ name: "game", gameId: "srs", mode: "training" })}
          >
            <Play className="mr-2 h-5 w-5" aria-hidden />
            {due.length >= 5 ? "Regar el jardín" : "Sesión recomendada"}
          </Button>
        </div>
      </section>

      {/* ===== Misiones diarias ===== */}
      <section className="mt-6" aria-labelledby="missions-title">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 id="missions-title" className="font-display text-lg font-bold">
            Misiones de hoy
          </h2>
          <button
            onClick={() => navigate({ name: "missions" })}
            className="flex items-center gap-0.5 text-sm font-bold text-primary transition hover:underline"
          >
            Ver todas <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {missions.map((m) => {
            const Icon = getIcon(m.mission.icon, Play);
            const pct = Math.min(1, m.current / m.target);
            return (
              <div
                key={m.mission.id}
                className={cn(
                  "rounded-2xl border bg-card p-3.5 shadow-sm",
                  m.done && m.claimed && "border-primary/50 bg-primary/5",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", m.done ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <p className="text-xs font-bold leading-snug">{m.mission.title}</p>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-[width] duration-500", m.done ? "bg-primary" : "bg-[var(--xp)]")}
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                  <span className="numeric text-[11px] font-bold text-muted-foreground">
                    {m.done ? "✓" : `${m.current}/${m.target}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== Regiones ===== */}
      <section className="mt-6" aria-labelledby="regions-title">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 id="regions-title" className="font-display text-lg font-bold">
            Explora el Archipiélago
          </h2>
          <button
            onClick={() => navigate({ name: "map" })}
            className="flex items-center gap-0.5 text-sm font-bold text-primary transition hover:underline"
          >
            Ver mapa <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {REGIONS.filter((r) => r.stage === 1).map((r) => {
            const Icon = getIcon(r.icon);
            const unlocked = level >= r.unlockLevel;
            return (
              <button
                key={r.id}
                onClick={() => unlocked && navigate({ name: "map" })}
                disabled={!unlocked}
                aria-label={`${r.name}${unlocked ? "" : ` — se desbloquea al nivel ${r.unlockLevel}`}`}
                className={cn(
                  "group flex items-center gap-3.5 rounded-2xl border bg-card p-4 text-left shadow-sm transition-all duration-150",
                  unlocked ? "hover:-translate-y-0.5 hover:shadow-md" : "cursor-not-allowed opacity-55",
                )}
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-inner"
                  style={{ background: `var(${r.colorVar})` }}
                  aria-hidden
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-base font-bold">{r.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {unlocked ? r.subtitle : `Se desbloquea al nivel ${r.unlockLevel}`}
                  </span>
                </span>
                {unlocked ? (
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" aria-hidden />
                ) : (
                  <span className="shrink-0 text-lg" aria-hidden>🔒</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== Entrenamientos rápidos ===== */}
      <section className="mt-6" aria-labelledby="training-title">
        <h2 id="training-title" className="font-display mb-2.5 text-lg font-bold">
          Entrenamiento rápido
        </h2>
        <div className="scroll-soft -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1.5" role="list">
          {GAME_IDS.map((gid) => {
            const g = GAMES[gid];
            const Icon = getIcon(g.icon, Play);
            return (
              <button
                key={gid}
                role="listitem"
                onClick={() => navigate({ name: "game", gameId: gid, mode: "training" })}
                className="tap-target flex w-36 shrink-0 flex-col items-start gap-2 rounded-2xl border bg-card p-3.5 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span className="font-display text-sm font-bold leading-tight">{g.name}</span>
                <span className="text-[11px] leading-snug text-muted-foreground">{g.tagline}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== Accesos secundarios ===== */}
      <section className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="Accesos rápidos">
        <QuickLink icon={Sprout} label="Jardín" onClick={() => navigate({ name: "game", gameId: "srs", mode: "training" })} hint={`${due.length} vencidas`} />
        <QuickLink icon={NotebookPen} label="Errores" onClick={() => navigate({ name: "errors" })} hint={`${core.errors.length} pendientes`} />
        <QuickLink icon={BookOpen} label="Colección" onClick={() => navigate({ name: "collection" })} hint={`${Object.keys(srs).length}/${SRS_WORDS.length}`} />
        <QuickLink icon={ChartColumn} label="Estadísticas" onClick={() => navigate({ name: "stats" })} hint={`${core.stats.totalSessions} sesiones`} />
      </section>

      {/* Consejo diario */}
      <TintaBubble text={`Consejo de Tinta: ${dailyTip.text}`} compact className="mt-6 opacity-90" />

      {/* Enlace a biblioteca (móvil no tiene en nav inferior) */}
      <button
        onClick={() => navigate({ name: "library" })}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-muted-foreground transition hover:bg-muted"
      >
        <Library className="h-4 w-4" aria-hidden />
        Biblioteca de contenidos y hoja de ruta
      </button>
    </div>
  );
}

function QuickLink({
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-1 rounded-2xl border bg-card p-3.5 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
    >
      <Icon className="h-5 w-5 text-primary" aria-hidden />
      <span className="text-sm font-bold">{label}</span>
      <span className="text-[11px] text-muted-foreground">{hint}</span>
    </button>
  );
}
