/**
 * Validador puntual de los paquetes X (historias-x / lectura-x).
 * Uso: bun scripts/validate-gen-x.ts
 */
import { HISTORIAS_PACK_X } from "../src/data/gen/historias-x";
import { LECTURA_PACK_X } from "../src/data/gen/lectura-x";

const errors: string[] = [];
const globalIds = new Set<string>();

/* ---------------- HISTORIAS ---------------- */
if (HISTORIAS_PACK_X.length !== 40) errors.push(`historias: se esperaban 40, hay ${HISTORIAS_PACK_X.length}`);

const distH: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
const answerH: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

HISTORIAS_PACK_X.forEach((h, hi) => {
  const tag = `historias[${hi}] (${h.id})`;
  if (globalIds.has(h.id)) errors.push(`${tag}: id global duplicado`);
  globalIds.add(h.id);
  if (h.start !== 0) errors.push(`${tag}: start != 0 (${h.start})`);
  if (h.options.length !== 4) errors.push(`${tag}: options.length = ${h.options.length}`);
  if (!(h.answerIndex >= 0 && h.answerIndex <= 3)) errors.push(`${tag}: answerIndex = ${h.answerIndex}`);
  answerH[h.answerIndex]++;
  distH[h.difficulty]++;

  const nodeIds = new Set<string>();
  h.nodes.forEach((n, ni) => {
    if (nodeIds.has(n.id)) errors.push(`${tag}: id de nodo duplicado "${n.id}"`);
    nodeIds.add(n.id);
    if (n.choices.length < 2) errors.push(`${tag}: nodo ${ni} tiene ${n.choices.length} decisiones`);
    n.choices.forEach((c, ci) => {
      if (c.next !== -1 && (c.next < 0 || c.next >= h.nodes.length)) {
        errors.push(`${tag}: next inválido ${c.next} (nodo ${ni}, decisión ${ci})`);
      }
      if (typeof c.feedback !== "string" || c.feedback.length === 0) {
        errors.push(`${tag}: falta feedback (nodo ${ni}, decisión ${ci})`);
      }
    });
  });

  const visited = new Set<number>([h.start]);
  const queue: number[] = [...visited];
  let endReachable = false;
  while (queue.length > 0) {
    const i = queue.shift() as number;
    for (const c of h.nodes[i].choices) {
      if (c.next === -1) { endReachable = true; continue; }
      if (!visited.has(c.next)) { visited.add(c.next); queue.push(c.next); }
    }
  }
  if (!endReachable) errors.push(`${tag}: ninguna decisión con next -1 alcanzable`);
  h.nodes.forEach((_, ni) => {
    if (!visited.has(ni)) errors.push(`${tag}: nodo ${ni} no alcanzable desde start`);
  });
});

HISTORIAS_PACK_X.forEach((h, i) => {
  const expected = `hx-${String(i + 1).padStart(2, "0")}`;
  if (h.id !== expected) errors.push(`historias: posición ${i} tiene id ${h.id}, se esperaba ${expected}`);
});

/* ---------------- LECTURAS ---------------- */
if (LECTURA_PACK_X.length !== 72) errors.push(`lecturas: se esperaban 72, hay ${LECTURA_PACK_X.length}`);

const distL: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
const answerL: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

LECTURA_PACK_X.forEach((l, li) => {
  const tag = `lectura[${li}] (${l.id})`;
  if (globalIds.has(l.id)) errors.push(`${tag}: id global duplicado`);
  globalIds.add(l.id);
  if (l.lines.length < 3 || l.lines.length > 8) errors.push(`${tag}: lines.length = ${l.lines.length}`);
  l.lines.forEach((line, xi) => {
    if (line.includes("*")) errors.push(`${tag}: línea ${xi} contiene asterisco`);
  });
  if (l.options.length !== 4) errors.push(`${tag}: options.length = ${l.options.length}`);
  if (!(l.answerIndex >= 0 && l.answerIndex <= 3)) errors.push(`${tag}: answerIndex = ${l.answerIndex}`);
  answerL[l.answerIndex]++;
  distL[l.difficulty]++;
  const expected = `lx-${String(li + 1).padStart(3, "0")}`;
  if (l.id !== expected) errors.push(`lecturas: posición ${li} tiene id ${l.id}, se esperaba ${expected}`);
});

/* ---------------- Distribuciones esperadas ---------------- */
const expectedH: Record<number, number> = { 1: 6, 2: 8, 3: 10, 4: 9, 5: 7 };
const expectedL: Record<number, number> = { 1: 14, 2: 16, 3: 16, 4: 14, 5: 12 };
([1, 2, 3, 4, 5] as const).forEach((d) => {
  if (distH[d] !== expectedH[d]) errors.push(`historias: dificultad ${d} tiene ${distH[d]}, se esperaban ${expectedH[d]}`);
  if (distL[d] !== expectedL[d]) errors.push(`lecturas: dificultad ${d} tiene ${distL[d]}, se esperaban ${expectedL[d]}`);
});

console.log("=== RESUMEN ===");
console.log(`Historias: ${HISTORIAS_PACK_X.length} | por dificultad: ${JSON.stringify(distH)} | answerIndex: ${JSON.stringify(answerH)}`);
console.log(`Lecturas: ${LECTURA_PACK_X.length} | por dificultad: ${JSON.stringify(distL)} | answerIndex: ${JSON.stringify(answerL)}`);
console.log(`Ids únicos globales: ${globalIds.size} (esperados ${HISTORIAS_PACK_X.length + LECTURA_PACK_X.length})`);

if (errors.length === 0) {
  console.log("VALIDACIÓN: TODO OK");
} else {
  console.log(`VALIDACIÓN: ${errors.length} error(es):`);
  errors.forEach((e) => console.log(" - " + e));
  process.exit(1);
}
