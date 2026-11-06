import type { MemoriaExercise, SkillId } from "@/types";
import { SRS_WORDS } from "../words-srs";
import { HOMOFONOS } from "./homofonos";
import { SINONIMOS } from "./sinonimos-pares";
import { REGIONAL_PARES } from "./regional-pares";
import { ORIGINS } from "./origins";
import { CEFR_BY_DIFFICULTY, fmtId, shortDef } from "./shared";

/**
 * Pack «Memoria» · Tableros de pares volteables, 6 variantes (una por ciudad).
 * Los tableros se generan de forma determinista a partir de datos estables.
 */

interface BoardSpec {
  variant: string;
  skill: SkillId;
  prompt: string;
  explanation: string;
  /** Pares del tablero (4 por tablero). */
  pairs: { left: string; right: string }[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}

function buildBoard(spec: BoardSpec, index: number): MemoriaExercise {
  const type = `memoria-${spec.variant}` as MemoriaExercise["type"];
  return {
    id: fmtId("me", spec.variant, index),
    type,
    skill: spec.skill,
    difficulty: spec.difficulty,
    cefr: CEFR_BY_DIFFICULTY[spec.difficulty],
    prompt: spec.prompt,
    explanation: spec.explanation,
    tags: ["memoria", spec.variant],
    pairs: spec.pairs,
  };
}

/** Palabras simples: una sola palabra, sin espacios ni guiones. */
function simpleWords(minDiff: number, maxDiff: number) {
  return SRS_WORDS.filter(
    (w) =>
      w.difficulty >= minDiff &&
      w.difficulty <= maxDiff &&
      /^[a-záéíóúüñ]+$/.test(w.word) &&
      w.word.length <= 11 &&
      w.definition.length <= 80,
  );
}

/** Tableros de palabra ↔ definición (bosque: A1-B1; biblioteca: B2-C1). */
function wordBoards(variant: string, skill: SkillId, minDiff: number, maxDiff: number, perBoard = 4): BoardSpec[] {
  const words = simpleWords(minDiff, maxDiff);
  const boards: BoardSpec[] = [];
  for (let i = 0; i + perBoard <= words.length && boards.length < 14; i += perBoard) {
    const chunk = words.slice(i, i + perBoard);
    boards.push({
      variant,
      skill,
      prompt: "Empareja cada palabra con su significado",
      explanation: "Los pares recuerdan: palabra arriba, significado abajo. Voltear dos veces la misma tarjeta no cuenta como intento.",
      pairs: chunk.map((w) => ({ left: w.word, right: shortDef(w.definition) })),
      difficulty: chunk[0].difficulty,
    });
  }
  return boards;
}

/** Tableros de homófonos (fortaleza): palabra ↔ mini-significado, con trampas. */
function homofonoBoards(): BoardSpec[] {
  const boards: BoardSpec[] = [];
  for (let i = 0; i + 1 < HOMOFONOS.length && boards.length < 10; i += 2) {
    const g1 = HOMOFONOS[i];
    const g2 = HOMOFONOS[i + 1];
    boards.push({
      variant: "fortaleza",
      skill: "ortografia",
      prompt: "Empareja cada palabra con su significado (ojo: suenan casi igual)",
      explanation: `«${g1.a}» y «${g1.b}» suenan casi igual, pero ${g1.noteA.toLowerCase()} frente a ${g1.noteB.toLowerCase()}.`,
      pairs: [
        { left: g1.a, right: shortDef(g1.noteA, 40) },
        { left: g1.b, right: shortDef(g1.noteB, 40) },
        { left: g2.a, right: shortDef(g2.noteA, 40) },
        { left: g2.b, right: shortDef(g2.noteB, 40) },
      ],
      difficulty: 3,
    });
  }
  return boards;
}

/** Tableros de sinónimos (torre): palabra ↔ sinónimo, ambos sobre la mesa. */
function sinonimoBoards(): BoardSpec[] {
  const boards: BoardSpec[] = [];
  for (let i = 0; i + 3 < SINONIMOS.length && boards.length < 8; i += 4) {
    const chunk = SINONIMOS.slice(i, i + 4);
    boards.push({
      variant: "torre",
      skill: "expresion",
      prompt: "Empareja cada palabra con su sinónimo",
      explanation: chunk.map((p) => `${p.a} ↔ ${p.b}: ${p.note}`).join(" "),
      pairs: chunk.map((p) => ({ left: p.a, right: p.b })),
      difficulty: 4,
    });
  }
  return boards;
}

/** Tableros de regionalismos (puerto): palabra ↔ su gemela de otro país. */
function regionalBoards(): BoardSpec[] {
  const boards: BoardSpec[] = [];
  for (let i = 0; i + 3 < REGIONAL_PARES.length && boards.length < 6; i += 4) {
    const chunk = REGIONAL_PARES.slice(i, i + 4);
    boards.push({
      variant: "puerto",
      skill: "audicion",
      prompt: "Empareja cada palabra con su variante regional",
      explanation: chunk.map((p) => `${p.a} ↔ ${p.b}: ${p.note}`).join(" "),
      pairs: chunk.map((p) => ({ left: p.a, right: p.b })),
      difficulty: 2,
    });
  }
  return boards;
}

/** Tableros de orígenes (observatorio): palabra ↔ idioma que la trajo.
 * Cada tablero usa orígenes ÚNICOS para que las tarjetas no se confundan. */
function originBoards(): BoardSpec[] {
  // Una palabra por cada origen distinto, rotando.
  const byOrigin = new Map<string, string[]>();
  for (const o of ORIGINS) {
    if (!byOrigin.has(o.origin)) byOrigin.set(o.origin, []);
    byOrigin.get(o.origin)!.push(o.word);
  }
  const originList = [...byOrigin.keys()];
  const boards: BoardSpec[] = [];
  const per = Math.min(5, originList.length);
  for (let round = 0; boards.length < 9; round++) {
    const chunk: { word: string; origin: string }[] = [];
    for (let k = 0; k < per; k++) {
      const origin = originList[(k + round) % originList.length];
      const words = byOrigin.get(origin)!;
      const word = words[(round + k) % words.length];
      if (word && !chunk.some((c) => c.word === word)) {
        chunk.push({ word, origin });
      }
    }
    if (chunk.length < 4) break;
    if (new Set(chunk.map((c) => c.origin)).size !== chunk.length) continue;
    const notes = chunk
      .map((c) => ORIGINS.find((o) => o.word === c.word && o.origin === c.origin))
      .filter((o): o is (typeof ORIGINS)[number] => Boolean(o));
    boards.push({
      variant: "observatorio",
      skill: "cultura",
      prompt: "Empareja cada palabra con el idioma que la trajo",
      explanation: notes.map((o) => `${o.word} viene del ${o.origin}: ${o.note}`).join(" "),
      pairs: chunk.map((c) => ({ left: c.word, right: c.origin })),
      difficulty: 4,
    });
  }
  return boards;
}

export const MEMORIA_PACKS: MemoriaExercise[] = [
  ...wordBoards("bosque", "vocabulario", 1, 3).map((b, i) => buildBoard(b, i)),
  ...homofonoBoards().map((b, i) => buildBoard(b, i)),
  ...wordBoards("biblioteca", "lectura", 4, 5).map((b, i) => buildBoard(b, i)),
  ...regionalBoards().map((b, i) => buildBoard(b, i)),
  ...sinonimoBoards().map((b, i) => buildBoard(b, i)),
  ...originBoards().map((b, i) => buildBoard(b, i)),
];
