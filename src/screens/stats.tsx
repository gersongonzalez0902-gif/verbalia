"use client";

/**
 * Estadísticas y evolución 2.0 · Resumen con récords, XP por día,
 * mapa de calor de constancia, radar de las 7 habilidades, exactitud
 * por isla, actividad por minijuego e historial de sesiones.
 */

import { useMemo, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { EmptyState } from "@/components/game/widgets";
import { cefrFromSkill, levelProgress } from "@/engine/xp";
import { REGIONS,  SKILL_LABELS, SKILL_COLORS } from "@/data/regions";
import { GAMES, GAME_IDS } from "@/data/games";
import { dateKey } from "@/engine/missions";
import { getIcon } from "@/components/game/icons";
import { LexicoBubble } from "@/components/game/lexico";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, ChartColumn, Droplets, Flame, History, MapPin, Play, Timer, TrendingUp, Zap } from "lucide-react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { formatPlaytime } from "@/lib/format-time";
import type { GameId, SkillId } from "@/types";

const DAY_MS = 86_400_000;

/** Habilidad de cada juego (para exactitud por isla). */
const SKILL_OF_GAME = (g: GameId): SkillId => GAMES[g].skill;

export function StatsScreen() {
  const core = useGameStore((s) => s.core);
  const srs = useGameStore((s) => s.srs);
  const [tab, setTab] = useState("resumen");

  /* ---------- series y derivados ---------- */

  const xpData = useMemo(() => {
    const days: { dia: string; xp: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * DAY_MS);
      const key = dateKey(d);
      days.push({ dia: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }), xp: core.stats.xpByDay[key] ?? 0 });
    }
    return days;
  }, [core.stats.xpByDay]);

  const radarData = useMemo(
    () =>
      (["vocabulario", "gramatica", "ortografia", "lectura", "audicion", "expresion", "cultura"] as const).map((s) => ({
        skill: SKILL_LABELS[s],
        nivel: +(core.skills[s] ?? 2).toFixed(1),
      })),
    [core.skills],
  );

  const gameData = useMemo(
    () =>
      GAME_IDS.map((g) => ({
        id: g,
        name: GAMES[g].name,
        plays: core.stats.byGame[g]?.plays ?? 0,
        correct: core.stats.byGame[g]?.correct ?? 0,
        answers: core.stats.byGame[g]?.answers ?? 0,
      })).sort((a, b) => b.plays - a.plays),
    [core.stats.byGame],
  );

  /** Mapa de calor: 16 semanas (7×16 celdas · Etapa 4). */
  const heatmap = useMemo(() => {
    const cells: { key: string; xp: number; date: Date }[] = [];
    const today = new Date();
    const offsetToMonday = (today.getDay() + 6) % 7; // lunes = 0
    for (let w = 15; w >= 0; w--) {
      for (let dow = 0; dow < 7; dow++) {
        const d = new Date(today.getTime() - (offsetToMonday + (w * 7) + (6 - dow)) * DAY_MS);
        const key = dateKey(d);
        cells.push({ key, xp: core.stats.xpByDay[key] ?? 0, date: d });
      }
    }
    const maxXp = Math.max(30, ...cells.map((c) => c.xp));
    return { cells, maxXp };
  }, [core.stats.xpByDay]);

  const records = useMemo(() => {
    const byDay = Object.entries(core.stats.xpByDay);
    const bestDay = byDay.sort((a, b) => b[1] - a[1])[0] ?? null;
    const played = gameData.filter((g) => g.plays > 0);
    const favorite = played[0] ?? null;
    const hardest = played
      .filter((g) => g.answers >= 8)
      .sort((a, b) => a.correct / a.answers - b.correct / b.answers)[0] ?? null;
    const avgResponse =
      core.stats.totalAnswers > 0 && (core.stats.answerTimeSumMs ?? 0) > 0
        ? core.stats.answerTimeSumMs / core.stats.totalAnswers / 1000
        : null;
    return {
      bestDay: bestDay ? { date: bestDay[0], xp: bestDay[1] } : null,
      bestComboEver: core.stats.bestComboEver ?? 0,
      favorite,
      hardest,
      avgResponse,
      uniqueGames: (core.stats.uniqueGames ?? []).length,
      activeDays: core.stats.activeDays.length,
      tinta: (core.wallet?.tinta ?? 0) + (core.wallet?.spent ?? 0),
      tintaSpent: core.wallet?.spent ?? 0,
    };
  }, [core.stats, core.stats.byGame, gameData, core.wallet]);

  /** Proyección de nivel: ritmo de XP diario (14 días) → días hasta el siguiente nivel. */
  const levelProjection = useMemo(() => {
    const { level: lvl, into, needed } = levelProgress(core.xp);
    if (needed <= 0) return null;
    const xp14 = xpData.reduce((acc, d) => acc + d.xp, 0);
    const activeDays14 = xpData.filter((d) => d.xp > 0).length;
    const perDay = activeDays14 > 0 ? xp14 / activeDays14 : 0;
    if (perDay <= 0) return null;
    const days = Math.ceil((needed - into) / perDay);
    return { perDay: Math.round(perDay), days, level: lvl };
  }, [core.xp, xpData]);

  const hasData = core.stats.totalSessions > 0;
  const avgAccuracy =
    core.stats.totalAnswers > 0
      ? Math.round((core.stats.totalCorrect / core.stats.totalAnswers) * 100)
      : null;

  /** Exactitud por isla (agregada desde los juegos). */
  const skillAccuracy = useMemo(() => {
    const acc: Partial<Record<SkillId, { correct: number; answers: number }>> = {};
    for (const g of gameData) {
      if (g.answers === 0) continue;
      const skill = SKILL_OF_GAME(g.id);
      const cur = (acc[skill] ??= { correct: 0, answers: 0 });
      cur.correct += g.correct;
      cur.answers += g.answers;
      acc[skill] = cur;
    }
    return (Object.keys(acc) as SkillId[])
      .filter((s) => (acc[s]?.answers ?? 0) >= 6)
      .map((s) => ({
        skill: s,
        label: SKILL_LABELS[s],
        pct: Math.round((acc[s]!.correct / Math.max(1, acc[s]!.answers)) * 100),
        color: SKILL_COLORS[s],
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [gameData]);

  return (
    <div>
      <ScreenHeader title="Estadísticas y evolución" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-28">
        {!hasData ? (
          <div className="mt-6">
            <EmptyState
              icon={<ChartColumn />}
              title="Aún no hay datos"
              description="Tu evaluación ya suma XP, pero los gráficos necesitan partidas: juega una misión y aquí florecerá tu evolución completa."
            />
          </div>
        ) : (
          <>
            {/* Tarjetas resumen */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <SummaryCard value={`${core.xp}`} label="XP total" />
              <SummaryCard value={formatPlaytime(core.stats.totalTimeMs ?? 0)} label="Tiempo jugado" />
              <SummaryCard value={avgAccuracy !== null ? `${avgAccuracy}%` : "—"} label="Exactitud global" />
              <SummaryCard value={`${records.bestComboEver}`} label="Mejor combo" />
            </div>

            {/* Récords */}
            <section className="card-aurora mt-3 rounded-3xl border bg-card p-4" aria-labelledby="records-title">
              <h3 id="records-title" className="font-display mb-3 flex items-center gap-2 text-base font-bold">
                <Award className="h-4.5 w-4.5 text-[var(--xp)]" aria-hidden /> Récords del navegante
              </h3>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <RecordRow icon={<Flame className="h-4 w-4" aria-hidden />} label="Mejor día" value={records.bestDay ? `${records.bestDay.xp} XP` : "—"} hint={records.bestDay ? records.bestDay.date : undefined} />
                <RecordRow icon={<Zap className="h-4 w-4" aria-hidden />} label="Combo más largo" value={`${records.bestComboEver} seguidos`} hint="en una sola sesión" />
                <RecordRow icon={<TrendingUp className="h-4 w-4" aria-hidden />} label="Juego favorito" value={records.favorite ? records.favorite.name : "—"} hint={records.favorite ? `${records.favorite.plays} partidas` : undefined} />
                <RecordRow icon={<Timer className="h-4 w-4" aria-hidden />} label="Respuesta media" value={records.avgResponse ? `${records.avgResponse.toFixed(1)} s` : "—"} hint="por pregunta" />
                <RecordRow icon={<Play className="h-4 w-4" aria-hidden />} label="Formatos probados" value={`${records.uniqueGames} / ${GAME_IDS.length}`} hint="minijuegos distintos" />
                <RecordRow icon={<ChartColumn className="h-4 w-4" aria-hidden />} label="Días navegados" value={`${records.activeDays}`} hint="días con actividad" />
                <RecordRow icon={<Droplets className="h-4 w-4" aria-hidden />} label="Tinta ganada" value={`${records.tinta}`} hint={`${records.tintaSpent} gastada en el Bazar`} />
                <RecordRow
                  icon={<MapPin className="h-4 w-4" aria-hidden />}
                  label="Isla más afilada"
                  value={skillAccuracy.length > 0 ? skillAccuracy[0].label : "—"}
                  hint={skillAccuracy.length > 0 ? `${skillAccuracy[0].pct}% de acierto` : undefined}
                />
              </ul>
              {levelProjection && (
                <p className="mt-3 rounded-2xl bg-secondary px-3.5 py-2 text-xs leading-relaxed text-secondary-foreground">
                  A tu ritmo actual ({levelProjection.perDay} XP por día activo), alcanzarás el nivel {levelProjection.level + 1} en
                  unos <strong>{levelProjection.days} {levelProjection.days === 1 ? "día" : "días"}</strong>. El faro avisa: sin prisa,
                  pero sin pausa.
                </p>
              )}
              {records.hardest && records.hardest.answers >= 8 && (
                <p className="mt-3 rounded-2xl bg-secondary px-3.5 py-2 text-xs leading-relaxed text-secondary-foreground">
                  Tu isla más empinada ahora es <strong>{records.hardest.name}</strong> (
                  {Math.round((records.hardest.correct / Math.max(1, records.hardest.answers)) * 100)}% de acierto).
                  ¿Le damos otra vuelta para ablandar la cuesta?
                </p>
              )}
            </section>

            <Tabs value={tab} onValueChange={(v) => { sfx.tap(); setTab(v); }} className="mt-5">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="resumen" className="font-bold">Resumen</TabsTrigger>
                <TabsTrigger value="constancia" className="font-bold">Constancia</TabsTrigger>
                <TabsTrigger value="historial" className="font-bold">Historial</TabsTrigger>
                <TabsTrigger value="patrones" className="font-bold">Patrones</TabsTrigger>
              </TabsList>

              <TabsContent value="resumen" className="mt-4 space-y-6">
                {/* XP por día */}
                <section aria-labelledby="xp-chart-title">
                  <h3 id="xp-chart-title" className="font-display mb-2 text-base font-bold">
                    XP de los últimos 14 días
                  </h3>
                  <div className="card-aurora rounded-3xl border bg-card p-4" style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={xpData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={2} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--popover)",
                            color: "var(--popover-foreground)",
                            border: "1px solid var(--border)",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                          formatter={(v) => [`${v} XP`, "Ganado"]}
                        />
                        <Bar dataKey="xp" fill="var(--xp)" radius={[6, 6, 0, 0]} maxBarSize={26} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Radar de habilidades (7 islas) */}
                <section aria-labelledby="radar-title">
                  <h3 id="radar-title" className="font-display mb-2 text-base font-bold">
                    Nivel por habilidad (de 10) · las 7 islas
                  </h3>
                  <div className="card-aurora rounded-3xl border bg-card p-4" style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius="70%">
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                        <Radar dataKey="nivel" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--popover)",
                            color: "var(--popover-foreground)",
                            border: "1px solid var(--border)",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Exactitud por isla */}
                {skillAccuracy.length > 0 && (
                  <section aria-labelledby="acc-title">
                    <h3 id="acc-title" className="font-display mb-2 text-base font-bold">
                      Exactitud por isla
                    </h3>
                    <div className="space-y-2">
                      {skillAccuracy.map((s) => (
                        <div key={s.skill} className="card-aurora flex items-center gap-3 rounded-2xl border bg-card p-3">
                          <span
                            className="gloss h-3 w-3 shrink-0 rounded-full"
                            style={{ background: s.color, boxShadow: `0 0 8px color-mix(in oklch, ${s.color} 60%, transparent)` }}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="truncate text-sm font-bold">{s.label}</p>
                              <p className="numeric text-xs font-bold text-muted-foreground">{s.pct}%</p>
                            </div>
                            <div className="groove mt-1.5 h-2 overflow-hidden rounded-full">
                              <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${s.pct}%`, background: s.color }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Distribución por juego (top 10) */}
                <section aria-labelledby="games-title">
                  <h3 id="games-title" className="font-display mb-2 text-base font-bold">
                    Minijuegos más jugados
                  </h3>
                  <div className="space-y-2">
                    {gameData.filter((g) => g.plays > 0).slice(0, 10).map((g) => {
                      const maxPlays = Math.max(1, gameData[0].plays);
                      const Icon = getIcon(GAMES[g.id].icon);
                      return (
                        <div key={g.id} className="card-aurora flex items-center gap-3 rounded-2xl border bg-card p-3">
                          <span className="chip-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                            <Icon className="h-4.5 w-4.5" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="truncate text-sm font-bold">{g.name}</p>
                              <p className="numeric shrink-0 text-xs text-muted-foreground">
                                {g.plays} partidas · {g.answers > 0 ? `${Math.round((g.correct / g.answers) * 100)}% acierto` : "sin datos"}
                              </p>
                            </div>
                            <div className="groove mt-1.5 h-2 overflow-hidden rounded-full">
                              <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(g.plays / maxPlays) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="constancia" className="mt-4 space-y-4">
                <section aria-labelledby="heatmap-title">
                  <h3 id="heatmap-title" className="font-display mb-2 text-base font-bold">
                    Mapa de constancia · 16 semanas
                  </h3>
                  <div className="card-aurora rounded-3xl border bg-card p-4">
                    <div
                      className="grid grid-flow-col grid-rows-7 gap-1"
                      role="img"
                      aria-label={`Mapa de calor de actividad: ${records.activeDays} días con juego en los últimos tres meses`}
                    >
                      {heatmap.cells.map((c) => {
                        const intensity = c.xp / heatmap.maxXp;
                        return (
                          <span
                            key={c.key}
                            title={`${c.date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}: ${c.xp} XP`}
                            className="aspect-square w-full rounded-[3px]"
                            style={{
                              background:
                                c.xp === 0
                                  ? "color-mix(in oklch, var(--muted) 70%, transparent)"
                                  : `color-mix(in oklch, var(--xp) ${Math.max(18, Math.round(18 + intensity * 72))}%, var(--muted))`,
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      <span>Hace 16 semanas</span>
                      <span className="flex items-center gap-1">
                        Menos
                        {[0.2, 0.45, 0.7, 1].map((i) => (
                          <span
                            key={i}
                            className="inline-block h-2.5 w-2.5 rounded-[3px]"
                            style={{ background: `color-mix(in oklch, var(--xp) ${i * 100}%, var(--muted))` }}
                            aria-hidden
                          />
                        ))}
                        Más
                      </span>
                      <span>Esta semana</span>
                    </div>
                  </div>
                </section>

                <LexicoBubble
                  compact
                  mood={records.activeDays >= 10 ? "happy" : "idle"}
                  text={
                    records.activeDays >= 10
                      ? "Dieciséis semanas de mapa y sigues dejando huella: la constancia es tu segundo apellido."
                      : "Cada celda encendida es un día que elegiste zarpar. Pinta el mapa a tu ritmo: el mar no tiene prisa."
                  }
                />
              </TabsContent>

              <TabsContent value="historial" className="mt-4">
                <section aria-labelledby="history-title">
                  <h3 id="history-title" className="font-display mb-2 flex items-center gap-2 text-base font-bold">
                    <History className="h-4 w-4" aria-hidden /> Historial de sesiones
                  </h3>
                  {core.sessions.length === 0 ? (
                    <EmptyState icon={<Play />} title="Sin sesiones todavía" description="Tu historial aparecerá aquí tras tu primera partida." />
                  ) : (
                    <ol className="stagger space-y-2">
                      {core.sessions.slice(0, 30).map((s) => (
                        <li key={s.id} className="card-aurora flex items-center gap-3 rounded-2xl border bg-card p-3">
                          <div
                            className={cn(
                              "numeric flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-[10px] font-black leading-none",
                              s.accuracy === null
                                ? "bg-secondary text-secondary-foreground"
                                : s.accuracy >= 0.8
                                  ? "bg-success/15 text-success"
                                  : s.accuracy >= 0.5
                                    ? "bg-[var(--xp)]/20 text-[var(--xp)]"
                                    : "bg-destructive/15 text-destructive",
                            )}
                            aria-hidden
                          >
                            <span className="text-sm">{s.accuracy === null ? `${s.total}` : `${Math.round(s.accuracy * 100)}%`}</span>
                            <span>{s.accuracy === null ? "cards" : "acierto"}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{s.label}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {new Date(s.at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} a las{" "}
                              {new Date(s.at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                              {s.bestCombo >= 3 && ` · combo ${s.bestCombo}`}
                              {` · ${formatPlaytime(s.durationMs)}`}
                            </p>
                          </div>
                          <span className="numeric shrink-0 text-sm font-bold text-[var(--xp)]">+{s.xpEarned} XP</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </TabsContent>

              <TabsContent value="patrones" className="mt-4 space-y-4">
                {/* XP por día de la semana */}
                <section aria-labelledby="weekday-title">
                  <h3 id="weekday-title" className="font-display mb-2 text-base font-bold">
                    ¿Qué día rinde más? · XP por día de la semana
                  </h3>
                  <div className="card-aurora rounded-3xl border bg-card p-4">
                    <div className="grid grid-cols-7 gap-1.5">
                      {(() => {
                        const names = ["L", "M", "X", "J", "V", "S", "D"];
                        const totals = [0, 0, 0, 0, 0, 0, 0];
                        for (const [key, xp] of Object.entries(core.stats.xpByDay)) {
                          const d = new Date(`${key}T12:00:00`);
                          totals[(d.getDay() + 6) % 7] += xp;
                        }
                        const max = Math.max(10, ...totals);
                        return totals.map((xp, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className="flex h-20 w-full items-end justify-center">
                              <div
                                className="w-full rounded-t-md transition-all"
                                style={{
                                  height: `${Math.max(4, (xp / max) * 100)}%`,
                                  background: i >= 5
                                    ? "linear-gradient(180deg, color-mix(in oklch, var(--region-torre) 78%, white 15%), var(--region-torre))"
                                    : "linear-gradient(180deg, color-mix(in oklch, var(--primary) 78%, white 15%), var(--primary))",
                                }}
                                title={`${xp} XP`}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">{names[i]}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </section>

                {/* Hora del día favorita */}
                <section aria-labelledby="hour-title">
                  <h3 id="hour-title" className="font-display mb-2 text-base font-bold">
                    Tu hora del faro · cuándo juegas
                  </h3>
                  <div className="card-aurora rounded-3xl border bg-card p-4">
                    {(() => {
                      const hours = new Array(24).fill(0);
                      for (const s of core.sessions ?? []) hours[new Date(s.at).getHours()]++;
                      const total = core.sessions?.length ?? 0;
                      const peak = hours.indexOf(Math.max(...hours));
                      const morning = hours.slice(6, 12).reduce((a, b) => a + b, 0);
                      const afternoon = hours.slice(12, 19).reduce((a, b) => a + b, 0);
                      const night = hours.slice(19, 24).reduce((a, b) => a + b, 0) + hours.slice(0, 6).reduce((a, b) => a + b, 0);
                      if (total === 0) {
                        return <p className="text-sm text-muted-foreground">Aún sin sesiones: tu patrón horario se dibujará solo.</p>;
                      }
                      const pct = (n: number) => Math.round((n / total) * 100);
                      return (
                        <div className="space-y-2.5">
                          <p className="text-sm leading-snug">
                            Tu hora más activa es <b className="numeric">{peak}:00</b>.{" "}
                            {morning >= afternoon && morning >= night ? "Eres navegante de madrugada 🌅" : afternoon >= night ? "Eres navegante de tardes ☀️" : "Eres navegante nocturno 🌙"}
                          </p>
                          {[
                            { label: "Mañana (6-12)", n: morning },
                            { label: "Tarde (12-19)", n: afternoon },
                            { label: "Noche (19-6)", n: night },
                          ].map((row) => (
                            <div key={row.label} className="flex items-center gap-2">
                              <span className="w-32 shrink-0 text-xs font-bold text-muted-foreground">{row.label}</span>
                              <div className="groove h-2.5 flex-1 overflow-hidden rounded-full">
                                <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct(row.n)}%` }} />
                              </div>
                              <span className="numeric w-10 text-right text-[11px] font-bold text-muted-foreground">{pct(row.n)}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </section>

                {/* Dominio por región */}
                <section aria-labelledby="region-title">
                  <h3 id="region-title" className="font-display mb-2 text-base font-bold">
                    Dominio por región
                  </h3>
                  <div className="card-aurora space-y-2.5 rounded-3xl border bg-card p-4">
                    {REGIONS.map((r) => {
                      let answers = 0;
                      let correct = 0;
                      for (const g of r.games) {
                        const s = core.stats.byGame[g];
                        if (s) { answers += s.answers; correct += s.correct; }
                      }
                      const acc = answers > 0 ? Math.round((correct / answers) * 100) : 0;
                      return (
                        <div key={r.id} className="flex items-center gap-2">
                          <span className="w-36 shrink-0 truncate text-xs font-bold text-muted-foreground">{r.name.replace(" de la ", " · ").replace(" del ", " · ")}</span>
                          <div className="groove h-2.5 flex-1 overflow-hidden rounded-full">
                            <div
                              className="h-full rounded-full transition-[width] duration-500"
                              style={{ width: `${answers > 0 ? acc : 0}%`, background: `var(${r.colorVar})` }}
                            />
                          </div>
                          <span className="numeric w-10 text-right text-[11px] font-bold text-muted-foreground">
                            {answers > 0 ? `${acc}%` : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Taller de Escritura y Salón */}
                <section aria-labelledby="writing-title">
                  <h3 id="writing-title" className="font-display mb-2 text-base font-bold">
                    Taller y Salón de Juegos
                  </h3>
                  <div className="card-aurora grid grid-cols-2 gap-3 rounded-3xl border bg-card p-4 sm:grid-cols-4">
                    <SummaryCard value={`${core.arcade.typing?.bestWpm ?? 0}`} label="PPM récord" />
                    <SummaryCard value={`${core.arcade.typing?.bestAccuracy ?? 0}%`} label="mejor precisión" />
                    <SummaryCard
                      value={String(Object.values(core.arcade.plays ?? {}).reduce((a, b) => a + b, 0))}
                      label="partidas del salón"
                    />
                    <SummaryCard
                      value={String(Object.keys(core.arcade.best ?? {}).length)}
                      label="juegos con récord"
                    />
                  </div>
                </section>

                {/* Ranking de formatos favoritos */}
                <section aria-labelledby="fav-title">
                  <h3 id="fav-title" className="font-display mb-2 text-base font-bold">
                    Tus formatos favoritos
                  </h3>
                  <div className="card-aurora space-y-2 rounded-3xl border bg-card p-4">
                    {(() => {
                      const byPlays = Object.entries(core.stats.byGame ?? {})
                        .map(([id, st]) => ({ id, plays: st.plays, acc: st.answers > 0 ? Math.round((st.correct / st.answers) * 100) : null }))
                        .sort((a, b) => b.plays - a.plays)
                        .slice(0, 6);
                      if (byPlays.length === 0) {
                        return <p className="text-sm text-muted-foreground">Juega algún entrenamiento y aquí nacerá tu podio.</p>;
                      }
                      const max = byPlays[0].plays || 1;
                      return byPlays.map((row, i) => (
                        <div key={row.id} className="flex items-center gap-2">
                          <span className="numeric w-5 shrink-0 text-right text-xs font-black text-muted-foreground">{i + 1}.</span>
                          <span className="w-36 shrink-0 truncate text-xs font-bold">{GAMES[row.id as keyof typeof GAMES]?.name ?? row.id}</span>
                          <div className="groove h-2.5 flex-1 overflow-hidden rounded-full">
                            <div
                              className="h-full rounded-full transition-[width] duration-500"
                              style={{ width: `${(row.plays / max) * 100}%`, background: i === 0 ? "var(--primary)" : "color-mix(in oklch, var(--primary) 60%, var(--muted))" }}
                            />
                          </div>
                          <span className="numeric w-16 shrink-0 text-right text-[11px] font-bold text-muted-foreground">
                            {row.plays} · {row.acc !== null ? `${row.acc}%` : "—"}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </section>

                {/* Riqueza del vocabulario */}
                <section aria-labelledby="vocab-title">
                  <h3 id="vocab-title" className="font-display mb-2 text-base font-bold">
                    Jardín de palabras
                  </h3>
                  <div className="card-aurora grid grid-cols-2 gap-3 rounded-3xl border bg-card p-4 sm:grid-cols-4">
                    <SummaryCard value={String(Object.keys(srs).length)} label="sembradas" />
                    <SummaryCard value={String(Object.values(srs).filter((c) => c.reps >= 2).length)} label="aprendidas" />
                    <SummaryCard value={String(Object.values(srs).filter((c) => c.state === "review" && c.intervalDays >= 21).length)} label="dominadas" />
                    <SummaryCard value={String(core.stats.srsReviewsByDay ? Object.values(core.stats.srsReviewsByDay).reduce((a, b) => a + b, 0) : 0)} label="repasos totales" />
                  </div>
                </section>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}

/* fin */
function RecordRow({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <li className="flex items-center gap-2.5 rounded-2xl bg-muted/50 px-3 py-2">
      <span className="chip-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-primary" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold">{value}</p>
        {hint && <p className="truncate text-[10px] text-muted-foreground">{hint}</p>}
      </div>
    </li>
  );
}

function SummaryCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="gloss card-aurora rounded-2xl border bg-card p-3 text-center">
      <p className="numeric font-display title-sheen truncate text-lg font-bold">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
