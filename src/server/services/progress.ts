/**
 * Servicio de progreso · endpoints #14–18 de 04-api.md.
 *
 * - GET/PUT /progress: espejo del PersistedState con mezcla por secciones
 *   (merge.ts) y 409 conflict_outdated si la base local era más vieja.
 * - POST /progress/import: migración de la bitácora local (una vez,
 *   idempotente; la tinta local entra como entrada MIGRATION del ledger).
 * - POST /progress/events: sesiones jugadas → validación de transcripción
 *   (suelos de tiempo, techos diarios de freeplay), StatDaily y
 *   TintaLedger idempotente por Idempotency-Key.
 * - GET /stats/me: StatDaily + racha oficial (server-side).
 *
 * Ola 1: el replay completo con semilla del servidor llega en la Ola 2
 * (engine/online.ts). Aquí solo suelos/techos/caps de freeplay.
 */

import { prisma } from "@/lib/db";
import { HttpError } from "@/server/http";
import { mergePayload, type ProgressDeltas } from "./merge";
import type { PersistedState } from "@/services/storage";

/* ============================== Constantes anti-trampa ============================== */

/** Tope diario de XP de freeplay que entra en StatDaily (04 §3.1). */
export const FREEPLAY_DAILY_XP_CAP = 150;
/** Tope diario de tinta derivado del tope de XP (1 tinta por 10 XP). */
export const FREEPLAY_DAILY_TINTA_CAP = Math.floor(FREEPLAY_DAILY_XP_CAP / 10);
/** Suelo humano por respuesta (01 §5.3). */
export const MIN_ANSWER_MS = 120;
/** Combo máximo plausible por sesión (01 §5.3: techo conservador). */
export const MAX_COMBO_PLAUSIBLE = 60;
/** Máximo de respuestas por transcripción. */
export const MAX_TRANSCRIPT_ANSWERS = 500;
/** Techo de XP por respuesta (sanidad del resultado reportado). */
export const MAX_XP_PER_ANSWER = 25;

export type EventFlags = Array<"timing_floor" | "implausible_combo" | "duration_mismatch">;

export interface EventSessionInput {
  formatId: string;
  origin: string;
  seed?: string | null;
  durationMs: number;
  transcript: { answers: Array<{ i: number; choice: number; ms: number }> };
  result: { xp: number; correct: number; total: number; bestCombo: number; accuracy?: number };
}

export interface ValidatedEventResult {
  validated: { xp: number; tinta: number; accuracy: number; bestCombo: number };
  statDelta: { day: string; xp: number; answers: number; correct: number };
  flags: EventFlags;
}

/** Clave de día UTC "YYYY-MM-DD" (StatDaily y ledger siempre en UTC). */
export function utcDayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/* ============================== Validación pura (tests) ============================== */

/**
 * Suelos y techos de una transcripción de freeplay · 01 §5.3.
 * - Rechaza (ok:false): estructura imposible (índices fuera de rango,
 *   repetidos, ms negativos, sin respuestas).
 * - Marca flags (ok:true + flags): ms < 120 (timing_floor), combo
 *   implausible, duración menor que la suma de respuestas.
 */
export function validateTranscript(
  session: EventSessionInput,
): { ok: true; flags: EventFlags } | { ok: false; reason: string } {
  const answers = session?.transcript?.answers ?? [];
  if (!Array.isArray(answers) || answers.length === 0) {
    return { ok: false, reason: "La transcripción no tiene respuestas." };
  }
  if (answers.length > MAX_TRANSCRIPT_ANSWERS) {
    return { ok: false, reason: `Máximo ${MAX_TRANSCRIPT_ANSWERS} respuestas por sesión.` };
  }
  const seenIdx = new Set<number>();
  const flags: EventFlags = [];
  let msSum = 0;
  for (const a of answers) {
    if (!a || typeof a.i !== "number" || !Number.isInteger(a.i) || a.i < 0 || a.i >= answers.length) {
      return { ok: false, reason: "Índice de respuesta fuera de rango." };
    }
    if (seenIdx.has(a.i)) {
      return { ok: false, reason: "Respuesta duplicada en la transcripción." };
    }
    seenIdx.add(a.i);
    if (typeof a.ms !== "number" || !Number.isInteger(a.ms) || a.ms < 0 || a.ms > 3_600_000) {
      return { ok: false, reason: "Tiempo de respuesta inválido." };
    }
    if (a.ms < MIN_ANSWER_MS) flags.push("timing_floor");
    msSum += a.ms;
  }
  const result = session.result;
  if (!result || typeof result.xp !== "number" || result.xp < 0) {
    return { ok: false, reason: "Resultado de sesión inválido." };
  }
  if (result.correct < 0 || result.correct > answers.length) {
    return { ok: false, reason: "Número de aciertos imposible." };
  }
  if (result.bestCombo > Math.min(answers.length, MAX_COMBO_PLAUSIBLE)) {
    flags.push("implausible_combo");
  }
  if (session.durationMs < msSum) {
    flags.push("duration_mismatch");
  }
  return { ok: true, flags };
}

/* ============================== Lecturas ============================== */

export interface RemoteProgress {
  version: number;
  payload: PersistedState;
  updatedAt: Date;
}

export async function getProgress(userId: string): Promise<RemoteProgress | null> {
  const state = await prisma.progressState.findUnique({ where: { userId } });
  if (!state) return null;
  return {
    version: state.version,
    payload: state.payload as unknown as PersistedState,
    updatedAt: state.updatedAt,
  };
}

/** Balance de tinta según TintaLedger (server-authoritative). */
export async function tintaBalance(userId: string): Promise<{ balance: number; hasMigration: boolean }> {
  const [agg, migration] = await Promise.all([
    prisma.tintaLedger.aggregate({ where: { userId }, _sum: { delta: true } }),
    prisma.tintaLedger.findUnique({
      where: { userId_refId: { userId, refId: `migration:${userId}` } },
      select: { id: true },
    }),
  ]);
  return { balance: agg._sum.delta ?? 0, hasMigration: Boolean(migration) };
}

/* ============================== Escrituras ============================== */

/** Crea el estado desde el payload local + entrada MIGRATION de tinta (una vez). */
async function createFromPayload(
  userId: string,
  payload: PersistedState,
  source: "first-sync" | "import",
): Promise<void> {
  const tinta = Math.max(0, Math.round(payload?.core?.wallet?.tinta ?? 0));
  await prisma.$transaction([
    prisma.progressState.create({
      data: {
        userId,
        version: payload?.version ?? 1,
        payload: payload as object,
      },
    }),
    prisma.tintaLedger.create({
      data: {
        userId,
        delta: tinta,
        reason: "MIGRATION",
        refId: `migration:${userId}`,
        day: utcDayKey(),
        meta: { source } as object,
      },
    }),
  ]);
}

export interface PutProgressInput {
  baseUpdatedAt?: string | null;
  payload: PersistedState;
  deltas?: ProgressDeltas | null;
}

export interface PutProgressOutcome {
  status: 200 | 409;
  code?: "conflict_outdated";
  merged: PersistedState;
  updatedAt: Date;
  conflicts: string[];
}

/**
 * PUT /progress · 06-sync §3. Mezcla SIEMPRE (200 normal, 409 si la base
 * local era más vieja que el remoto — el cliente adopta el merged igualmente).
 */
export async function putProgress(userId: string, input: PutProgressInput): Promise<PutProgressOutcome> {
  let remote = await getProgress(userId);

  // Carrera de dos PUT simultáneos sin estado: reintenta como merge.
  if (!remote) {
    try {
      await createFromPayload(userId, input.payload, "first-sync");
      const created = await getProgress(userId);
      return {
        status: 200,
        merged: input.payload,
        updatedAt: created?.updatedAt ?? new Date(),
        conflicts: [],
      };
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      remote = await getProgress(userId);
      if (!remote) throw err;
    }
  }

  const { balance, hasMigration } = await tintaBalance(userId);
  const { merged, conflicts } = mergePayload(input.payload, remote.payload, input.deltas ?? null, {
    serverTinta: hasMigration ? balance : undefined,
  });

  const updated = await prisma.progressState.update({
    where: { userId },
    data: { version: merged.version, payload: merged as object },
  });

  const baseMs = input.baseUpdatedAt ? Date.parse(input.baseUpdatedAt) : null;
  const baseOlder =
    baseMs !== null && Number.isFinite(baseMs) && baseMs < remote.updatedAt.getTime();

  if (baseOlder) {
    return { status: 409, code: "conflict_outdated", merged, updatedAt: updated.updatedAt, conflicts };
  }
  return { status: 200, merged, updatedAt: updated.updatedAt, conflicts };
}

/**
 * POST /progress/import · 06-sync §5. Una vez (idempotente): sin estado →
 * crea + MIGRATION; con estado → mergePayload y devuelve el canónico.
 * No otorga XP de ranking (StatDaily no se toca: empieza en 0).
 */
export async function importProgress(
  userId: string,
  payload: PersistedState,
): Promise<{ merged: PersistedState; updatedAt: Date }> {
  let remote = await getProgress(userId);

  if (!remote) {
    try {
      await createFromPayload(userId, payload, "import");
      const created = await getProgress(userId);
      return { merged: payload, updatedAt: created?.updatedAt ?? new Date() };
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      remote = await getProgress(userId);
      if (!remote) throw err;
    }
  }

  const { balance, hasMigration } = await tintaBalance(userId);
  const { merged } = mergePayload(payload, remote.payload, null, {
    serverTinta: hasMigration ? balance : undefined,
  });
  const updated = await prisma.progressState.update({
    where: { userId },
    data: { version: merged.version, payload: merged as object },
  });
  return { merged, updatedAt: updated.updatedAt };
}

/* ============================== Events (#17) ============================== */

/**
 * POST /progress/events · 04 §3.1. Freeplay: valida suelos/techos, aplica
 * el tope diario, escribe StatDaily y TintaLedger idempotente por
 * Idempotency-Key (reintentos de la cola offline no duplican nada).
 */
export async function recordEvent(
  userId: string,
  session: EventSessionInput,
  idempotencyKey?: string | null,
): Promise<ValidatedEventResult> {
  const verdict = validateTranscript(session);
  if (!verdict.ok) {
    throw new HttpError(422, "rejected_invalid_transcript", verdict.reason);
  }
  const flags = verdict.flags;
  const answers = session.transcript.answers;
  const day = utcDayKey();
  const refId = idempotencyKey?.slice(0, 200) || null;

  // Idempotencia: mismo Idempotency-Key ⇒ mismo resultado, sin dobles pagos.
  if (refId) {
    const existing = await prisma.tintaLedger.findUnique({
      where: { userId_refId: { userId, refId } },
    });
    const stored = existing?.meta as { result?: ValidatedEventResult } | undefined;
    if (stored?.result) return stored.result;
  }

  // Tope diario de freeplay sobre StatDaily.
  const today = await prisma.statDaily.findUnique({
    where: { userId_day: { userId, day } },
  });
  const xpToday = today?.xp ?? 0;

  const plausibleXp = Math.min(
    Math.max(0, Math.round(session.result.xp)),
    answers.length * MAX_XP_PER_ANSWER,
  );
  const xpAwarded = Math.max(0, Math.min(plausibleXp, FREEPLAY_DAILY_XP_CAP - xpToday));
  const correct = Math.max(0, Math.min(Math.round(session.result.correct), answers.length));
  const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) / 100 : 0;
  const bestCombo = Math.max(0, Math.min(Math.round(session.result.bestCombo), answers.length));
  const tinta = Math.floor(xpAwarded / 10);

  const result: ValidatedEventResult = {
    validated: { xp: xpAwarded, tinta, accuracy, bestCombo },
    statDelta: { day, xp: xpAwarded, answers: answers.length, correct },
    flags,
  };

  // StatDaily upsert (+byGame fusionado en JS: es Json).
  const byGame = mergeByGame(today?.byGame as Record<string, { plays: number; correct: number }> | undefined, session.formatId, correct);
  await prisma.statDaily.upsert({
    where: { userId_day: { userId, day } },
    create: {
      userId,
      day,
      xp: xpAwarded,
      sessions: 1,
      answers: answers.length,
      correct,
      bestCombo,
      minutes: Math.round(session.durationMs / 60_000),
      byGame,
    },
    update: {
      xp: { increment: xpAwarded },
      sessions: { increment: 1 },
      answers: { increment: answers.length },
      correct: { increment: correct },
      bestCombo: { set: Math.max(today?.bestCombo ?? 0, bestCombo) },
      minutes: { increment: Math.round(session.durationMs / 60_000) },
      byGame,
    },
  });

  // TintaLedger idempotente (carrera de reintentos: unique(userId, refId)).
  try {
    await prisma.tintaLedger.create({
      data: {
        userId,
        delta: tinta,
        reason: "SESSION",
        refId,
        day,
        meta: { result, formatId: session.formatId } as object,
      },
    });
  } catch (err) {
    if (!isUniqueViolation(err) || !refId) throw err;
    const existing = await prisma.tintaLedger.findUnique({
      where: { userId_refId: { userId, refId } },
    });
    const stored = existing?.meta as { result?: ValidatedEventResult } | undefined;
    if (stored?.result) return stored.result;
  }

  // Flags ⇒ strikes (revisión humana después, nunca baneo automático).
  if (flags.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { riskFlags: { increment: flags.length } },
    }).catch(() => null);
  }

  return result;
}

function mergeByGame(
  existing: Record<string, { plays: number; correct: number }> | undefined,
  formatId: string,
  correct: number,
): Record<string, { plays: number; correct: number }> {
  const byGame: Record<string, { plays: number; correct: number }> = {};
  for (const [g, v] of Object.entries(existing ?? {})) {
    byGame[g] = { plays: v?.plays ?? 0, correct: v?.correct ?? 0 };
  }
  const cur = (byGame[formatId] ??= { plays: 0, correct: 0 });
  cur.plays += 1;
  cur.correct += correct;
  return byGame;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    ((err as { code?: string }).code === "P2002" ||
      String((err as { message?: string }).message ?? "").includes("Unique constraint"))
  );
}

/* ============================== Stats (#18) ============================== */

export interface StatDailyDto {
  day: string;
  xp: number;
  sessions: number;
  answers: number;
  correct: number;
  bestCombo: number;
  minutes: number;
}

/** Racha oficial: días consecutivos con xp > 0 hasta hoy (o ayer) en UTC. */
export function officialStreak(days: Array<{ day: string; xp: number }>, today = utcDayKey()): number {
  const played = new Set(days.filter((d) => (d.xp ?? 0) > 0).map((d) => d.day));
  let streak = 0;
  let cursor = new Date(`${today}T00:00:00Z`);
  // Si hoy aún no se ha jugado, la racha puede seguir viva desde ayer.
  if (!played.has(today)) cursor = new Date(cursor.getTime() - 86_400_000);
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!played.has(key)) break;
    streak += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

export async function statsMe(
  userId: string,
  window: "7d" | "30d" = "7d",
): Promise<{ days: StatDailyDto[]; streakOfficial: number }> {
  const n = window === "30d" ? 30 : 7;
  const today = utcDayKey();
  const from = new Date(new Date(`${today}T00:00:00Z`).getTime() - (n - 1) * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const rows = await prisma.statDaily.findMany({
    where: { userId, day: { gte: from } },
    orderBy: { day: "asc" },
  });

  return {
    days: rows.map((r) => ({
      day: r.day,
      xp: r.xp,
      sessions: r.sessions,
      answers: r.answers,
      correct: r.correct,
      bestCombo: r.bestCombo,
      minutes: r.minutes,
    })),
    streakOfficial: officialStreak(rows.map((r) => ({ day: r.day, xp: r.xp })), today),
  };
}
