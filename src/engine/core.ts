import type {
  AnswerRecord,
  GameCore,
  SessionRecord,
  SessionResult,
  SessionSpec,
  SkillId,
} from "@/types";
import { levelFromXp } from "./xp";
import { applySkillDelta } from "./xp";
import { bestComboFrom, completionBonus, itemXp, DAILY_XP_SOFT_CAP } from "./scoring";
import { updateStreak, grantShield } from "./streak";
import { dateKey, weekKey, dailyMissions, weeklyMissions, metricValue, daysOfWeek } from "./missions";
import { ACHIEVEMENTS, LEVEL_ACHIEVEMENTS, ACHIEVEMENTS_BY_ID } from "@/data/achievements";
import { REPEAT_WINDOW_MS } from "./scoring";

/**
 * Núcleo puro del juego: crea el estado inicial y aplica los efectos
 * de completar una sesión. Toda la lógica de progresión vive aquí,
 * de modo que puede probarse con `bun test` sin navegador.
 */

export const SKILL_IDS: SkillId[] = [
  "vocabulario",
  "gramatica",
  "ortografia",
  "lectura",
  "audicion",
  "expresion",
];

const MAX_ERRORS = 120;
const MAX_SESSIONS = 200;
const MAX_ACTIVE_DAYS = 400;

export function createCore(now = Date.now()): GameCore {
  return {
    xp: 0,
    skills: SKILL_IDS.reduce(
      (acc, s) => {
        acc[s] = 2;
        return acc;
      },
      {} as Record<SkillId, number>,
    ),
    stats: {
      totalSessions: 0,
      totalAnswers: 0,
      totalCorrect: 0,
      byGame: {},
      xpByDay: {},
      sessionsByDay: {},
      correctByDay: {},
      gamesByDay: {},
      regionsByDay: {},
      srsReviewsByDay: {},
      comboByDay: {},
      activeDays: [],
      startedAt: now,
    },
    streak: { current: 0, best: 0, lastActiveDay: null, shields: 0 },
    missions: {
      daily: { dateKey: "", claimed: [] },
      weekly: { weekKey: "", claimed: [] },
    },
    achievements: {},
    errors: [],
    seenExercises: {},
    sessions: [],
  };
}

export interface SessionCompleteInput {
  spec: SessionSpec;
  answers: AnswerRecord[];
  /** Duración total de la sesión en ms. */
  durationMs: number;
  now: Date;
  /** Contexto para logros que dependen del SRS. */
  masteredWords: number;
  learnedWords: number;
}

function bumpMap(map: Record<string, string[]>, key: string, value: string) {
  const list = map[key] ?? [];
  if (!list.includes(value)) list.push(value);
  map[key] = list;
}

export function reduceSessionComplete(
  core: GameCore,
  input: SessionCompleteInput,
): { core: GameCore; result: SessionResult } {
  const { spec, answers, durationMs } = input;
  const now = input.now;
  const dayKey = dateKey(now);
  const wKey = weekKey(now);

  // ---------- Copia estructural superficial del núcleo ----------
  const next: GameCore = {
    ...core,
    skills: { ...core.skills },
    stats: {
      ...core.stats,
      byGame: Object.fromEntries(
        Object.entries(core.stats.byGame).map(([k, v]) => [k, { ...v }]),
      ),
      xpByDay: { ...core.stats.xpByDay },
      sessionsByDay: { ...core.stats.sessionsByDay },
      correctByDay: { ...core.stats.correctByDay },
      gamesByDay: Object.fromEntries(Object.entries(core.stats.gamesByDay)),
      regionsByDay: Object.fromEntries(Object.entries(core.stats.regionsByDay)),
      srsReviewsByDay: { ...core.stats.srsReviewsByDay },
      comboByDay: { ...core.stats.comboByDay },
      activeDays: [...core.stats.activeDays],
    },
    streak: { ...core.streak },
    missions: {
      daily: { ...core.missions.daily },
      weekly: { ...core.missions.weekly },
    },
    achievements: { ...core.achievements },
    errors: [...core.errors],
    seenExercises: { ...core.seenExercises },
    sessions: [...core.sessions],
  };

  const levelBefore = levelFromXp(core.xp);
  let xpToday = next.stats.xpByDay[dayKey] ?? 0;

  // ---------- XP por respuesta + habilidades ----------
  let xpTotal = 0;
  let baseSum = 0;
  let comboBonusSum = 0;
  let cappedTotal = 0;
  let combo = 0;

  for (const a of answers) {
    const isCorrect = a.correct === true || (a.correct === null && a.grade && a.grade !== "again");
    if (isCorrect) combo += 1;
    else combo = 0;

    const r = itemXp({
      difficulty: a.difficulty,
      correct: a.correct,
      grade: a.grade,
      timeMs: a.timeMs,
      combo,
      seenRecently: a.wasSeenRecently,
      xpToday: xpToday + xpTotal,
      timed: a.gameId === "trivia" || a.gameId === "sprint",
    });

    xpTotal += r.xp;
    baseSum += r.base;
    comboBonusSum += r.comboBonus;
    cappedTotal += r.capped;

    // Habilidades (solo ejercicios con acierto/fracaso binario).
    if (a.correct !== null) {
      next.skills[a.skill] = applySkillDelta(next.skills[a.skill], a.correct, a.difficulty);
    }

    // Registro de errores.
    if (a.correct === false && a.exercise) {
      next.errors.unshift({
        exerciseId: a.exercise.id,
        type: a.exercise.type,
        skill: a.exercise.skill,
        prompt: a.exercise.prompt,
        userAnswer: a.userAnswer,
        correctAnswer: a.correctAnswer,
        explanation: a.exercise.explanation,
        at: now.getTime(),
      });
      next.errors = next.errors.slice(0, MAX_ERRORS);
    }

    // Contadores por juego.
    const g = (next.stats.byGame[a.gameId] ||= { plays: 0, answers: 0, correct: 0, bestCombo: 0 });
    if (a.kind === "srs") {
      next.stats.srsReviewsByDay[dayKey] = (next.stats.srsReviewsByDay[dayKey] ?? 0) + 1;
      g.answers += 1;
      if (a.grade && a.grade !== "again") g.correct += 1;
    } else {
      g.answers += 1;
      if (a.correct === true) g.correct += 1;
      next.seenExercises[a.itemId] = now.getTime();
    }
    g.bestCombo = Math.max(g.bestCombo, combo);

    // Contadores diarios.
    if (a.correct === true || (a.correct === null && a.grade && a.grade !== "again")) {
      next.stats.correctByDay[dayKey] = (next.stats.correctByDay[dayKey] ?? 0) + 1;
    }
    if (spec.mode !== "placement") {
      bumpMap(next.stats.gamesByDay, dayKey, a.gameId);
    }
  }

  const bestCombo = bestComboFrom(answers);

  // ---------- Bonus de finalización ----------
  const gradable = answers.filter((a) => a.correct !== null);
  const correctCount = gradable.filter((a) => a.correct === true).length;
  const accuracy =
    gradable.length > 0 ? correctCount / gradable.length : null;

  let bonus = 0;
  if (spec.mode !== "placement") {
    bonus = completionBonus(accuracy, gradable.length);
    if (bonus > 0) {
      const overflow = xpToday + xpTotal + bonus - DAILY_XP_SOFT_CAP;
      if (overflow > 0) {
        const reduced = Math.round(overflow / 2);
        cappedTotal += reduced;
        bonus -= reduced;
      }
    }
    xpTotal += bonus;
  }

  // ---------- Contadores globales y diarios ----------
  if (spec.mode !== "placement") {
    next.xp += xpTotal;
    xpToday += xpTotal;
    next.stats.xpByDay[dayKey] = xpToday;
    next.stats.sessionsByDay[dayKey] = (next.stats.sessionsByDay[dayKey] ?? 0) + 1;
    next.stats.comboByDay[dayKey] = Math.max(next.stats.comboByDay[dayKey] ?? 0, bestCombo);
    if (!next.stats.activeDays.includes(dayKey)) next.stats.activeDays.push(dayKey);
    if (next.stats.activeDays.length > MAX_ACTIVE_DAYS) {
      next.stats.activeDays = next.stats.activeDays.slice(-MAX_ACTIVE_DAYS);
    }
    if (spec.regionId) bumpMap(next.stats.regionsByDay, dayKey, spec.regionId);
    // Cada juego presente en la sesión suma una partida jugada.
    const gamesInSession = new Set(answers.map((a) => a.gameId));
    for (const g of gamesInSession) {
      const entry = (next.stats.byGame[g] ||= { plays: 0, answers: 0, correct: 0, bestCombo: 0 });
      entry.plays += 1;
    }
    if (spec.mode === "review") {
      const entry = (next.stats.byGame["review"] ||= { plays: 0, answers: 0, correct: 0, bestCombo: 0 });
      entry.plays += 1;
    }
    // La sesión cuenta como "play" también para misiones de sesión.
    next.stats.totalSessions += 1;
  } else {
    // La evaluación inicial da un pequeño premio fijo (sustituye al XP de ítems).
    xpTotal = 0;
    const placementXp = 15 + correctCount * 3;
    next.xp += placementXp;
    xpTotal += placementXp;
    next.stats.xpByDay[dayKey] = (next.stats.xpByDay[dayKey] ?? 0) + placementXp;
  }

  next.stats.totalAnswers += answers.length;
  next.stats.totalCorrect += answers.filter(
    (a) => a.correct === true || (a.correct === null && a.grade && a.grade !== "again"),
  ).length;

  // ---------- Racha ----------
  let shieldUsed = false;
  if (spec.mode !== "placement") {
    const outcome = updateStreak(next, now);
    next.streak = outcome.streak;
    shieldUsed = outcome.shieldUsed;
  }

  // ---------- Registro de sesión ----------
  const record: SessionRecord = {
    id: `s-${now.getTime()}-${Math.floor(Math.random() * 1e6)}`,
    at: now.getTime(),
    mode: spec.mode,
    label: spec.label,
    regionId: spec.regionId,
    gameId: spec.gameId,
    total: gradable.length || answers.length,
    correct: correctCount,
    accuracy,
    xpEarned: xpTotal,
    durationMs,
    bestCombo,
  };
  if (spec.mode !== "placement") {
    next.sessions.unshift(record);
    next.sessions = next.sessions.slice(0, MAX_SESSIONS);
  }

  // ---------- Misiones: reclamo automático ----------
  const missionsCompleted: string[] = [];
  if (spec.mode !== "placement") {
    // Reinicio de listas al cambiar de día/semana.
    if (next.missions.daily.dateKey !== dayKey) {
      next.missions.daily = { dateKey: dayKey, claimed: [] };
    }
    if (next.missions.weekly.weekKey !== wKey) {
      next.missions.weekly = { weekKey: wKey, claimed: [] };
    }

    const level = levelFromXp(next.xp);
    for (const m of dailyMissions(dayKey, level)) {
      if (next.missions.daily.claimed.includes(m.id)) continue;
      if (metricValue(next, m.metric, { days: [dayKey] }) >= m.target) {
        next.missions.daily.claimed.push(m.id);
        next.xp += m.xpReward;
        xpTotal += m.xpReward;
        missionsCompleted.push(m.id);
      }
    }
    const weekDays = daysOfWeek(now);
    for (const m of weeklyMissions(wKey, level)) {
      if (next.missions.weekly.claimed.includes(m.id)) continue;
      if (metricValue(next, m.metric, { days: weekDays }) >= m.target) {
        next.missions.weekly.claimed.push(m.id);
        next.xp += m.xpReward;
        xpTotal += m.xpReward;
        missionsCompleted.push(m.id);
        if (m.shieldReward) {
          next.streak.shields = grantShield(next);
        }
      }
    }
  }

  // ---------- Logros ----------
  const newAchievements: string[] = [];
  if (spec.mode !== "placement") {
    const levelAfter = levelFromXp(next.xp);
    const ctx = { masteredWords: input.masteredWords, learnedWords: input.learnedWords, now: now.getTime() };

    for (const def of ACHIEVEMENTS) {
      if (next.achievements[def.id]) continue;
      if (def.check(next, ctx)) {
        next.achievements[def.id] = now.getTime();
        next.xp += def.xpReward;
        xpTotal += def.xpReward;
        newAchievements.push(def.id);
      }
    }
    for (const [id, lvl] of Object.entries(LEVEL_ACHIEVEMENTS)) {
      if (next.achievements[id]) continue;
      if (levelAfter >= lvl) {
        next.achievements[id] = now.getTime();
        const def = ACHIEVEMENTS_BY_ID[id];
        const reward = def?.xpReward ?? 40;
        next.xp += reward;
        xpTotal += reward;
        newAchievements.push(id);
      }
    }
  }

  const levelAfter = levelFromXp(next.xp);

  // ---------- Limpieza de vistos hace mucho (> 30 días) ----------
  const monthAgo = now.getTime() - 30 * 86_400_000;
  for (const [id, ts] of Object.entries(next.seenExercises)) {
    if (ts < monthAgo) delete next.seenExercises[id];
  }

  const result: SessionResult = {
    record,
    xpTotal,
    xpBreakdown: { base: baseSum, comboBonus: comboBonusSum, completionBonus: bonus, capped: cappedTotal },
    correctCount,
    totalCount: gradable.length || answers.length,
    accuracy,
    bestCombo,
    leveledUp: levelAfter > levelBefore,
    newLevel: levelAfter,
    newAchievements,
    missionsCompleted,
    shieldUsed,
    answers,
  };

  return { core: next, result };
}

/* ==================== Evaluación inicial ==================== */

/** Prior de habilidad según la experiencia declarada. */
export function experiencePrior(experience: "principiante" | "intermedio" | "avanzado"): number {
  switch (experience) {
    case "principiante":
      return 1.6;
    case "intermedio":
      return 2.6;
    case "avanzado":
      return 3.6;
  }
}

export function computePlacement(
  experience: "principiante" | "intermedio" | "avanzado",
  answers: { skill: SkillId; difficulty: number; correct: boolean }[],
): Record<SkillId, number> {
  const skills = { ...createCore().skills };
  const prior = experiencePrior(experience);
  for (const s of SKILL_IDS) skills[s] = prior;

  for (const a of answers) {
    if (a.correct) {
      skills[a.skill] = Math.min(7, skills[a.skill] + 0.7 + 0.25 * a.difficulty);
    } else {
      skills[a.skill] = Math.max(1, skills[a.skill] - 0.15);
    }
  }
  // Redondeo a 3 decimales.
  for (const s of SKILL_IDS) skills[s] = +skills[s].toFixed(3);
  return skills;
}

export { REPEAT_WINDOW_MS };
