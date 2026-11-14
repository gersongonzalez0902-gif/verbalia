import { describe, expect, test } from "bun:test";
import { lexiconCardText, sortWords, wordOfDay } from "@/lib/lexico";
import { SRS_WORDS_FULL } from "@/data/content";
import type { SrsCard, SrsWord } from "@/types";

/**
 * Área 10 · biblioteca léxica: palabra del día determinista, órdenes
 * estables y ficha para copiar.
 */

const srsOf = (entries: Record<string, Partial<SrsCard>>): Record<string, SrsCard> =>
  Object.fromEntries(
    Object.entries(entries).map(([id, card]) => [id, { dueAt: 0, reps: 0, lapses: 0, ...card } as SrsCard]),
  );

describe("Área 10 · palabra del día", () => {
  test("misma fecha, misma palabra (determinista y sin servidor)", () => {
    const a = wordOfDay(SRS_WORDS_FULL, {}, "2026-11-14");
    const b = wordOfDay(SRS_WORDS_FULL, {}, "2026-11-14");
    expect(a?.id).toBe(b?.id);
  });

  test("fechas distintas reparten la elección (no siempre la primera)", () => {
    const picks = new Set(
      Array.from({ length: 30 }, (_, i) => wordOfDay(SRS_WORDS_FULL, {}, `2026-10-${String(i + 1).padStart(2, "0")}`)?.id),
    );
    expect(picks.size).toBeGreaterThan(3);
  });

  test("con jardín aprendido, la palabra del día sale de lo aprendido", () => {
    const learned = SRS_WORDS_FULL[0];
    const pending = SRS_WORDS_FULL[1];
    const srs = srsOf({
      [learned.id]: { state: "review", intervalDays: 21, dueAt: 1 },
    });
    const pick = wordOfDay([pending, learned], srs, "2026-11-14");
    expect(pick?.id).toBe(learned.id);
  });

  test("sin palabras no hay palabra del día", () => {
    expect(wordOfDay([], {}, "2026-11-14")).toBeNull();
  });
});

describe("Área 10 · órdenes de la colección", () => {
  const words = SRS_WORDS_FULL.slice(0, 12);

  test("alfabético ordena por la palabra (es)", () => {
    const sorted = sortWords(words, {}, "alfabetico");
    const names = sorted.map((w) => w.word);
    expect([...names].sort((a, b) => a.localeCompare(b, "es"))).toEqual(names);
  });

  test("dificultad es estable y ascendente", () => {
    const sorted = sortWords(words, {}, "dificultad");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].difficulty).toBeGreaterThanOrEqual(sorted[i - 1].difficulty);
    }
  });

  test("revisión adelanta las tarjetas que tocan repasar antes", () => {
    const srs = srsOf({
      [words[3].id]: { dueAt: 100 },
      [words[5].id]: { dueAt: 200 },
    });
    const sorted = sortWords(words, srs, "revision");
    expect(sorted[0].id).toBe(words[3].id);
    expect(sorted[1].id).toBe(words[5].id);
  });
});

describe("Área 10 · ficha léxica para copiar", () => {
  test("incluye palabra, categoría, nivel, definición y ejemplo", () => {
    const w: SrsWord = SRS_WORDS_FULL[0];
    const txt = lexiconCardText(w);
    expect(txt).toContain(w.word);
    expect(txt).toContain(w.pos);
    expect(txt).toContain(w.cefr);
    expect(txt).toContain(w.definition);
    expect(txt).toContain(w.example);
  });
});
