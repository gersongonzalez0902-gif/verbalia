#!/usr/bin/env bun
/**
 * Verificación del cofre de frases · dedupe + conteo total.
 * Cuenta las frases de todos los bancos y busca duplicados exactos
 * (texto normalizado). Falla si hay menos de 2000 o duplicados.
 */
import { FRASES } from "../src/data/frases";

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
const seen = new Map<string, number>();
const dupes: string[] = [];
for (const f of FRASES) {
  const k = norm(f.text);
  if (seen.has(k)) dupes.push(`DUP: "${f.text.slice(0, 60)}…" (ya apareció en el índice ${seen.get(k)})`);
  else seen.set(k, FRASES.indexOf(f));
}
console.log(`Total de frases: ${FRASES.length}`);
if (dupes.length > 0) {
  console.error(dupes.join("\n"));
  process.exit(1);
}
if (FRASES.length < 2000) {
  console.error(`Faltan ${2000 - FRASES.length} frases para el objetivo de 2000.`);
  process.exit(1);
}
console.log("Sin duplicados · objetivo de 2000 cumplido ✓");
