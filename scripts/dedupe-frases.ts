/**
 * Deduplica frases: elimina de los bancos D y E los textos que ya
 * aparecen en bancos anteriores (A/B/C o dentro del mismo banco).
 * Reescribe frases-d.ts y frases-e.ts in situ.
 */
import { FRASES_A } from "../src/data/frases-a";
import { FRASES_B } from "../src/data/frases-b";
import { FRASES_C } from "../src/data/frases-c";
import { FRASES_D } from "../src/data/frases-d";
import { FRASES_E } from "../src/data/frases-e";
import { writeFileSync, readFileSync } from "node:fs";

const key = (t: string) => t.trim().toLowerCase();

// Textos vistos en bancos prioritarios (a, b, c).
const seen = new Set<string>([...FRASES_A, ...FRASES_B, ...FRASES_C].map((f) => key(f.text)));

// Textos duplicados que deben eliminarse de D y E.
const dropD = new Set<string>();
for (const f of FRASES_D) {
  const k = key(f.text);
  if (seen.has(k)) dropD.add(k);
  else seen.add(k);
}
const dropE = new Set<string>();
for (const f of FRASES_E) {
  const k = key(f.text);
  if (seen.has(k)) dropE.add(k);
  else seen.add(k);
}

/** Elimina del archivo las líneas `{ text: "...", ... }` cuyo texto esté en `drop`. */
function stripLines(path: string, drop: Set<string>): number {
  const src = readFileSync(path, "utf8");
  const lines = src.split("\n");
  let removed = 0;
  const out = lines.filter((line) => {
    const m = line.match(/^\s*\{\s*text:\s*"((?:[^"\\]|\\.)*)"/);
    if (!m) return true;
    const k = key(m[1].replace(/\\"/g, '"'));
    if (drop.has(k)) {
      removed += 1;
      return false;
    }
    return true;
  });
  writeFileSync(path, out.join("\n"), "utf8");
  return removed;
}

const root = new URL("..", import.meta.url).pathname;
const rd = stripLines(`${root}src/data/frases-d.ts`, dropD);
const re = stripLines(`${root}src/data/frases-e.ts`, dropE);
console.log(`frases-d: -${rd} (${FRASES_D.length} → ${FRASES_D.length - rd})`);
console.log(`frases-e: -${re} (${FRASES_E.length} → ${FRASES_E.length - re})`);
console.log(`total: 1020 → ${1020 - rd - re}`);
