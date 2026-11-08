import type { GameCore, MissionDef, MissionMetric } from "@/types";
import { createRng, hashString } from "./rng";
import { DAILY_TEMPLATES, WEEKLY_TEMPLATES, SHIELD_MISSION_ID, type MissionTemplate } from "@/data/missions";
import { levelFromXp } from "./xp";

/**
 * Motor de misiones diarias y semanales.
 * Generación determinista a partir de la fecha (misma lista todo el día),
 * progreso derivado de los contadores diarios/semanales (sin estado extra).
 * Las misiones se completan solas, pero la recompensa se recoge a mano
 * en el apartado de Misiones (reclamo manual).
 */

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Clave ISO de la semana (lunes como primer día). */
export function weekKey(d: Date): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7; // lunes = 0
  date.setDate(date.getDate() - day + 3); // jueves de la semana ISO
  const isoWeek = isoweekNumber(date);
  return `${date.getFullYear()}-W${`${isoWeek}`.padStart(2, "0")}`;
}

function isoweekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const diff = d.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 86_400_000));
}

/** Días (claves) comprendidos en la semana de la fecha dada. */
export function daysOfWeek(d: Date): string[] {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return dateKey(x);
  });
}

function scaleTarget(range: [number, number], level: number, rng: () => number): number {
  // El objetivo crece ligeramente con el nivel del jugador.
  const t = Math.min(1, (level - 1) / 24);
  const lo = range[0] + Math.floor((range[1] - range[0]) * t * 0.5);
  const hi = range[1] + Math.ceil((range[1] - range[0]) * t * 0.5);
  return lo + Math.floor(rng() * (hi - lo + 1));
}

function materialize(
  templates: MissionTemplate[],
  seed: string,
  count: number,
  level: number,
  prefix: "d" | "w",
): MissionDef[] {
  const rng = createRng(hashString(seed));
  const pool = [...templates];
  const chosen: MissionDef[] = [];
  while (chosen.length < Math.min(count, templates.length) && pool.length) {
    const idx = Math.floor(rng() * pool.length);
    const t = pool.splice(idx, 1)[0];
    const target = t.id === SHIELD_MISSION_ID ? 5 : scaleTarget(t.range, level, rng);
    chosen.push({
      id: `${prefix}-${t.id}`,
      title: t.title(target),
      description: t.description(target),
      icon: t.icon,
      metric: t.metric,
      target,
      xpReward: t.xpReward,
      shieldReward: t.id === SHIELD_MISSION_ID || undefined,
    });
  }
  return chosen;
}

export function dailyMissions(dayKey: string, level: number): MissionDef[] {
  return materialize(DAILY_TEMPLATES, `daily-${dayKey}`, 3, level, "d");
}

export function weeklyMissions(wKey: string, level: number): MissionDef[] {
  return materialize(WEEKLY_TEMPLATES, `weekly-${wKey}`, 3, level, "w");
}

/** Valor actual de cada métrica para el día o la semana en curso. */
export function metricValue(
  core: GameCore,
  metric: MissionMetric,
  scope: { days: string[] },
): number {
  const sum = (fn: (day: string) => number) =>
    scope.days.reduce((acc, day) => acc + fn(day), 0);
  const distinct = (map: Record<string, string[]>) =>
    new Set(scope.days.flatMap((d) => map[d] ?? [])).size;

  switch (metric) {
    case "sessions":
      return sum((d) => core.stats.sessionsByDay[d] ?? 0);
    case "correct":
      return sum((d) => core.stats.correctByDay[d] ?? 0);
    case "xp":
      return sum((d) => core.stats.xpByDay[d] ?? 0);
    case "tinta":
      // Tinta aproximada ganada: 1 por cada 10 XP del periodo.
      return sum((d) => Math.floor((core.stats.xpByDay[d] ?? 0) / 10));
    case "games":
      return distinct(core.stats.gamesByDay);
    case "regions":
      return distinct(core.stats.regionsByDay);
    case "combo":
      return Math.max(0, ...scope.days.map((d) => core.stats.comboByDay[d] ?? 0));
    case "srsReviews":
      return sum((d) => core.stats.srsReviewsByDay[d] ?? 0);
    case "activeDays":
      return scope.days.filter((d) => (core.stats.sessionsByDay[d] ?? 0) > 0).length;
  }
}

export interface MissionProgress {
  mission: MissionDef;
  current: number;
  target: number;
  done: boolean;
  claimed: boolean;
  isShieldMission: boolean;
}

export function dailyProgress(core: GameCore, dayKey: string): MissionProgress[] {
  const level = levelFromXp(core.xp);
  const missions = dailyMissions(dayKey, level);
  return missions.map((m) => {
    const current = metricValue(core, m.metric, { days: [dayKey] });
    return {
      mission: m,
      current: Math.min(current, m.target),
      target: m.target,
      done: current >= m.target,
      claimed: core.missions.daily.claimed.includes(m.id),
      isShieldMission: false,
    };
  });
}

export function weeklyProgress(core: GameCore, wKey: string, days: string[]): MissionProgress[] {
  const level = levelFromXp(core.xp);
  const missions = weeklyMissions(wKey, level);
  return missions.map((m) => {
    const current = metricValue(core, m.metric, { days });
    return {
      mission: m,
      current: Math.min(current, m.target),
      target: m.target,
      done: current >= m.target,
      claimed: core.missions.weekly.claimed.includes(m.id),
      isShieldMission: Boolean(m.shieldReward),
    };
  });
}
