/**
 * Pruebas del motor de VerbalIA · Se ejecutan con `bun test`.
 * Cubren: niveles y rangos, SRS, puntuación (combo, decaimiento,
 * tope diario), validación de respuestas, rachas con escudos,
 * misiones deterministas y el reductor de sesión completo.
 */

import { describe, expect, test } from "bun:test";
import {
  xpForLevelUp,
  cumulativeXpForLevel,
  levelFromXp,
  levelProgress,
  rankForLevel,
  cefrFromSkill,
  targetDifficulty,
  applySkillDelta,
} from "@/engine/xp";
import { newCard, reviewCard, srsGradeXp, isMastered, isLearned, cardStatus, MASTERY_INTERVAL_DAYS } from "@/engine/srs";
import { itemXp, completionBonus, bestComboFrom, DAILY_XP_SOFT_CAP } from "@/engine/scoring";
import { checkTrivia, checkPuzzle, checkCloze, checkErrorHunt, checkTildes, checkParagraph } from "@/engine/validation";
import { updateStreak, grantShield, MAX_SHIELDS } from "@/engine/streak";
import { dateKey, weekKey, dailyMissions, weeklyMissions, metricValue, dailyProgress } from "@/engine/missions";
import { createCore, reduceSessionComplete, computePlacement, experiencePrior } from "@/engine/core";
import { createRng, shuffle } from "@/engine/rng";
import type { AnswerRecord, GameCore, SessionSpec, SrsCard } from "@/types";

/* ============================ Niveles ============================ */

describe("motor de niveles y rangos", () => {
  test("la curva de nivel es incremental y coherente", () => {
    expect(xpForLevelUp(1)).toBe(100);
    expect(xpForLevelUp(2)).toBe(140);
    expect(xpForLevelUp(5)).toBe(260);
  });

  test("nivel desde XP: acumulado exacto en el umbral", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(100 + 140)).toBe(3);
    expect(levelFromXp(100 + 139)).toBe(2);
  });

  test("el XP acumulado es la suma de tramos", () => {
    expect(cumulativeXpForLevel(1)).toBe(0);
    expect(cumulativeXpForLevel(3)).toBe(100 + 140);
  });

  test("el progreso dentro del nivel es correcto", () => {
    const p = levelProgress(150); // nivel 2, 50/140
    expect(p.level).toBe(2);
    expect(p.into).toBe(50);
    expect(p.needed).toBe(140);
  });

  test("los rangos crecen con el nivel", () => {
    expect(rankForLevel(1).name).toContain("Aprendiz");
    expect(rankForLevel(10).name).toContain("Guardián");
    expect(rankForLevel(30).name).toContain("Leyenda");
  });

  test("mapeo habilidad → MCER orientativo", () => {
    expect(cefrFromSkill(1.2)).toBe("A1");
    expect(cefrFromSkill(2.5)).toBe("A2");
    expect(cefrFromSkill(3.5)).toBe("B1");
    expect(cefrFromSkill(5.5)).toBe("B2");
    expect(cefrFromSkill(9)).toBe("C2");
  });

  test("dificultad objetivo dentro de 1-5", () => {
    expect(targetDifficulty(1)).toBe(1);
    expect(targetDifficulty(2.5)).toBe(1);
    expect(targetDifficulty(2.9)).toBe(2);
    expect(targetDifficulty(4.5)).toBe(2);
    expect(targetDifficulty(5.5)).toBe(3);
    expect(targetDifficulty(7)).toBe(4);
    expect(targetDifficulty(10)).toBe(5);
  });

  test("ajuste de habilidad: subir al acertar, bajar al fallar, con límites", () => {
    expect(applySkillDelta(5, true, 3)).toBeGreaterThan(5);
    expect(applySkillDelta(5, false, 3)).toBeLessThan(5);
    expect(applySkillDelta(1, false, 1)).toBe(1); // suelo
    expect(applySkillDelta(10, true, 5)).toBe(10); // techo
  });
});

/* ============================ SRS ============================ */

describe("motor SRS (SM-2 simplificado)", () => {
  const now = Date.parse("2026-01-01T10:00:00Z");

  test("tarjeta nueva arranca en aprendizaje", () => {
    const c = newCard("w-casa", now);
    expect(c.state).toBe("learning");
    expect(c.ease).toBe(2.5);
    expect(cardStatus(undefined)).toBe("nueva");
    expect(cardStatus(c)).toBe("aprendiendo");
  });

  test("«again» reinicia y penaliza la facilidad", () => {
    let c = newCard("w-casa", now);
    c = reviewCard(c, "good", now);
    const afterAgain = reviewCard(c, "again", now + 86_400_000);
    expect(afterAgain.reps).toBe(0);
    expect(afterAgain.lapses).toBe(1);
    expect(afterAgain.ease).toBeLessThan(c.ease);
    expect(afterAgain.dueAt).toBeGreaterThan(now); // reintenta en 10 min
  });

  test("«good» encadena intervalos crecientes", () => {
    let c = newCard("w-casa", now);
    c = reviewCard(c, "good", now); // 1 día
    expect(c.intervalDays).toBe(1);
    c = reviewCard(c, "good", now + 86_400_000); // ~2.5 días
    expect(c.intervalDays).toBeGreaterThanOrEqual(2);
    expect(c.state).toBe("review");
  });

  test("«easy» acelera más que «hard»", () => {
    let easy = newCard("w-casa", now);
    let hard = newCard("w-perro", now);
    easy = reviewCard(easy, "easy", now);
    hard = reviewCard(hard, "hard", now);
    expect(easy.intervalDays).toBe(3);
    expect(hard.intervalDays).toBe(1);
  });

  test("la facilidad está acotada", () => {
    let c = newCard("w-casa", now);
    for (let i = 0; i < 10; i++) c = reviewCard(c, "again", now + i * 1000);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
    let d = newCard("w-perro", now);
    for (let i = 0; i < 10; i++) d = reviewCard(d, "easy", now + i * 1000);
    expect(d.ease).toBeLessThanOrEqual(2.8);
  });

  test("dominio tras intervalo largo y estado review", () => {
    let c = newCard("w-casa", now);
    for (let i = 0; i < 6; i++) {
      c = reviewCard(c, "good", now + i * 20 * 86_400_000);
    }
    expect(c.intervalDays).toBeGreaterThanOrEqual(MASTERY_INTERVAL_DAYS);
    expect(isMastered(c)).toBe(true);
    expect(cardStatus(c)).toBe("dominada");
    expect(isLearned(c)).toBe(true);
  });

  test("XP por calificación es creciente y positivo", () => {
    expect(srsGradeXp("again")).toBeLessThan(srsGradeXp("hard"));
    expect(srsGradeXp("hard")).toBeLessThan(srsGradeXp("good"));
    expect(srsGradeXp("good")).toBeLessThan(srsGradeXp("easy"));
    expect(srsGradeXp("again")).toBeGreaterThan(0);
  });
});

/* ============================ Puntuación ============================ */

describe("motor de puntuación", () => {
  test("el acierto paga según dificultad", () => {
    const d1 = itemXp({ difficulty: 1, correct: true, timeMs: 8000, combo: 0, seenRecently: false, xpToday: 0, timed: false });
    const d5 = itemXp({ difficulty: 5, correct: true, timeMs: 8000, combo: 0, seenRecently: false, xpToday: 0, timed: false });
    expect(d5.base).toBeGreaterThan(d1.base * 2);
  });

  test("el combo suma bonus acotado", () => {
    const c1 = itemXp({ difficulty: 3, correct: true, timeMs: 8000, combo: 1, seenRecently: false, xpToday: 0, timed: false });
    const c9 = itemXp({ difficulty: 3, correct: true, timeMs: 8000, combo: 9, seenRecently: false, xpToday: 0, timed: false });
    expect(c9.comboBonus).toBeGreaterThan(c1.comboBonus);
    // a partir de 6 no crece más
    const c6 = itemXp({ difficulty: 3, correct: true, timeMs: 8000, combo: 6, seenRecently: false, xpToday: 0, timed: false });
    expect(c9.comboBonus).toBe(c6.comboBonus);
  });

  test("el error da XP de esfuerzo mínimo", () => {
    const r = itemXp({ difficulty: 3, correct: false, timeMs: 9000, combo: 0, seenRecently: false, xpToday: 0, timed: false });
    expect(r.xp).toBeGreaterThan(0);
    expect(r.xp).toBeLessThanOrEqual(2);
  });

  test("repetir un ejercicio reciente decae el XP (anti-farmeo)", () => {
    const fresh = itemXp({ difficulty: 3, correct: true, timeMs: 8000, combo: 0, seenRecently: false, xpToday: 0, timed: false });
    const stale = itemXp({ difficulty: 3, correct: true, timeMs: 8000, combo: 0, seenRecently: true, xpToday: 0, timed: false });
    expect(stale.xp).toBeLessThan(fresh.xp);
  });

  test("tope diario suave: tras el cap el XP rinde al 50 %", () => {
    const r = itemXp({ difficulty: 3, correct: true, timeMs: 8000, combo: 0, seenRecently: false, xpToday: DAILY_XP_SOFT_CAP + 50, timed: false });
    expect(r.capped).toBeGreaterThan(0);
    expect(r.xp).toBe(Math.round(r.base / 2)); // sin combo
  });

  test("bonus de sesión por dominio", () => {
    expect(completionBonus(0.9, 10)).toBeGreaterThanOrEqual(10);
    expect(completionBonus(null, 10)).toBe(25); // repaso SRS completo
    expect(completionBonus(0.6, 10)).toBe(5); // constancia
    expect(completionBonus(0.4, 10)).toBe(0); // sesión floja: sin bonus
    expect(completionBonus(1, 3)).toBe(0); // sesiones muy cortas no dan bonus
  });

  test("mejor combo a partir del historial", () => {
    const answers = [
      { correct: true }, { correct: true }, { correct: false },
      { correct: true }, { correct: true }, { correct: true },
      { correct: null, grade: "good" }, { correct: null, grade: "again" },
    ] as AnswerRecord[];
    expect(bestComboFrom(answers)).toBe(4); // 3 aciertos + tarjeta good
  });
});

/* ============================ Validación ============================ */

describe("validación de respuestas", () => {
  const trivia = { answer: "sustantivo" };
  test("trivia compara la clase gramatical", () => {
    expect(checkTrivia(trivia, "sustantivo").correct).toBe(true);
    expect(checkTrivia(trivia, "verbo").correct).toBe(false);
  });

  const puzzle = { chunks: ["El gato", "duerme", "en el sofá"] };
  test("puzzle exige el orden exacto", () => {
    expect(checkPuzzle(puzzle, [0, 1, 2]).correct).toBe(true);
    expect(checkPuzzle(puzzle, [0, 2, 1]).correct).toBe(false);
    expect(checkPuzzle(puzzle, [0, 1]).correct).toBe(false);
  });

  const cloze = { options: ["está", "es", "sea"], answerIndex: 0 };
  test("cloze compara el índice de opción", () => {
    expect(checkCloze(cloze, 0).correct).toBe(true);
    expect(checkCloze(cloze, 1).correct).toBe(false);
  });

  const errorItem = {
    tokens: ["La", "sopa", "estaba", "fria"],
    errorIndex: 3,
    options: ["fría", "frío", "friamente"],
    answerIndex: 0,
  };
  test("caza de errores: palabra y corrección", () => {
    expect(checkErrorHunt(errorItem, 3, 0).correct).toBe(true);
    expect(checkErrorHunt(errorItem, 3, 1).correct).toBe(false); // palabra bien, corrección mal
    expect(checkErrorHunt(errorItem, 0, 0).correct).toBe(false); // palabra mal
  });

  const cleanItem = { tokens: ["Hay", "menos", "libros"], errorIndex: -1, options: ["x"], answerIndex: 0 };
  test("caza de errores: frase limpia exige «no hay error»", () => {
    expect(checkErrorHunt(cleanItem, "none", null).correct).toBe(true);
    expect(checkErrorHunt(cleanItem, 1, 0).correct).toBe(false);
  });

  const tilde = { syllables: ["ca", "ma", "ra"], answerSyllable: 0, tokens: [] };
  test("tildes: sílaba correcta o «no lleva»", () => {
    expect(checkTildes(tilde, 0).correct).toBe(true);
    expect(checkTildes(tilde, 2).correct).toBe(false);
    const noTilde = { syllables: ["ho", "tel"], answerSyllable: -1 };
    expect(checkTildes(noTilde, -1).correct).toBe(true);
  });

  const paragraph = { sentences: ["Uno.", "Dos.", "Tres."] };
  test("párrafos: orden exacto de oraciones", () => {
    expect(checkParagraph(paragraph, [0, 1, 2]).correct).toBe(true);
    expect(checkParagraph(paragraph, [2, 1, 0]).correct).toBe(false);
  });
});

/* ============================ Rachas ============================ */

describe("rachas flexibles con escudos", () => {
  const base = (lastActiveDay: string | null, current: number, best: number, shields = 0) =>
    ({ ...createCore(), streak: { current, best, lastActiveDay, shields } });

  test("primera sesión arranca la racha en 1", () => {
    const core = base(null, 0, 0);
    const out = updateStreak(core, new Date("2026-01-10T12:00:00"));
    expect(out.streak.current).toBe(1);
    expect(out.started).toBe(true);
  });

  test("jugar al día siguiente suma", () => {
    const core = base("2026-01-09", 3, 3);
    const out = updateStreak(core, new Date("2026-01-10T12:00:00"));
    expect(out.streak.current).toBe(4);
    expect(out.shieldUsed).toBe(false);
  });

  test("un día de ausencia con escudo protege la racha", () => {
    const core = base("2026-01-08", 5, 5, 1);
    const out = updateStreak(core, new Date("2026-01-10T12:00:00"));
    expect(out.streak.current).toBe(6);
    expect(out.shieldUsed).toBe(true);
    expect(out.streak.shields).toBe(0);
  });

  test("sin escudo, la racha se reinicia en 1 (nunca en 0)", () => {
    const core = base("2026-01-05", 8, 8, 0);
    const out = updateStreak(core, new Date("2026-01-10T12:00:00"));
    expect(out.streak.current).toBe(1);
    expect(out.streak.best).toBe(8); // el récord se conserva
  });

  test("jugar dos veces el mismo día no suma doble", () => {
    const core = base("2026-01-10", 2, 2);
    const out = updateStreak(core, new Date("2026-01-10T20:00:00"));
    expect(out.streak.current).toBe(2);
  });

  test("los escudos están acotados a 2", () => {
    const core = base("2026-01-05", 1, 1, MAX_SHIELDS);
    expect(grantShield(core)).toBe(MAX_SHIELDS);
  });
});

/* ============================ Misiones ============================ */

describe("misiones diarias y semanales", () => {
  test("generación determinista por fecha", () => {
    const a = dailyMissions("2026-01-10", 3);
    const b = dailyMissions("2026-01-10", 3);
    expect(a.map((m) => m.id)).toEqual(b.map((m) => m.id));
    expect(a.map((m) => m.target)).toEqual(b.map((m) => m.target));
    expect(a).toHaveLength(3);
  });

  test("otro día, otras misiones (probablemente)", () => {
    const a = dailyMissions("2026-01-10", 3);
    const b = dailyMissions("2026-01-11", 3);
    // La rotación de plantillas cambia la selección.
    expect(a[0].id !== b[0].id || a[1].id !== b[1].id).toBe(true);
  });

  test("misiones semanales incluyen la de escudo", () => {
    const weekly = weeklyMissions("2026-W02", 5);
    expect(weekly.some((m) => m.shieldReward)).toBe(true);
  });

  test("la métrica se calcula desde los contadores diarios", () => {
    const core = createCore();
    const day = "2026-01-10";
    core.stats.sessionsByDay[day] = 2;
    core.stats.xpByDay[day] = 130;
    core.stats.gamesByDay[day] = ["trivia", "puzzle"];
    expect(metricValue(core, "sessions", { days: [day] })).toBe(2);
    expect(metricValue(core, "xp", { days: [day] })).toBe(130);
    expect(metricValue(core, "games", { days: [day] })).toBe(2);
  });

  test("progreso diario refleja hecho y reclamado", () => {
    const core = createCore();
    const day = dateKey(new Date());
    core.stats.correctByDay[day] = 999;
    core.missions.daily = { dateKey: day, claimed: [] };
    const progress = dailyProgress(core, day);
    expect(progress.length).toBe(3);
    const aciertos = progress.find((p) => p.mission.metric === "correct");
    expect(aciertos?.done).toBe(true);
    expect(aciertos?.claimed).toBe(false);
  });

  test("clave de semana estable en lunes y domingo", () => {
    expect(weekKey(new Date("2026-01-05T10:00:00"))).toBe(weekKey(new Date("2026-01-11T10:00:00")));
  });
});

/* ============================ Reductor de sesión ============================ */

/** Fabrica una respuesta de ejercicio para los tests. */
function exerciseAnswer(
  id: string,
  gameId: AnswerRecord["gameId"],
  skill: AnswerRecord["skill"],
  correct: boolean,
  difficulty = 3,
  exercise?: AnswerRecord["exercise"],
): AnswerRecord {
  return {
    itemId: id,
    kind: "exercise",
    gameId,
    skill,
    difficulty: difficulty as AnswerRecord["difficulty"],
    correct,
    userAnswer: "—",
    correctAnswer: "—",
    exercise,
    timeMs: 5000,
    wasSeenRecently: false,
  };
}

function coreWithAnswers(core: GameCore, correctCount: number): GameCore {
  for (let i = 0; i < correctCount; i++) {
    core.stats.correctByDay["2026-01-10"] = (core.stats.correctByDay["2026-01-10"] ?? 0) + 1;
  }
  return core;
}

describe("reductor de sesión", () => {
  const spec: SessionSpec = { label: "Test", mode: "training", gameId: "trivia", items: [] };
  const now = new Date("2026-01-10T12:00:00");

  test("sesión perfecta: XP, contadores y sesión registrada", () => {
    const core = createCore(now.getTime());
    const answers = Array.from({ length: 10 }, (_, i) =>
      exerciseAnswer(`e${i}`, "trivia", "vocabulario", true, 3),
    );
    const { core: next, result } = reduceSessionComplete(core, {
      spec,
      answers,
      durationMs: 60_000,
      now,
      masteredWords: 0,
      learnedWords: 0,
    });

    expect(result.correctCount).toBe(10);
    expect(result.accuracy).toBe(1);
    expect(result.xpTotal).toBeGreaterThan(0);
    expect(next.stats.totalSessions).toBe(1);
    expect(next.stats.byGame["trivia"].plays).toBe(1);
    expect(next.stats.byGame["trivia"].answers).toBe(10);
    expect(next.sessions).toHaveLength(1);
    expect(next.stats.activeDays).toContain("2026-01-10");
    expect(result.leveledUp).toBe(true); // 100+ XP → nivel 2
  });

  test("los errores quedan registrados y desbloquean el repaso", () => {
    const core = createCore(now.getTime());
    const exercise = { id: "tv-s01", type: "trivia", skill: "vocabulario", difficulty: 1, cefr: "A1", prompt: "p", explanation: "e", tags: [], sentence: "s", answer: "sustantivo" } as never;
    const answers = [
      exerciseAnswer("tv-s01", "trivia", "vocabulario", false, 1, exercise),
    ];
    const { core: next } = reduceSessionComplete(core, {
      spec, answers, durationMs: 5000, now, masteredWords: 0, learnedWords: 0,
    });
    expect(next.errors).toHaveLength(1);
    expect(next.errors[0].exerciseId).toBe("tv-s01");
  });

  test("misión completada se reclama automáticamente y solo una vez", () => {
    let core = createCore(now.getTime());
    const run = () => {
      const answers = Array.from({ length: 10 }, (_, i) =>
        exerciseAnswer(`e${i}-${Math.random()}`, "trivia", "vocabulario", true, 3),
      );
      const r = reduceSessionComplete(core, {
        spec, answers, durationMs: 30_000, now, masteredWords: 0, learnedWords: 0,
      });
      core = r.core;
      return r;
    };
    run();
    run();
    run(); // 30 aciertos y 3 sesiones: garantiza las misiones de aciertos/sesiones/XP
    expect(core.missions.daily.claimed.length).toBeGreaterThanOrEqual(1);
    const claimedBefore = [...core.missions.daily.claimed];
    const r4 = run();
    for (const id of r4.result.missionsCompleted) {
      expect(claimedBefore).not.toContain(id);
    }
  });

  test("la racha se actualiza y el escudo se consume si procede", () => {
    const core = createCore(now.getTime());
    core.streak = { current: 2, best: 2, lastActiveDay: "2026-01-08", shields: 1 };
    const answers = [exerciseAnswer("e0", "tildes", "ortografia", true, 2)];
    const { core: next, result } = reduceSessionComplete(core, {
      spec: { ...spec, gameId: "tildes" },
      answers,
      durationMs: 10_000,
      now,
      masteredWords: 0,
      learnedWords: 0,
    });
    expect(next.streak.current).toBe(3);
    expect(result.shieldUsed).toBe(true);
  });

  test("logro de primera sesión se desbloquea", () => {
    const core = createCore(now.getTime());
    const answers = [exerciseAnswer("e0", "trivia", "vocabulario", true, 1)];
    const { core: next, result } = reduceSessionComplete(core, {
      spec, answers, durationMs: 5000, now, masteredWords: 0, learnedWords: 0,
    });
    expect(next.achievements["ac-primer-paso"]).toBeDefined();
    expect(result.newAchievements).toContain("ac-primer-paso");
  });

  test("la evaluación inicial no cuenta como sesión ni toca la racha", () => {
    const core = createCore(now.getTime());
    const placementSpec: SessionSpec = { label: "Evaluación", mode: "placement", items: [] };
    const answers = [
      exerciseAnswer("p1", "trivia", "vocabulario", true, 1),
      exerciseAnswer("p2", "cloze", "gramatica", false, 2),
    ];
    const { core: next } = reduceSessionComplete(core, {
      spec: placementSpec, answers, durationMs: 60_000, now, masteredWords: 0, learnedWords: 0,
    });
    expect(next.stats.totalSessions).toBe(0);
    expect(next.streak.current).toBe(0);
    expect(next.sessions).toHaveLength(0);
    expect(next.xp).toBe(15 + 3); // premio fijo
  });

  test("las habilidades suben al acertar y bajan al fallar", () => {
    const core = createCore(now.getTime());
    const before = core.skills.vocabulario;
    const answers = [
      exerciseAnswer("a1", "trivia", "vocabulario", true, 3),
      exerciseAnswer("a2", "trivia", "vocabulario", true, 3),
    ];
    const { core: next } = reduceSessionComplete(core, {
      spec, answers, durationMs: 5000, now, masteredWords: 0, learnedWords: 0,
    });
    expect(next.skills.vocabulario).toBeGreaterThan(before);
  });
});

/* ============================ Evaluación inicial ============================ */

describe("cálculo de la evaluación inicial", () => {
  test("prior según experiencia declarada", () => {
    expect(experiencePrior("principiante")).toBeLessThan(experiencePrior("intermedio"));
    expect(experiencePrior("intermedio")).toBeLessThan(experiencePrior("avanzado"));
  });

  test("aciertos elevan la habilidad correspondiente", () => {
    const skills = computePlacement("principiante", [
      { skill: "vocabulario", difficulty: 1, correct: true },
      { skill: "vocabulario", difficulty: 3, correct: true },
      { skill: "ortografia", difficulty: 1, correct: false },
    ]);
    expect(skills.vocabulario).toBeGreaterThan(skills.ortografia);
    expect(skills.gramatica).toBeGreaterThan(0);
  });

  test("los resultados quedan dentro de 1-7", () => {
    const skills = computePlacement("avanzado", [
      { skill: "lectura", difficulty: 4, correct: true },
      { skill: "lectura", difficulty: 4, correct: true },
    ]);
    expect(skills.lectura).toBeLessThanOrEqual(7);
    expect(skills.lectura).toBeGreaterThan(3.6);
  });
});

/* ============================ Utilidades ============================ */

describe("RNG y barajado", () => {
  test("determinista con la misma semilla", () => {
    const a = createRng("semilla");
    const b = createRng("semilla");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  test("shuffle preserva los elementos", () => {
    const rng = createRng(42);
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffle(arr, rng);
    expect(shuffled.sort((x, y) => x - y)).toEqual(arr);
    expect(arr).toEqual([1, 2, 3, 4, 5, 6, 7, 8]); // no muta
  });

  test("shuffle desordena de verdad", () => {
    const rng = createRng(7);
    const arr = Array.from({ length: 20 }, (_, i) => i);
    let differs = false;
    for (let t = 0; t < 5 && !differs; t++) {
      const s = shuffle(arr, rng);
      differs = s.some((v, i) => v !== arr[i]);
    }
    expect(differs).toBe(true);
  });
});

/* ==================== Regresión: trivia insensible a mayúsculas ==================== */

describe("validación trivia: mayúsculas y minúsculas", () => {
  const trivia = { answer: "sustantivo" };
  test("la etiqueta capitalizada del botón debe contar como correcta", () => {
    expect(checkTrivia(trivia, "Sustantivo").correct).toBe(true);
    expect(checkTrivia(trivia, "SUSTANTIVO").correct).toBe(true);
    expect(checkTrivia(trivia, " sustantivo ").correct).toBe(true);
    expect(checkTrivia(trivia, "Verbo").correct).toBe(false);
  });
});

/* ==================== Etapa 2: validación de nuevas mecánicas ==================== */

import { checkDictado, dictadoDiff, normalizeDictado, checkOptionIndex, checkMinuto } from "@/engine/validation";
import { buildMissionSession as buildMission2, buildTrainingSession as buildTraining2 } from "@/engine/session";
import { DICTADO_PACK } from "@/data/dictado";
import { MATICES_PACK } from "@/data/matices";
import { LECTURA_PACK } from "@/data/lectura";
import { SPRINT_PACK } from "@/data/sprint";
import { SINONIMOS_PACK } from "@/data/sinonimos";
import { HISTORIAS_PACK } from "@/data/historias";
import { REFRANES_PACK } from "@/data/refranes";
import { MINUTO_PACK } from "@/data/minuto";
import { SRS_WORDS } from "@/data/words-srs";
import { ACHIEVEMENTS } from "@/data/achievements";

describe("dictado: normalización y comparación", () => {
  const ex = { sentence: "El café de esta mañana estaba frío." };
  test("idéntica se acepta", () => {
    expect(checkDictado(ex, "El café de esta mañana estaba frío.").correct).toBe(true);
  });
  test("mayúsculas, espacios y punto final no importan", () => {
    expect(checkDictado(ex, "el  café   de esta mañana estaba frío  ").correct).toBe(true);
    expect(checkDictado(ex, "EL CAFÉ DE ESTA MAÑANA ESTABA FRÍO").correct).toBe(true);
  });
  test("una tilde que falta hace fallar el dictado", () => {
    expect(checkDictado(ex, "El cafe de esta mañana estaba frio.").correct).toBe(false);
  });
  test("otro signo final tampoco rompe (se tolera)", () => {
    expect(normalizeDictado("¡Hola!")).toBe("¡hola");
    expect(normalizeDictado("¿Qué tal?...")).toBe("¿qué tal");
  });
  test("el diff marca la palabra mal escrita y la que falta", () => {
    const d = dictadoDiff("El cafe de mañana", "El café de esta mañana");
    expect(d.some((t) => t.word === "cafe" && t.status === "wrong")).toBe(true);
    expect(d.some((t) => t.word === "esta" && t.status === "missing")).toBe(true);
    expect(d.filter((t) => t.status === "ok").length).toBe(3);
  });
});

describe("opción por índice (matics, lectura, sprint, sinónimos, refranes, historias)", () => {
  const ex = { options: ["A", "B", "C"], answerIndex: 1 };
  test("acierta y falla según índice", () => {
    expect(checkOptionIndex(ex, 1).correct).toBe(true);
    expect(checkOptionIndex(ex, 0).correct).toBe(false);
  });
  test("describe la respuesta del usuario y la correcta", () => {
    const v = checkOptionIndex(ex, 2);
    expect(v.userAnswer).toBe("C");
    expect(v.correctAnswer).toBe("B");
  });
});

describe("minuto: gradación honesta por esfuerzo", () => {
  const ex = { wordGoal: 40, criteria: ["c1", "c2", "c3"] };
  test("casi vacío es again y no cuenta acierto", () => {
    const v = checkMinuto(ex, 2, 0);
    expect(v.correct).toBe(null);
    expect(v.grade).toBe("again");
  });
  test("palabras suficientes y criterios altos son easy", () => {
    const v = checkMinuto(ex, 45, 2);
    expect(v.grade).toBe("easy");
  });
  test("esfuerzo medio es good o hard, nunca falso acierto", () => {
    const v = checkMinuto(ex, 24, 2);
    expect(["good", "hard"]).toContain(v.grade);
    expect(v.correct).toBe(null);
  });
});

describe("sesiones de las regiones de la Etapa 2", () => {
  const ctx = {
    skills: { vocabulario: 3, gramatica: 3, ortografia: 3, lectura: 3, audicion: 3, expresion: 3 } as Record<string, number>,
    seenExercises: {},
    srs: {},
    now: Date.now(),
    newCardsPerDay: 8,
  };
  test("misión del puerto mezcla dictado y matices", () => {
    const s = buildMission2("puerto", ctx, "seed-puerto");
    expect(s.items.length).toBeGreaterThan(0);
    const types = new Set(s.items.map((i) => (i.kind === "exercise" ? i.exercise.type : "srs")));
    expect(types.has("dictado")).toBe(true);
    expect(types.has("matices")).toBe(true);
  });
  test("misión de la torre incluye historias y refranes (sesión corta honesta)", () => {
    const s = buildMission2("torre", ctx, "seed-torre");
    const types = s.items.map((i) => (i.kind === "exercise" ? i.exercise.type : "srs"));
    expect(types.filter((t) => t === "historias").length).toBeLessThanOrEqual(2);
    expect(types).toContain("refranes");
    expect(s.items.length).toBeLessThanOrEqual(8);
  });
  test("misión de biblioteca incluye lectura inmersiva", () => {
    const s = buildMission2("biblioteca", ctx, "seed-biblio");
    const types = s.items.map((i) => (i.kind === "exercise" ? i.exercise.type : "srs"));
    expect(types).toContain("lectura");
    expect(types).toContain("parrafos");
  });
  test("entrenamiento de minuto es una sola consigna", () => {
    const s = buildTraining2("minuto", ctx, "seed-min");
    expect(s.items.length).toBe(1);
    expect(s.items[0].kind === "exercise" && s.items[0].exercise.type === "minuto").toBe(true);
  });
  test("entrenamiento de dictado trae dictados", () => {
    const s = buildTraining2("dictado", ctx, "seed-dict");
    expect(s.items.length).toBeGreaterThan(0);
    expect(s.items.every((i) => i.kind === "exercise" && i.exercise.type === "dictado")).toBe(true);
  });
});

describe("integridad de los grafos de historias", () => {
  for (const h of HISTORIAS_PACK) {
    test(`historia ${h.id}: todos los «next» llevan a nodos válidos o a fin`, () => {
      expect(h.start).toBeGreaterThanOrEqual(0);
      expect(h.start).toBeLessThan(h.nodes.length);
      for (const n of h.nodes) {
        expect(n.choices.length).toBeGreaterThanOrEqual(2);
        for (const c of n.choices) {
          expect(c.next === -1 || (c.next >= 0 && c.next < h.nodes.length)).toBe(true);
        }
      }
    });
  }
  test("toda historia alcanza al menos un final", () => {
    for (const h of HISTORIAS_PACK) {
      const finals = h.nodes.some((n) => n.choices.some((c) => c.next === -1));
      expect(finals).toBe(true);
    }
  });
});

describe("paquetes de la Etapa 2: cobertura de dificultad", () => {
  const packs: [string, { difficulty: number }[]][] = [
    ["dictado", DICTADO_PACK],
    ["matices", MATICES_PACK],
    ["lectura", LECTURA_PACK],
    ["sprint", SPRINT_PACK],
    ["sinonimos", SINONIMOS_PACK],
    ["refranes", REFRANES_PACK],
    ["minuto", MINUTO_PACK],
  ];
  for (const [name, pack] of packs) {
    test(`${name}: tiene ítems y dificultades 1-5 en rango`, () => {
      expect(pack.length).toBeGreaterThan(0);
      for (const e of pack) {
        expect(e.difficulty).toBeGreaterThanOrEqual(1);
        expect(e.difficulty).toBeLessThanOrEqual(5);
      }
    });
    test(`${name}: la respuesta correcta está en la posición declarada`, () => {
      const anyEx = pack as unknown as { options: string[]; answerIndex: number }[];
      for (const e of anyEx) {
        if (Array.isArray(e.options)) {
          expect(e.answerIndex).toBeGreaterThanOrEqual(0);
          expect(e.answerIndex).toBeLessThan(e.options.length);
        }
      }
    });
  }
  test("sprint y matices no concentran la respuesta en la primera opción", () => {
    const firstRatio = (p: { answerIndex: number }[]) => p.filter((e) => e.answerIndex === 0).length / p.length;
    expect(firstRatio(SPRINT_PACK)).toBeLessThan(0.5);
    expect(firstRatio(MATICES_PACK)).toBeLessThan(0.5);
  });
  test("el jardín se amplió de 49 a 73 palabras", () => {
    expect(SRS_WORDS.length).toBe(73);
  });
});

describe("logros de la Etapa 2", () => {
  test("existen los seis logros nuevos con iconos registrados", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    for (const id of ["ac-oido-marino", "ac-lector-atento", "ac-cuentacuentos", "ac-sabio-popular", "ac-cronista-minuto", "ac-explorador-total"]) {
      expect(ids).toContain(id);
    }
  });
  test("oído de marino se desbloquea con 10 dictados correctos", () => {
    const core = createCore();
    core.stats.byGame["dictado"] = { plays: 10, answers: 10, correct: 10, bestCombo: 4 };
    const def = ACHIEVEMENTS.find((a) => a.id === "ac-oido-marino")!;
    expect(def.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(true);
  });
  test("explorador de las seis islas exige las 6 regiones", () => {
    const core = createCore();
    core.stats.regionsByDay["2026-01-05"] = ["bosque", "ciudad", "fortaleza", "biblioteca", "puerto"];
    const def = ACHIEVEMENTS.find((a) => a.id === "ac-explorador-total")!;
    expect(def.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(false);
    core.stats.regionsByDay["2026-01-06"] = ["torre"];
    expect(def.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(true);
  });
});

describe("reductor: una sesión del minuto cuenta esfuerzo sin falsear aciertos", () => {
  test("minuto suma XP por grade y no contamina la exactitud", () => {
    const now = new Date("2026-03-01T10:00:00");
    const minutoSpec: SessionSpec = {
      label: "Minuto", mode: "training", gameId: "minuto",
      items: [{ kind: "exercise", exercise: MINUTO_PACK[0] }],
    };
    const answer: AnswerRecord = {
      itemId: MINUTO_PACK[0].id, kind: "exercise", gameId: "minuto", skill: "expresion",
      difficulty: 1, correct: null, grade: "easy", userAnswer: "40 palabras", correctAnswer: "Meta",
      timeMs: 61_000, wasSeenRecently: false,
    };
    const { core: next, result } = reduceSessionComplete(createCore(), {
      spec: minutoSpec, answers: [answer], durationMs: 70_000, now, masteredWords: 0, learnedWords: 0,
    });
    expect(result.accuracy).toBe(null);
    expect(result.xpTotal).toBeGreaterThan(0);
    expect(next.stats.byGame["minuto"].plays).toBe(1);
  });
});
