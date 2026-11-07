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
import { REGIONS, REGION_BY_ID } from "@/data/regions";
import { GAMES, GAME_IDS } from "@/data/games";
import { SRS_WORDS_FULL } from "@/data/content";
import { dueCards } from "@/engine/session";
import { buildRecommendedDestination } from "@/engine/session";
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
  Dumbbell,
  Flame,
  Keyboard,
  Gamepad2,
  Library,
  ListMusic,
  NotebookPen,
  Play,
  Quote,
  Settings as SettingsIcon,
  Sparkles,
  Sprout,
  Target,
  Zap,
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
  /** Misiones diarias completadas que esperan su recompensa en el apartado. */
  const claimableMissions = missions.filter((m) => m.done && !m.claimed).length;

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

  // Saludo según la hora del día (Etapa 4).
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

  const forjaUnlocked = level >= (REGION_BY_ID.forja?.unlockLevel ?? 8);
  const forjaLockedHint = REGION_BY_ID.forja
    ? forjaUnlocked
      ? "Taller de estilo desbloqueado"
      : `Nivel ${REGION_BY_ID.forja.unlockLevel} · ${Math.max(0, REGION_BY_ID.forja.unlockLevel - level)} para abrir`
    : "";

  /** Destino de la sesión recomendada: tarjetas vencidas si toca, o la región más floja. */
  const recommended = useMemo(
    () => buildRecommendedDestination({ srs, skills: core.skills, now: Date.now(), newCardsPerDay: settings.newCardsPerDay, seenExercises: core.seenExercises }, due.length),
    [srs, core.skills, core.seenExercises, settings.newCardsPerDay, due.length],
  );

  const unlockedRegions = REGIONS.filter((r) => r.games.length > 0 && level >= r.unlockLevel);

  /** Mini resumen para la tira de estadísticas (visible en móvil). */
  const statsMini = useMemo(() => {
    const answers = core.stats.totalAnswers;
    const correct = core.stats.totalCorrect ?? 0;
    const acc = answers > 0 ? Math.round((correct / answers) * 100) : null;
    const learned = Object.values(srs).filter((c) => c.reps >= 2).length;
    return { acc, learned, pctWords: Math.round((learned / Math.max(SRS_WORDS_FULL.length, 1)) * 100) };
  }, [core.stats, srs]);

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

      {/* ===== Dos columnas en escritorio: viaje a la izquierda, progreso a la derecha ===== */}
      <div className="lg:mt-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
        <div className="lg:space-y-5">
      {/* ===== Objetivo diario + sesión recomendada ===== */}
      <section className="card-aurora mt-4 grid gap-4 rounded-3xl border bg-card p-4 sm:grid-cols-[auto_1fr] lg:mt-0" aria-labelledby="goal-title">
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
            className="h-13 min-w-0 max-w-full text-base"
            onClick={() => {
              sfx.whoosh();
              navigate({ name: "game", gameId: recommended.gameId, mode: recommended.mode, regionId: recommended.regionId });
            }}
          >
            <Play className="mr-2 h-5 w-5 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">
              {due.length >= 5 ? "Regar el jardín" : recommended.mode === "mission" ? `Misión: ${REGION_BY_ID[recommended.regionId!]?.name ?? "recomendada"}` : "Sesión recomendada"}
            </span>
          </Button>
        </div>
      </section>

      {/* ===== Palabra del día (Etapa 4) ===== */}
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

      {/* ===== Forja del Escritor (Etapa 4) ===== */}
      <section
        className={cn(
          "mt-4 overflow-hidden rounded-3xl border p-4 transition",
          forjaUnlocked ? "card-aurora border-primary/40 bg-card" : "border-dashed bg-muted/30 opacity-80",
        )}
        aria-labelledby="forja-title"
      >
        <div className="flex items-center gap-4">
          <span
            className="gloss flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{ background: "linear-gradient(150deg, oklch(0.62 0.19 30), oklch(0.45 0.14 20) 70%)" }}
            aria-hidden
          >
            <Flame className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p id="forja-title" className="font-display text-lg font-bold leading-tight">
              Forja del Escritor
            </p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              {forjaLockedHint} · metáforas, ironía, registro y estilo
            </p>
          </div>
          <Button
            size="sm"
            disabled={!forjaUnlocked}
            className="shrink-0 text-xs font-bold"
            onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: "metaforas", mode: "mission", regionId: "forja" }); }}
          >
            {forjaUnlocked ? "Entrar" : "🔒"}
          </Button>
        </div>
      </section>
        </div>

        {/* Columna derecha: progreso del navegante */}
        <div className="lg:space-y-5">
      {/* ===== Misiones diarias ===== */}
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
        <div className="stagger grid gap-2.5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
        </div>
      </div>

      {/* ===== Regiones (ancho completo en escritorio) ===== */}
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

      {/* ===== Entrenamientos: escaparate hacia su propio apartado ===== */}
      <section className="mt-6" aria-labelledby="training-title">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 id="training-title" className="font-display text-lg font-bold">
            Entrenamientos
            <span className="ml-2 text-xs font-semibold text-muted-foreground">
              {unlockedGameIds.length}/{GAME_IDS.length} abiertos
            </span>
          </h2>
          <button
            onClick={() => { sfx.click(); navigate({ name: "training" }); }}
            className="flex items-center gap-0.5 text-sm font-bold text-primary transition hover:underline"
          >
            Ver todos <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {/* Vitrina reducida: 6 formatos; el catálogo completo vive en su propia pantalla. */}
        <ul className="stagger grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {unlockedGameIds.slice(0, 6).map((gid) => {
            const g = GAMES[gid];
            const Icon = getIcon(g.icon, Play);
            return (
              <li key={gid}>
                <button
                  onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: gid, mode: "training" }); }}
                  className="tap-3d flex h-full w-full flex-col items-start gap-2 rounded-2xl border bg-card p-3.5 text-left"
                >
                  <span className="chip-icon flex h-9 w-9 items-center justify-center rounded-xl">
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                  <span className="font-display text-sm font-bold leading-tight">{g.name}</span>
                  <span className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">{g.tagline}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button
          onClick={() => { sfx.whoosh(); navigate({ name: "training" }); }}
          className="tap-3d mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/30 px-4 py-3 text-sm font-bold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
        >
          <Dumbbell className="h-4 w-4" aria-hidden />
          Los {GAME_IDS.length} entrenamientos, con guías y estadísticas
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </section>

      {/* ===== Accesos secundarios ===== */}
      <section className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="Accesos rápidos">
        <QuickLink icon={Sprout} label="Jardín" onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: "srs", mode: "training" }); }} hint={`${due.length} vencidas`} />
        <QuickLink icon={NotebookPen} label="Errores" onClick={() => { sfx.click(); navigate({ name: "errors" }); }} hint={`${core.errors.length} pendientes`} />
        <QuickLink icon={BookOpen} label="Colección" onClick={() => { sfx.flip(); navigate({ name: "collection" }); }} hint={`${Object.keys(srs).length}/${SRS_WORDS_FULL.length}`} />
        <QuickLink icon={ChartColumn} label="Estadísticas" onClick={() => { sfx.click(); navigate({ name: "stats" }); }} hint={`${core.stats.totalSessions} sesiones`} />
        <QuickLink icon={Gamepad2} label="Juegos" onClick={() => { sfx.whoosh(); navigate({ name: "arcade" }); }} hint="21 retos de mente" />
        <QuickLink icon={ListMusic} label="Estación" onClick={() => { sfx.click(); navigate({ name: "music" }); }} hint={`${stationCount} canciones`} />
        <QuickLink icon={Keyboard} label="Escritura" onClick={() => { sfx.whoosh(); navigate({ name: "writing" }); }} hint="tipeo y mecanografía" />
        <QuickLink icon={Quote} label="Frases" onClick={() => { sfx.tap(); navigate({ name: "frases" }); }} hint="bitácora completa" />
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
