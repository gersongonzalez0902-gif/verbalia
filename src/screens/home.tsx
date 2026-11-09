"use client";

/**
 * Dashboard v4 · Mínimo y enfocado.
 * ----------------------------------------------------------------
 * - «Tu siguiente paso»: tarjeta inteligente arriba y al centro que
 *   prioriza lo que más importa ahora (recompensas sin recoger,
 *   cuaderno de errores, tarjetas vencidas, objetivo del día).
 * - Isla de objetivo diario + misiones de hoy en dos columnas (PC).
 * - Carruseles horizontales con snap para islas y entrenamientos:
 *   nada de listas verticales infinitas en escritorio.
 * - Sin accesos rápidos duplicados: la navegación completa vive en la
 *   barra lateral (PC) y en el muelle (móvil); el inicio solo recomienda.
 */

import { useMemo, useRef } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { sfx } from "@/services/audio";
import { levelProgress, rankForLevel, rankName } from "@/engine/xp";
import { dailyProgress, weeklyProgress, daysOfWeek, weekKey, dateKey } from "@/engine/missions";
import { REGIONS, REGION_BY_ID } from "@/data/regions";
import { GAMES, GAME_IDS } from "@/data/games";
import { SRS_WORDS_FULL } from "@/data/content";
import { dueCards, buildRecommendedDestination } from "@/engine/session";
import { gameLock, unlockContext } from "@/engine/unlocks";
import { ProgressRing, XpBar, LevelBadge, StreakBadge } from "@/components/game/widgets";
import { LexicoBubble } from "@/components/game/lexico";
import { LEXICO_GREETINGS, LEXICO_TIPS } from "@/data/companion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createRng } from "@/engine/rng";
import { FraseCard } from "@/components/game/frase-card";
import {
  ChartColumn,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gift,
  Map as MapIcon,
  NotebookPen,
  Play,
  Settings as SettingsIcon,
  Sparkles,
  Sprout,
  Target,
  Zap,
} from "lucide-react";
import { getIcon } from "@/components/game/icons";
import type { Screen } from "@/types";

export function HomeScreen() {
  const { profile, core, srs, settings } = useGameStore();
  const navigate = useUiStore((s) => s.navigate);

  const { level, into, needed } = levelProgress(core.xp);
  const rank = rankForLevel(level);
  const today = dateKey(new Date());
  const wKeyToday = weekKey(new Date());
  const weekDaysToday = useMemo(() => daysOfWeek(new Date()), []);
  const xpToday = core.stats.xpByDay[today] ?? 0;
  const goalPct = Math.min(1, xpToday / settings.dailyGoalXp);

  const due = useMemo(() => dueCards({ srs, now: Date.now() }), [srs]);

  const missions = useMemo(() => dailyProgress(core, today), [core, today]);
  /** Misiones diarias completadas que esperan su recompensa en el apartado. */
  const claimableMissions = missions.filter((m) => m.done && !m.claimed).length;

  /** Recompensas listas en total: diarias + semanales + logros sin recoger.
 *  La misma cuenta que ve el jugador en Misiones y logros: si cero, la
 *  tarjeta «recoger recompensas» desaparece de verdad. */
  const weekly = useMemo(() => weeklyProgress(core, wKeyToday, weekDaysToday), [core, wKeyToday, weekDaysToday]);
  const claimableWeekly = weekly.filter((m) => m.done && !m.claimed).length;
  const unclaimedAchievements = useMemo(
    () => Object.keys(core.achievements).filter((id) => !(core.achievementsClaimed ?? []).includes(id)).length,
    [core.achievements, core.achievementsClaimed],
  );
  const readyRewards = claimableMissions + claimableWeekly + unclaimedAchievements;

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

  // Saludo según la hora del día.
  const horaGreeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return "Buenas noches";
    if (h < 13) return "Buenos días";
    if (h < 20) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // Palabra del día: determinista por fecha, preferentemente no vista aún.
  const palabraDelDia = useMemo(() => {
    const rng = createRng(`palabra-${today}`);
    const fresh = SRS_WORDS_FULL.filter((w) => !srs[w.id]);
    const pool = fresh.length > 0 ? fresh : SRS_WORDS_FULL;
    return pool[Math.floor(rng() * pool.length)];
  }, [today, srs]);

  /** Destino de la sesión recomendada: tarjetas vencidas si toca, o la región más floja ya abierta. */
  const recommended = useMemo(
    () => buildRecommendedDestination({ srs, skills: core.skills, now: Date.now(), newCardsPerDay: settings.newCardsPerDay, seenExercises: core.seenExercises, level }, due.length),
    [srs, core.skills, core.seenExercises, settings.newCardsPerDay, due.length, level],
  );

  /* ===== «Tu siguiente paso»: la recomendación con mayor prioridad ===== */
  const nextStep = useMemo(() => {
    type Step = {
      icon: React.ElementType;
      tone: string;
      eyebrow: string;
      title: string;
      desc: string;
      cta: string;
      go: Screen;
    };
    if (readyRewards > 0) {
      return {
        icon: Gift,
        tone: "--xp",
        eyebrow: "Recompensas esperando",
        title: readyRewards === 1 ? "Una recompensa lista" : `${readyRewards} recompensas listas`,
        desc: "Misiones y logros con la tinta y el XP ya ganados: pásate por el apartado y cógelos antes de zarpar.",
        cta: "Recoger recompensas",
        go: { name: "missions" },
      } satisfies Step;
    }
    if (core.errors.length >= 4) {
      return {
        icon: NotebookPen,
        tone: "--region-fortaleza",
        eyebrow: "Cuaderno de errores",
        title: `${core.errors.length} ${core.errors.length === 1 ? "error apuntado" : "errores apuntados"}`,
        desc: "Los fallos de tus últimas partidas piden revisión: repásalos mientras están frescos.",
        cta: "Repasar el cuaderno",
        go: { name: "errors" },
      } satisfies Step;
    }
    if (due.length >= 5) {
      return {
        icon: Sprout,
        tone: "--region-bosque",
        eyebrow: "Jardín de tarjetas",
        title: `${due.length} tarjetas vencidas`,
        desc: "El jardín pide riego: una sesión corta ahora vale por tres mañana.",
        cta: "Regar el jardín",
        go: { name: "game", gameId: "srs", mode: "training" },
      } satisfies Step;
    }
    if (goalPct < 1) {
      const regionName = REGION_BY_ID[recommended.regionId ?? "bosque"]?.name ?? "el Archipiélago";
      return {
        icon: Target,
        tone: "--primary",
        eyebrow: goalPct >= 0.5 ? "Casi lo tienes" : "Objetivo del día",
        title: recommended.mode === "mission" ? `Misión: ${regionName}` : "Sesión recomendada",
        desc: `Te faltan ${settings.dailyGoalXp - xpToday} XP para el objetivo: una misión de 3-5 minutos basta.`,
        cta: recommended.mode === "mission" ? "Empezar misión" : "Empezar sesión",
        go: { name: "game", gameId: recommended.gameId, mode: recommended.mode, regionId: recommended.regionId },
      } satisfies Step;
    }
    return {
      icon: Sparkles,
      tone: "--region-biblioteca",
      eyebrow: "Todo al día",
      title: "¡Objetivo cumplido, navegante!",
      desc: "Jardín regado, cuaderno al día y objetivo en el bolsillo. Explora una isla nueva o afina tu estilo en la Forja.",
      cta: "Explorar el mapa",
      go: { name: "map" },
    } satisfies Step;
  }, [readyRewards, core.errors.length, due.length, goalPct, recommended, settings.dailyGoalXp, xpToday]);

  /** Mini resumen para la tira de estadísticas (visible en móvil). */
  const statsMini = useMemo(() => {
    const answers = core.stats.totalAnswers;
    const correct = core.stats.totalCorrect ?? 0;
    const acc = answers > 0 ? Math.round((correct / answers) * 100) : null;
    const learned = Object.values(srs).filter((c) => c.reps >= 2).length;
    return { acc, learned, pctWords: Math.round((learned / Math.max(SRS_WORDS_FULL.length, 1)) * 100) };
  }, [core.stats, srs]);

  /** Candados de la vitrina de entrenamientos (isla + extras). */
  const uctx = useMemo(() => unlockContext(core, level), [core, level]);
  const gameRegion = useMemo(() => {
    const map = new Map<string, { name: string; unlockLevel: number }>();
    for (const r of REGIONS) for (const g of r.games) map.set(g, { name: r.name, unlockLevel: r.unlockLevel });
    return map;
  }, []);
  const unlockedGameIds = useMemo(
    () => GAME_IDS.filter((g) => gameRegion.get(g)?.unlockLevel !== undefined && gameLock(g, gameRegion.get(g)?.unlockLevel, uctx).unlocked),
    [GAME_IDS, gameRegion, uctx],
  );

  const NextIcon = nextStep.icon;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-8 pt-4 lg:pt-6">
      {/* ===== Cabecera ===== */}
      <header className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {horaGreeting} · {rankName(rank, profile.gender)}
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

      {/* ===== Tu siguiente paso (recomendación inteligente) ===== */}
      <section
        className="card-aurora anim-slide-up relative mt-4 overflow-hidden rounded-3xl border p-4 sm:p-5"
        aria-labelledby="next-step-title"
        style={{ borderColor: `color-mix(in oklch, var(${nextStep.tone}) 42%, var(--border))` }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full opacity-20 blur-2xl"
          style={{ background: `var(${nextStep.tone})` }}
        />
        <div className="relative flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <span
            className="gloss anim-bob flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white sm:h-14 sm:w-14"
            style={{ background: `linear-gradient(150deg, color-mix(in oklch, var(${nextStep.tone}) 76%, white 18%), var(${nextStep.tone}) 58%, color-mix(in oklch, var(${nextStep.tone}) 82%, #000 16%))` }}
            aria-hidden
          >
            <NextIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: `var(${nextStep.tone})` }}
            >
              Tu siguiente paso
            </p>
            <h2 id="next-step-title" className="font-display text-lg font-bold leading-tight sm:text-xl">
              {nextStep.title}
            </h2>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground sm:text-sm">{nextStep.desc}</p>
          </div>
          <Button
            size="lg"
            className="h-12 w-full shrink-0 text-sm font-bold sm:w-auto sm:text-base"
            onClick={() => {
              sfx.whoosh();
              navigate(nextStep.go);
            }}
          >
            <Play className="mr-2 h-4.5 w-4.5 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">{nextStep.cta}</span>
          </Button>
        </div>
      </section>

      {/* ===== Frase del día: protagonista, arriba — no al final ===== */}
      <FraseCard className="mt-4" />

      {/* ===== Léxico ===== */}
      <LexicoBubble mood={xpToday >= settings.dailyGoalXp ? "happy" : "idle"} text={greeting.text({ name: profile.name, streak: core.streak.current, dueCards: due.length })} className="mt-4" />

      {/* ===== Tira de estadísticas (siempre visible, también en móvil) ===== */}
      <button
        onClick={() => { sfx.click(); navigate({ name: "stats" }); }}
        className="card-aurora tap-3d group mt-4 flex w-full items-stretch gap-1 overflow-hidden rounded-3xl border bg-card p-1.5 text-left"
        aria-label="Ver todas las estadísticas"
      >
        <StatStripCell icon={<Zap className="h-4 w-4" aria-hidden />} value={`${xpToday}`} label="XP hoy" tone="--xp" />
        <StatStripCell icon={<Target className="h-4 w-4" aria-hidden />} value={statsMini.acc !== null ? `${statsMini.acc}%` : "—"} label="exactitud" tone="--region-bosque" />
        <StatStripCell icon={<Flame className="h-4 w-4" aria-hidden />} value={`${core.streak.current}`} label="racha" tone="--region-torre" />
        <StatStripCell icon={<ChartColumn className="h-4 w-4" aria-hidden />} value={`${core.stats.totalSessions}`} label="sesiones" tone="--region-puerto" />
        <StatStripCell icon={<Sprout className="h-4 w-4" aria-hidden />} value={`${statsMini.pctWords}%`} label="palabras" tone="--primary" />
      </button>

      {/* ===== Dos columnas en escritorio: objetivo a la izquierda, misiones a la derecha ===== */}
      <div className="mt-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
        {/* Objetivo diario */}
        <section className="card-aurora grid gap-4 rounded-3xl border bg-card p-4 sm:grid-cols-[auto_1fr]" aria-labelledby="goal-title">
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
              {goalPct >= 1
                ? "El faro ya te vio pasar: lo que juegues desde ahora es propina."
                : due.length >= 5
                  ? `El jardín te espera: ${due.length} tarjetas vencidas piden riego.`
                  : "Una sesión de 3 a 5 minutos basta para mover el mapa."}
            </p>
          </div>
        </section>

        {/* Misiones diarias */}
        <section className="mt-6 lg:mt-0" aria-labelledby="missions-title">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 id="missions-title" className="font-display flex items-center gap-2 text-lg font-bold">
              Misiones de hoy
              {claimableMissions > 0 && (
                <span className="gloss numeric rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
                  {claimableMissions} por recoger
                </span>
              )}
            </h2>
            <button
              onClick={() => { sfx.click(); navigate({ name: "missions" }); }}
              className="flex items-center gap-0.5 text-sm font-bold text-primary transition hover:underline"
            >
              Ver todas <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="stagger grid gap-2.5 sm:grid-cols-2">
            {missions.slice(0, 4).map((m) => {
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
      </div>

      {/* ===== Palabra del día ===== */}
      <section className="card-aurora mt-4 flex items-center gap-4 rounded-3xl border bg-card p-4" aria-labelledby="wotd-title">
        <span className="chip-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" aria-hidden>
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p id="wotd-title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Palabra del día · {palabraDelDia.cefr}
          </p>
          <p className="font-display text-xl font-bold leading-tight">{palabraDelDia.word}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">{palabraDelDia.definition}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 text-xs font-bold"
          onClick={() => {
            sfx.flip();
            // La palabra del día entra garantizada en la sesión de práctica.
            useUiStore.getState().setSrsFocusWordId(palabraDelDia.id);
            navigate({ name: "game", gameId: "srs", mode: "training" });
          }}
        >
          Practicar
        </Button>
      </section>

      {/* ===== Explora el Archipiélago (carrusel horizontal) ===== */}
      <RailSection
        title="Explora el Archipiélago"
        onSeeAll={() => { sfx.click(); navigate({ name: "map" }); }}
        seeAllLabel="Ver mapa"
        className="mt-6"
      >
        {REGIONS.map((r, i) => {
          const Icon = getIcon(r.icon);
          const unlocked = level >= r.unlockLevel;
          const islandNo = i + 1;
          return (
            <button
              key={r.id}
              onClick={() => { if (unlocked) { sfx.whoosh(); navigate({ name: "map" }); } else { sfx.error(); } }}
              disabled={!unlocked}
              aria-label={`${r.name}${unlocked ? "" : ` — se desbloquea al nivel ${r.unlockLevel}`}`}
              className={cn(
                "tap-3d tilt-hover group flex w-60 shrink-0 snap-start flex-col gap-2 rounded-2xl border bg-card p-4 text-left",
                unlocked ? "hover:border-primary/40" : "cursor-not-allowed opacity-55",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className="gloss flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{
                    background: `linear-gradient(150deg, color-mix(in oklch, var(${r.colorVar}) 76%, white 18%), var(${r.colorVar}) 58%, color-mix(in oklch, var(${r.colorVar}) 82%, #000 16%))`,
                    boxShadow: `0 3px 0 0 color-mix(in oklch, var(${r.colorVar}) 52%, #000 30%), inset 0 1px 0 oklch(1 0 0 / 30%)`,
                  }}
                  aria-hidden
                >
                  <Icon className="h-5.5 w-5.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-base font-bold">{r.name}</span>
                  <span className="numeric block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {unlocked ? `Isla ${islandNo} · ${r.games.length} formatos` : `Se abre en el nivel ${r.unlockLevel}`}
                  </span>
                </span>
                {unlocked ? (
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
                ) : (
                  <span className="shrink-0 text-lg" aria-hidden>🔒</span>
                )}
              </div>
              <span className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                {unlocked ? r.subtitle : `Sigue jugando para zarpar hacia ${r.name}.`}
              </span>
            </button>
          );
        })}
      </RailSection>

      {/* ===== Entrenamientos (carrusel horizontal) ===== */}
      <RailSection
        title="Entrenamientos"
        count={`${unlockedGameIds.length}/${GAME_IDS.length} abiertos`}
        onSeeAll={() => { sfx.click(); navigate({ name: "training" }); }}
        seeAllLabel="Ver todos"
        className="mt-6"
      >
        {unlockedGameIds.map((gid) => {
          const g = GAMES[gid];
          const Icon = getIcon(g.icon, Play);
          return (
            <button
              key={gid}
              onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: gid, mode: "training" }); }}
              className="tap-3d tilt-hover group flex w-40 shrink-0 snap-start flex-col gap-2 rounded-2xl border bg-card p-3.5 text-left hover:border-primary/40"
            >
              <span className="chip-icon flex h-9 w-9 items-center justify-center rounded-xl transition group-hover:scale-110">
                <Icon className="h-4.5 w-4.5" aria-hidden />
              </span>
              <span className="font-display text-sm font-bold leading-tight">{g.name}</span>
              <span className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{g.tagline}</span>
            </button>
          );
        })}
        <button
          onClick={() => { sfx.whoosh(); navigate({ name: "training" }); }}
          className="tap-3d flex w-40 shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/30 p-3.5 text-center transition hover:border-primary/50"
        >
          <MapIcon className="h-6 w-6 text-muted-foreground" aria-hidden />
          <span className="text-xs font-bold text-muted-foreground">
            Catálogo completo · {GAME_IDS.length} formatos
          </span>
        </button>
      </RailSection>

      {/* Consejo diario */}
      <LexicoBubble text={`Consejo de Léxico: ${dailyTip.text}`} compact className="mt-6 opacity-90" />
    </div>
  );
}

/* ================= Componentes locales del dashboard ================= */

/** Celda de la tira de estadísticas. */
function StatStripCell({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <span
      className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 transition group-hover:bg-primary/5"
      style={{ color: `var(${tone})` }}
    >
      <span className="flex items-center gap-1" aria-hidden>{icon}</span>
      <span className="numeric font-display text-base font-black leading-none text-foreground">{value}</span>
      <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
    </span>
  );
}

/** Carril horizontal con snap y flechas (escritorio). Sin listas infinitas. */
function RailSection({
  title,
  count,
  onSeeAll,
  seeAllLabel,
  className,
  children,
}: {
  title: string;
  count?: string;
  onSeeAll: () => void;
  seeAllLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: 1 | -1) => {
    sfx.tap();
    railRef.current?.scrollBy({ left: dir * 420, behavior: "smooth" });
  };

  return (
    <section className={className} aria-labelledby={`rail-${title}`}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h2 id={`rail-${title}`} className="font-display flex items-baseline gap-2 text-lg font-bold">
          {title}
          {count && <span className="text-xs font-semibold text-muted-foreground">{count}</span>}
        </h2>
        <div className="flex items-center gap-1.5">
          <div className="hidden items-center gap-1 lg:flex">
            <button
              onClick={() => scrollByCards(-1)}
              aria-label={`Desplazar ${title} hacia la izquierda`}
              className="tap-target flex h-8 w-8 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:border-primary/50 hover:text-primary active:scale-90"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              aria-label={`Desplazar ${title} hacia la derecha`}
              className="tap-target flex h-8 w-8 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:border-primary/50 hover:text-primary active:scale-90"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <button
            onClick={onSeeAll}
            className="flex items-center gap-0.5 text-sm font-bold text-primary transition hover:underline"
          >
            {seeAllLabel} <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        className="scroll-soft -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
      >
        {children}
      </div>
    </section>
  );
}
