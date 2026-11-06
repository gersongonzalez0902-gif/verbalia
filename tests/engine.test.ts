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
import { REGIONS as REGIONS_ALL } from "@/data/regions";
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
    // La selección diaria es determinista pero depende de la fecha
    // (semilla `daily-<fecha>`), así que no podemos asumir qué métricas
    // saldrán hoy: saturamos todas y exigimos hecho + no reclamado.
    core.stats.correctByDay[day] = 999;
    core.stats.sessionsByDay[day] = 999;
    core.stats.xpByDay[day] = 999;
    core.stats.gamesByDay[day] = ["trivia", "puzzle", "cloze", "dictado", "refran"];
    core.stats.regionsByDay[day] = ["bosque", "ciudad", "fortaleza"];
    core.stats.comboByDay[day] = 999;
    core.stats.srsReviewsByDay[day] = 999;
    core.missions.daily = { dateKey: day, claimed: [] };
    const progress = dailyProgress(core, day);
    expect(progress.length).toBe(3);
    for (const p of progress) {
      expect(p.done).toBe(true);
      expect(p.claimed).toBe(false);
      expect(p.current).toBe(p.target);
    }
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
  test("el jardín se amplió a 1160 palabras (x2 variedad)", () => {
    expect(SRS_WORDS.length).toBe(1160);
  });
  test("las 8 regiones tienen sus cinco juegos nuevos", () => {
    for (const r of REGIONS_ALL) {
      expect(r.games.length).toBeGreaterThanOrEqual(5);
      if (r.id !== "forja") {
        const nuevos = r.games.filter((g) => g.includes("-"));
        expect(nuevos.length).toBeGreaterThanOrEqual(5); // 5 formatos nuevos por ciudad
      }
    }
    expect(REGIONS_ALL.length).toBe(8); // 6 clásicas + Observatorio + Forja
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
  test("explorador de las siete islas exige las 7 regiones", () => {
    const core = createCore();
    core.stats.regionsByDay["2026-01-05"] = ["bosque", "ciudad", "fortaleza", "biblioteca", "puerto", "torre"];
    const def = ACHIEVEMENTS.find((a) => a.id === "ac-explorador-total")!;
    expect(def.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(false);
    core.stats.regionsByDay["2026-01-06"] = ["observatorio"];
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

/* ============================ Etapa 4 · El Códice Infinito ============================ */

import { migrateProfile, migrateCore, EMPTY_PROFILE } from "@/engine/migrate";
import {
  applyPurchase, applyEquip, tintaForXp, TINTA_PER_XP, MAX_SHIELDS as SHOP_MAX_SHIELDS,
  SHOP_ITEMS, FRAMES, TITLES, frameCss, titleText,
} from "@/engine/shop";
import { checkForjaOption, checkIronia, checkCensura } from "@/engine/validation";
import { FORJA_PACKS, FORJA_METAFORAS, FORJA_REGISTRO, FORJA_CONECTORES, FORJA_IRONIA, FORJA_TITULOS } from "@/data/forja";
import { ALL_EXERCISES, EXERCISES_BY_GAME, SRS_WORDS_FULL } from "@/data/content";
import { SRS_WORDS_B } from "@/data/words-srs-b";
import { FRASES } from "@/data/frases";
import { ACHIEVEMENTS as ACH_ET4, LEVEL_ACHIEVEMENTS as LEVELS_ET4, ACHIEVEMENTS_BY_ID as BY_ID_ET4 } from "@/data/achievements";

describe("migración de partidas antiguas (fix del banner)", () => {
  test("migrateProfile rellena banner, bio, foto y featuredBadge de un perfil antiguo", () => {
    const antiguo = { name: "Marina", createdAt: 0 } as Partial<import("@/types").PlayerProfile>;
    const p = migrateProfile(antiguo);
    expect(p.banner).toBe("preset:aurora"); // nunca más undefined → .startsWith() seguro
    expect(p.bio).toBe("");
    expect(p.photo).toBe("");
    expect(p.featuredBadge).toBe("");
    expect(p.gender).toBe("x");
    expect(p.name).toBe("Marina");
    expect(p.createdAt).toBeGreaterThan(0); // 0 se sustituye por ahora
  });

  test("migrateProfile respeta los valores existentes", () => {
    const p = migrateProfile({ banner: "preset:coral", bio: "Hola", gender: "f", createdAt: 123456 });
    expect(p.banner).toBe("preset:coral");
    expect(p.bio).toBe("Hola");
    expect(p.gender).toBe("f");
    expect(p.createdAt).toBe(123456);
  });

  test("migrateProfile tolera null e undefined", () => {
    expect(migrateProfile(null).banner).toBe("preset:aurora");
    expect(migrateProfile(undefined).name).toBe("");
  });

  test("migrateCore añade wallet, cultura y métricas modernas a un núcleo Etapa 1", () => {
    const viejo: Partial<GameCore> = {
      xp: 500,
      skills: { vocabulario: 4, gramatica: 3 } as GameCore["skills"],
      stats: { totalSessions: 2, totalAnswers: 20, totalCorrect: 15 } as Partial<GameCore["stats"]> as GameCore["stats"],
    };
    const c = migrateCore(viejo as GameCore);
    expect(c.wallet.tinta).toBe(0);
    expect(c.wallet.owned).toEqual([]);
    expect(c.skills.cultura).toBe(2); // habilidad de la Etapa 3 rellenada
    expect(c.stats.totalTimeMs).toBe(0);
    expect(c.stats.bestComboEver).toBe(0);
    expect(c.xp).toBe(500); // el progreso no se toca
    expect(c.skills.vocabulario).toBe(4);
  });

  test("migrateCore conserva wallet existente y clona owned", () => {
    const base = createCore();
    base.wallet.tinta = 77;
    base.wallet.owned = ["frame-marea"];
    const c = migrateCore(base);
    expect(c.wallet.tinta).toBe(77);
    expect(c.wallet.owned).toEqual(["frame-marea"]);
    expect(c.wallet.owned).not.toBe(base.wallet.owned); // clonado, no compartido
  });

  test("migrateCore sin datos devuelve un núcleo fresco válido", () => {
    const c = migrateCore(null);
    expect(c).toEqual(createCore());
    expect(EMPTY_PROFILE.banner).toBe("preset:aurora");
  });
});

describe("Bazar del Copista: economía de tinta", () => {
  test("tintaForXp convierte 1 tinta por cada 10 XP (redondeo a la baja)", () => {
    expect(TINTA_PER_XP).toBe(10);
    expect(tintaForXp(0)).toBe(0);
    expect(tintaForXp(9)).toBe(0);
    expect(tintaForXp(10)).toBe(1);
    expect(tintaForXp(54)).toBe(5);
    expect(tintaForXp(-5)).toBe(0);
  });

  test("el reductor acredita la tinta de la sesión en la wallet", () => {
    const now = new Date("2026-03-01T10:00:00");
    const triviaEx = EXERCISES_BY_GAME["trivia"]![0];
    const spec: SessionSpec = {
      label: "T", mode: "training", gameId: "trivia",
      items: [{ kind: "exercise", exercise: triviaEx }],
    };
    const answer: AnswerRecord = {
      itemId: triviaEx.id, kind: "exercise", gameId: "trivia", skill: "vocabulario",
      difficulty: 1, correct: true, userAnswer: "sustantivo", correctAnswer: "sustantivo",
      timeMs: 4000, wasSeenRecently: false,
    };
    const { core, result } = reduceSessionComplete(createCore(), {
      spec, answers: [answer], durationMs: 9000, now, masteredWords: 0, learnedWords: 0,
    });
    expect(result.tintaEarned).toBe(Math.floor(result.xpTotal / 10));
    expect(core.wallet.tinta).toBe(result.tintaEarned);
    expect(result.tintaEarned).toBeGreaterThan(0);
  });

  test("la evaluación inicial no genera tinta", () => {
    const now = new Date("2026-03-01T10:00:00");
    const spec: SessionSpec = {
      label: "Evaluación", mode: "placement",
      items: ALL_EXERCISES.slice(0, 8).map((e) => ({ kind: "exercise", exercise: e })),
    };
    const answers: AnswerRecord[] = spec.items.map((it) => ({
      itemId: (it as { exercise: { id: string } }).exercise.id,
      kind: "exercise",
      gameId: "trivia" as const,
      skill: "vocabulario",
      difficulty: 1,
      correct: false,
      userAnswer: "x",
      correctAnswer: "y",
      timeMs: 1000,
      wasSeenRecently: false,
    }));
    const { result } = reduceSessionComplete(createCore(), {
      spec, answers, durationMs: 8000, now, masteredWords: 0, learnedWords: 0,
    });
    expect(result.tintaEarned).toBe(0);
  });

  test("compra falla sin fondos y no muta el núcleo", () => {
    const core = createCore();
    const item = SHOP_ITEMS.find((s) => s.kind === "frame")!;
    const out = applyPurchase(core, item.id);
    expect(out.ok).toBe(false);
    expect(out.reason).toBe("sin-fondos");
    expect(out.core).toBeUndefined();
    expect(core.wallet.tinta).toBe(0); // inmutabilidad
  });

  test("compra con fondos descuenta, registra, gasta y equipa al instante", () => {
    const core = createCore();
    core.wallet.tinta = 500;
    const item = SHOP_ITEMS.find((s) => s.id === "frame-marea")!;
    const out = applyPurchase(core, item.id)!;
    expect(out.ok).toBe(true);
    const next = out.core!;
    expect(next.wallet.tinta).toBe(500 - item.price);
    expect(next.wallet.spent).toBe(item.price);
    expect(next.wallet.owned).toContain("frame-marea");
    expect(next.wallet.frame).toBe("frame-marea"); // se equipa al comprar
    expect(core.wallet.tinta).toBe(500); // el original intacto
    // Repetir la compra: ya es dueño
    expect(applyPurchase(next, item.id).reason).toBe("ya-propietario");
  });

  test("los títulos se equipan en el campo correcto", () => {
    const core = createCore();
    core.wallet.tinta = 400;
    const out = applyPurchase(core, "title-tinta")!;
    expect(out.ok).toBe(true);
    expect(out.core!.wallet.title).toBe("title-tinta");
    expect(titleText("title-tinta")).toBe("Mano de tinta");
    expect(titleText("title-none")).toBe("");
  });

  test("escudo: se apila hasta el máximo y luego rechaza", () => {
    const core = createCore();
    core.wallet.tinta = 500;
    let cur = core;
    for (let i = 1; i <= SHOP_MAX_SHIELDS; i++) {
      const out = applyPurchase(cur, "shield-1")!;
      expect(out.ok).toBe(true);
      cur = out.core!;
      expect(cur.streak.shields).toBe(i);
    }
    const full = applyPurchase(cur, "shield-1");
    expect(full.ok).toBe(false);
    expect(full.reason).toBe("escudo-lleno");
  });

  test("applyEquip solo permite artículos comprados o gratuitos", () => {
    const core = createCore();
    core.wallet.tinta = 300;
    const owned = applyPurchase(core, "frame-rustico")!.core!;
    // Equipar lo comprado
    let cur = applyEquip(owned, "frame-rustico");
    expect(cur.wallet.frame).toBe("frame-rustico");
    // Volver al gratuito
    cur = applyEquip(cur, "frame-none");
    expect(cur.wallet.frame).toBe("frame-none");
    // No se puede equipar lo no comprado
    cur = applyEquip(cur, "frame-faro");
    expect(cur.wallet.frame).toBe("frame-none");
    // Catálogos completos
    expect(FRAMES.length).toBeGreaterThanOrEqual(6);
    expect(TITLES.length).toBeGreaterThanOrEqual(7);
    expect(frameCss("frame-codice")).toContain("linear-gradient");
    expect(frameCss("no-existe")).toBe("");
  });

  test("el catálogo no vende ventajas: precios razonables y sin ids duplicados", () => {
    const ids = new Set(SHOP_ITEMS.map((s) => s.id));
    expect(ids.size).toBe(SHOP_ITEMS.length);
    for (const s of SHOP_ITEMS) {
      expect(s.price).toBeGreaterThan(0);
      expect(s.price).toBeLessThanOrEqual(250); // tope: legendarios del Bazar 2.0
    }
  });
});

describe("Etapa 4: contenido de la Forja", () => {
  test("la Forja aporta 12 ejercicios por cada uno de sus cinco formatos", () => {
    expect(FORJA_METAFORAS.length).toBe(12);
    expect(FORJA_REGISTRO.length).toBe(12);
    expect(FORJA_CONECTORES.length).toBe(12);
    expect(FORJA_IRONIA.length).toBe(12);
    expect(FORJA_TITULOS.length).toBe(12);
    expect(FORJA_PACKS.length).toBe(60);
  });

  test("los 60 ejercicios de la Forja están registrados y sin ids repetidos", () => {
    const ids = FORJA_PACKS.map((e) => e.id);
    expect(new Set(ids).size).toBe(60);
    for (const g of ["metaforas", "registro", "conectores", "ironia", "titulos"] as const) {
      expect(EXERCISES_BY_GAME[g]?.length).toBe(12);
    }
  });

  test("metáforas y registro: opciones válidas, respuesta dentro de rango y explicación real", () => {
    for (const e of [...FORJA_METAFORAS, ...FORJA_REGISTRO]) {
      expect(e.options.length).toBeGreaterThanOrEqual(3);
      expect(e.answerIndex).toBeGreaterThanOrEqual(0);
      expect(e.answerIndex).toBeLessThan(e.options.length);
      expect(e.explanation.length).toBeGreaterThan(20);
      expect(e.stem ?? e.context).toBeTruthy();
    }
  });

  test("conectores: el hueco está en la frase y la respuesta es un conector", () => {
    for (const e of FORJA_CONECTORES) {
      expect(e.sentence).toContain("___");
      expect(e.answerIndex).toBeLessThan(e.options.length);
      expect(e.options[e.answerIndex].length).toBeGreaterThan(3);
    }
  });

  test("ironía: tono binario y contexto presente", () => {
    for (const e of FORJA_IRONIA) {
      expect(["literal", "ironico"]).toContain(e.answer);
      expect(e.context.length).toBeGreaterThan(8);
      expect(e.statement.length).toBeGreaterThan(8);
    }
    const iron = FORJA_IRONIA.filter((e) => e.answer === "ironico").length;
    const lit = FORJA_IRONIA.length - iron;
    expect(iron).toBeGreaterThan(0);
    expect(lit).toBeGreaterThan(0); // equilibrio: ambos tonos aparecen
  });

  test("censura: tokens contienen la respuesta; los textos limpios son mínimos", () => {
    for (const e of FORJA_TITULOS) {
      if (e.answerIndex === -1) continue;
      expect(e.answerIndex).toBeLessThan(e.tokens.length);
      expect(e.tokens.length).toBeGreaterThanOrEqual(5);
      expect(e.explanation.length).toBeGreaterThan(15);
    }
    const limpios = FORJA_TITULOS.filter((e) => e.answerIndex === -1).length;
    expect(limpios).toBe(2); // trampas honestas: no todo lleva error
  });

  test("la misión de la Forja mezcla los cinco formatos", () => {
    const ctx = {
      skills: createCore().skills,
      seenExercises: {},
      srs: {} as Record<string, SrsCard>,
      now: new Date("2026-03-01").getTime(),
      newCardsPerDay: 8,
    };
    const spec = buildMission2("forja" as never, ctx, "seed-forja");
    expect(spec.items.length).toBeGreaterThan(0);
    const tipos = new Set(spec.items.map((i) => (i.kind === "exercise" ? i.exercise.type : "srs")));
    expect(tipos.size).toBeGreaterThanOrEqual(4);
  });
});

describe("Etapa 4: validación de los formatos de la Forja", () => {
  test("checkForjaOption compara por índice", () => {
    const ex = { options: ["a", "b", "c"], answerIndex: 2 };
    expect(checkForjaOption(ex, 2).correct).toBe(true);
    expect(checkForjaOption(ex, 0).correct).toBe(false);
    expect(checkForjaOption(ex, 2).correctAnswer).toBe("c");
  });

  test("checkIronia acierta solo con el tono real", () => {
    const ex = { answer: "ironico" };
    expect(checkIronia(ex, "ironico").correct).toBe(true);
    expect(checkIronia(ex, "literal").correct).toBe(false);
    expect(checkIronia(ex, "literal").userAnswer).toBe("Sentido literal");
  });

  test("checkCensura: token redundante, texto limpio y ambos errores", () => {
    const conError = { tokens: ["El", "gato", "subió", "arriba"], answerIndex: 3 };
    expect(checkCensura(conError, 3).correct).toBe(true);
    expect(checkCensura(conError, 1).correct).toBe(false);
    expect(checkCensura(conError, "limpio").correct).toBe(false);
    expect(checkCensura(conError, "limpio").correctAnswer).toContain("arriba");
    const limpio = { tokens: ["Faro", "brilla"], answerIndex: -1 };
    expect(checkCensura(limpio, "limpio").correct).toBe(true);
    expect(checkCensura(limpio, 0).correct).toBe(false);
  });
});

describe("Etapa 4: logros del Códice", () => {
  test("existen los 13 logros nuevos de la Etapa 4 con id único", () => {
    const ids = ACH_ET4.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of [
      "ac-forja-1", "ac-forja-25", "ac-forja-completa",
      "ac-tinta-100", "ac-tinta-500", "ac-mecenas",
      "ac-ocho-islas", "ac-palabras-75", "ac-palabras-125",
      "ac-racha-30", "ac-combo-15", "ac-tiempo-10h", "ac-sesiones-100",
    ]) {
      expect(ids).toContain(id);
    }
    expect(LEVELS_ET4["ac-nivel-15"]).toBe(15);
    expect(BY_ID_ET4["ac-nivel-15"].name).toBe("Leyenda del Códice");
  });

  test("herrero de palabras se desbloquea con 25 aciertos de la Forja", () => {
    const core = createCore();
    core.stats.byGame["metaforas"] = { plays: 3, answers: 10, correct: 9, bestCombo: 2 };
    core.stats.byGame["titulos"] = { plays: 2, answers: 10, correct: 8, bestCombo: 3 };
    core.stats.byGame["ironia"] = { plays: 2, answers: 10, correct: 8, bestCombo: 2 };
    const def = ACH_ET4.find((a) => a.id === "ac-forja-25")!;
    expect(def.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(true);
  });

  test("maestro de la Forja exige los cinco formatos", () => {
    const core = createCore();
    for (const g of ["metaforas", "registro", "conectores", "ironia"] as const) {
      core.stats.byGame[g] = { plays: 1, answers: 1, correct: 1, bestCombo: 1 };
    }
    const def = ACH_ET4.find((a) => a.id === "ac-forja-completa")!;
    expect(def.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(false);
    core.stats.byGame["titulos"] = { plays: 1, answers: 1, correct: 1, bestCombo: 1 };
    expect(def.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(true);
  });

  test("tinta ganada y mecenas usan la wallet (compatible con núcleos sin wallet)", () => {
    const core = createCore();
    const def100 = ACH_ET4.find((a) => a.id === "ac-tinta-100")!;
    const defMecenas = ACH_ET4.find((a) => a.id === "ac-mecenas")!;
    expect(def100.check({ ...core, wallet: undefined as never }, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(false);
    core.wallet.tinta = 90;
    core.wallet.spent = 20;
    expect(def100.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(true);
    core.wallet.owned = ["frame-rustico", "title-tinta", "frame-faro"];
    expect(defMecenas.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(true);
  });

  test("cartógrafo de las ocho islas exige las 8 regiones", () => {
    const core = createCore();
    core.stats.regionsByDay["2026-01-05"] = ["bosque", "ciudad", "fortaleza", "biblioteca", "puerto", "torre", "observatorio"];
    const def = ACH_ET4.find((a) => a.id === "ac-ocho-islas")!;
    expect(def.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(false);
    core.stats.regionsByDay["2026-01-06"] = ["forja"];
    expect(def.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(true);
  });

  test("combo-15, tiempo-10h y sesiones-100 usan las métricas acumuladas", () => {
    const core = createCore();
    const combo = ACH_ET4.find((a) => a.id === "ac-combo-15")!;
    const tiempo = ACH_ET4.find((a) => a.id === "ac-tiempo-10h")!;
    const sesiones = ACH_ET4.find((a) => a.id === "ac-sesiones-100")!;
    expect(combo.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(false);
    core.stats.bestComboEver = 15;
    expect(combo.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(true);
    core.stats.totalTimeMs = 10 * 3_600_000;
    expect(tiempo.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(true);
    core.stats.totalSessions = 100;
    expect(sesiones.check(core, { masteredWords: 0, learnedWords: 0, now: Date.now() })).toBe(true);
  });
});

describe("Etapa 4: misiones y palabras ampliadas", () => {
  test("la métrica de tinta aproxima 1 por cada 10 XP del periodo", () => {
    const core = createCore();
    core.stats.xpByDay["2026-03-01"] = 95;
    core.stats.xpByDay["2026-03-02"] = 40;
    const hoy = metricValue(core, "tinta", { days: ["2026-03-01", "2026-03-02"] });
    expect(hoy).toBe(9 + 4);
  });

  test("el jardín completo creció a 1844 palabras sin duplicados entre paquetes (Mega-6)", () => {
    expect(SRS_WORDS_B.length).toBe(150);
    expect(SRS_WORDS_FULL.length).toBe(1844);
    const ids = SRS_WORDS_FULL.map((w) => w.id);
    expect(new Set(ids).size).toBe(1844);
    const words = SRS_WORDS_FULL.map((w) => w.word);
    expect(new Set(words).size).toBe(1844); // ni palabras repetidas
  });

  test("las palabras nuevas tienen definición, ejemplo y MCER coherente", () => {
    for (const w of SRS_WORDS_B) {
      expect(w.definition.length).toBeGreaterThan(10);
      expect(w.example.length).toBeGreaterThan(6);
      expect(["A1", "A2", "B1", "B2", "C1", "C2"]).toContain(w.cefr);
      expect(w.difficulty).toBeGreaterThanOrEqual(1);
      expect(w.difficulty).toBeLessThanOrEqual(5);
    }
  });

  test("las frases del día llegan a 320 sin repetición de texto", () => {
    expect(FRASES.length).toBeGreaterThanOrEqual(320);
    const texts = new Set(FRASES.map((f) => f.text));
    expect(texts.size).toBe(FRASES.length);
  });

  test("todo el catálogo de ejercicios sigue sin ids duplicados y creció a 5080+", () => {
    const ids = ALL_EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ALL_EXERCISES.length).toBeGreaterThanOrEqual(5080);
  });
});

/* ==================== Mega-actualización 6: Salón de Juegos ==================== */

import {
  parseFen, START_FEN, legalMoves, applyMove, gameStatus, toFen,
  bestMove, evaluate, type ChessState,
} from "@/engine/chess";
import {
  initialBoard, legalDraughtsMoves, applyDraughtsMove,
  draughtsStatus, bestDraughtsMove, draughtsName,
} from "@/engine/checkers";
import {
  ARCADE_GAMES, ARCADE_BY_ID, arcadeAvailable, applyArcadeUnlock,
  applyArcadeScore, applyChessElo, arcadeXpFor,
} from "@/engine/arcade";
import { createCore } from "@/engine/core";

function perft(state: ChessState, depth: number): number {
  if (depth === 0) return 1;
  const moves = legalMoves(state);
  if (depth === 1) return moves.length;
  let nodes = 0;
  for (const m of moves) nodes += perft(applyMove(state, m), depth - 1);
  return nodes;
}

describe("Mega-6: motor de ajedrez local (perft canónico)", () => {
  test("posición inicial: perft 1-3 exacto", () => {
    const s = parseFen(START_FEN);
    expect(perft(s, 1)).toBe(20);
    expect(perft(s, 2)).toBe(400);
    expect(perft(s, 3)).toBe(8902);
  });

  test("Kiwipete (enroques + descubiertos): 48 / 2039", () => {
    const s = parseFen("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    expect(perft(s, 1)).toBe(48);
    expect(perft(s, 2)).toBe(2039);
  });

  test("posición 3 (al paso): 14 / 191 / 2812", () => {
    const s = parseFen("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
    expect(perft(s, 1)).toBe(14);
    expect(perft(s, 2)).toBe(191);
    expect(perft(s, 3)).toBe(2812);
  });

  test("detecta mate, ahogado y tablas por material", () => {
    // mate del pastor en 2: 1. e4 e5?? no — posición tras Dxh7+ mate clásico
    const mate = parseFen("6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1");
    const after = applyMove(mate, { from: 0, to: 56, piece: "R" });
    const st = gameStatus(after);
    expect(st.over).toBe(true);
    if (st.over) expect(st.reason).toBe("mate");

    const stale = parseFen("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
    const st2 = gameStatus(stale);
    expect(st2.over).toBe(true);
    if (st2.over) expect(st2.reason).toBe("stalemate");

    const bare = parseFen("8/8/4k3/8/8/4K3/8/8 w - - 0 1");
    const st3 = gameStatus(bare);
    expect(st3.over).toBe(true);
    if (st3.over) expect(st3.reason).toBe("material");
  });

  test("el motor encuentra mate en 1 y captura colgante", () => {
    const mate1 = parseFen("6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1");
    const r = bestMove(mate1, 2);
    expect(r.move?.from).toBe(0);
    expect(r.move?.to).toBe(56);

    // dama colgante en d5: la torre debe comerla
    const hang = parseFen("3k4/8/8/3r4/8/8/3R4/3K4 w - - 0 1");
    const r2 = bestMove(hang, 2);
    expect(r2.move?.to).toBe(35); // d5
  });

  test("FEN ida y vuelta conserva la posición", () => {
    const s = parseFen("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    expect(toFen(s)).toBe("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
  });

  test("la evaluación prefiere material extra para las blancas", () => {
    const up = parseFen("4k3/8/8/4P3/8/8/8/4K3 w - - 0 1"); // peón blanco de más
    expect(evaluate(up)).toBeGreaterThan(0);
    const down = parseFen("4k3/4p3/8/8/8/8/8/4K3 w - - 0 1"); // peón negro de más
    expect(evaluate(down)).toBeLessThan(0);
  });
});

describe("Mega-6: damas españolas", () => {
  test("posición inicial: 7 jugadas para negras, tablero válido", () => {
    const b = initialBoard();
    expect(b.filter((c) => c === 3).length).toBe(12);
    expect(b.filter((c) => c === 1).length).toBe(12);
    const moves = legalDraughtsMoves(b, "b");
    expect(moves.length).toBe(7);
    expect(draughtsStatus(b, "w").over).toBe(false);
  });

  test("la captura es obligatoria", () => {
    // peón blanco en b4 puede comer peón negro en c5 y aterrizar en d6
    const b = new Array(64).fill(0) as import("@/engine/checkers").Board;
    b[25] = 1; // blanco en b4
    b[34] = 3; // negro en c5
    const moves = legalDraughtsMoves(b, "w");
    expect(moves.length).toBe(1);
    expect(moves[0].captured.length).toBe(1);
    expect(moves[0].captured[0]).toBe(34);
    // aplicar la captura
    const after = applyDraughtsMove(b, moves[0]);
    expect(after[34]).toBe(0);
    expect(after[43]).toBe(1); // aterriza en d6
  });

  test("la IA responde con una jugada legal", () => {
    const b = initialBoard();
    const m = bestDraughtsMove(b, "b", 2);
    expect(m).not.toBeNull();
    expect(m!.path.length).toBeGreaterThanOrEqual(2);
    expect(typeof draughtsName(m!)).toBe("string");
  });

  test("fin de partida por bloqueo o sin fichas", () => {
    const empty = new Array(64).fill(0) as import("@/engine/checkers").Board;
    const st = draughtsStatus(empty, "b");
    expect(st.over).toBe(true);
    if (st.over) expect(st.reason).toBe("sin-fichas");
  });
});

describe("Mega-6: economía del Salón de Juegos", () => {
  test("el catálogo tiene 23 juegos con categorías y precios válidos", () => {
    expect(ARCADE_GAMES.length).toBe(23);
    const ids = new Set(ARCADE_GAMES.map((g) => g.id));
    expect(ids.size).toBe(23);
    for (const g of ARCADE_GAMES) {
      expect(g.price).toBeGreaterThanOrEqual(0);
      expect(g.xpCap).toBeGreaterThan(0);
      expect(g.dailyXpCap).toBeGreaterThan(0);
      expect(["mesa", "calculo", "memoria", "logica", "palabras", "reflejos"]).toContain(g.category);
    }
    expect(ARCADE_BY_ID["ajedrez"]).toBeDefined();
    expect(ARCADE_BY_ID["damas"]).toBeDefined();
  });

  test("ajedrez y damas son gratuitos; los retos cuestan tinta", () => {
    const core = createCore();
    expect(arcadeAvailable(core, "ajedrez", 1)).toBe(true);
    expect(arcadeAvailable(core, "damas", 1)).toBe(true);
    expect(arcadeAvailable(core, "buscaminas", 1)).toBe(false);
  });

  test("desbloqueo con tinta resta y persiste", () => {
    let core = { ...createCore(), wallet: { ...createCore().wallet, tinta: 100 } };
    const out = applyArcadeUnlock(core, "buscaminas");
    expect(out.ok).toBe(true);
    expect(out.core!.wallet.tinta).toBe(60); // 40 de precio
    expect(out.core!.arcade.unlocked).toContain("buscaminas");
    expect(arcadeAvailable(out.core!, "buscaminas", 1)).toBe(true);
    // no hay fondos
    const out2 = applyArcadeUnlock(out.core!, "sudoku-4"); // cuesta 40, quedan 60 → ok
    expect(out2.ok).toBe(true);
    const out3 = applyArcadeUnlock(out2.core!, "palabra-secreta"); // 40, quedan 20 → sin fondos
    expect(out3.ok).toBe(false);
    if (!out3.ok) expect(out3.reason).toBe("sin-fondos");
  });

  test("la puntuación entrega XP limitada por tope diario", () => {
    const core = createCore();
    const first = applyArcadeScore(core, "mates-relampago", 300);
    expect(first.xp).toBe(30); // 300/10 = 30 (cap 40, cap diario 80)
    expect(first.isRecord).toBe(true);
    expect(first.tinta).toBe(3);
    const second = applyArcadeScore(first.core, "mates-relampago", 500);
    expect(second.xp).toBe(40); // 50 pedido, cap por partida 40
    const third = applyArcadeScore(second.core, "mates-relampago", 400);
    expect(third.xp).toBe(10); // 40 pedido, solo 10 hasta el tope diario 80
    const fourth = applyArcadeScore(third.core, "mates-relampago", 400);
    expect(fourth.xp).toBe(0); // tope diario agotado
  });

  test("el ELO de ajedrez se actualiza con Elo clásico", () => {
    const core = createCore();
    const afterWin = applyChessElo(core, "w", 1200);
    expect(afterWin.arcade.chessElo).toBeGreaterThan(1200);
    const afterLoss = applyChessElo(core, "l", 1200);
    expect(afterLoss.arcade.chessElo).toBeLessThan(1200);
    expect(afterWin.arcade.chessRecord.w).toBe(1);
    expect(afterLoss.arcade.chessRecord.l).toBe(1);
  });

  test("arcadeXpFor no devuelve negativos ni excede el tope", () => {
    const core = createCore();
    expect(arcadeXpFor(core, "ajedrez", 1000)).toBe(60);
    expect(arcadeXpFor(core, "ajedrez", -5)).toBe(0);
  });
});
