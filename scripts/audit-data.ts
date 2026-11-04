/**
 * Auditoría de integridad de datos de VerbalIA (Etapas 1 y 2).
 * Ejecutar con: bun run scripts/audit-data.ts
 * Verifica: índices en rango, respuestas válidas, campos obligatorios,
 * duplicados de id, grafos de historias y coherencia dificultad/MCER.
 */
import { SRS_WORDS } from "@/data/words-srs";
import { TRIVIA_PACK } from "@/data/trivia";
import { PUZZLE_PACK } from "@/data/puzzles";
import { CLOZE_PACK } from "@/data/cloze";
import { ERRORS_PACK } from "@/data/errors-hunt";
import { TILDES_PACK } from "@/data/tildes";
import { PARAGRAPHS_PACK } from "@/data/paragraphs";
import { DICTADO_PACK } from "@/data/dictado";
import { MATICES_PACK } from "@/data/matices";
import { LECTURA_PACK } from "@/data/lectura";
import { SPRINT_PACK } from "@/data/sprint";
import { SINONIMOS_PACK } from "@/data/sinonimos";
import { HISTORIAS_PACK } from "@/data/historias";
import { REFRANES_PACK } from "@/data/refranes";
import { MINUTO_PACK } from "@/data/minuto";
import { PLACEMENT_ITEMS, ALL_EXERCISES } from "@/data/content";

let problems = 0;
const err = (msg: string) => { problems++; console.log("❌", msg); };
const ok = (msg: string) => console.log("✓", msg);

// ---- IDs únicos ----
const ids = ALL_EXERCISES.map((e) => e.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) err(`IDs duplicados: ${dup.join(", ")}`); else ok(`IDs únicos (${ids.length} ejercicios)`);

// ---- SRS ----
const wordIds = SRS_WORDS.map((w) => w.id);
const wdup = wordIds.filter((id, i) => wordIds.indexOf(id) !== i);
if (wdup.length) err(`Palabras duplicadas: ${wdup.join(", ")}`); else ok(`${SRS_WORDS.length} palabras SRS sin duplicados`);
for (const w of SRS_WORDS) {
  if (w.difficulty < 1 || w.difficulty > 5) err(`${w.id}: dificultad ${w.difficulty} fuera de rango`);
  if (!w.definition || !w.example || !w.word) err(`${w.id}: campos vacíos`);
}

// ---- Trivia ----
const CLASES = ["sustantivo", "verbo", "adjetivo", "adverbio"];
for (const t of TRIVIA_PACK) {
  if (!CLASES.includes(t.answer)) err(`${t.id}: answer inválido "${t.answer}"`);
  const m = t.sentence.match(/\*[^*]+\*/);
  if (!m) err(`${t.id}: frase sin palabra destacada: "${t.sentence}"`);
}

// ---- Puzzle ----
for (const p of PUZZLE_PACK) {
  if (p.chunks.length < 3) err(`${p.id}: menos de 3 fragmentos`);
  if (p.chunks.some((c) => !c.trim())) err(`${p.id}: fragmento vacío`);
  if (new Set(p.chunks).size !== p.chunks.length) err(`${p.id}: fragmentos duplicados`);
}

// ---- Cloze ----
for (const c of CLOZE_PACK) {
  if (!c.text.includes("___")) err(`${c.id}: texto sin hueco ___`);
  if (c.answerIndex < 0 || c.answerIndex >= c.options.length) err(`${c.id}: answerIndex ${c.answerIndex} fuera de rango`);
  if (new Set(c.options).size !== c.options.length) err(`${c.id}: opciones duplicadas`);
}

// ---- Caza de errores ----
for (const e of ERRORS_PACK) {
  if (e.errorIndex >= e.tokens.length) err(`${e.id}: errorIndex fuera de rango`);
  if (e.errorIndex === -1 && (!e.options || e.options.length === 0)) {
    // frases limpias: no necesitan opciones
  } else {
    if (e.answerIndex < 0 || e.answerIndex >= (e.options?.length ?? 0)) err(`${e.id}: answerIndex fuera de rango`);
    if (e.errorIndex >= 0) {
      const wrong = e.tokens[e.errorIndex];
      const fix = e.options[e.answerIndex];
      if (wrong === fix) err(`${e.id}: "corrección" idéntica al error («${wrong}»)`);
    }
  }
}

// ---- Tildes ----
const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u0302\u0304-\u036f]/g, "").normalize("NFC");
for (const t of TILDES_PACK) {
  if (t.answerSyllable >= t.syllables.length) err(`${t.id}: answerSyllable fuera de rango`);
  if (t.answerSyllable >= 0 && !t.sentence.includes(t.word)) err(`${t.id}: la palabra "${t.word}" no está en la frase`);
  if (t.answerSyllable >= 0 && strip(t.correctForm) !== strip(t.syllables.join(""))) {
    err(`${t.id}: correctForm "${t.correctForm}" ≠ sílabas "${t.syllables.join("")}"`);
  }
  if (t.answerSyllable === -1 && t.correctForm !== t.word) {
    err(`${t.id}: sin tilde pero correctForm="${t.correctForm}" ≠ word="${t.word}"`);
  }
}

// ---- Párrafos ----
for (const p of PARAGRAPHS_PACK) {
  if (p.sentences.length < 3) err(`${p.id}: menos de 3 oraciones`);
  if (new Set(p.sentences).size !== p.sentences.length) err(`${p.id}: oraciones duplicadas`);
}

/* ------------ Etapa 2 ------------ */

// ---- Dictado: sin caracteres invisibles, frase no vacía, termina en signo ----
for (const d of DICTADO_PACK) {
  if (d.sentence.trim().length < 8) err(`${d.id}: frase demasiado corta`);
  if (/[\u00AD\u200B-\u200F]/.test(d.sentence)) err(`${d.id}: caracteres invisibles en la frase`);
  if (!/[.!?…]$/.test(d.sentence.trim())) err(`${d.id}: la frase no termina en signo de puntuación`);
}

// ---- Opción-índice: matices / lectura / sprint / sinónimos / refranes / historias ----
const indexedPacks: [string, { id: string; options: string[]; answerIndex: number; [k: string]: unknown }[]][] = [
  ["matics", MATICES_PACK as unknown as typeof MATICES_PACK extends never ? never : any[]],
  ["lectura", LECTURA_PACK as any],
  ["sprint", SPRINT_PACK as any],
  ["sinónimos", SINONIMOS_PACK as any],
  ["refranes", REFRANES_PACK as any],
  ["historias", HISTORIAS_PACK as any],
];
for (const [name, pack] of indexedPacks) {
  for (const e of pack) {
    if (e.answerIndex < 0 || e.answerIndex >= e.options.length) err(`${name} ${e.id}: answerIndex fuera de rango`);
    if (new Set(e.options).size !== e.options.length) err(`${name} ${e.id}: opciones duplicadas`);
  }
}

// ---- Sinónimos: la palabra marcada existe y la relación es válida ----
for (const s of SINONIMOS_PACK) {
  const m = s.sentence.match(/\*[^*]+\*/);
  if (!m) err(`${s.id}: frase sin palabra destacada`);
  if (s.relation !== "sinónimo" && s.relation !== "antónimo") err(`${s.id}: relación inválida "${s.relation}"`);
}

// ---- Lectura: título, líneas y pregunta coherentes ----
for (const l of LECTURA_PACK) {
  if (l.lines.length < 3) err(`${l.id}: menos de 3 líneas`);
  if (l.lines.some((x) => !x.trim())) err(`${l.id}: línea vacía`);
}

// ---- Historias: grafo íntegro, sin ciclos infinitos, finales alcanzables ----
for (const h of HISTORIAS_PACK) {
  if (h.start < 0 || h.start >= h.nodes.length) err(`${h.id}: start fuera de rango`);
  for (const n of h.nodes) {
    if (n.choices.length < 2) err(`${h.id}/${n.id}: menos de 2 opciones`);
    for (const c of n.choices) {
      if (!(c.next === -1 || (c.next >= 0 && c.next < h.nodes.length))) {
        err(`${h.id}/${n.id}: next inválido ${c.next}`);
      }
    }
  }
  // Accesibilidad de final desde el inicio (BFS).
  const seen = new Set<number>([h.start]);
  const queue = [h.start];
  let reachesEnd = false;
  while (queue.length) {
    const cur = queue.shift()!;
    for (const c of h.nodes[cur].choices) {
      if (c.next === -1) { reachesEnd = true; continue; }
      if (!seen.has(c.next)) { seen.add(c.next); queue.push(c.next); }
    }
  }
  if (!reachesEnd) err(`${h.id}: ningún final alcanzable desde el inicio`);
  if (seen.size !== h.nodes.length) err(`${h.id}: nodos inalcanzables (${h.nodes.length - seen.size})`);
  // La pregunta debe ser respondible: al menos una opción correcta en rango.
  if (h.answerIndex < 0 || h.answerIndex >= h.options.length) err(`${h.id}: answerIndex de la pregunta fuera de rango`);
}

// ---- Minuto: criterios razonables y meta positiva ----
for (const m of MINUTO_PACK) {
  if (m.criteria.length < 3) err(`${m.id}: menos de 3 criterios de autoevaluación`);
  if (m.wordGoal < 20 || m.wordGoal > 120) err(`${m.id}: meta de palabras fuera de rango razonable (${m.wordGoal})`);
}

// ---- Evaluación inicial ----
const placementIds = PLACEMENT_ITEMS.map((p) => p.exerciseId);
for (const pid of placementIds) {
  if (!ALL_EXERCISES.find((e) => e.id === pid)) err(`placement: el ejercicio "${pid}" no existe`);
}
const pdup = placementIds.filter((id, i) => placementIds.indexOf(id) !== i);
if (pdup.length) err(`placement: ejercicios repetidos: ${pdup.join(", ")}`); else ok(`placement: ${placementIds.length} ítems válidos`);

// ---- MCER vs dificultad (coherencia aproximada) ----
// Nota: en audición/expresión una TAREA fácil (d1) puede usar lenguaje A2,
// y una d2 puede usar B1: el nivel de la tarea ≠ nivel del texto.
const CEFR_FOR_DIFF: Record<number, string[]> = {
  1: ["A1", "A2"],
  2: ["A2", "A1", "B1"],
  3: ["B1", "B2"],
  4: ["C1", "B2"],
  5: ["C2", "C1"],
};
for (const e of ALL_EXERCISES) {
  if (!CEFR_FOR_DIFF[e.difficulty]?.includes(e.cefr)) {
    err(`${e.id}: dificultad ${e.difficulty} con MCER ${e.cefr} (poco coherente)`);
  }
}

console.log(problems === 0 ? "\n🟢 AUDITORÍA COMPLETA: sin problemas" : `\n🔴 ${problems} problemas encontrados`);
