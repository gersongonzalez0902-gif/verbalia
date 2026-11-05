"use client";

/**
 * Estadísticas y evolución · XP por día, radar de habilidades,
 * distribución de juegos y fichas de sesión (historial completo).
 */

import { useMemo, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { EmptyState } from "@/components/game/widgets";
import { cefrFromSkill } from "@/engine/xp";
import { SKILL_LABELS } from "@/data/regions";
import { GAMES, GAME_IDS } from "@/data/games";
import { dateKey } from "@/engine/missions";
import { getIcon } from "@/components/game/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartColumn, History, Play } from "lucide-react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;

export function StatsScreen() {
  const core = useGameStore((s) => s.core);
  const [tab, setTab] = useState("resumen");

  // XP de los últimos 14 días (incluye días sin actividad).
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
      (["vocabulario", "gramatica", "ortografia", "lectura", "audicion", "expresion"] as const).map((s) => ({
        skill: SKILL_LABELS[s],
        nivel: +core.skills[s].toFixed(1),
        cefr: cefrFromSkill(core.skills[s]),
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
      })),
    [core.stats.byGame],
  );

  const hasData = core.stats.totalSessions > 0;
  const avgAccuracy =
    core.stats.totalAnswers > 0
      ? Math.round((core.stats.totalCorrect / core.stats.totalAnswers) * 100)
      : null;

  return (
    <div>
      <ScreenHeader title="Estadísticas y evolución" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-10">
        {!hasData ? (
          <div className="mt-6">
            <EmptyState
              icon={<ChartColumn />}
              title="Aún no hay datos"
              description="Completa tu primera sesión y aquí verás tu evolución: XP por día, habilidades y todas tus partidas."
            />
          </div>
        ) : (
          <>
            {/* Tarjetas resumen */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <SummaryCard value={`${core.xp}`} label="XP total" />
              <SummaryCard value={`${core.stats.totalSessions}`} label="Sesiones" />
              <SummaryCard value={avgAccuracy !== null ? `${avgAccuracy}%` : "—"} label="Exactitud global" />
            </div>

            <Tabs value={tab} onValueChange={(v) => { sfx.tap(); setTab(v); }} className="mt-5">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resumen" className="font-bold">Resumen</TabsTrigger>
                <TabsTrigger value="historial" className="font-bold">Historial</TabsTrigger>
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

                {/* Radar de habilidades */}
                <section aria-labelledby="radar-title">
                  <h3 id="radar-title" className="font-display mb-2 text-base font-bold">
                    Nivel por habilidad (de 10) · estimación orientativa
                  </h3>
                  <div className="card-aurora rounded-3xl border bg-card p-4" style={{ height: 230 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius="72%">
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
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

                {/* Distribución por juego */}
                <section aria-labelledby="games-title">
                  <h3 id="games-title" className="font-display mb-2 text-base font-bold">
                    Actividad por minijuego
                  </h3>
                  <div className="space-y-2">
                    {gameData.map((g) => {
                      const maxPlays = Math.max(1, ...gameData.map((x) => x.plays));
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
                            </p>
                          </div>
                          <span className="numeric shrink-0 text-sm font-bold text-[var(--xp)]">+{s.xpEarned} XP</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="gloss card-aurora rounded-2xl border bg-card p-3 text-center">
      <p className="numeric font-display title-sheen text-xl font-bold">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
