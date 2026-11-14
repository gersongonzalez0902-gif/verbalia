#!/usr/bin/env node
/**
 * Auditoría de contraste WCAG AA de los tokens de VERBALIA (Área 18).
 * Convierte los oklch del CSS a sRGB y calcula el ratio de contraste de
 * las parejas que de verdad conviven en pantalla. Falla si algo < 4.5:1
 * (texto normal) o < 3:1 (texto grande ≥ 24 px).
 *
 *   node scripts/contrast-check.mjs
 */

import { readFileSync } from "node:fs";

const CSS = readFileSync("src/app/globals.css", "utf8");

/** oklch → sRGB hex/rgb (matemáticas estándar, sin dependencias). */
function oklchToRgb(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  // OKLab → lineal sRGB
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const gamma = (c) => {
    const v = Math.min(1, Math.max(0, c));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  };
  return [gamma(r), gamma(g), gamma(bb)];
}

function luminance([r, g, b]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg, bg) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

function parseOklch(token) {
  const m = CSS.match(new RegExp(`--${token}:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\)`));
  if (!m) return null;
  return oklchToRgb(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
}

function theme(prefix) {
  const tokens = ["background", "foreground", "muted-foreground", "primary", "primary-foreground", "secondary", "secondary-foreground", "card"];
  const out = {};
  for (const t of tokens) out[t] = parseOklch(prefix + t);
  return out;
}

// El tema oscuro aparece DESPUÉS en el CSS: parseamos por bloques.
const lightBlock = CSS.slice(0, CSS.indexOf(".dark {"));
const darkBlock = CSS.slice(CSS.indexOf(".dark {"));
const light = {};
const dark = {};
for (const t of ["background", "foreground", "muted-foreground", "primary", "primary-foreground", "secondary", "secondary-foreground", "card"]) {
  const re = (tok) => new RegExp(`--${tok}:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\)`);
  const l = lightBlock.match(re(t));
  const d = darkBlock.match(re(t));
  if (l) light[t] = oklchToRgb(...l.slice(1).map(Number));
  if (d) dark[t] = oklchToRgb(...d.slice(1).map(Number));
}

const pairs = [
  ["texto normal sobre fondo", "foreground", "background", 4.5],
  ["texto apagado sobre fondo", "muted-foreground", "background", 4.5],
  ["texto apagado sobre tarjeta", "muted-foreground", "card", 4.5],
  ["texto normal sobre tarjeta", "foreground", "card", 4.5],
  ["texto sobre botón primario", "primary-foreground", "primary", 4.5],
  ["texto sobre chip secundario", "secondary-foreground", "secondary", 4.5],
];

let fail = false;
for (const [name, themeObj] of [["claro", light], ["oscuro", dark]]) {
  console.log(`\nTema ${name}:`);
  for (const [label, fg, bg, min] of pairs) {
    if (!themeObj[fg] || !themeObj[bg]) continue;
    const ratio = contrast(themeObj[fg], themeObj[bg]);
    const ok = ratio >= min;
    if (!ok) fail = true;
    console.log(`${ok ? "✔" : "✘"} ${label.padEnd(30)} ${ratio.toFixed(2)}:1 (mínimo ${min}:1)`);
  }
}
console.log("");
process.exit(fail ? 1 : 0);
