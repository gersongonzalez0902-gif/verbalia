import { describe, expect, test } from "bun:test";
import { ACHIEVEMENTS, LEVEL_ACHIEVEMENTS } from "@/data/achievements";
import { cumulativeXpForLevel } from "@/engine/xp";
import { createCore } from "@/engine/core";

/** Núcleo real a cero, con el XP ajustado: los checks se evalúan sobre
 *  la misma forma que usan en partida (nada de stubs a medio hacer). */
const coreWith = (xp: number, ctxExtra?: { learnedWords?: number }) => {
  const c = createCore();
  c.xp = xp;
  return c;
};

const CTX = { masteredWords: 0, learnedWords: 0, now: Date.now() };

describe("Área 8 · evaluación real de logros", () => {
  test("el catálogo no tiene checks falsos ni ids repetidos", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Ningún check es el falso histórico «() => false».
    for (const a of ACHIEVEMENTS) {
      expect(a.check(coreWith(0), CTX)).not.toBeUndefined();
    }
  });

  test("los logros por nivel se cumplen justo al alcanzar el nivel", () => {
    for (const [, lvl] of Object.entries(LEVEL_ACHIEVEMENTS)) {
      const def = ACHIEVEMENTS.find((a) => a.id === `ac-nivel-${lvl}`);
      expect(def).toBeDefined();
      const defOk = ACHIEVEMENTS.find((a) => a.id === `ac-nivel-${lvl}`)!;
      expect(defOk.check(coreWith(cumulativeXpForLevel(lvl)), CTX)).toBe(true);
      expect(defOk.check(coreWith(cumulativeXpForLevel(lvl) - 1), CTX)).toBe(false);
    }
  });

  test("el progreso por nivel crece con el XP y llega a 1 en el destino", () => {
    const def = ACHIEVEMENTS.find((a) => a.id === "ac-nivel-5")!;
    const progBefore = def.progress!(coreWith(cumulativeXpForLevel(5) - 100), CTX);
    const progAfter = def.progress!(coreWith(cumulativeXpForLevel(5)), CTX);
    expect(progBefore).toBeGreaterThan(0);
    expect(progBefore).toBeLessThan(1);
    expect(progAfter).toBe(1);
  });

  test("el nivel 30 («Treinta faros») existe y evalúa como los demás", () => {
    const def = ACHIEVEMENTS.find((a) => a.id === "ac-nivel-30")!;
    expect(def.check(coreWith(cumulativeXpForLevel(30)), CTX)).toBe(true);
    expect(def.check(coreWith(cumulativeXpForLevel(30) - 1), CTX)).toBe(false);
  });

  test("los logros de palabras progresan con el contexto aprendido", () => {
    const def = ACHIEVEMENTS.find((a) => a.id === "ac-palabras-25")!;
    expect(def.check(coreWith(0), { ...CTX, learnedWords: 25 })).toBe(true);
    expect(def.check(coreWith(0), { ...CTX, learnedWords: 24 })).toBe(false);
    expect(def.progress!(coreWith(0), { ...CTX, learnedWords: 10 })).toBeCloseTo(0.4);
  });

  test("las recompensas del catálogo son siempre positivas", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.xpReward).toBeGreaterThan(0);
      if (a.tintaReward !== undefined) expect(a.tintaReward).toBeGreaterThan(0);
    }
  });

  test("los umbrales de nivel del catálogo coinciden con LEVEL_ACHIEVEMENTS", () => {
    for (const [id, lvl] of Object.entries(LEVEL_ACHIEVEMENTS)) {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      expect(def, `falta el logro ${id}`).toBeDefined();
      expect(def!.check(coreWith(cumulativeXpForLevel(lvl)), CTX)).toBe(true);
    }
  });
});
