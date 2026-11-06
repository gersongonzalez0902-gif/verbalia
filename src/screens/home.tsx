"use client";

/**
 * Dashboard · Saludo, objetivo diario, racha, misiones del día,
 * sesión recomendada y accesos a regiones y entrenamientos.
 */

import { useMemo } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { sfx } from "@/services/audio";
import { levelProgress, rankForLevel, rankName } from "@/engine/xp";
import { dailyProgress, dateKey } from "@/engine/missions";
import { REGIONS } from "@/data/regions";
import { GAMES, GAME_IDS } from "@/data/games";
import { SRS_WORDS } from "@/data/words-srs";
import { dueCards } from "@/engine/session";
import { ProgressRing, XpBar, LevelBadge, StreakBadge } from "@/components/game/widgets";
import { LexicoBubble } from "@/components/game/lexico";
import { LEXICO_GREETINGS, LEXICO_TIPS } from "@/data/companion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createRng } from "@/engine/rng";
import { FraseCard } from "@/components/game/frase-card";
import { useMusicStore } from "@/services/music-station";
import {
  BookOpen,
  ChartColumn,
  ChevronRight,
  Library,
  ListMusic,
  NotebookPen,
  Play,
  Quote,
  Settings as SettingsIcon,
  Sprout,
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

  const stationCount = useMusicStore((s) => s.tracks.length);

  const greeting = useMemo(() => {
    const ctx = {
      streak: core.streak.current,
      xpToday,
      dailyGoal: settings.dailyGoalXp,
      hasErrors: core.errors.length,
      dueCards: due.length,
    };
    return LEXICO_GREETINGS.find((g) => g.condition(ctx)) ?? LEXICO_GREETINGS[LEXICO_GREETINGS.length - 1];
  }, [core, xpToday, settings.dailyGoalXp, due.length]);

  // Consejo de Léxico: uno al día, determinista.
  const dailyTip = useMemo(() => {
    const rng = createRng(`tip-${today}`);
    const idx = Math.floor(rng() * LEXICO_TIPS.length);
    return LEXICO_TIPS[idx];
  }, [today]);

  const unlockedRegions = REGIONS.filter((r) => r.games.length > 0 && level >= r.unlockLevel);

  /** Región dueña de cada minijuego (para respetar la progresión). */
  const gameRegion = useMemo(() => {
    const map = new Map<string, { name: string; unlockLevel: number }>();
    for (const r of REGIONS) for (const g of r.games) map.set(g, { name: r.name, unlockLevel: r.unlockLevel });
    return map;
  }, []);
  const unlockedGameIds = useMemo(
    () => GAME_IDS.filter((g) => (gameRegion.get(g)?.unlockLevel ?? 99) <= level),
    [GAME_IDS, gameRegion, level],
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-8 pt-4 lg:pt-6">
      {/* ===== Cabecera ===== */}
      <header className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {rankName(rank, profile.gender)}
          </p>
          <h1 className="font-display truncate text-2xl font-bold leading-tight title-sheen">
            ¡Hola, {profile.name}!
          </h1>
        </div>
        <StreakBadge current={core.streak.current} shields={core.streak.shields} />
        <LevelBadge level={level} size="md" />
        <button
          onClick={() => { sfx.click(); navigate({ name: "settings" }); }}
          aria-label="Ajustes"
          className="tap-target flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <SettingsIcon className="h-5 w-5" aria-hidden />
        </button>
      </header>

      {/* Barra de nivel */}
      <div className="card-aurora mt-3 flex items-center gap-3 rounded-2xl border bg-card p-3.5">
        <span className="gloss numeric rounded-lg px-2 py-1 text-xs font-black" style={{ background: "color-mix(in oklch, var(--primary) 14%, transparent)", color: "var(--primary)" }}>NV {level}</span>
        <XpBar into={into} needed={needed} className="flex-1" />
        <span className="numeric shrink-0 text-xs font-bold text-muted-foreground">
          {into}/{needed}
        </span>
      </div>

      {/* ===== Léxico ===== */}
      <LexicoBubble mood={xpToday >= settings.dailyGoalXp ? "happy" : "idle"} text={greeting.text({ name: profile.name, streak: core.streak.current, dueCards: due.length })} className="mt-4" />

      {/* ===== Objetivo diario + sesión recomendada ===== */}
      <section className="card-aurora mt-4 grid gap-4 rounded-3xl border bg-card p-4 sm:grid-cols-[auto_1fr]" aria-labelledby="goal-title">
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
            className="h-13 text-base"
            onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: "srs", mode: "training" }); }}
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
            onClick={() => { sfx.click(); navigate({ name: "missions" }); }}
            className="flex items-center gap-0.5 text-sm font-bold text-primary transition hover:underline"
          >
            Ver todas <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="stagger grid gap-2.5 sm:grid-cols-3">
          {missions.map((m) => {
            const Icon = getIcon(m.mission.icon, Play);
            const pct = Math.min(1, m.current / m.target);
            return (
              <div
                key={m.mission.id}
                className={cn(
                  "card-aurora rounded-2xl border bg-card p-3.5",
                  m.done && m.claimed && "border-primary/50 bg-primary/5",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    m.done ? "chip-icon" : "bg-secondary text-secondary-foreground",
                  )}>
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <p className="text-xs font-bold leading-snug">{m.mission.title}</p>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="groove h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${pct * 100}%`,
                        background: m.done
                          ? "var(--primary)"
                          : "linear-gradient(180deg, color-mix(in oklch, var(--xp) 78%, white 20%), var(--xp) 60%)",
                      }}
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
            onClick={() => { sfx.click(); navigate({ name: "map" }); }}
            className="flex items-center gap-0.5 text-sm font-bold text-primary transition hover:underline"
          >
            Ver mapa <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2">
          {REGIONS.map((r) => {
            const Icon = getIcon(r.icon);
            const unlocked = level >= r.unlockLevel;
            return (
              <button
                key={r.id}
                onClick={() => { if (unlocked) { sfx.whoosh(); navigate({ name: "map" }); } else { sfx.error(); } }}
                disabled={!unlocked}
                aria-label={`${r.name}${unlocked ? "" : ` — se desbloquea al nivel ${r.unlockLevel}`}`}
                className={cn(
                  "tap-3d group flex items-center gap-3.5 rounded-2xl border bg-card p-4 text-left",
                  unlocked ? "hover:border-primary/40" : "cursor-not-allowed opacity-55",
                )}
              >
                <span
                  className="gloss flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{
                    background: `linear-gradient(150deg, color-mix(in oklch, var(${r.colorVar}) 76%, white 18%), var(${r.colorVar}) 58%, color-mix(in oklch, var(${r.colorVar}) 82%, #000 16%))`,
                    boxShadow: `0 3px 0 0 color-mix(in oklch, var(${r.colorVar}) 52%, #000 30%), inset 0 1px 0 oklch(1 0 0 / 30%)`,
                  }}
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
          <span className="ml-2 text-xs font-semibold text-muted-foreground">
            {unlockedGameIds.length}/{GAME_IDS.length} desbloqueados
          </span>
        </h2>
        <ul className="scroll-soft -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1.5" aria-label="Entrenamientos rápidos">
          {unlockedGameIds.map((gid) => {
            const g = GAMES[gid];
            const Icon = getIcon(g.icon, Play);
            return (
              <li key={gid}>
              <button
                onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: gid, mode: "training" }); }}
                className="tap-3d flex w-36 shrink-0 flex-col items-start gap-2 rounded-2xl border bg-card p-3.5 text-left"
              >
                <span className="chip-icon flex h-9 w-9 items-center justify-center rounded-xl">
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span className="font-display text-sm font-bold leading-tight">{g.name}</span>
                <span className="text-[11px] leading-snug text-muted-foreground">{g.tagline}</span>
              </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ===== Accesos secundarios ===== */}
      <section className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="Accesos rápidos">
        <QuickLink icon={Sprout} label="Jardín" onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: "srs", mode: "training" }); }} hint={`${due.length} vencidas`} />
        <QuickLink icon={NotebookPen} label="Errores" onClick={() => { sfx.click(); navigate({ name: "errors" }); }} hint={`${core.errors.length} pendientes`} />
        <QuickLink icon={BookOpen} label="Colección" onClick={() => { sfx.flip(); navigate({ name: "collection" }); }} hint={`${Object.keys(srs).length}/${SRS_WORDS.length}`} />
        <QuickLink icon={ChartColumn} label="Estadísticas" onClick={() => { sfx.click(); navigate({ name: "stats" }); }} hint={`${core.stats.totalSessions} sesiones`} />
        <QuickLink icon={ListMusic} label="Estación" onClick={() => { sfx.click(); navigate({ name: "music" }); }} hint={`${stationCount} canciones`} />
        <QuickLink icon={Quote} label="Frase" onClick={() => { sfx.tap(); navigate({ name: "map" }); }} hint="del día" />
      </section>

      {/* Consejo diario */}
      <LexicoBubble text={`Consejo de Léxico: ${dailyTip.text}`} compact className="mt-6 opacity-90" />

      {/* ===== Frase del día (rota con cada navegación) ===== */}
      <FraseCard className="mt-5" />

      {/* Enlace a biblioteca (móvil no tiene en nav inferior) */}
      <button
        onClick={() => { sfx.page(); navigate({ name: "library" }); }}
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
      className="tap-3d flex flex-col items-start gap-1 rounded-2xl border bg-card p-3.5 text-left"
    >
      <span className="chip-icon flex h-8 w-8 items-center justify-center rounded-lg">
        <Icon className="h-4.5 w-4.5" aria-hidden />
      </span>
      <span className="text-sm font-bold">{label}</span>
      <span className="text-[11px] text-muted-foreground">{hint}</span>
    </button>
  );
}
