#!/usr/bin/env node
/**
 * Presupuestos de peso de VERBALIA (Área 17 · rendimiento).
 * ------------------------------------------------------------
 * Mide lo que de verdad viaja por la malla (GZIP) y lo compara con los
 * presupuestos autoimpuestos. Falla (exit 1) si algo se dispara.
 *
 *   bun run budget
 *
 * Nota honesta: los packs de contenido del Archipiélago (mega8) viven en
 * chunks perezosos que solo bajan cuando un grupo se necesita
 * (src/data/pool-loader.ts). Por eso el presupuesto de «chunk más
 * pesado» mide un pack entero comprimido, no el arranque.
 *
 * Presupuestos:
 *   - JS total en la malla (gzip)            ≤ 10 MB
 *   - El chunk más pesado (gzip, un pack)    ≤ 1,3 MB
 *   - Banco de audio (public/sfx + music)    ≤ 12 MB
 */

import { readdirSync, statSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const KB = 1024;
const MB = 1024 * KB;
const fmt = (bytes) => `${(bytes / KB).toFixed(0)} KB`;

function jsChunks(dir) {
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".js"));
  } catch {
    return [];
  }
  return files
    .map((f) => {
      const raw = statSync(join(dir, f)).size;
      let gz = 0;
      try {
        gz = gzipSync(readFileSync(join(dir, f))).length;
      } catch {
        gz = 0;
      }
      return { file: f, raw, gz };
    })
    .sort((a, b) => b.gz - a.gz);
}

const STATIC = ".next/static/chunks";
const SFX = "public/sfx";
const MUSIC = "public/music";

const chunks = jsChunks(STATIC);
const totalGz = chunks.reduce((s, c) => s + c.gz, 0);
const biggest = chunks[0] ?? { file: "-", gz: 0, raw: 0 };

function audioBytes(dir, exts) {
  let total = 0;
  let count = 0;
  try {
    for (const f of readdirSync(dir)) {
      if (exts.some((e) => f.endsWith(e))) {
        total += statSync(join(dir, f)).size;
        count++;
      }
    }
  } catch {
    /* sin carpeta */
  }
  return { total, count };
}

const sfx = audioBytes(SFX, [".ogg", ".mp3"]);
const music = audioBytes(MUSIC, [".ogg"]);
const audioTotal = sfx.total + music.total;

console.log("\nPresupuestos de VERBALIA — medidos en la malla (gzip, Área 17)");
console.log("===============================================================");
console.log(`JS servido: ${chunks.length} chunks · ${fmt(totalGz)} gzip en total`);
console.log("Los 5 chunks más pesados (gzip):");
for (const c of chunks.slice(0, 5)) {
  console.log(`   ${fmt(c.gz).padStart(7)}  (raw ${fmt(c.raw)})  ${c.file}`);
}

const rows = [
  ["JS total en la malla (gzip)", totalGz, 10 * MB],
  [`Chunk más pesado (gzip · ${biggest.file})`, biggest.gz, 1.3 * MB],
  ["Banco de audio (sfx + música, sin comprimir)", audioTotal, 12 * MB],
];

let fail = false;
console.log("");
for (const [label, bytes, budget] of rows) {
  const pct = Math.round((bytes / budget) * 100);
  const ok = bytes <= budget;
  if (!ok) fail = true;
  console.log(
    `${ok ? "✔" : "✘"} ${label.padEnd(46)} ${fmt(bytes).padStart(8)} / ${fmt(budget)} (${pct} %)`,
  );
}
console.log("");
process.exit(fail ? 1 : 0);
