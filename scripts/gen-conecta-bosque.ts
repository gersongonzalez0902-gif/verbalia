/**
 * Generador del paquete ampliado de Conecta del Bosque (conecta-bosque-x).
 * Tres tipos de tablero, todos de 5 parejas:
 *  1. palabra → definición (léxico SRS, cada palabra una vez)
 *  2. palabra → sinónimo (banco Mega-8 de sinónimos)
 *  3. palabra → campo semántico (etiquetas curadas del léxico)
 * Ejecutar: bun run scripts/gen-conecta-bosque.ts → src/data/gen/conecta-bosque-x.ts
 */
import { writeFileSync } from "node:fs";
import { SRS_WORDS_FULL } from "../src/data/content";
import { M8_SINONIMOS } from "../src/data/gen/mega8/torre";
import { M8_ESCRIBE_BOSQUE } from "../src/data/gen/mega8/core";
import type { ConectaExercise, Difficulty } from "../src/types";

const CEFR: Record<Difficulty, string> = { 1: "A1", 2: "A2", 3: "B1", 4: "B2", 5: "C1" };

/* Palabras únicas (por si acaso) y con definición útil. */
const seen = new Set<string>();
const words = SRS_WORDS_FULL.filter((w) => {
  if (seen.has(w.word)) return false;
  if (!w.definition || w.definition.length < 8) return false;
  seen.add(w.word);
  return true;
});

/* Barajado determinista: misma salida en cada ejecución. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20261108);
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Grupos homogéneos por dificultad, luego troceos de 5 palabras. */
const byDiff = new Map<Difficulty, typeof words>();
for (const w of words) {
  const list = byDiff.get(w.difficulty) ?? [];
  list.push(w);
  byDiff.set(w.difficulty, list);
}
// Mezcla dentro de cada dificultad y vuelca los restos (los grupos con menos
// de 5) sobre la dificultad contigua para no perder palabras.
const ordered: typeof words = [];
for (const d of [1, 2, 3, 4, 5] as Difficulty[]) {
  const list = shuffle(byDiff.get(d) ?? []);
  ordered.push(...list);
}

const items: ConectaExercise[] = [];
const used = new Set<string>();
for (let i = 0; i + 4 < ordered.length; i += 5) {
  const group = ordered.slice(i, i + 5);
  const difficulty = Math.max(...group.map((w) => w.difficulty)) as Difficulty;
  const pairs = group.map((w) => {
    if (used.has(w.word)) throw new Error(`palabra repetida: ${w.word}`);
    used.add(w.word);
    return { left: w.word, right: w.definition };
  });
  items.push({
    id: `cnbx-${String(items.length + 1).padStart(4, "0")}`,
    type: "conecta-bosque",
    skill: "vocabulario",
    difficulty,
    cefr: CEFR[difficulty],
    prompt: "Une cada par tocando las dos columnas",
    explanation: "Cada palabra del bosque tiene una sola pareja: su definición.",
    tags: ["conecta", "bosque"],
    pairs,
  });
}

/* ---- Tableros de sinónimos (palabra → sinónimo) ---- */
const synPairs: { left: string; right: string }[] = [];
const synSeen = new Set<string>();
for (const e of M8_SINONIMOS as { sentence: string; options: string[]; answerIndex: number }[]) {
  const m = e.sentence.match(/\*([^*]+)\*/);
  if (!m) continue;
  const word = m[1];
  const syn = e.options[e.answerIndex];
  if (synSeen.has(word) || !word || !syn || word === syn) continue;
  synSeen.add(word);
  synPairs.push({ left: word, right: syn });
}
const synBoards: ConectaExercise[] = [];
for (let i = 0; i + 4 < synPairs.length; i += 5) {
  synBoards.push({
    id: `cnbx-s${String(synBoards.length + 1).padStart(3, "0")}`,
    type: "conecta-bosque",
    skill: "vocabulario",
    difficulty: 3,
    cefr: "B1",
    prompt: "Une cada par tocando las dos columnas",
    explanation: "Cada palabra se une a su sinónimo: significan casi lo mismo en ese contexto.",
    tags: ["conecta", "bosque", "sinónimos"],
    pairs: synPairs.slice(i, i + 5),
  });
}

/* ---- Tableros de campo semántico (palabra → campo) ---- */
const FIELD_TAGS = new Set([
  "comida", "mar", "naturaleza", "emociones", "animales", "música", "ciudad",
  "salud", "ciencia", "dinero", "viajes", "clima", "arte", "hogar", "trabajo",
  "literatura", "tecnología", "oficios",
]);
const TAG_LABEL: Record<string, string> = {
  comida: "Comida y cocina", mar: "Mar y navegación", naturaleza: "Naturaleza",
  emociones: "Emociones y ánimo", animales: "Animales", música: "Música y sonido",
  ciudad: "Ciudad y calles", salud: "Salud y cuerpo", ciencia: "Ciencia",
  dinero: "Dinero y comercio", viajes: "Viajes y caminos", clima: "Clima y tiempo",
  arte: "Arte e imagen", hogar: "Hogar y casa", trabajo: "Trabajo y oficios",
  literatura: "Libros y letras", tecnología: "Tecnología", oficios: "Oficios y artesanos",
};
const byTag = new Map<string, string[]>();
const wordSeen = new Set<string>();
for (const e of M8_ESCRIBE_BOSQUE as { word: string; tags: string[] }[]) {
  const tag = (e.tags ?? []).find((t) => FIELD_TAGS.has(t));
  if (!tag || !e.word || wordSeen.has(e.word)) continue;
  wordSeen.add(e.word);
  const list = byTag.get(tag) ?? [];
  list.push(e.word);
  byTag.set(tag, list);
}
const fieldBoards: ConectaExercise[] = [];
const tagsPool = [...FIELD_TAGS].filter((t) => (byTag.get(t) ?? []).length > 0);
const cursor = new Map(tagsPool.map((t) => [t, 0]));
while (fieldBoards.length < 102) {
  // Ronda de 5 etiquetas distintas; se agota cuando alguna etiqueta se queda sin palabras.
  const chosen: string[] = [];
  for (const t of tagsPool) {
    if (chosen.length === 5) break;
    const idx = cursor.get(t) ?? 0;
    const list = byTag.get(t) ?? [];
    if (idx < list.length) { chosen.push(t); if (chosen.length === 5) break; }
  }
  if (chosen.length < 5) break;
  const pairs = chosen.map((t) => {
    const list = byTag.get(t) ?? [];
    const word = list[cursor.get(t) ?? 0];
    cursor.set(t, (cursor.get(t) ?? 0) + 1);
    return { left: word, right: TAG_LABEL[t] };
  });
  fieldBoards.push({
    id: `cnbx-f${String(fieldBoards.length + 1).padStart(3, "0")}`,
    type: "conecta-bosque",
    skill: "vocabulario",
    difficulty: 2,
    cefr: "A2",
    prompt: "Une cada par tocando las dos columnas",
    explanation: "Cada palabra pertenece a un campo distinto: une cada una con su territorio de significado.",
    tags: ["conecta", "bosque", "campos"],
    pairs,
  });
}

const allItems = [...items, ...synBoards, ...fieldBoards];

const head = `/**
 * Conecta del Bosque · Paquete ampliado (${allItems.length} ítems de 5 parejas:
 * ${items.length} palabra→definición, ${synBoards.length} palabra→sinónimo y
 * ${fieldBoards.length} palabra→campo semántico).
 * Generado por scripts/gen-conecta-bosque.ts · NO editar a mano.
 */
import type { ConectaExercise } from "@/types";

export const CONECTA_BOSQUE_X: ConectaExercise[] = [
`;

const body = allItems
  .map((it) => {
    const pairs = it.pairs.map((p) => `{ left: ${JSON.stringify(p.left)}, right: ${JSON.stringify(p.right)} }`).join(", ");
    return `  { id: "${it.id}", type: "conecta-bosque", skill: "vocabulario", difficulty: ${it.difficulty}, cefr: "${it.cefr}",
    pairs: [${pairs}],
    prompt: ${JSON.stringify(it.prompt)},
    explanation: ${JSON.stringify(it.explanation)},
    tags: [${it.tags.map((t) => `"${t}"`).join(", ")}] },`;
  })
  .join("\n");

writeFileSync(new URL("../src/data/gen/conecta-bosque-x.ts", import.meta.url).pathname, head + body + "\n];\n", "utf8");
console.log(`Generados ${allItems.length} ítems: ${items.length} definiciones + ${synBoards.length} sinónimos + ${fieldBoards.length} campos`);
console.log(`conecta-bosque total: ${12 + allItems.length}`);
if (new Set(allItems.map((x) => x.id)).size !== allItems.length) { console.error("✗ ids duplicados"); process.exit(1); }
for (const it of allItems) {
  if (it.pairs.length !== 5) { console.error(`✗ tablero con ${it.pairs.length} parejas: ${it.id}`); process.exit(1); }
  const lefts = new Set(it.pairs.map((p) => p.left));
  const rights = new Set(it.pairs.map((p) => p.right));
  if (lefts.size !== 5 || rights.size !== 5) { console.error(`✗ parejas repetidas: ${it.id}`); process.exit(1); }
}
console.log("✓ Validaciones correctas");
