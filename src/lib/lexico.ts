/**
 * Ayudas de la biblioteca léxica (Área 10) — puras y testeables.
 * La «palabra del día» es determinista: la misma fecha, la misma palabra
 * en todos los aparatos, sin servidor y sin azar.
 */

import { cardStatus } from "@/engine/srs";
import type { SrsCard, SrsWord } from "@/types";

export type WordSort = "dificultad" | "alfabetico" | "revision";

/** Hash FNV-1a de 32 bits: rápido, determinista y sin dependencias. */
function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** La palabra del día: preferimos una ya aprendida (revisar lo conocido);
 *  si el jardín está vacío, cualquier palabra sirve. Determinista por fecha. */
export function wordOfDay(
  words: SrsWord[],
  srs: Record<string, SrsCard>,
  dateKeyStr: string,
): SrsWord | null {
  if (words.length === 0) return null;
  const learned = words.filter((w) => {
    const st = cardStatus(srs[w.id]);
    return st === "aprendida" || st === "dominada";
  });
  const pool = learned.length > 0 ? learned : words;
  return pool[fnv1a(dateKeyStr) % pool.length] ?? null;
}

/** Orden estable de la colección según el criterio elegido. */
export function sortWords(
  words: SrsWord[],
  srs: Record<string, SrsCard>,
  mode: WordSort,
): SrsWord[] {
  const copy = [...words];
  if (mode === "alfabetico") {
    return copy.sort((a, b) => a.word.localeCompare(b.word, "es"));
  }
  if (mode === "revision") {
    // Las que tocan repasar primero; sin tarjeta al final (por descubrir).
    return copy.sort((a, b) => {
      const da = srs[a.id]?.dueAt ?? Number.POSITIVE_INFINITY;
      const db = srs[b.id]?.dueAt ?? Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      return a.word.localeCompare(b.word, "es");
    });
  }
  // dificultad (el orden de siempre)
  return copy.sort((a, b) => a.difficulty - b.difficulty || a.word.localeCompare(b.word, "es"));
}

/** Ficha léxica en texto plano para copiar y llevar (apuntes, clase…). */
export function lexiconCardText(w: SrsWord): string {
  return `${w.word} (${w.pos}, ${w.cefr}) — ${w.definition} Ejemplo: «${w.example}»`;
}
