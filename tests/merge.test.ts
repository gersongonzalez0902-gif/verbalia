/**
 * Pruebas del merge de progreso + validación anti-trampa · `bun test`.
 *
 * Regla de oro del repo: todo lo que decide merge de estados, XP validado
 * o tinta es FUNCIÓN PURA testeada (09-integracion.md §6).
 * Escenarios de 06-sync-progreso.md §3: dos dispositivos, offline largo,
 * logro duplicado, tarjeta SRS conflictiva, import sobre cuenta existente,
 * wallet en conflicto, misiones de dos días, deltas, recortes, pureza.
 */

import { describe, expect, test } from "bun:test";
import { mergePayload, type ProgressDeltas } from "@/server/services/merge";
import {
  validateTranscript,
  officialStreak,
  FREEPLAY_DAILY_XP_CAP,
  type EventSessionInput,
} from "@/server/services/progress";
import {
  backoffDelayMs,
  computeDeltas,
  isDeadLetter,
  nextAttemptAt,
  snapshotOfStats,
  type PersistedState,
  type SyncQueueItem,
} from "@/services/storage";
import { createCore } from "@/engine/core";
import type { GameCore, PlayerProfile, SrsCard } from "@/types";

/* ============================== Fábricas ============================== */

const NOW = Date.UTC(2026, 10, 11, 12, 0, 0); // 2026-11-11T12:00:00Z (fijo)

function profile(name: string): PlayerProfile {
  return {
    name,
    avatar: "preset:buhito",
    goal: "fluir",
    experience: "principiante",
    gender: "x",
    bio: "",
    banner: "preset:aurora",
    photo: "",
    featuredBadge: "",
    createdAt: 1_000,
    onboarded: true,
    placementDone: true,
  };
}

function card(wordId: string, ts: number, extra: Partial<SrsCard> = {}): SrsCard {
  return {
    wordId,
    ease: 2.5,
    intervalDays: 3,
    reps: 2,
    lapses: 0,
    dueAt: ts + 86_400_000,
    introducedAt: ts - 1000,
    lastReviewedAt: ts,
    state: "review",
    updatedAt: ts,
    ...extra,
  };
}

function state(overrides: {
  core?: Partial<GameCore>;
  srs?: Record<string, SrsCard>;
  savedAt?: number;
  profileName?: string;
}): PersistedState {
  return {
    version: 1,
    profile: profile(overrides.profileName ?? "Marina"),
    settings: { sound: true, textSize: "md" } as PersistedState["settings"],
    core: { ...createCore(NOW), ...overrides.core } as GameCore,
    srs: overrides.srs ?? {},
    savedAt: overrides.savedAt ?? NOW,
  };
}

/* ============================== Merge ============================== */

describe("mergePayload · primera sincronización", () => {
  test("sin estado remoto: adopta el local tal cual y no reporta conflictos", () => {
    const local = state({ core: { xp: 500 } });
    const { merged, conflicts } = mergePayload(local, null, null, { now: NOW });
    expect(merged.core.xp).toBe(500);
    expect(conflicts).toEqual([]);
  });
});

describe("mergePayload · XP y contadores (dos dispositivos)", () => {
  test("core.xp nunca baja: max de las ramas", () => {
    const local = state({ core: { xp: 800 }, savedAt: NOW });
    const remote = state({ core: { xp: 1000 }, savedAt: NOW - 1000 });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.core.xp).toBe(1000);
  });

  test("sin deltas (offline largo): contadores globales y por día a max", () => {
    const local = state({
      core: {
        xp: 120,
        stats: {
          ...createCore(NOW).stats,
          totalAnswers: 40,
          totalCorrect: 30,
          xpByDay: { "2026-11-11": 120 },
        },
      },
    });
    const remote = state({
      core: {
        xp: 100,
        stats: {
          ...createCore(NOW).stats,
          totalAnswers: 50,
          totalCorrect: 20,
          xpByDay: { "2026-11-11": 100, "2026-11-10": 90 },
        },
      },
    });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.core.stats.totalAnswers).toBe(50);
    expect(merged.core.stats.totalCorrect).toBe(30);
    expect(merged.core.stats.xpByDay["2026-11-11"]).toBe(120);
    expect(merged.core.stats.xpByDay["2026-11-10"]).toBe(90);
  });

  test("con deltas: el día del delta SUMA sobre el remoto; los demás a max", () => {
    const local = state({
      core: {
        stats: {
          ...createCore(NOW).stats,
          xpByDay: { "2026-11-11": 150 },
          correctByDay: { "2026-11-11": 10 },
        },
      },
    });
    const remote = state({
      core: {
        stats: {
          ...createCore(NOW).stats,
          xpByDay: { "2026-11-11": 100, "2026-11-09": 40 },
        },
      },
    });
    const deltas: ProgressDeltas = {
      stats: { "2026-11-11": { xp: 50, correct: 10, sessions: 1 } },
      scalars: { totalAnswers: 12 },
    };
    const { merged } = mergePayload(local, remote, deltas, { now: NOW });
    expect(merged.core.stats.xpByDay["2026-11-11"]).toBe(150); // 100 + 50
    expect(merged.core.stats.correctByDay["2026-11-11"]).toBe(10);
    expect(merged.core.stats.sessionsByDay["2026-11-11"]).toBe(1);
    expect(merged.core.stats.xpByDay["2026-11-09"]).toBe(40); // sin delta ⇒ max
  });

  test("bestComboEver y streak.best a max", () => {
    const local = state({
      core: {
        stats: { ...createCore(NOW).stats, bestComboEver: 18 },
        streak: { current: 3, best: 9, lastActiveDay: "2026-11-11", shields: 1 },
      },
    });
    const remote = state({
      core: {
        stats: { ...createCore(NOW).stats, bestComboEver: 25 },
        streak: { current: 12, best: 12, lastActiveDay: "2026-11-10", shields: 0 },
      },
    });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.core.stats.bestComboEver).toBe(25);
    expect(merged.core.streak.best).toBe(12);
    // current/lastActiveDay: de la rama con el día activo más reciente.
    expect(merged.core.streak.lastActiveDay).toBe("2026-11-11");
    expect(merged.core.streak.current).toBe(3);
  });
});

describe("mergePayload · logros", () => {
  test("logro duplicado: unión con timestamp mínimo (nunca se pierde)", () => {
    const local = state({ core: { achievements: { "primer-combo": NOW - 500, "maraton": NOW - 100 } } });
    const remote = state({ core: { achievements: { "primer-combo": NOW - 5000, "coleccionista": NOW - 50 } } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.core.achievements["primer-combo"]).toBe(NOW - 5000); // mínimo
    expect(merged.core.achievements["maraton"]).toBe(NOW - 100);
    expect(merged.core.achievements["coleccionista"]).toBe(NOW - 50);
  });

  test("achievementsClaimed: unión", () => {
    const local = state({ core: { achievementsClaimed: ["a", "b"] } });
    const remote = state({ core: { achievementsClaimed: ["b", "c"] } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.core.achievementsClaimed.sort()).toEqual(["a", "b", "c"]);
  });
});

describe("mergePayload · SRS (LWW por tarjeta)", () => {
  test("tarjeta conflictiva: gana la de updatedAt más reciente", () => {
    const local = state({ srs: { "casa": card("casa", NOW - 1000, { reps: 9 }) } });
    const remote = state({ srs: { "casa": card("casa", NOW - 10, { reps: 3 }) } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.srs["casa"].reps).toBe(3); // remota más reciente
  });

  test("tarjeta VIEJA sin updatedAt: degrada a lastReviewedAt", () => {
    const oldLocal = card("flor", NOW - 2000, { reps: 1 });
    const oldRemote = card("flor", NOW - 5000, { reps: 7 });
    delete (oldLocal as Partial<SrsCard>).updatedAt;
    delete (oldRemote as Partial<SrsCard>).updatedAt;
    const local = state({ srs: { flor: oldLocal } });
    const remote = state({ srs: { flor: oldRemote } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.srs.flor.reps).toBe(1); // lastReviewedAt más reciente gana
  });

  test("tarjeta que solo está en un lado se conserva", () => {
    const local = state({ srs: { mar: card("mar", NOW - 100) } });
    const remote = state({ srs: { sol: card("sol", NOW - 100) } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.srs.mar).toBeDefined();
    expect(merged.srs.sol).toBeDefined();
  });
});

describe("mergePayload · wallet (tinta server-authoritative)", () => {
  test("con serverTinta del ledger: el balance del servidor manda", () => {
    const local = state({ core: { wallet: { ...createCore(NOW).wallet, tinta: 999 } } });
    const remote = state({ core: { wallet: { ...createCore(NOW).wallet, tinta: 5 } } });
    const { merged } = mergePayload(local, remote, null, { serverTinta: 42, now: NOW });
    expect(merged.core.wallet.tinta).toBe(42);
  });

  test("sin serverTinta: max de las ramas; owned unión; spent max", () => {
    const baseWallet = createCore(NOW).wallet;
    const local = state({ core: { wallet: { ...baseWallet, tinta: 30, owned: ["marco-oro"], spent: 10 } } });
    const remote = state({ core: { wallet: { ...baseWallet, tinta: 50, owned: ["titulo-capitan"], spent: 4 } } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.core.wallet.tinta).toBe(50);
    expect(merged.core.wallet.owned.sort()).toEqual(["marco-oro", "titulo-capitan"]);
    expect(merged.core.wallet.spent).toBe(10);
  });
});

describe("mergePayload · misiones (LWW por periodo)", () => {
  test("misiones de dos días: gana el día más reciente", () => {
    const local = state({ core: { missions: { ...createCore(NOW).missions, daily: { dateKey: "2026-11-11", claimed: ["d-md-xp"] } } } });
    const remote = state({ core: { missions: { ...createCore(NOW).missions, daily: { dateKey: "2026-11-10", claimed: ["d-md-quests"] } } } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.core.missions.daily.dateKey).toBe("2026-11-11");
    // El día viejo no arrastra sus claims (no bloquea cobrar hoy).
    expect(merged.core.missions.daily.claimed).toEqual(["d-md-xp"]);
  });

  test("mismo día: unión de claims (no se puede reclamar dos veces)", () => {
    const local = state({ core: { missions: { ...createCore(NOW).missions, daily: { dateKey: "2026-11-11", claimed: ["d-md-xp"] } } } });
    const remote = state({ core: { missions: { ...createCore(NOW).missions, daily: { dateKey: "2026-11-11", claimed: ["d-md-correct"] } } } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.core.missions.daily.dateKey).toBe("2026-11-11");
    expect(merged.core.missions.daily.claimed.sort()).toEqual(["d-md-correct", "d-md-xp"]);
  });
});

describe("mergePayload · uniones acotadas", () => {
  test("sessions: unión por id y recorte al máximo (200)", () => {
    const mk = (n: number, day: number) =>
      Array.from({ length: n }, (_, i) => ({
        id: `s-${day}-${i}`,
        at: Date.UTC(2026, 10, day, i % 24),
        mode: "training" as const,
        label: "t",
        total: 10,
        correct: 5,
        accuracy: 0.5,
        xpEarned: 10,
        durationMs: 1000,
        bestCombo: 2,
      }));
    const local = state({ core: { sessions: mk(150, 11) } });
    const remote = state({ core: { sessions: [...mk(150, 9), ...mk(20, 11)] } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    // 150 + 150 + 20 con solapamiento de ids en el día 11 → únicos, recortados a 200.
    expect(merged.core.sessions.length).toBe(200);
    const ids = new Set(merged.core.sessions.map((s) => s.id));
    expect(ids.size).toBe(200); // sin duplicados
  });

  test("errors: unión deduplicada y recorte a 120 (más recientes primero)", () => {
    const mk = (n: number, tag: string) =>
      Array.from({ length: n }, (_, i) => ({
        exerciseId: `${tag}-${i}`,
        type: "trivia" as const,
        skill: "vocabulario" as const,
        prompt: "p",
        userAnswer: "u",
        correctAnswer: "c",
        explanation: "e",
        at: NOW - (tag === "l" ? i : 100_000 + i),
      }));
    const local = state({ core: { errors: mk(100, "l") } });
    const remote = state({ core: { errors: mk(100, "r") } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.core.errors.length).toBeLessThanOrEqual(120);
    expect(merged.core.errors[0].exerciseId.startsWith("l")).toBe(true); // recientes primero
    expect(new Set(merged.core.errors.map((e) => e.exerciseId)).size).toBe(merged.core.errors.length);
  });

  test("seenExercises: unión con el visto más reciente; los de >30 días se van", () => {
    const local = state({ core: { seenExercises: { nuevo: NOW - 1000, viejo: NOW - 40 * 86_400_000 } } });
    const remote = state({ core: { seenExercises: { nuevo: NOW - 5000, remoto: NOW - 2000 } } });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.core.seenExercises.nuevo).toBe(NOW - 1000);
    expect(merged.core.seenExercises.remoto).toBe(NOW - 2000);
    expect(merged.core.seenExercises.viejo).toBeUndefined();
  });
});

describe("mergePayload · profile y settings (LWW global)", () => {
  test("gana el savedAt más reciente", () => {
    const local = state({ profileName: "Marina", savedAt: NOW });
    const remote = state({ profileName: "Marina-Vieja", savedAt: NOW - 9999 });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.profile.name).toBe("Marina");
  });

  test("el remoto más reciente gana aunque el local sea el entrante", () => {
    const local = state({ profileName: "Local-Viejo", savedAt: NOW - 9999 });
    const remote = state({ profileName: "Remota-Nueva", savedAt: NOW });
    const { merged } = mergePayload(local, remote, null, { now: NOW });
    expect(merged.profile.name).toBe("Remota-Nueva");
  });
});

describe("mergePayload · import sobre cuenta existente (02 §7)", () => {
  test("aditivo: nunca baja XP ni pierde logros ni tarjetas", () => {
    const local = state({
      core: {
        xp: 300,
        achievements: { "a-local": NOW - 10 },
        stats: { ...createCore(NOW).stats, totalAnswers: 20 },
      },
      srs: { gato: card("gato", NOW - 5) },
    });
    const remote = state({
      core: {
        xp: 200,
        achievements: { "a-remota": NOW - 20 },
        stats: { ...createCore(NOW).stats, totalAnswers: 35 },
      },
      srs: { perro: card("perro", NOW - 8) },
    });
    const { merged } = mergePayload(local, remote, null, { now: NOW }); // import: deltas null
    expect(merged.core.xp).toBe(300);
    expect(merged.core.achievements["a-local"]).toBe(NOW - 10);
    expect(merged.core.achievements["a-remota"]).toBe(NOW - 20);
    expect(merged.core.stats.totalAnswers).toBe(35);
    expect(merged.srs.gato).toBeDefined();
    expect(merged.srs.perro).toBeDefined();
  });
});

describe("mergePayload · conflictos y pureza", () => {
  test("conflicts lista las secciones cuyo resultado difiere del local", () => {
    const local = state({ core: { xp: 100 }, savedAt: NOW });
    const remote = state({ core: { xp: 500 }, savedAt: NOW - 1 });
    const { conflicts } = mergePayload(local, remote, null, { now: NOW });
    expect(conflicts).toContain("xp");
    expect(conflicts).not.toContain("profile"); // idénticos
  });

  test("FUNCIÓN PURA: no muta ninguna de las dos entradas", () => {
    const local = state({ core: { xp: 100, achievements: { x: 1 } }, srs: { a: card("a", NOW) } });
    const remote = state({ core: { xp: 400, achievements: { y: 2 } }, srs: { b: card("b", NOW) } });
    const localBefore = JSON.stringify(local);
    const remoteBefore = JSON.stringify(remote);
    mergePayload(local, remote, null, { now: NOW });
    expect(JSON.stringify(local)).toBe(localBefore);
    expect(JSON.stringify(remote)).toBe(remoteBefore);
  });
});

/* ============================== Validación de transcripción ============================== */

function sessionInput(overrides: Partial<EventSessionInput> = {}): EventSessionInput {
  return {
    formatId: "trivia",
    origin: "freeplay",
    seed: null,
    durationMs: 60_000,
    transcript: { answers: [{ i: 0, choice: 2, ms: 3000 }, { i: 1, choice: 0, ms: 2500 }] },
    result: { xp: 20, correct: 2, total: 2, bestCombo: 2 },
    ...overrides,
  };
}

describe("validateTranscript · suelos y techos (01 §5.3)", () => {
  test("transcripción correcta pasa sin flags", () => {
    const v = validateTranscript(sessionInput());
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.flags).toEqual([]);
  });

  test("respuesta con ms < 120 marca timing_floor", () => {
    const v = validateTranscript(sessionInput({
      transcript: { answers: [{ i: 0, choice: 1, ms: 50 }, { i: 1, choice: 0, ms: 2000 }] },
    }));
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.flags).toContain("timing_floor");
  });

  test("índice fuera de rango ⇒ rechazo", () => {
    const v = validateTranscript(sessionInput({
      transcript: { answers: [{ i: 5, choice: 1, ms: 1000 }] },
    }));
    expect(v.ok).toBe(false);
  });

  test("índice duplicado ⇒ rechazo (anti-replay)", () => {
    const v = validateTranscript(sessionInput({
      transcript: { answers: [{ i: 0, choice: 1, ms: 1000 }, { i: 0, choice: 2, ms: 1500 }] },
    }));
    expect(v.ok).toBe(false);
  });

  test("tiempo negativo o imposible ⇒ rechazo", () => {
    const negativo = validateTranscript(sessionInput({
      transcript: { answers: [{ i: 0, choice: 1, ms: -5 }] },
    }));
    expect(negativo.ok).toBe(false);
    const gigante = validateTranscript(sessionInput({
      transcript: { answers: [{ i: 0, choice: 1, ms: 9_999_999_999 }] },
    }));
    expect(gigante.ok).toBe(false);
  });

  test("combo implausible (> respuestas o > techo) marca implausible_combo", () => {
    const v = validateTranscript(sessionInput({
      result: { xp: 20, correct: 2, total: 2, bestCombo: 99 },
    }));
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.flags).toContain("implausible_combo");
  });

  test("duración menor que la suma de respuestas marca duration_mismatch", () => {
    const v = validateTranscript(sessionInput({ durationMs: 100 }));
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.flags).toContain("duration_mismatch");
  });

  test("sin respuestas ⇒ rechazo; aciertos imposibles ⇒ rechazo", () => {
    expect(validateTranscript(sessionInput({ transcript: { answers: [] } })).ok).toBe(false);
    const v = validateTranscript(sessionInput({
      result: { xp: 10, correct: 5, total: 2, bestCombo: 1 },
    }));
    expect(v.ok).toBe(false);
  });

  test("tope diario de freeplay declarado en constantes (150 XP ⇒ 15 tinta)", () => {
    expect(FREEPLAY_DAILY_XP_CAP).toBe(150);
  });
});

/* ============================== Racha oficial ============================== */

describe("officialStreak · racha server-side desde StatDaily", () => {
  test("cuenta días consecutivos con xp > 0 hasta hoy", () => {
    const days = [
      { day: "2026-11-08", xp: 30 },
      { day: "2026-11-09", xp: 10 },
      { day: "2026-11-10", xp: 0 }, // racha rota
      { day: "2026-11-11", xp: 50 },
    ];
    expect(officialStreak(days, "2026-11-11")).toBe(1);
  });

  test("hoy sin jugar: la racha sigue viva desde ayer", () => {
    const days = [
      { day: "2026-11-09", xp: 30 },
      { day: "2026-11-10", xp: 10 },
    ];
    expect(officialStreak(days, "2026-11-11")).toBe(2);
  });

  test("días con xp = 0 no cuentan", () => {
    const days = [{ day: "2026-11-11", xp: 0 }];
    expect(officialStreak(days, "2026-11-11")).toBe(0);
  });
});

/* ============================== Cola offline (backoff) ============================== */

describe("Cola offline · backoff 30 s → 2 h, máx 12", () => {
  test("backoffDelayMs crece exponencialmente y se tapa a 2 h", () => {
    expect(backoffDelayMs(1)).toBe(30_000);
    expect(backoffDelayMs(2)).toBe(60_000);
    expect(backoffDelayMs(3)).toBe(120_000);
    expect(backoffDelayMs(10)).toBe(2 * 60 * 60 * 1000); // 30s·2^9 = 15360s > 2h ⇒ tope
    expect(backoffDelayMs(12)).toBe(2 * 60 * 60 * 1000);
  });

  test("nextAttemptAt es determinista desde createdAt + intentos", () => {
    const item: SyncQueueItem = { id: "q1", kind: "events", body: {}, attempts: 2, createdAt: 1000 };
    expect(nextAttemptAt(item)).toBe(1000 + 30_000 + 60_000);
  });

  test("a los 12 intentos el item es carta muerta", () => {
    const item: SyncQueueItem = { id: "q1", kind: "events", body: {}, attempts: 12, createdAt: 0 };
    expect(isDeadLetter(item)).toBe(true);
    expect(isDeadLetter({ ...item, attempts: 11 })).toBe(false);
  });
});

/* ============================== Deltas del cliente ============================== */

describe("computeDeltas · foto de stats → deltas", () => {
  test("deltas = crecimiento positivo por día y en escalares", () => {
    const snap = snapshotOfStats({
      ...createCore(NOW).stats,
      xpByDay: { "2026-11-11": 100 },
      totalAnswers: 10,
    });
    const stats = {
      ...createCore(NOW).stats,
      xpByDay: { "2026-11-11": 160 },
      correctByDay: { "2026-11-11": 8 },
      totalAnswers: 22,
    };
    const deltas = computeDeltas(stats, snap);
    expect(deltas).not.toBeNull();
    expect(deltas!.stats["2026-11-11"].xp).toBe(60);
    expect(deltas!.scalars.totalAnswers).toBe(12);
  });

  test("sin foto de base ⇒ null (el servidor usará max)", () => {
    expect(computeDeltas(createCore(NOW).stats, null)).toBeNull();
  });

  test("sin crecimiento ⇒ null (nada que sumar)", () => {
    const stats = createCore(NOW).stats;
    expect(computeDeltas(stats, snapshotOfStats(stats))).toBeNull();
  });
});
