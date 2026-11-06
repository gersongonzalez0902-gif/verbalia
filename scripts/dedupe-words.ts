/**
 * Deduplica las palabras de los packs c1/d1/e1 contra el catálogo
 * existente (base + B + X) y entre sí. Reescribe los ficheros sin las
 * entradas repetidas (por palabra en minúsculas).
 */
import { SRS_WORDS } from "@/data/words-srs";
import { SRS_WORDS_B } from "@/data/words-srs-b";
import { SRS_WORDS_C1 } from "@/data/gen/words-srs-c1";
import { SRS_WORDS_D1 } from "@/data/gen/words-srs-d1";
import { SRS_WORDS_E1 } from "@/data/gen/words-srs-e1";
import { writeFileSync } from "node:fs";

const seen = new Set<string>();
for (const w of [...SRS_WORDS, ...SRS_WORDS_B]) seen.add(w.word.toLowerCase());

function dedupe<T extends { word: string }>(arr: T[]): { keep: T[]; dropped: string[] } {
  const keep: T[] = [];
  const dropped: string[] = [];
  for (const w of arr) {
    const key = w.word.toLowerCase();
    if (seen.has(key)) dropped.push(w.word);
    else {
      seen.add(key);
      keep.push(w);
    }
  }
  return { keep, dropped };
}

const c1 = dedupe(SRS_WORDS_C1);
const d1 = dedupe(SRS_WORDS_D1);
const e1 = dedupe(SRS_WORDS_E1);

console.log(`c1: quedan ${c1.keep.length}, fuera ${c1.dropped.length}`);
console.log(`d1: quedan ${d1.keep.length}, fuera ${d1.dropped.length}`);
console.log(`e1: quedan ${e1.keep.length}, fuera ${e1.dropped.length}`);
console.log(`Total final: ${1310 + c1.keep.length + d1.keep.length + e1.keep.length}`);

function rewrite(path: string, header: string, items: { word: string }[]) {
  const body = items
    .map((w) => {
      const full = w as unknown as Record<string, unknown>;
      const tags = JSON.stringify(full.tags);
      return `  { id: ${JSON.stringify(full.id)}, word: ${JSON.stringify(full.word)}, pos: ${JSON.stringify(full.pos)}, definition: ${JSON.stringify(full.definition)}, example: ${JSON.stringify(full.example)}, difficulty: ${full.difficulty}, cefr: ${JSON.stringify(full.cefr)}, tags: ${tags} },`;
    })
    .join("\n");
  writeFileSync(path, `${header}\n${items.length > 0 ? body + "\n" : ""};\n`, "utf-8");
}

rewrite(
  "src/data/gen/words-srs-c1.ts",
  `import type { SrsWord } from "@/types";

/**
 * Paquete C1 · Mega-ampliación (niveles A1-B1), depurado sin duplicados.
 */

export const SRS_WORDS_C1: SrsWord[] = [`,
  c1.keep,
);
rewrite(
  "src/data/gen/words-srs-d1.ts",
  `import type { SrsWord } from "@/types";

/**
 * Paquete D1 · Mega-ampliación (niveles A1-B1), depurado sin duplicados.
 */

export const SRS_WORDS_D1: SrsWord[] = [`,
  d1.keep,
);
rewrite(
  "src/data/gen/words-srs-e1.ts",
  `import type { SrsWord } from "@/types";

/**
 * Paquete E1 · Mega-ampliación (Mega-6): finanzas, ciencia, arte, clima,
 * ley, oficios, salud, emociones y léxico marinero. Depurado sin duplicados.
 */

export const SRS_WORDS_E1: SrsWord[] = [`,
  e1.keep,
);
console.log("Ficheros reescritos.");
