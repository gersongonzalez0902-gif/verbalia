/**
 * Mezcla de estados de progreso · 06-sync-progreso.md §3.
 *
 * `mergePayload(local, remote, deltas)` — FUNCIÓN PURA (sin IO, sin reloj
 * propio: `now` se inyecta para tests). Es la ÚNICA autoridad de mezcla:
 * la usan PUT /progress, POST /progress/import y los tests.
 *
 * Políticas por sección (tabla de 06 §3):
 * - core.xp                     → max
 * - core.stats (contadores)     → suma de deltas / max si no hay delta
 * - bestComboEver, streak.best  → max
 * - core.achievements           → unión, timestamp mínimo
 * - core.srs                    → LWW por tarjeta (updatedAt de tarjeta)
 * - core.wallet.tinta           → server-authoritative (serverTinta del ledger)
 * - core.missions               → LWW por dayKey/weekKey (mismo día: unión de claimed)
 * - core.errors, seenExercises  → unión (recorte a límites actuales)
 * - profile, settings           → LWW global (savedAt decide)
 * - sessions                    → unión por id, recorte al máximo actual
 *
 * Regla de oro: el resultado es SIEMPRE un estado válido y mezclado
 * (nunca se pierde un logro ni baja el XP); el cliente solo lo adopta.
 */

import type {
  ErrorRecord,
  GameCore,
  PlayerProfile,
  SessionRecord,
  SrsCard,
} from "@/types";
import {
  MAX_ACTIVE_DAYS,
  MAX_ERRORS,
  MAX_SESSIONS,
  SEEN_WINDOW_MS,
} from "@/engine/core";
import type { PersistedState } from "@/services/storage";

/* ============================== Contrato ============================== */

/** Deltas de stats desde baseUpdatedAt (lo que creció el cliente). */
export interface ProgressDeltas {
  /** Por día (YYYY-MM-DD): crecimiento de los mapas por día. */
  stats?: Record<string, { xp?: number; correct?: number; sessions?: number }>;
  /** Contadores globales: crecimiento de los escalares. */
  scalars?: {
    totalAnswers?: number;
    totalCorrect?: number;
    totalSessions?: number;
    totalTimeMs?: number;
    answerTimeSumMs?: number;
  };
}

export interface MergeOptions {
  /** Balance de tinta según TintaLedger (server-authoritative). */
  serverTinta?: number;
  /** Reloj inyectable para tests. */
  now?: number;
}

export interface MergeResult {
  merged: PersistedState;
  /** Secciones cuyo valor final difiere del payload local entrante. */
  conflicts: string[];
}

/* ============================== Utilidades ============================== */

/** Clona por JSON: el payload ya vive en JSON (IndexedDB / JsonB). */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function maxNumber(...vals: Array<number | undefined>): number {
  let m = 0;
  for (const v of vals) m = Math.max(m, typeof v === "number" && Number.isFinite(v) ? v : 0);
  return m;
}

/** Marca de tiempo efectiva de una tarjeta SRS (compat: sin updatedAt). */
function cardTs(card: SrsCard): number {
  return card.updatedAt ?? card.lastReviewedAt ?? card.introducedAt ?? 0;
}

const EMPTY_STATS = (): GameCore["stats"] => ({
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
  startedAt: 0,
  totalTimeMs: 0,
  answerTimeSumMs: 0,
  bestComboEver: 0,
  uniqueGames: [],
});

/* ============================== Núcleo ============================== */

export function mergePayload(
  local: PersistedState,
  remote: PersistedState | null,
  deltas: ProgressDeltas | null,
  options: MergeOptions = {},
): MergeResult {
  const now = options.now ?? Date.now();

  // Sin estado en el barco: el local se adopta tal cual (primera sincronización).
  if (!remote) {
    const adopted = clone(local);
    return { merged: adopted, conflicts: [] };
  }

  const l = local;
  const r = remote;
  const lCore = l.core ?? ({} as GameCore);
  const rCore = r.core ?? ({} as GameCore);
  const lStats = lCore.stats ?? EMPTY_STATS();
  const rStats = rCore.stats ?? EMPTY_STATS();
  // LWW global por savedAt (empate ⇒ gana el local entrante).
  const localNewer = (l.savedAt ?? 0) >= (r.savedAt ?? 0);

  const merged: PersistedState = {
    version: Math.max(l.version ?? 1, r.version ?? 1),
    profile: (localNewer ? clone(l.profile) : clone(r.profile)) as PlayerProfile,
    settings: clone(localNewer ? (l.settings ?? r.settings) : (r.settings ?? l.settings)),
    savedAt: Math.max(l.savedAt ?? 0, r.savedAt ?? 0, now),
    core: {} as GameCore,
    srs: {},
  };

  /* ---------- XP y habilidades (max) ---------- */
  const core: GameCore = merged.core;
  core.xp = maxNumber(lCore.xp, rCore.xp);
  const skills: Record<string, number> = { ...clone(rCore.skills ?? {}) };
  for (const [k, v] of Object.entries(lCore.skills ?? {})) {
    skills[k] = Math.max(skills[k] ?? 0, v ?? 0);
  }
  core.skills = skills as GameCore["skills"];

  /* ---------- stats: contadores por día (suma de deltas / max) ---------- */
  const dayStats = deltas?.stats ?? null;
  const scalarDeltas = deltas?.scalars ?? null;

  function mergeDayNumberMap(
    lMap: Record<string, number> | undefined,
    rMap: Record<string, number> | undefined,
    deltaPicker: (d: { xp?: number; correct?: number; sessions?: number }) => number | undefined,
  ): Record<string, number> {
    const out: Record<string, number> = {};
    const days = new Set([
      ...Object.keys(lMap ?? {}),
      ...Object.keys(rMap ?? {}),
      ...Object.keys(dayStats ?? {}),
    ]);
    for (const day of days) {
      const delta = dayStats?.[day] ? deltaPicker(dayStats[day]) : undefined;
      if (typeof delta === "number") {
        // Suma de deltas sobre lo que tiene el barco (06 §3).
        out[day] = (rMap?.[day] ?? 0) + Math.max(0, delta);
      } else {
        // Sin delta calculable ⇒ max (dispositivo sin base o día heredado).
        out[day] = Math.max(lMap?.[day] ?? 0, rMap?.[day] ?? 0);
      }
    }
    return out;
  }

  const stats = EMPTY_STATS();
  stats.xpByDay = mergeDayNumberMap(lStats.xpByDay, rStats.xpByDay, (d) => d.xp);
  stats.correctByDay = mergeDayNumberMap(lStats.correctByDay, rStats.correctByDay, (d) => d.correct);
  stats.sessionsByDay = mergeDayNumberMap(lStats.sessionsByDay, rStats.sessionsByDay, (d) => d.sessions);
  stats.comboByDay = mergeDayNumberMap(lStats.comboByDay, rStats.comboByDay, () => undefined);
  stats.srsReviewsByDay = mergeDayNumberMap(lStats.srsReviewsByDay, rStats.srsReviewsByDay, () => undefined);

  // Contadores globales: delta ⇒ suma; sin delta ⇒ max.
  stats.totalAnswers = applyScalar(lStats.totalAnswers, rStats.totalAnswers, scalarDeltas?.totalAnswers);
  stats.totalCorrect = applyScalar(lStats.totalCorrect, rStats.totalCorrect, scalarDeltas?.totalCorrect);
  stats.totalSessions = applyScalar(lStats.totalSessions, rStats.totalSessions, scalarDeltas?.totalSessions);
  stats.totalTimeMs = applyScalar(lStats.totalTimeMs, rStats.totalTimeMs, scalarDeltas?.totalTimeMs);
  stats.answerTimeSumMs = applyScalar(lStats.answerTimeSumMs, rStats.answerTimeSumMs, scalarDeltas?.answerTimeSumMs);
  stats.bestComboEver = maxNumber(lStats.bestComboEver, rStats.bestComboEver);
  stats.startedAt =
    Math.min(
      lStats.startedAt && rStats.startedAt
        ? Math.min(lStats.startedAt, rStats.startedAt)
        : (lStats.startedAt || rStats.startedAt || now),
      now,
    ) || now;

  // uniqueGames: unión.
  stats.uniqueGames = [...new Set([...(lStats.uniqueGames ?? []), ...(rStats.uniqueGames ?? [])])];

  // activeDays: unión, ordenada, últimos MAX_ACTIVE_DAYS.
  const daysSet = new Set([
    ...(lStats.activeDays ?? []),
    ...(rStats.activeDays ?? []),
    ...Object.keys(stats.xpByDay),
  ]);
  stats.activeDays = [...daysSet].sort().slice(-MAX_ACTIVE_DAYS);

  // gamesByDay / regionsByDay: unión de listas por día.
  stats.gamesByDay = mergeDayListMap(lStats.gamesByDay, rStats.gamesByDay);
  stats.regionsByDay = mergeDayListMap(lStats.regionsByDay, rStats.regionsByDay);

  // byGame: max campo a campo (contadores que solo crecen).
  const byGame: Record<string, { plays: number; answers: number; correct: number; bestCombo: number }> = {};
  for (const [g, entry] of Object.entries(rStats.byGame ?? {})) {
    byGame[g] = { plays: entry?.plays ?? 0, answers: entry?.answers ?? 0, correct: entry?.correct ?? 0, bestCombo: entry?.bestCombo ?? 0 };
  }
  for (const [g, entry] of Object.entries(lStats.byGame ?? {})) {
    const cur = (byGame[g] ??= { plays: 0, answers: 0, correct: 0, bestCombo: 0 });
    cur.plays = Math.max(cur.plays, entry?.plays ?? 0);
    cur.answers = Math.max(cur.answers, entry?.answers ?? 0);
    cur.correct = Math.max(cur.correct, entry?.correct ?? 0);
    cur.bestCombo = Math.max(cur.bestCombo, entry?.bestCombo ?? 0);
  }
  stats.byGame = byGame;
  core.stats = stats;

  /* ---------- racha ---------- */
  const lStreak = lCore.streak ?? { current: 0, best: 0, lastActiveDay: null, shields: 0 };
  const rStreak = rCore.streak ?? { current: 0, best: 0, lastActiveDay: null, shields: 0 };
  // La rama con el último día activo más reciente gana current/lastActiveDay.
  const lDay = lStreak.lastActiveDay ?? "";
  const rDay = rStreak.lastActiveDay ?? "";
  const streakFrom = lDay >= rDay ? lStreak : rStreak;
  core.streak = {
    current: maxNumber(streakFrom.current),
    best: maxNumber(lStreak.best, rStreak.best),
    lastActiveDay: streakFrom.lastActiveDay ?? null,
    shields: Math.max(lStreak.shields ?? 0, rStreak.shields ?? 0),
  };

  /* ---------- misiones: LWW por dayKey/weekKey (mismo periodo: unión) ---------- */
  core.missions = {
    daily: mergeMissions(lCore.missions?.daily, rCore.missions?.daily, "dateKey") as GameCore["missions"]["daily"],
    weekly: mergeMissions(lCore.missions?.weekly, rCore.missions?.weekly, "weekKey") as GameCore["missions"]["weekly"],
  };

  /* ---------- logros: unión con timestamp mínimo ---------- */
  const achievements: Record<string, number> = { ...clone(rCore.achievements ?? {}) };
  for (const [id, ts] of Object.entries(lCore.achievements ?? {})) {
    const prev = achievements[id];
    achievements[id] = typeof prev === "number" ? Math.min(prev, ts ?? 0) : (ts ?? 0);
  }
  core.achievements = achievements;
  core.achievementsClaimed = [
    ...new Set([...(lCore.achievementsClaimed ?? []), ...(rCore.achievementsClaimed ?? [])]),
  ];

  /* ---------- errores y ejercicios vistos: unión acotada ---------- */
  core.errors = mergeErrors(lCore.errors ?? [], rCore.errors ?? []);
  core.seenExercises = mergeSeen(lCore.seenExercises ?? {}, rCore.seenExercises ?? {}, now);

  /* ---------- historial de sesiones: unión por id, recorte ---------- */
  const sessionsById = new Map<string, SessionRecord>();
  for (const s of [...(rCore.sessions ?? []), ...(lCore.sessions ?? [])]) {
    if (s?.id) sessionsById.set(s.id, s); // local pisa al remoto en colisión de id
  }
  core.sessions = [...sessionsById.values()]
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0))
    .slice(0, MAX_SESSIONS);

  /* ---------- wallet: tinta server-authoritative, resto unión/max ---------- */
  const emptyWallet = { tinta: 0, owned: [], frame: "frame-none", title: "title-none", spent: 0, lastGiftDay: "" };
  const lWallet = lCore.wallet ?? emptyWallet;
  const rWallet = rCore.wallet ?? emptyWallet;
  core.wallet = {
    tinta:
      typeof options.serverTinta === "number"
        ? Math.max(0, Math.round(options.serverTinta))
        : Math.max(lWallet.tinta ?? 0, rWallet.tinta ?? 0),
    owned: [...new Set([...(lWallet.owned ?? []), ...(rWallet.owned ?? [])])],
    frame: localNewer ? lWallet.frame : rWallet.frame,
    title: localNewer ? lWallet.title : rWallet.title,
    spent: Math.max(lWallet.spent ?? 0, rWallet.spent ?? 0),
    lastGiftDay: (lWallet.lastGiftDay ?? "") >= (rWallet.lastGiftDay ?? "") ? (lWallet.lastGiftDay ?? "") : (rWallet.lastGiftDay ?? ""),
  };

  /* ---------- salón (arcade): max/unión campo a campo ---------- */
  core.arcade = mergeArcade(lCore.arcade, rCore.arcade);

  /* ---------- SRS: LWW por tarjeta ---------- */
  const srs: Record<string, SrsCard> = {};
  for (const [wordId, card] of Object.entries(r.srs ?? {})) {
    if (card) srs[wordId] = card;
  }
  for (const [wordId, card] of Object.entries(l.srs ?? {})) {
    if (!card) continue;
    const remoteCard = srs[wordId];
    if (!remoteCard || cardTs(card) >= cardTs(remoteCard)) srs[wordId] = card;
  }
  merged.srs = srs;

  /* ---------- conflictos: secciones que difieren del local entrante ---------- */
  const conflicts: string[] = [];
  const sectionChecks: Array<[string, unknown, unknown]> = [
    ["xp", core.xp, lCore.xp],
    ["skills", core.skills, lCore.skills],
    ["stats", core.stats, lStats],
    ["streak", core.streak, lCore.streak],
    ["missions", core.missions, lCore.missions],
    ["achievements", core.achievements, lCore.achievements],
    ["errors", core.errors, lCore.errors],
    ["seenExercises", core.seenExercises, lCore.seenExercises],
    ["sessions", core.sessions, lCore.sessions],
    ["wallet", core.wallet, lCore.wallet],
    ["arcade", core.arcade, lCore.arcade],
    ["srs", merged.srs, l.srs],
    ["profile", merged.profile, l.profile],
    ["settings", merged.settings, l.settings],
  ];
  for (const [name, mergedValue, localValue] of sectionChecks) {
    if (!sameJson(mergedValue, localValue ?? null)) conflicts.push(name);
  }

  return { merged, conflicts };
}

/* ============================== Ayudantes ============================== */

function applyScalar(local: number | undefined, remote: number | undefined, delta: number | undefined): number {
  if (typeof delta === "number" && Number.isFinite(delta)) {
    return Math.max(0, (remote ?? 0) + Math.max(0, delta));
  }
  return maxNumber(local, remote);
}

function mergeDayListMap(
  lMap: Record<string, string[]> | undefined,
  rMap: Record<string, string[]> | undefined,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const days = new Set([...Object.keys(lMap ?? {}), ...Object.keys(rMap ?? {})]);
  for (const day of days) {
    out[day] = [...new Set([...(rMap?.[day] ?? []), ...(lMap?.[day] ?? [])])];
  }
  return out;
}

/** Misiones: gana el periodo más reciente; mismo periodo: unión de claimed. */
function mergeMissions(
  lMission: GameCore["missions"]["daily"] | GameCore["missions"]["weekly"] | undefined,
  rMission: GameCore["missions"]["daily"] | GameCore["missions"]["weekly"] | undefined,
  key: "dateKey" | "weekKey",
): GameCore["missions"]["daily"] | GameCore["missions"]["weekly"] {
  const l = (lMission ?? { claimed: [] }) as GameCore["missions"]["daily"];
  const r = (rMission ?? { claimed: [] }) as GameCore["missions"]["daily"];
  const lKey = String((l as unknown as Record<string, string>)[key] ?? "");
  const rKey = String((r as unknown as Record<string, string>)[key] ?? "");
  if (lKey !== rKey) {
    // Periodo distinto: LWW por la clave (gana el más reciente).
    const winner = lKey > rKey ? l : r;
    return { ...winner, claimed: [...winner.claimed] };
  }
  // Mismo periodo: unión de claims (nunca se puede reclamar dos veces).
  const base = lKey >= rKey ? l : r;
  return { ...base, claimed: [...new Set([...r.claimed, ...l.claimed])] };
}

/** Errores: unión por (exerciseId + at), más recientes primero, recorte a MAX_ERRORS. */
function mergeErrors(l: ErrorRecord[], r: ErrorRecord[]): ErrorRecord[] {
  const seen = new Set<string>();
  const out: ErrorRecord[] = [];
  for (const e of [...r, ...l]) {
    if (!e?.exerciseId) continue;
    const key = `${e.exerciseId}@${e.at}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out.sort((a, b) => (b.at ?? 0) - (a.at ?? 0)).slice(0, MAX_ERRORS);
}

/** seenExercises: unión por id con el visto más reciente; ventana de 30 días. */
function mergeSeen(
  l: Record<string, number>,
  r: Record<string, number>,
  now: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  const cutoff = now - SEEN_WINDOW_MS;
  for (const id of new Set([...Object.keys(r), ...Object.keys(l)])) {
    const best = Math.max(r[id] ?? 0, l[id] ?? 0);
    if (best >= cutoff) out[id] = best;
  }
  return out;
}

/** Salón de juegos: máximos por juego, unión de desbloqueos. */
function mergeArcade(
  l: GameCore["arcade"] | undefined,
  r: GameCore["arcade"] | undefined,
): GameCore["arcade"] {
  const base = {
    unlocked: [] as string[],
    best: {} as Record<string, number>,
    plays: {} as Record<string, number>,
    playsByDay: {} as Record<string, number>,
    xpEarned: 0,
    typing: { bestWpm: 0, bestAccuracy: 0, testsDone: 0, totalWords: 0, streak: 0, lastDay: "", drillsDone: 0 },
  };
  const lArc = l ?? base;
  const rArc = r ?? base;
  const best: Record<string, number> = {};
  const plays: Record<string, number> = {};
  const playsByDay: Record<string, number> = {};
  for (const [g, v] of Object.entries(rArc.best ?? {})) best[g] = v ?? 0;
  for (const [g, v] of Object.entries(lArc.best ?? {})) best[g] = Math.max(best[g] ?? 0, v ?? 0);
  for (const [g, v] of Object.entries(rArc.plays ?? {})) plays[g] = v ?? 0;
  for (const [g, v] of Object.entries(lArc.plays ?? {})) plays[g] = Math.max(plays[g] ?? 0, v ?? 0);
  for (const [d, v] of Object.entries(rArc.playsByDay ?? {})) playsByDay[d] = v ?? 0;
  for (const [d, v] of Object.entries(lArc.playsByDay ?? {})) playsByDay[d] = Math.max(playsByDay[d] ?? 0, v ?? 0);
  const lT = lArc.typing ?? base.typing;
  const rT = rArc.typing ?? base.typing;
  return {
    unlocked: [...new Set([...(rArc.unlocked ?? []), ...(lArc.unlocked ?? [])])],
    best,
    plays,
    playsByDay,
    xpEarned: Math.max(lArc.xpEarned ?? 0, rArc.xpEarned ?? 0),
    typing: {
      bestWpm: Math.max(lT.bestWpm ?? 0, rT.bestWpm ?? 0),
      bestAccuracy: Math.max(lT.bestAccuracy ?? 0, rT.bestAccuracy ?? 0),
      testsDone: Math.max(lT.testsDone ?? 0, rT.testsDone ?? 0),
      totalWords: Math.max(lT.totalWords ?? 0, rT.totalWords ?? 0),
      streak: Math.max(lT.streak ?? 0, rT.streak ?? 0),
      lastDay: (lT.lastDay ?? "") >= (rT.lastDay ?? "") ? (lT.lastDay ?? "") : (rT.lastDay ?? ""),
      drillsDone: Math.max(lT.drillsDone ?? 0, rT.drillsDone ?? 0),
    },
  };
}
