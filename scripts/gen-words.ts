/**
 * Generador v3 de paquetes SRS.
 * - Checkpoint: mapa palabra-normalizada → entrada (+pack). Inmune a offsets.
 * - Lotes de 12 con max_tokens 4096.
 * - Backoff exponencial ante 429.
 * - Concurrencia 2.
 */
import ZAI from "z-ai-web-dev-sdk";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { SRS_WORDS } from "../src/data/words-srs";
import { SRS_WORDS_B } from "../src/data/words-srs-b";
import { SRS_WORDS_C1 } from "../src/data/gen/words-srs-c1";
import { SRS_WORDS_D1 } from "../src/data/gen/words-srs-d1";
import type { SrsWord } from "../src/types";

const WL = "/home/z/my-project/scripts/wordlists";
const PROGRESS = `${WL}/progress-v3.json`;
const DEBUG_DIR = `${WL}/debug`;
mkdirSync(DEBUG_DIR, { recursive: true });

type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type PackId = "c1b1" | "d1fix" | "d1a2" | "d1b1" | "c2b2" | "c2c1" | "c2c2" | "d2b2" | "d2c1" | "d2c2";
const DIFF: Record<Level, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 4, C2: 5 };
const POS_OK = new Set(["sustantivo", "verbo", "adjetivo", "adverbio"]);

function norm(w: string): string {
  return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n").trim();
}
function slug(w: string): string {
  return norm(w).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Entrada con metadatos de generación. */
type GenEntry = SrsWord & { pack: PackId };

let store: Record<string, GenEntry> = {};
if (existsSync(PROGRESS)) store = JSON.parse(readFileSync(PROGRESS, "utf8"));
const save = () => writeFileSync(PROGRESS, JSON.stringify(store));

const usedNorm = new Set<string>();
for (const w of [...SRS_WORDS, ...SRS_WORDS_B, ...SRS_WORDS_C1, ...SRS_WORDS_D1]) usedNorm.add(norm(w.word));
for (const e of Object.values(store)) usedNorm.add(norm(e.word));

/** Lee una wordlist sin filtrar por «usadas» (dedupe interno sí). */
function parseList(name: string): { word: string; level: Level }[] {
  const out: { word: string; level: Level }[] = [];
  const seen = new Set<string>();
  for (const raw of readFileSync(`${WL}/${name}`, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const [word, level] = line.split("|") as [string, Level];
    const w = word.trim();
    if (!w || w.includes(" ")) continue;
    if (!["A1", "A2", "B1", "B2", "C1", "C2"].includes(level)) continue;
    const key = norm(w);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ word: w, level });
  }
  return out;
}

let zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function chat(user: string, system: string, attempt = 0): Promise<string> {
  if (!zai) zai = await ZAI.create();
  try {
    const call = zai.chat.completions.create({
      messages: [
        { role: "assistant", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 4096,
      thinking: { type: "disabled" },
    });
    const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout 170s")), 170_000));
    const completion = await Promise.race([call, timeout]);
    return completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    const msg = (err as Error).message ?? "";
    if (attempt < 4 && (msg.includes("429") || msg.includes("Too many") || msg.includes("timeout"))) {
      const wait = 15_000 * (attempt + 1);
      console.error(`  ⏳ backoff ${(wait / 1000).toFixed(0)}s`);
      await sleep(wait);
      return chat(user, system, attempt + 1);
    }
    throw err;
  }
}

function extractJson(text: string): unknown[] {
  let t = text.trim().replace(/```(?:json)?/gi, "").trim();
  const s = t.indexOf("[");
  let e = t.lastIndexOf("]");
  if (e === -1) {
    const last = t.lastIndexOf("},");
    if (last > 0) {
      t = t.slice(0, last + 1) + "]";
      e = t.length - 1;
    }
  }
  if (s === -1 || e === -1) throw new Error("sin array JSON");
  return JSON.parse(t.slice(s, e + 1)) as unknown[];
}

function validateEntry(raw: unknown, level: Level): { entry: SrsWord | null; reason: string } {
  try {
    const o = raw as Record<string, unknown>;
    const word = String(o.word ?? "").trim();
    const pos = String(o.pos ?? "").trim();
    const definition = String(o.definition ?? "").trim();
    const example = String(o.example ?? "").trim();
    let tags = Array.isArray(o.tags) ? o.tags.map(String) : [];
    if (!word || word.includes(" ") || word.length > 25) return { entry: null, reason: "palabra" };
    if (!POS_OK.has(pos)) return { entry: null, reason: "pos" };
    if (!definition || definition.length > 115) return { entry: null, reason: "definicion" };
    if (!example || example.length > 125) return { entry: null, reason: "ejemplo" };
    const root = norm(word).slice(0, Math.min(4, norm(word).length));
    if (!norm(example).includes(root)) return { entry: null, reason: "sin-palabra-en-ejemplo" };
    if (usedNorm.has(norm(word))) return { entry: null, reason: "duplicada" };
    tags = tags.slice(0, 2).map((t) => t.toLowerCase());
    if (tags.length === 0) tags = ["vocabulario"];
    return {
      entry: { id: "", word, pos, definition, example, difficulty: DIFF[level], cefr: level, tags },
      reason: "",
    };
  } catch {
    return { entry: null, reason: "formato" };
  }
}

/** Genera entradas para una lista concreta de palabras (un lote ≤12). */
async function genWords(words: { word: string; level: Level }[], pack: PackId): Promise<number> {
  const level = words[0].level;
  const target = words.map((w) => w.word).join(", ");
  const system = "Eres lexicógrafo experto del español y profesor de ELE. Devuelves EXCLUSIVAMENTE un array JSON válido, sin texto adicional.";
  const user = `Genera entradas de diccionario para estudiantes de español (juego educativo VERBALIA). Para CADA palabra indicada devuelve un objeto:
{"word":"...","pos":"sustantivo|verbo|adjetivo|adverbio","definition":"...","example":"...","tags":["..."]}
Reglas:
- word: la palabra indicada con sus tildes correctas.
- pos: categoría gramatical correcta.
- definition: definición de diccionario en español claro, MÁXIMO 110 caracteres.
- example: frase natural en español que USE la palabra (misma raíz), MÁXIMO 120 caracteres.
- tags: 1-2 etiquetas en minúscula sobre el tema.
Devuelve UNA entrada por palabra, en el mismo orden, sin comentarios.`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const text = await chat(`${user}\n\nPalabras: ${target}`, system);
      writeFileSync(`${DEBUG_DIR}/${pack}.txt`, text);
      const arr = extractJson(text);
      const entries: SrsWord[] = [];
      const reasons: Record<string, number> = {};
      for (const raw of arr) {
        const { entry, reason } = validateEntry(raw, level);
        if (entry) {
          usedNorm.add(norm(entry.word));
          entries.push(entry);
        } else {
          reasons[reason] = (reasons[reason] ?? 0) + 1;
        }
      }
      for (const e of entries) store[norm(e.word)] = { ...e, pack };
      save();
      return entries.length;
    } catch (err) {
      console.error(`  ${pack} intento ${attempt}:`, (err as Error).message?.slice(0, 70));
    }
  }
  return 0;
}

/** Propone y genera palabras nuevas sobre un tema (pide de más). */
async function topUp(level: Level, themes: string, pack: PackId, need: number): Promise<number> {
  let got = 0;
  let round = 0;
  while (got < need && round < 8) {
    round++;
    const chunk = Math.min(24, Math.max(12, (need - got) * 2));
    const exclusion = [...usedNorm].slice(-2400).join(", ");
    const system = "Eres lexicógrafo experto del español. Devuelves EXCLUSIVAMENTE un array JSON válido, sin texto adicional.";
    const user = `Propón ${chunk} palabras del español de nivel MCER ${level} sobre: ${themes}.
REGLAS: palabras únicas (nunca frases de varias palabras), reales del español, DISTINTAS de esta lista de prohibidas: ${exclusion}.
Enumera temas variados dentro del campo. Para cada una devuelve {"word":"...","pos":"sustantivo|verbo|adjetivo|adverbio","definition":"definición ≤110 caracteres","example":"frase que use la palabra ≤120 caracteres","tags":["etiqueta"]}.
Nivel MCER ${level}. Devuelve un array JSON con exactamente ${chunk} entradas.`;
    try {
      const text = await chat(user, system);
      writeFileSync(`${DEBUG_DIR}/${pack}-topup.txt`, text);
      const arr = extractJson(text);
      for (const raw of arr) {
        const { entry } = validateEntry(raw, level);
        if (entry) {
          usedNorm.add(norm(entry.word));
          store[norm(entry.word)] = { ...entry, pack };
          got++;
        }
      }
      save();
    } catch (err) {
      console.error(`  ${pack} topup r${round}:`, (err as Error).message?.slice(0, 70));
      await sleep(10_000);
    }
  }
  return got;
}

/** Ejecuta las palabras pendientes de una lista, en lotes de 12, concurrencia 2. */
async function runList(listInput: string | string[], level: Level, pack: PackId, total: number, themes: string) {
  const lists = Array.isArray(listInput) ? listInput : [listInput];
  // Palabras de las listas aún no generadas (y no usadas en el catálogo base).
  const pending = lists
    .flatMap((l) => parseList(l))
    .filter((w) => w.level === level)
    .filter((w) => !store[norm(w.word)] && !usedNorm.has(norm(w.word)))
    .map((w) => ({ ...w, level }));

  const batches: { word: string; level: Level }[][] = [];
  for (let i = 0; i < pending.length; i += 12) batches.push(pending.slice(i, i + 12));

  const have = () => Object.values(store).filter((e) => e.pack === pack).length;

  const queue = [...batches];
  const workers = Array.from({ length: 1 }, async () => {
    while (queue.length && have() < total) {
      const b = queue.shift();
      if (!b) break;
      try {
        await genWords(b, pack);
      } catch (err) {
        console.error("  lote perdido (continúo):", (err as Error).message?.slice(0, 60));
      }
      await sleep(1500);
    }
  });
  await Promise.all(workers);

  // Recuento del pack (incluye generaciones de ejecuciones previas).
  if (have() < total) {
    const missing = total - have();
    console.log(`  ${pack}: topUp ${missing} (${themes.split(",")[0]}…)`);
    await topUp(level, themes, pack, missing);
  }
  console.log(`  ${pack}: ${have()}/${total}`);
}

function emit(entries: SrsWord[], prefix: string): string {
  return entries
    .map((e) => {
      const id = `${prefix}-${slug(e.word)}`;
      return `  { id: "${id}", word: ${JSON.stringify(e.word)}, pos: ${JSON.stringify(e.pos)}, definition: ${JSON.stringify(e.definition)}, example: ${JSON.stringify(e.example)}, difficulty: ${e.difficulty}, cefr: "${e.cefr}", tags: ${JSON.stringify(e.tags)} },`;
    })
    .join("\n");
}

const of = (pack: PackId) => Object.values(store).filter((e) => e.pack === pack).map(({ pack: _p, ...rest }) => rest);

async function main() {
  const stage = process.argv[2] ?? "all";

  if (stage === "c1b1") {
    console.log("→ C1 B1 (110)…");
    await runList("c1-b1.txt", "B1", "c1b1", 110, "trabajo, economía doméstica, ciudad, comercio");
  }
  if (stage === "d1a2") {
    console.log("→ D1 A2 (110)…");
    await runList("d1-a2.txt", "A2", "d1a2", 110, "transporte, viaje, cuerpo, salud, hogar");
  }
  if (stage === "d1b1") {
    console.log("→ D1 B1 (110)…");
    await runList("d1-b1.txt", "B1", "d1b1", 110, "deporte, música, teatro, valores del deportista");
  }
  if (stage === "d1fix") {
    console.log("→ D1 fix (29 A1 curadas)…");
    await runList("d1-fix.txt", "A1", "d1fix", 29, "ciudad, transporte, ropa, animales, objetos cotidianos");
  }
  if (stage === "c2") {
    await runList(["c2.txt", "c2-extra.txt"], "B2", "c2b2", 125, "geografía física de América, naturaleza, gastronomía latinoamericana");
    await runList(["c2.txt", "c2-extra.txt"], "C1", "c2c1", 100, "sociedad, política, instituciones del español");
    await runList(["c2.txt", "c2-extra.txt"], "C2", "c2c2", 95, "marinería, construcción naval, léxico culto de América");
  }
  if (stage === "d2") {
    await runList(["d2.txt", "d2-extra.txt"], "B2", "d2b2", 125, "retórica, figuras literarias, métrica, periodismo");
    await runList(["d2.txt", "d2-extra.txt"], "C1", "d2c1", 100, "música clásica, teoría musical, notación");
    await runList(["d2.txt", "d2-extra.txt"], "C2", "d2c2", 95, "filosofía, tragedia griega, léxico culto");
  }

  if (stage === "write") {
    console.log("→ Escribiendo archivos…");
    const c1b1 = of("c1b1").slice(0, 110);
    const d1a2 = of("d1a2").slice(0, 110);
    const d1b1 = of("d1b1").slice(0, 110);
    const d1fix = of("d1fix").slice(0, 29);
    const c2b2 = of("c2b2").slice(0, 125);
    const c2c1 = of("c2c1").slice(0, 100);
    const c2c2 = of("c2c2").slice(0, 95);
    const d2b2 = of("d2b2").slice(0, 125);
    const d2c1 = of("d2c1").slice(0, 100);
    const d2c2 = of("d2c2").slice(0, 95);

    const c1Path = "/home/z/my-project/src/data/gen/words-srs-c1.ts";
    const c1Cur = readFileSync(c1Path, "utf8");
    if (c1b1.length === 110 && !c1Cur.includes("B1 · cotidiano")) {
      writeFileSync(
        c1Path,
        c1Cur.replace(/\n\];(\s*)$/, `\n\n  // ---------- B1 · cotidiano que crece (110) ----------\n${emit(c1b1, "w1c")}\n];$1`),
      );
    }

    const { SRS_WORDS_C1 } = await import("../src/data/gen/words-srs-c1");
    const { SRS_WORDS_D1 } = await import("../src/data/gen/words-srs-d1");
    const c1Norm = new Set(SRS_WORDS_C1.map((w) => norm(w.word)));
    const d1Clean = SRS_WORDS_D1.filter((w) => !c1Norm.has(norm(w.word)));
    const d1Final = [...d1Clean, ...d1fix.slice(0, Math.max(0, 110 - d1Clean.length)), ...d1a2, ...d1b1];
    const g = (l: Level) => d1Final.filter((w) => w.cefr === l).slice(0, 110);
    writeFileSync(
      "/home/z/my-project/src/data/gen/words-srs-d1.ts",
      `import type { SrsWord } from "@/types";

/**
 * Paquete D1 · Mega-ampliación (niveles A1-B1): 110 A1 · 110 A2 · 110 B1.
 * Ejes: ciudad, transporte, ropa, animales, deportes, salud, escuela
 * y tiempo libre.
 */
export const SRS_WORDS_D1: SrsWord[] = [
  // ---------- A1 ----------
${emit(g("A1"), "w1d")}

  // ---------- A2 ----------
${emit(g("A2"), "w1d")}

  // ---------- B1 ----------
${emit(g("B1"), "w1d")}
];
`,
    );

    writeFileSync(
      "/home/z/my-project/src/data/gen/words-srs-c2.ts",
      `import type { SrsWord } from "@/types";

/**
 * Paquete C2 · Mega-ampliación (niveles B2-C2): 125 B2 · 100 C1 · 105 C2.
 * Ejes: geografía y naturaleza de América, gastronomía latinoamericana,
 * sociedad, política y marinería del español.
 */
export const SRS_WORDS_C2: SrsWord[] = [
  // ---------- B2 ----------
${emit(c2b2, "w2c")}

  // ---------- C1 ----------
${emit(c2c1, "w2c")}

  // ---------- C2 ----------
${emit(c2c2, "w2c")}
];
`,
    );
    writeFileSync(
      "/home/z/my-project/src/data/gen/words-srs-d2.ts",
      `import type { SrsWord } from "@/types";

/**
 * Paquete D2 · Mega-ampliación (niveles B2-C2): 125 B2 · 100 C1 · 105 C2.
 * Ejes: retórica, métrica, periodismo, música clásica, filosofía y
 * léxico culto del español.
 */
export const SRS_WORDS_D2: SrsWord[] = [
  // ---------- B2 ----------
${emit(d2b2, "w2d")}

  // ---------- C1 ----------
${emit(d2c1, "w2d")}

  // ---------- C2 ----------
${emit(d2c2, "w2d")}
];
`,
    );
    console.log(
      `✔ C1+${c1b1.length} · D1 ${d1Final.length} · C2 ${c2b2.length + c2c1.length + c2c2.length} · D2 ${d2b2.length + d2c1.length + d2c2.length}`,
    );
  }

  const counts: Partial<Record<PackId, number>> = {};
  for (const e of Object.values(store)) counts[e.pack] = (counts[e.pack] ?? 0) + 1;
  console.log("PACKS:", JSON.stringify(counts), "· total generado:", Object.keys(store).length);
}

main().catch((err) => {
  console.error("FALLO:", err);
  process.exit(1);
});
