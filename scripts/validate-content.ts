/**
 * Validación global de contenido de VERBALIA.
 * Ejecutar:  bun scripts/validate-content.ts
 * Comprueba conteos (ampliación 4x), ids únicos, distribuciones de
 * respuesta, coherencia del grafo de historias y salud de cada pack.
 */

import { TRIVIA_PACK } from "../src/data/trivia";
import { PUZZLE_PACK } from "../src/data/puzzles";
import { CLOZE_PACK } from "../src/data/cloze";
import { ERRORS_PACK } from "../src/data/errors-hunt";
import { TILDES_PACK } from "../src/data/tildes";
import { PARAGRAPHS_PACK } from "../src/data/paragraphs";
import { DICTADO_PACK } from "../src/data/dictado";
import { MATICES_PACK } from "../src/data/matices";
import { LECTURA_PACK } from "../src/data/lectura";
import { SPRINT_PACK } from "../src/data/sprint";
import { SINONIMOS_PACK } from "../src/data/sinonimos";
import { HISTORIAS_PACK } from "../src/data/historias";
import { REFRANES_PACK } from "../src/data/refranes";
import { MINUTO_PACK } from "../src/data/minuto";
import { SRS_WORDS_FULL } from "../src/data/content";

type AnyExercise = { id: string; type: string; difficulty: number; cefr?: string };

const EXPECTED: Record<string, number> = {
  trivia: 288,
  puzzle: 144,
  cloze: 160,
  errores: 144,
  tildes: 180,
  parrafos: 72,
  dictado: 120,
  matices: 120,
  lectura: 48,
  sprint: 160,
  sinonimos: 160,
  historias: 81,
  refranes: 160,
  minuto: 96,
};

const ALL: Record<string, AnyExercise[]> = {
  trivia: TRIVIA_PACK,
  puzzle: PUZZLE_PACK,
  cloze: CLOZE_PACK,
  errores: ERRORS_PACK,
  tildes: TILDES_PACK,
  parrafos: PARAGRAPHS_PACK,
  dictado: DICTADO_PACK,
  matices: MATICES_PACK,
  lectura: LECTURA_PACK,
  sprint: SPRINT_PACK,
  sinonimos: SINONIMOS_PACK,
  historias: HISTORIAS_PACK,
  refranes: REFRANES_PACK,
  minuto: MINUTO_PACK,
};

let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.log(`  ✗ ${msg}`);
};
const ok = (msg: string) => console.log(`  ✓ ${msg}`);

console.log("\n=== VERBALIA · Validación de contenido (ampliación 4x) ===\n");

console.log("Conteos por paquete:");
let total = 0;
for (const [name, pack] of Object.entries(ALL)) {
  const want = EXPECTED[name] ?? 0;
  total += pack.length;
  const ids = new Set(pack.map((e) => e.id));
  if (pack.length !== want) fail(`${name}: ${pack.length} ítems (esperados ${want})`);
  else if (ids.size !== pack.length) fail(`${name}: ids duplicados (${pack.length} ítems, ${ids.size} ids)`);
  else ok(`${name}: ${pack.length}`);
}

console.log(`\nTotal de ejercicios: ${total} (más ${SRS_WORDS_FULL.length} palabras del jardín)`);

// Ids globales únicos (unión de todos los packs)
const allIds = Object.values(ALL).flat().map((e) => e.id);
if (new Set(allIds).size !== allIds.length) {
  fail(`ids duplicados entre packs (${allIds.length} vs ${new Set(allIds).size})`);
} else {
  ok(`${allIds.length} ids únicos entre packs`);
}

// Palabras SRS (catálogo completo: base + ampliaciones Etapa 4)
{
  const ids = new Set(SRS_WORDS_FULL.map((w) => w.id));
  const words = new Set(SRS_WORDS_FULL.map((w) => w.word.toLowerCase()));
  if (SRS_WORDS_FULL.length < 1800) fail(`SRS: ${SRS_WORDS_FULL.length} palabras (esperadas ≥1800)`);
  else if (ids.size !== SRS_WORDS_FULL.length) fail(`SRS: ids duplicados`);
  else if (words.size !== SRS_WORDS_FULL.length) fail(`SRS: palabras repetidas`);
  else ok(`SRS: ${SRS_WORDS_FULL.length} palabras únicas`);
}

// Distribución de answerIndex (no concentrar la respuesta)
for (const name of ["sprint", "matices", "sinonimos", "refranes", "cloze", "lectura"] as const) {
  const pack = ALL[name] as unknown as { answerIndex: number }[];
  const first = pack.filter((e) => e.answerIndex === 0).length / pack.length;
  const dist = [0, 1, 2, 3].map((i) => pack.filter((e) => e.answerIndex === i).length);
  if (first >= 0.5) fail(`${name}: respuesta concentrada en la primera opción (${(first * 100).toFixed(0)}%)`);
  else ok(`${name}: answerIndex ${dist.join("/")} (primera ${(first * 100).toFixed(0)}%)`);
}

// Grafo de historias
{
  const bad = HISTORIAS_PACK.filter(
    (h) =>
      !(h.start >= 0 && h.start < h.nodes.length) ||
      !h.nodes.every(
        (n) => n.choices.length >= 2 && n.choices.every((c) => c.next === -1 || (c.next >= 0 && c.next < h.nodes.length)),
      ),
  );
  if (bad.length) fail(`historias: ${bad.length} relatos con grafo inválido (${bad.map((h) => h.id).join(", ")})`);
  else ok(`historias: grafo válido en ${HISTORIAS_PACK.length} relatos`);
}

// Frases limpias en caza de errores
{
  const clean = ERRORS_PACK.filter((e) => (e as { errorIndex: number }).errorIndex === -1).length;
  const ratio = clean / ERRORS_PACK.length;
  if (ratio < 0.2 || ratio > 0.45) fail(`errores: proporción de frases limpias fuera de rango (${(ratio * 100).toFixed(0)}%)`);
  else ok(`errores: ${(ratio * 100).toFixed(0)}% frases limpias (${clean}/${ERRORS_PACK.length})`);
}

// Dificultades dentro de rango
for (const [name, pack] of Object.entries(ALL)) {
  const bad = pack.filter((e) => e.difficulty < 1 || e.difficulty > 5);
  if (bad.length) fail(`${name}: dificultades fuera de rango (${bad.length})`);
}

// CEFRR conocido
const KNOWN_CEFR = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
for (const [name, pack] of Object.entries(ALL)) {
  const bad = pack.filter((e) => e.cefr && !KNOWN_CEFR.has(e.cefr));
  if (bad.length) fail(`${name}: CEFR desconocido en ${bad.length} ítems`);
}

console.log(failures === 0 ? "\nTODO EN ORDEN\n" : `\n${failures} comprobaciones fallidas\n`);
process.exit(failures === 0 ? 0 : 1);
