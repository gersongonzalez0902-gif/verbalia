/**
 * Utilidades lingüísticas del generador Mega-8.
 */

export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(rng: () => number, arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function sample<T>(rng: () => number, arr: readonly T[], n: number): T[] {
  return shuffle(rng, arr).slice(0, Math.min(n, arr.length));
}

const CLOSED_ACCENTED = "íúÍÚ";
const isVowel = (c: string) => "aeiouáéíóúüAEIOUÁÉÍÓÚÜ".includes(c);
const isAccentedVowel = (c: string) => "áéíóúÁÉÍÓÚ".includes(c);
const norm = (c: string) => c.toLowerCase();
const isStrong = (c: string) => "aeo".includes(norm(c)) || "áéóÁÉÓ".includes(c);
const isClosed = (c: string) => "iuü".includes(norm(c));

function vowelsJoin(a: string, b: string): boolean {
  if (CLOSED_ACCENTED.includes(a) || CLOSED_ACCENTED.includes(b)) return false;
  if (isStrong(a) && isStrong(b)) return false;
  if (isClosed(a) && isClosed(b) && norm(a) === norm(b)) return false;
  return true;
}

const INSEPARABLES = new Set([
  "bl", "br", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "kl", "kr",
  "pl", "pr", "tl", "tr", "ch", "ll", "rr",
]);

export function syllabify(word: string): string[] {
  const chars = [...word];
  const n = chars.length;
  const nuclei: { start: number; end: number }[] = [];
  let i = 0;
  while (i < n) {
    if (isVowel(chars[i])) {
      let j = i;
      while (j + 1 < n && isVowel(chars[j + 1]) && vowelsJoin(chars[j], chars[j + 1])) j++;
      nuclei.push({ start: i, end: j + 1 });
      i = j + 1;
    } else {
      i++;
    }
  }
  if (nuclei.length === 0) return [word];
  const onsets: number[] = [];
  for (let k = 0; k < nuclei.length; k++) {
    const clusterStart = k === 0 ? 0 : nuclei[k - 1].end;
    const nucleusStart = nuclei[k].start;
    const cluster = chars.slice(clusterStart, nucleusStart).join("");
    let onsetStart = nucleusStart;
    if (cluster.length === 1) {
      onsetStart = nucleusStart - 1;
    } else if (cluster.length === 2) {
      if (INSEPARABLES.has(cluster.toLowerCase())) onsetStart = nucleusStart - 2;
      else onsetStart = nucleusStart - 1;
    } else if (cluster.length >= 3) {
      const last2 = cluster.slice(-2).toLowerCase();
      if (INSEPARABLES.has(last2)) onsetStart = nucleusStart - 2;
      else onsetStart = nucleusStart - 1;
    }
    onsets.push(onsetStart);
  }
  const syls: string[] = [];
  for (let k = 0; k < nuclei.length; k++) {
    const from = onsets[k];
    const to = k + 1 < nuclei.length ? onsets[k + 1] : n;
    syls.push(chars.slice(from, Math.max(to, nuclei[k].end)).join(""));
  }
  return syls.filter((s) => s.length > 0);
}

export function stressedSyllableIndex(word: string): number {
  const syls = syllabify(word);
  if (syls.length === 0) return -1;
  if (syls.length === 1) return 0;
  const accented = syls.findIndex((s) => [...s].some(isAccentedVowel));
  if (accented >= 0) return accented;
  const openEnd = /[aeiouáéíóúns]$/i.test(word);
  if (openEnd) return Math.max(0, syls.length - 2);
  return syls.length - 1;
}

export type StressType = "aguda" | "llana" | "esdrújula" | "sobresdrújula";

export function stressType(word: string): StressType | null {
  const syls = syllabify(word);
  if (syls.length === 0) return null;
  const idx = stressedSyllableIndex(word);
  if (idx < 0) return null;
  const fromEnd = syls.length - 1 - idx;
  if (fromEnd === 0) return "aguda";
  if (fromEnd === 1) return "llana";
  if (fromEnd === 2) return "esdrújula";
  return "sobresdrújula";
}

export function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const UNITS = [
  "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete",
  "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés",
  "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
];

const TENS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];

const HUNDREDS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

function under100(n: number, feminine = false): string {
  if (n < 30) {
    if (n === 1 && feminine) return "una";
    if (n === 21 && feminine) return "veintiuna";
    return UNITS[n];
  }
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return TENS[t];
  return `${TENS[t]} y ${UNITS[u]}`;
}

function under1000(n: number, feminine = false): string {
  if (n === 100) return "cien";
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h === 0) return under100(rest, feminine);
  let hText = HUNDREDS[h];
  if (feminine && h === 2) hText = "doscientas";
  if (rest === 0) return hText;
  return `${hText} ${under100(rest, feminine)}`;
}

export function numberToSpanish(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999999) throw new Error("rango no soportado");
  if (n < 1000) return under1000(n);
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const thText = thousands === 1 ? "mil" : `${under1000(thousands)} mil`;
  if (rest === 0) return thText;
  return `${thText} ${under1000(rest)}`;
}

export function hasWrittenAccent(word: string): boolean {
  return [...word].some(isAccentedVowel);
}

export function capFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
