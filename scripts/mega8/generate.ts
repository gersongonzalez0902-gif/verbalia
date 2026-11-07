/**
 * GENERADOR MEGA-8 · Produce ≥500 ejercicios por minijuego.
 * Fuentes: banco SRS (1844 palabras reales), bancos curados 1-4 y
 * packs existentes (refranes, orígenes, sinónimos...).
 * Salida: src/data/gen/mega8/*.ts (carga diferida por grupo).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { makeRng, hashString, pick, sample, shuffle, syllabify, stressedSyllableIndex, stressType, numberToSpanish, stripAccents, capFirst } from "./util";
import { HOMOFONOS, COLOCACIONES, ANALOGIAS, GRADOS } from "./banks1";
import { NAMES, OBJECTS, PLACES, FOODS, ANIMALS, SERESTAR, PORPARA, CONCORDANCIA, PUNTUACION, SUBJUNTIVO, TIEMPOS, PRONOMBRES, RELATIVOS, ESTILO, PASIVA, GENERO } from "./banks2";
import { STORIES } from "./banks3";
import { METAFORAS, REGISTRO, CONECTORES, IRONIA, REDUNDANCIAS, REGIONALISMOS, FALSOS, FAMILIAS, DERIVADAS, MAYUSCULAS, ENTONACION, INICIADORES, CIERRE, DESCRIPCIONES } from "./banks4";
import { SRS_WORDS_FULL } from "../../src/data/content";
import { REFRANES_PACK } from "../../src/data/refranes";
import { SINONIMOS_PACK } from "../../src/data/sinonimos";
import { ORIGINS } from "../../src/data/formats/origins";
import type {
  Exercise, Difficulty, SkillId, TriviaExercise, ClozeExercise, SprintExercise, DictadoExercise,
  PuzzleExercise, EscribeLibreExercise, GrafiaExercise, ClasificaExercise, OrdenaExercise,
  EligeExercise, MultiExercise, OyeExercise, EscribeExercise, MemoriaExercise, IntrusoExercise,
  SorteaExercise, VfExercise, ConectaExercise, ConectoresExercise, MetaforasExercise, RegistroExercise,
  IroniaExercise, TitulosExercise, MaticesExercise, LecturaExercise, ParagraphExercise, HistoriasExercise,
  RefranesExercise, MinutoExercise, OyeAcentoExercise, OyeNumeroExercise, SinonimosExercise,
} from "../../src/types";

/* ============================ utilidades ============================ */

const OUT_DIR = path.join(process.cwd(), "src/data/gen/mega8");
fs.mkdirSync(OUT_DIR, { recursive: true });

/** ¿Tiene marcadores basura un valor de banco? (\bno: con límite de palabra
 *  para no confundir con «masculino:», «femenino:»...). */
const dirty = (...vals: string[]) =>
  vals.some((v) => !v || v.trim() === "" || /\bno:/.test(v));

const cefrFor = (d: Difficulty): "A1" | "A2" | "B1" | "B2" | "C1" | "C2" =>
  (["A1", "A2", "B1", "B2", "C1", "C2"] as const)[d - 1];

const DIFFS: Difficulty[] = [1, 2, 3, 4, 5];
const diffFor = (i: number): Difficulty => DIFFS[Math.min(4, Math.floor((i % 500) / 100))];

const fill = (tpl: string, rng: () => number): string =>
  tpl
    .replace(/\{N\}/g, () => pick(rng, NAMES))
    .replace(/\{O\}/g, () => pick(rng, OBJECTS))
    .replace(/\{L\}/g, () => pick(rng, PLACES))
    .replace(/\{C\}/g, () => pick(rng, FOODS))
    .replace(/\{A\}/g, () => pick(rng, ANIMALS));

/** Registro de pools por juego. */
const pools = new Map<string, Exercise[]>();
const pool = (gameId: string) => {
  let p = pools.get(gameId);
  if (!p) { p = []; pools.set(gameId, p); }
  return p;
};
const seenIds = new Set<string>();
function push<T extends Exercise>(gameId: string, ex: Omit<T, "id"> & { id?: string }): void {
  const p = pool(gameId);
  let id = ex.id ?? `${gameId.slice(0, 4)}m8-${String(p.length + 1).padStart(4, "0")}`;
  while (seenIds.has(id)) id = `${id}x`;
  seenIds.add(id);
  p.push({ ...ex, id } as T);
}

/* ============================ 1 · NÚCLEO SRS ============================ */

const WORDS = SRS_WORDS_FULL.filter((w) => w.word && w.definition && w.example && !w.word.includes(" "));
const NOUNS = WORDS.filter((w) => w.pos === "sustantivo");
const VERBS = WORDS.filter((w) => w.pos === "verbo");
const ADJ = WORDS.filter((w) => w.pos === "adjetivo");

function genCoreFromWords(seed: number) {
  const rng = makeRng(seed);

  /* --- Trivia --- */
  const PROMPTS_TRIVIA = [
    "¿Qué clase de palabra es la destacada?",
    "Clasifica la palabra que va entre asteriscos.",
    "¿Qué función cumple la palabra resaltada?",
  ];
  for (const w of WORDS) {
    const sentence = w.example.replace(new RegExp(`\\b${w.word}\\b`, "u"), `*${w.word}*`);
    if (sentence === w.example) continue;
    const answer = (["sustantivo", "verbo", "adjetivo", "adverbio"] as const).includes(w.pos as "sustantivo")
      ? (w.pos as "sustantivo" | "verbo" | "adjetivo" | "adverbio")
      : "sustantivo";
    push<TriviaExercise>("trivia", {
      type: "trivia", skill: "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
      sentence, answer,
      prompt: pick(rng, PROMPTS_TRIVIA),
      explanation: `«${capFirst(w.word)}» aparece en el diccionario como ${w.pos}: ${w.definition.toLowerCase()}`,
      tags: w.tags.slice(0, 3),
    });
  }

  /* --- Sprint --- */
  for (const w of shuffle(rng, WORDS)) {
    const distract = sample(rng, WORDS.filter((x) => x.id !== w.id), 3);
    if (distract.length < 3) continue;
    const options = shuffle(rng, [w.definition, ...distract.map((d) => d.definition)]);
    push<SprintExercise>("sprint", {
      type: "sprint", skill: "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
      word: w.word, options, answerIndex: options.indexOf(w.definition),
      prompt: "Elige la definición correcta.",
      explanation: `«${w.word}»: ${w.definition}`,
      tags: w.tags.slice(0, 3),
    });
  }

  /* --- Cloze --- */
  for (const w of shuffle(rng, WORDS)) {
    if (!w.example.toLowerCase().includes(w.word.toLowerCase())) continue;
    const sameKind = WORDS.filter((x) => x.id !== w.id && x.pos === w.pos && x.word !== w.word);
    const distract = sample(rng, sameKind, 3);
    if (distract.length < 3) continue;
    const text = w.example.replace(new RegExp(`\\b${w.word}\\b`, "u"), "___");
    if (text === w.example) continue;
    const options = shuffle(rng, [w.word, ...distract.map((d) => d.word)]);
    push<ClozeExercise>("cloze", {
      type: "cloze", skill: w.pos === "verbo" ? "gramatica" : "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
      text, options, answerIndex: options.indexOf(w.word),
      prompt: "Completa el hueco con la palabra correcta.",
      explanation: `«${w.word}»: ${w.definition}`,
      tags: w.tags.slice(0, 3),
    });
  }

  /* --- Dictado --- */
  for (const w of shuffle(rng, WORDS)) {
    if (w.example.length < 25 || w.example.length > 90) continue;
    push<DictadoExercise>("dictado", {
      type: "dictado", skill: "audicion", difficulty: w.difficulty, cefr: w.cefr,
      sentence: w.example,
      hint: `Empieza por «${w.example.split(" ")[0]}» · ${w.example.split(" ").length} palabras`,
      prompt: "Escucha (o lee) y escribe la frase tal cual.",
      explanation: `La frase correcta es: «${w.example}»`,
      tags: w.tags.slice(0, 3),
    });
  }

  /* --- Puzzle --- */
  for (const w of shuffle(rng, WORDS)) {
    if (w.example.length < 30 || w.example.length > 80) continue;
    const words = w.example.replace(/[.]$/, "").split(" ");
    if (words.length < 5 || words.length > 10) continue;
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += 2) {
      chunks.push(words.slice(i, i + 2).join(" "));
    }
    push<PuzzleExercise>("puzzle", {
      type: "puzzle", skill: "gramatica", difficulty: w.difficulty, cefr: w.cefr,
      chunks,
      prompt: "Reconstruye la frase tocando los fragmentos en orden.",
      explanation: `La frase original es: «${w.example}»`,
      tags: w.tags.slice(0, 3),
    });
  }

  /* --- Definiciones (escribe libre) --- */
  for (const w of shuffle(rng, WORDS)) {
    if (w.word.length < 4) continue;
    push<EscribeLibreExercise>("definiciones", {
      type: "definiciones", skill: "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
      clue: `Palabra que significa: ${w.definition.toLowerCase()}`,
      word: w.word,
      hint: `${w.pos} · empieza por «${w.word[0]}» · ${w.word.length} letras`,
      prompt: "Escribe la palabra exacta.",
      explanation: `«${w.word}»: ${w.definition}`,
      tags: w.tags.slice(0, 3),
    });
  }

  /* --- Escribe (4 regiones) --- */
  const escribeTargets: [string, typeof WORDS][] = [
    ["escribe-bosque", NOUNS],
    ["escribe-ciudad", VERBS],
    ["escribe-fortaleza", WORDS.filter((w) => /[áéíóú]/.test(w.word))],
    ["escribe-torre", ADJ],
  ];
  for (const [gid, list] of escribeTargets) {
    for (const w of shuffle(rng, list)) {
      if (w.word.length < 4) continue;
      push<EscribeExercise>(gid, {
        type: gid as "escribe-bosque", skill: "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
        clue: `${capFirst(w.definition)}.`,
        word: w.word,
        hint: `${w.pos} · ${w.word.length} letras · empieza por «${w.word[0].toLowerCase()}»`,
        prompt: "Escribe la palabra que encaja con la pista.",
        explanation: `«${w.word}»: ${w.definition}`,
        tags: w.tags.slice(0, 3),
      });
    }
    if (pool(gid).length < 520) {
      for (const w of shuffle(rng, WORDS)) {
        if (pool(gid).length >= 520) break;
        if (list.some((x) => x.id === w.id) || w.word.length < 4) continue;
        push<EscribeExercise>(gid, {
          type: gid as "escribe-bosque", skill: "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
          clue: `${capFirst(w.definition)}.`,
          word: w.word,
          hint: `${w.pos} · ${w.word.length} letras`,
          prompt: "Escribe la palabra que encaja con la pista.",
          explanation: `«${w.word}»: ${w.definition}`,
          tags: w.tags.slice(0, 3),
        });
      }
    }
  }

  /* --- Oye (3 regiones) --- */
  const swapVariants = (word: string): string[] => {
    const out = new Set<string>();
    const add = (v: string) => { if (v && v !== word) out.add(v); };
    if (/b|v/i.test(word)) {
      add(word.replace(/b/g, "v").replace(/B/g, "V"));
      add(word.replace(/v/g, "b").replace(/V/g, "B"));
    }
    if (/^h/i.test(word)) add(word.slice(1));
    if (/ll/i.test(word)) add(word.replace(/ll/g, "y").replace(/LL/g, "YY").replace(/Ll/g, "Y"));
    else if (/^y/i.test(word)) add(word.replace(/^y/i, "ll").replace(/^Y/, "Ll"));
    if (/[áéíóú]/.test(word)) add(stripAccents(word));
    if (/g[ei]/i.test(word)) add(word.replace(/ge/gi, "je").replace(/gi/gi, "ji").replace(/Ge/g, "Je").replace(/Gi/g, "Ji"));
    if (/j/i.test(word)) add(word.replace(/j/g, "g").replace(/J/g, "G"));
    return [...out].slice(0, 2);
  };
  for (const gid of ["oye-bosque", "oye-fortaleza", "oye-puerto"] as const) {
    let i = 0;
    const usable = shuffle(makeRng(hashString(gid)), WORDS).filter((w) => swapVariants(w.word).length > 0);
    while (pool(gid).length < 520 && usable.length > 0) {
      const w = usable[i % usable.length];
      const wrongs = swapVariants(w.word);
      const options = shuffle(makeRng(hashString(`${gid}-${w.id}-${Math.floor(i / usable.length)}`)), [w.word, ...wrongs]);
      push<OyeExercise>(gid, {
        type: gid, skill: "audicion", difficulty: w.difficulty, cefr: w.cefr,
        word: w.word, wrongs,
        prompt: "Escucha y elige la escritura correcta.",
        explanation: `Se escribe «${w.word}»: ${w.definition}`,
        tags: w.tags.slice(0, 3),
      });
      i++;
      if (i > usable.length * 12) break;
    }
  }

  /* --- Abecedario --- */
  for (let i = 0; i < 520; i++) {
    const rng2 = makeRng(hashString(`abc-${i}`));
    const four = sample(rng2, NOUNS.length >= 4 ? NOUNS : WORDS, 4);
    if (four.length < 4) break;
    const sorted = [...four].sort((a, b) => a.word.localeCompare(b.word, "es"));
    push<OrdenaExercise>("abecedario", {
      type: "abecedario", skill: "vocabulario", difficulty: diffFor(i), cefr: cefrFor(diffFor(i)),
      items: sorted.map((w) => w.word),
      criteria: "Tócalas en orden alfabético.",
      prompt: "Ordena las palabras alfabéticamente.",
      explanation: `Orden alfabético: ${sorted.map((w) => w.word).join(" < ")}.`,
      tags: ["orden"],
    });
  }

  /* --- Acentos (clasifica) --- */
  {
    let accCount = 0;
    for (const w of shuffle(makeRng(seed + 7), WORDS)) {
      if (accCount >= 520) break;
      const t = stressType(w.word);
      if (!t || t === "sobresdrújula") continue;
      if (w.word.length < 4) continue;
      push<ClasificaExercise>("acentos", {
        type: "acentos", skill: "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
        item: w.word,
        buckets: ["aguda", "llana", "esdrújula"],
        answerIndex: t === "aguda" ? 0 : t === "llana" ? 1 : 2,
        prompt: "¿Dónde recae la fuerza de voz?",
        explanation: `«${w.word}» es ${t}: la sílaba tónica es «${syllabify(w.word)[stressedSyllableIndex(w.word)]}».`,
        tags: ["acentos"],
      });
      accCount++;
    }
  }

  /* --- Silabas (ordena) --- */
  {
    let sylCount = 0;
    for (const w of shuffle(makeRng(seed + 8), WORDS)) {
      if (sylCount >= 520) break;
      const syls = syllabify(w.word);
      if (syls.length < 2 || syls.length > 5 || w.word.length < 5) continue;
      push<OrdenaExercise>("silabas", {
        type: "silabas", skill: "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
        items: syls,
        criteria: "Une las sílabas en su orden real.",
        prompt: "Ordena las sílabas para formar la palabra.",
        explanation: `«${w.word}» se divide: ${syls.join("-")}.`,
        tags: ["sílabas"],
      });
      sylCount++;
    }
  }

  /* --- Oye-acento --- */
  {
    let oyeAcc = 0;
    for (const w of shuffle(makeRng(seed + 9), WORDS)) {
      if (oyeAcc >= 520) break;
      const syls = syllabify(w.word);
      const idx = stressedSyllableIndex(w.word);
      if (syls.length < 2 || syls.length > 5 || idx < 0) continue;
      push<OyeAcentoExercise>("oye-acento", {
        type: "oye-acento", skill: "audicion", difficulty: w.difficulty, cefr: w.cefr,
        word: w.word, syllables: syls, answerSyllable: idx,
        prompt: "Escucha y toca la sílaba tónica.",
        explanation: `La fuerza de voz cae en «${syls[idx]}» (${stressType(w.word)}).`,
        tags: ["acentos", "escucha"],
      });
      oyeAcc++;
    }
  }

  /* --- Cifras y oyenumero --- */
  for (let i = 0; i < 520; i++) {
    const rng2 = makeRng(hashString(`cifra-${i}`));
    const bands = [30, 100, 300, 1000, 5000, 30000, 99000];
    const max = bands[Math.floor(rng2() * bands.length)];
    const n = 1 + Math.floor(rng2() * max);
    const words = numberToSpanish(n);
    const distract = shuffle(rng2, [numberToSpanish(Math.max(1, n - 1)), numberToSpanish(n + 1), numberToSpanish(Math.min(999999, n + 10))]);
    const options = shuffle(rng2, [words, ...distract]);
    push<EligeExercise>("cifras", {
      type: "cifras", skill: "ortografia", difficulty: diffFor(i), cefr: cefrFor(diffFor(i)),
      context: `En el talonario estaba anotado el número ${n}.`,
      question: `¿Cómo se escribe en letras la cifra ${n}?`,
      options, answerIndex: options.indexOf(words),
      prompt: "Cifras a letras.",
      explanation: `${n} se escribe «${words}».`,
      tags: ["números"],
    });
    {
      const optNums = shuffle(rng2, [n, Math.max(1, n - 1), n + 1, n + 10]);
      push<OyeNumeroExercise>("oyenumero", {
        type: "oyenumero", skill: "audicion", difficulty: diffFor(i), cefr: cefrFor(diffFor(i)),
        speech: words,
        options: optNums.map(String),
        answerIndex: optNums.indexOf(n),
        prompt: "Escucha el número y elige la cifra.",
        explanation: `«${words}» es ${n}.`,
        tags: ["números", "escucha"],
      });
    }
  }
}

/* ============================ 2 · GRAMÁTICA ============================ */

function genGrammar(seed: number) {
  const rng = makeRng(seed);

  const eligeFromBank = (
    gameId: string,
    bank: [string, string, string, string][],
    skill: SkillId,
    prompt: string,
  ) => {
    const clean = bank.filter((b) => !dirty(b[0], b[1], b[2], b[3]));
    let i = 0;
    while (pool(gameId).length < 520 && clean.length > 0) {
      const [tpl, correct, wrong, expl] = clean[i % clean.length];
      const surface = fill(tpl, rng).replace("{x}", "…").replace(/ \([^)]*\)/g, "");
      const options = shuffle(rng, [correct, wrong]);
      push<EligeExercise>(gameId, {
        type: gameId as "serestar", skill, difficulty: diffFor(pool(gameId).length), cefr: cefrFor(diffFor(pool(gameId).length)),
        context: surface,
        question: prompt,
        options, answerIndex: options.indexOf(correct),
        prompt,
        explanation: expl,
        tags: ["gramática"],
      });
      i++;
      if (i > clean.length * 40) break;
    }
  };

  eligeFromBank("serestar", SERESTAR, "gramatica", "¿«Ser» o «estar» encaja aquí?");
  eligeFromBank("porpara", PORPARA, "gramatica", "¿«Por» o «para» es la correcta?");
  eligeFromBank("subjuntivo", SUBJUNTIVO, "gramatica", "Elige la forma verbal correcta.");
  eligeFromBank("tiempos", TIEMPOS, "gramatica", "¿Qué tiempo verbal encaja?");
  eligeFromBank("pronombres", PRONOMBRES, "gramatica", "Elige el pronombre correcto.");
  eligeFromBank("relativos", RELATIVOS, "gramatica", "Elige el relativo correcto.");
  eligeFromBank("puntuacion", PUNTUACION, "ortografia", "Elige la grafía o signo correcto.");

  // Concordancia: banco de 5 campos
  {
    const clean = CONCORDANCIA.filter((b) => !dirty(b[0], b[1], b[2], b[3], b[4]));
    let i = 0;
    while (pool("concordancia").length < 520 && clean.length > 0) {
      const [tpl, correct, w1, w2, expl] = clean[i % clean.length];
      const surface = fill(tpl, rng).replace("{x}", "…");
      const options = shuffle(rng, [correct, w1, w2]);
      push<EligeExercise>("concordancia", {
        type: "concordancia", skill: "gramatica", difficulty: diffFor(pool("concordancia").length), cefr: cefrFor(diffFor(pool("concordancia").length)),
        context: surface,
        question: "Completa con la forma que concuerda.",
        options, answerIndex: options.indexOf(correct),
        prompt: "Elige la forma que concuerda.",
        explanation: expl,
        tags: ["gramática"],
      });
      i++;
      if (i > clean.length * 40) break;
    }
  }

  // Género y número: banco de 4 campos
  {
    const clean = GENERO.filter((b) => !dirty(b[0], b[1], b[2], b[3]));
    let i = 0;
    while (pool("genero").length < 520 && clean.length > 0) {
      const [tpl, correct, wrong, expl] = clean[i % clean.length];
      const distract2 = clean[(i + 3) % clean.length][2];
      const surface = fill(tpl, rng).replace("{x}", "…").replace(/ \([^)]*\)/g, "");
      const options = shuffle(rng, [correct, wrong, distract2]);
      push<EligeExercise>("genero", {
        type: "genero", skill: "gramatica", difficulty: diffFor(pool("genero").length), cefr: cefrFor(diffFor(pool("genero").length)),
        context: surface,
        question: "Elige la forma correcta de género o número.",
        options, answerIndex: options.indexOf(correct),
        prompt: "Concordancia de género y número.",
        explanation: expl,
        tags: ["gramática"],
      });
      i++;
      if (i > clean.length * 40) break;
    }
  }

  // Estilo directo → indirecto
  {
    const clean = ESTILO.filter((b) => !dirty(b[0], b[1], b[2]));
    let i = 0;
    while (pool("estilo").length < 520 && clean.length > 0) {
      const [direct, indirect, expl] = clean[i % clean.length];
      const distract = clean[(i + 3) % clean.length][1];
      const options = shuffle(rng, [indirect, distract, expl.slice(0, 30) + "…"]);
      push<EligeExercise>("estilo", {
        type: "estilo", skill: "gramatica", difficulty: diffFor(pool("estilo").length), cefr: cefrFor(diffFor(pool("estilo").length)),
        context: fill(direct, rng),
        question: "¿Cuál es la versión en estilo indirecto?",
        options, answerIndex: options.indexOf(indirect),
        prompt: "Convierte a estilo indirecto.",
        explanation: expl,
        tags: ["estilo"],
      });
      i++;
      if (i > clean.length * 60) break;
    }
  }

  // Pasiva
  {
    const clean = PASIVA.filter((b) => !dirty(b[0], b[1], b[2]));
    let i = 0;
    while (pool("pasiva").length < 520 && clean.length > 0) {
      const [activa, pasiva, expl] = clean[i % clean.length];
      const distract = clean[(i + 2) % clean.length][1];
      const options = shuffle(rng, [pasiva, distract, "Nadie hizo nada."]);
      push<EligeExercise>("pasiva", {
        type: "pasiva", skill: "gramatica", difficulty: diffFor(pool("pasiva").length), cefr: cefrFor(diffFor(pool("pasiva").length)),
        context: fill(activa, rng),
        question: "¿Cuál es la pasiva correcta?",
        options, answerIndex: options.indexOf(pasiva),
        prompt: "Convierte a la voz pasiva.",
        explanation: expl,
        tags: ["pasiva"],
      });
      i++;
      if (i > clean.length * 60) break;
    }
  }

  // Entonación: clasificar
  {
    const clean = ENTONACION.filter((x) => !dirty(x[0], x[1]));
    let i = 0;
    while (pool("entonacion").length < 520 && clean.length > 0) {
      const [frase, tipo] = clean[i % clean.length];
      push<ClasificaExercise>("entonacion", {
        type: "entonacion", skill: "audicion", difficulty: diffFor(pool("entonacion").length), cefr: cefrFor(diffFor(pool("entonacion").length)),
        item: frase,
        buckets: ["enunciativa", "interrogativa", "exclamativa", "dubitativa"],
        answerIndex: ["enunciativa", "interrogativa", "exclamativa", "dubitativa"].indexOf(tipo),
        prompt: "¿Qué entonación tiene esta frase?",
        explanation: `«${frase}» es una frase ${tipo}.`,
        tags: ["entonación"],
      });
      i++;
      if (i > clean.length * 60) break;
    }
  }

  // Mayúsculas: multi — marca TODAS las que van con mayúscula
  {
    const COMMON_NOUNS = ["mesa", "libro", "gato", "playa", "tarea", "zapato", "nube", "queso", "flauta", "puerta"];
    const PROPER_PLACES = ["Madrid", "Lima", "Bogotá", "Sevilla", "Quito", "Cádiz", "Toledo", "Oviedo", "Cuenca"];
    let i = 0;
    while (pool("mayusculas").length < 520) {
      const withThree = i % 3 === 0;
      const props = sample(rng, [...NAMES, ...PROPER_PLACES], withThree ? 3 : 2);
      const commons = sample(rng, COMMON_NOUNS, withThree ? 1 : 2);
      const options = shuffle(rng, [...props, ...commons]);
      const answerIndexes = options.map((o, k) => (props.includes(o) ? k : -1)).filter((k) => k >= 0);
      push<MultiExercise>("mayusculas", {
        type: "mayusculas", skill: "ortografia", difficulty: diffFor(pool("mayusculas").length), cefr: cefrFor(diffFor(pool("mayusculas").length)),
        prompt: "Marca TODAS las que se escriben con mayúscula inicial.",
        statement: "Nombres propios frente a nombres comunes:",
        options, answerIndexes,
        explanation: `Los nombres propios (${props.join(", ")}) se escriben con mayúscula; los comunes, no.`,
        tags: ["mayúsculas"],
      });
      i++;
      if (i > 2000) break;
    }
    // Respaldo con el banco de mayúsculas si faltara
    const clean = MAYUSCULAS.filter((x) => !dirty(x[0], x[1], x[2], x[3]));
    let j = 0;
    while (pool("mayusculas").length < 520 && clean.length > 0) {
      const [frase, correct] = [clean[j % clean.length][0], clean[j % clean.length][1]];
      const wrongs = clean[j % clean.length].slice(2);
      const props = sample(rng, [...NAMES], 2);
      const commons = sample(rng, COMMON_NOUNS, 2);
      const options = shuffle(rng, [...props, ...commons]);
      const answerIndexes = options.map((o, k) => (props.includes(o) ? k : -1)).filter((k) => k >= 0);
      push<MultiExercise>("mayusculas", {
        type: "mayusculas", skill: "ortografia", difficulty: diffFor(pool("mayusculas").length), cefr: cefrFor(diffFor(pool("mayusculas").length)),
        prompt: "Marca TODAS las que se escriben con mayúscula inicial.",
        statement: frase.replace("«___»", `«${correct}»`) + ` · ${wrongss(wrongs)}`,
        options, answerIndexes,
        explanation: `«${correct}» es la escritura correcta.`,
        tags: ["mayúsculas"],
      });
      j++;
      if (j > clean.length * 60) break;
    }
    function wrongss(w: string[]): string {
      return w.filter(Boolean).length > 0 ? `Las formas «${w.filter(Boolean).join("», «")}» no son correctas.` : "";
    }
  }
}

/* ============================ 3 · LÉXICO ============================ */

function genLexicon(seed: number) {
  const rng = makeRng(seed);

  /* --- Grafías: palabra del banco SRS + marcos citativos --- */
  const FRAMES = [
    "En el dictado de la clase apareció «___».",
    "El profesor subrayó «___» en el examen.",
    "María buscó «___» en el diccionario.",
    "En el cartel del concurso se lee «___».",
    "El copista escribió «___» con letra clara.",
    "En la libreta de apuntes anotó «___».",
    "La lista de la compra incluía «___».",
    "El título del poema contiene «___».",
    "En el mensaje final escribió «___».",
    "La maestra dictó despacio «___».",
    "En el rótulo de la tienda ponía «___».",
    "¿Sabes escribir sin falta «___»?",
  ];
  const grafiaGames: [string, (w: string) => string[]][] = [
    ["bv", (w) => {
      if (!/b|v/i.test(w)) return [];
      const out = new Set<string>();
      const alt = w.replace(/b/g, "v").replace(/B/g, "V");
      const alt2 = w.replace(/v/g, "b").replace(/V/g, "B");
      if (alt !== w) out.add(alt);
      if (alt2 !== w) out.add(alt2);
      return [...out];
    }],
    ["gj", (w) => {
      if (!/g|j/i.test(w)) return [];
      const out = new Set<string>();
      const alt = w.replace(/ge/gi, "je").replace(/gi/gi, "ji").replace(/Ge/g, "Je").replace(/Gi/g, "Ji");
      const alt2 = w.replace(/j/g, "g").replace(/J/g, "G");
      if (alt !== w) out.add(alt);
      if (alt2 !== w) out.add(alt2);
      return [...out];
    }],
    ["hach", (w) => {
      if (!/^h/i.test(w)) return [];
      return [w.slice(1)];
    }],
    ["lly", (w) => {
      const out: string[] = [];
      if (/ll/i.test(w)) out.push(w.replace(/ll/g, "y").replace(/Ll/g, "Y").replace(/LL/g, "YY"));
      else if (/^y/i.test(w)) out.push(w.replace(/^y/i, "ll").replace(/^Y/, "Ll"));
      return out.filter((v) => v !== w);
    }],
    ["csz", (w) => {
      const out = new Set<string>();
      const c2s = w.replace(/c(?=[ei])/gi, "s");
      if (c2s !== w) out.add(c2s);
      const s2z = w.replace(/s$/i, "z");
      if (s2z !== w) out.add(s2z);
      const z2s = w.replace(/z/gi, "s");
      if (z2s !== w) out.add(z2s);
      const c2z = w.replace(/c(?=[ei])/gi, "z");
      if (c2z !== w) out.add(c2z);
      return [...out].slice(0, 2);
    }],
  ];
  for (const [gid, transform] of grafiaGames) {
    let i = 0;
    const usable = shuffle(makeRng(hashString(gid)), WORDS).filter((w) => transform(w.word).length > 0);
    while (pool(gid).length < 520 && usable.length > 0) {
      const w = usable[i % usable.length];
      const wrongs = transform(w.word);
      const options = shuffle(makeRng(hashString(`${gid}-${w.id}-${Math.floor(i / usable.length)}`)), [w.word, ...wrongs]);
      push<GrafiaExercise>(gid, {
        type: gid as "bv", skill: "ortografia", difficulty: w.difficulty, cefr: w.cefr,
        sentence: FRAMES[i % FRAMES.length],
        word: w.word,
        options, answerIndex: options.indexOf(w.word),
        prompt: "Elige la grafía correcta.",
        explanation: `Se escribe «${w.word}»: ${w.definition}`,
        tags: ["grafías"],
      });
      i++;
      if (i > usable.length * 12) break;
    }
  }

  /* --- Homófonos --- */
  {
    const clean = HOMOFONOS.filter((x) => !dirty(x[0], x[1], x[2], x[3]));
    let i = 0;
    while (pool("homofonos").length < 520 && clean.length > 0) {
      const [tpl, correct, wrong, expl] = clean[i % clean.length];
      const options = shuffle(rng, [correct, wrong]);
      push<EligeExercise>("homofonos", {
        type: "homofonos", skill: "ortografia", difficulty: diffFor(pool("homofonos").length), cefr: cefrFor(diffFor(pool("homofonos").length)),
        context: fill(tpl, rng),
        question: "Elige la palabra correcta.",
        options, answerIndex: options.indexOf(correct),
        prompt: "¿Cuál es la forma correcta?",
        explanation: expl,
        tags: ["homófonos"],
      });
      i++;
      if (i > clean.length * 40) break;
    }
  }

  /* --- Colocaciones --- */
  {
    const clean = COLOCACIONES.filter((x) => !dirty(x[0], x[1], x[2]));
    const VERB_DISTRACTORS = ["mandar", "dejar", "apoyar", "encontrar", "cubrir", "abrir", "cerrar", "decir"];
    let i = 0;
    while (pool("colocaciones").length < 520 && clean.length > 0) {
      const [verb, complement, tpl] = clean[i % clean.length];
      const distract = sample(rng, VERB_DISTRACTORS.filter((v) => v !== verb), 3);
      const options = shuffle(rng, [verb, ...distract]);
      push<EligeExercise>("colocaciones", {
        type: "colocaciones", skill: "vocabulario", difficulty: diffFor(pool("colocaciones").length), cefr: cefrFor(diffFor(pool("colocaciones").length)),
        context: fill(tpl, rng),
        question: `¿Qué verbo encaja con «${complement}»?`,
        options, answerIndex: options.indexOf(verb),
        prompt: "Completa la colocación natural.",
        explanation: `Se dice «${verb} ${complement}»: son pareja natural en español.`,
        tags: ["colocaciones"],
      });
      i++;
      if (i > clean.length * 60) break;
    }
  }

  /* --- Analogías --- */
  {
    const clean = ANALOGIAS.filter((x) => !dirty(x[0], x[1], x[2], x[3]));
    let i = 0;
    while (pool("analogias").length < 520 && clean.length > 0) {
      const [a, b, c, d] = clean[i % clean.length];
      const other = clean[(i + 5) % clean.length];
      const options = shuffle(rng, [d, other[1], other[3]]);
      push<EligeExercise>("analogias", {
        type: "analogias", skill: "vocabulario", difficulty: diffFor(pool("analogias").length), cefr: cefrFor(diffFor(pool("analogias").length)),
        context: `${capFirst(a)} es a ${b} como ${c} es a…`,
        question: "Completa la analogía.",
        options, answerIndex: options.indexOf(d),
        prompt: "Elige la palabra que completa el puente.",
        explanation: `«${a}» se relaciona con «${b}» como «${c}» con «${d}».`,
        tags: ["analogías"],
      });
      i++;
      if (i > clean.length * 40) break;
    }
  }

  /* --- Grados --- */
  {
    const clean = GRADOS.filter((g) => g.length === 4 && !dirty(...g));
    let i = 0;
    while (pool("grados").length < 520 && clean.length > 0) {
      const ladder = clean[i % clean.length];
      push<OrdenaExercise>("grados", {
        type: "grados", skill: "vocabulario", difficulty: diffFor(pool("grados").length), cefr: cefrFor(diffFor(pool("grados").length)),
        items: i % 4 === 3 ? [...ladder].reverse() : ladder,
        criteria: i % 4 === 3 ? "Tócalas de MAYOR a menor intensidad." : "Tócalas de menor a MAYOR intensidad.",
        prompt: "Ordena la escalera de intensidad.",
        explanation: `La escala creciente es: ${ladder.join(" < ")}.`,
        tags: ["intensidad"],
      });
      i++;
      if (i > clean.length * 40) break;
    }
  }

  /* --- Polisemia --- */
  {
    let i = 0;
    while (pool("polisemia").length < 520 && WORDS.length > 0) {
      const w = WORDS[i % WORDS.length];
      const distract = sample(rng, WORDS.filter((x) => x.id !== w.id), 3);
      if (distract.length < 3) { i++; continue; }
      const options = shuffle(rng, [w.definition, ...distract.map((d) => d.definition)]);
      push<EligeExercise>("polisemia", {
        type: "polisemia", skill: "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
        context: w.example,
        question: `¿Qué significa aquí «${w.word}»?`,
        options, answerIndex: options.indexOf(w.definition),
        prompt: "Detecta el sentido en contexto.",
        explanation: `En este contexto, «${w.word}» = ${w.definition}`,
        tags: w.tags.slice(0, 3),
      });
      i++;
      if (i > WORDS.length * 2) break;
    }
  }

  /* --- Familias (multi) --- */
  {
    const clean = FAMILIAS.filter((f) => f.length >= 4 && !dirty(...f));
    const allWords = clean.flat();
    let i = 0;
    while (pool("familias").length < 520 && clean.length > 0) {
      const fam = clean[i % clean.length];
      const root = fam[0];
      const members = fam.slice(1, 4);
      const outsiders = sample(rng, allWords.filter((x) => !fam.includes(x)), 1);
      const options = shuffle(rng, [...members, ...outsiders]);
      const answerIndexes = options.map((o, k) => (members.includes(o) ? k : -1)).filter((k) => k >= 0);
      push<MultiExercise>("familias", {
        type: "familias", skill: "vocabulario", difficulty: diffFor(pool("familias").length), cefr: cefrFor(diffFor(pool("familias").length)),
        prompt: `Marca TODAS las palabras de la familia de «${root}».`,
        options, answerIndexes,
        explanation: `Pertenecen a la familia: ${members.join(", ")}.`,
        tags: ["familias"],
      });
      i++;
      if (i > clean.length * 60) break;
    }
  }

  /* --- Derivadas --- */
  {
    const clean = DERIVADAS.filter((x) => !dirty(x[0], x[1], x[2]));
    let i = 0;
    while (pool("derivadas").length < 520 && clean.length > 0) {
      const [clue, correct] = [clean[i % clean.length][0], clean[i % clean.length][1]];
      push<EscribeLibreExercise>("derivadas", {
        type: "derivadas", skill: "vocabulario", difficulty: diffFor(pool("derivadas").length), cefr: cefrFor(diffFor(pool("derivadas").length)),
        clue: fill(clue, rng),
        word: correct,
        hint: `Empieza por «${correct[0].toLowerCase()}» · ${correct.length} letras`,
        prompt: "Forja la palabra derivada.",
        explanation: `La palabra derivada correcta es «${correct}».`,
        tags: ["derivación"],
      });
      i++;
      if (i > clean.length * 40) break;
    }
  }

  /* --- Regiones --- */
  {
    const clean = REGIONALISMOS.filter((x) => !dirty(x[0], x[1], x[2]));
    let i = 0;
    while (pool("regiones").length < 520 && clean.length > 0) {
      const [word, region, meaning] = clean[i % clean.length];
      const others = sample(rng, clean.filter((x) => x[2] !== meaning), 3);
      const options = shuffle(rng, [meaning, ...others.map((o) => o[2])]);
      push<EligeExercise>("regiones", {
        type: "regiones", skill: "cultura", difficulty: diffFor(pool("regiones").length), cefr: cefrFor(diffFor(pool("regiones").length)),
        context: `«${word}» se usa en: ${region}.`,
        question: "¿Qué significa allí?",
        options, answerIndex: options.indexOf(meaning),
        prompt: "Traduce el regionalismo.",
        explanation: `En ${region}, «${word}» significa ${meaning}.`,
        tags: ["regionalismos"],
      });
      i++;
      if (i > clean.length * 40) break;
    }
  }

  /* --- Falsos amigos --- */
  {
    const clean = FALSOS.filter((x) => !dirty(x[0], x[1], x[2], x[3]));
    let i = 0;
    while (pool("falsosamigos").length < 520 && clean.length > 0) {
      const [es, en, esMean, enMean] = clean[i % clean.length];
      const options = shuffle(rng, [esMean, enMean]);
      push<EligeExercise>("falsosamigos", {
        type: "falsosamigos", skill: "cultura", difficulty: diffFor(pool("falsosamigos").length), cefr: cefrFor(diffFor(pool("falsosamigos").length)),
        context: `El inglés «${en}» se parece a «${es}», pero cuidado.`,
        question: `¿Qué significa la palabra española «${es}»?`,
        options, answerIndex: options.indexOf(esMean),
        prompt: "Cuidado con los falsos amigos.",
        explanation: `«${es}» = ${esMean}; el inglés «${en}» = ${enMean}.`,
        tags: ["falsos amigos"],
      });
      i++;
      if (i > clean.length * 60) break;
    }
  }
}

/* ============================ 4 · LECTURA ============================ */

function genReading(seed: number) {
  const rng = makeRng(seed);
  const cleanStories = STORIES.filter((s) => !dirty(...s.txt) && !dirty(...s.idea));
  const count = cleanStories.length;

  const mkContext = (tpl: (typeof cleanStories)[number], name: string) =>
    tpl.txt.map((line) => line.replace(/\{N\}/g, name)).join(" ");

  const loop = (gameId: string, make: (ctx: string, tpl: (typeof cleanStories)[number], i: number) => void) => {
    let i = 0;
    while (pool(gameId).length < 520 && count > 0) {
      const tpl = cleanStories[i % count];
      const name = NAMES[Math.floor(i / count) % NAMES.length];
      const ctx = mkContext(tpl, name);
      make(ctx, tpl, i);
      i++;
      if (i > count * NAMES.length * 3) break;
    }
  };

  loop("idea", (ctx, tpl, i) => {
    const others = cleanStories[(i + 3) % count].idea;
    const options = shuffle(rng, [tpl.idea[0], tpl.idea[1], tpl.idea[2], i % 4 === 3 ? others[1] : others[2]]);
    push<EligeExercise>("idea", {
      type: "idea", skill: "lectura", difficulty: diffFor(pool("idea").length), cefr: cefrFor(diffFor(pool("idea").length)),
      context: ctx, question: "¿Cuál es la idea central del texto?",
      options, answerIndex: options.indexOf(tpl.idea[0]),
      prompt: "Encuentra la idea central.",
      explanation: `El texto gira en torno a: ${tpl.idea[0].toLowerCase()}.`,
      tags: ["lectura"],
    });
  });

  loop("tono", (ctx, tpl, i) => {
    const others = cleanStories[(i + 7) % count].tono;
    const options = shuffle(rng, [tpl.tono[0], tpl.tono[1], tpl.tono[2], i % 4 === 3 ? others[0] : others[1]]);
    push<EligeExercise>("tono", {
      type: "tono", skill: "lectura", difficulty: diffFor(pool("tono").length), cefr: cefrFor(diffFor(pool("tono").length)),
      context: ctx, question: "¿Qué tono tiene el texto?",
      options, answerIndex: options.indexOf(tpl.tono[0]),
      prompt: "Toma la temperatura del texto.",
      explanation: `El texto tiene un tono ${tpl.tono[0].toLowerCase()}.`,
      tags: ["lectura"],
    });
  });

  loop("inferencia", (ctx, tpl) => {
    const [q, correct] = [tpl.inf[0], tpl.inf[1]];
    const options = shuffle(rng, [correct, tpl.inf[2], tpl.inf[3]]);
    push<EligeExercise>("inferencia", {
      type: "inferencia", skill: "lectura", difficulty: diffFor(pool("inferencia").length), cefr: cefrFor(diffFor(pool("inferencia").length)),
      context: ctx, question: q.replace(/\{N\}/g, "María"),
      options, answerIndex: options.indexOf(correct.replace(/\{N\}/g, "María")),
      prompt: "Lee entre líneas.",
      explanation: `El texto permite deducir: ${correct.replace(/\{N\}/g, "María")}`,
      tags: ["lectura"],
    });
  });

  loop("proposito", (ctx, tpl) => {
    const options = shuffle(rng, [tpl.prop[0], tpl.prop[1], tpl.prop[2]]);
    push<EligeExercise>("proposito", {
      type: "proposito", skill: "lectura", difficulty: diffFor(pool("proposito").length), cefr: cefrFor(diffFor(pool("proposito").length)),
      context: ctx, question: "¿Para qué se escribió este texto?",
      options, answerIndex: options.indexOf(tpl.prop[0]),
      prompt: "Averigua la intención.",
      explanation: `El propósito es ${tpl.prop[0].toLowerCase()}.`,
      tags: ["lectura"],
    });
  });

  loop("vocabctx", (ctx, tpl, i) => {
    const [word, meaning] = [tpl.voc[0], tpl.voc[1]];
    const others = cleanStories[(i + 11) % count].voc;
    const options = shuffle(rng, [meaning, tpl.voc[2], tpl.voc[3], i % 4 === 3 ? others[1] : others[2]]);
    push<EligeExercise>("vocabctx", {
      type: "vocabctx", skill: "lectura", difficulty: diffFor(pool("vocabctx").length), cefr: cefrFor(diffFor(pool("vocabctx").length)),
      context: ctx, question: `¿Qué significa «${word}» en este texto?`,
      options, answerIndex: options.indexOf(meaning),
      prompt: "Detective de contexto.",
      explanation: `«${word}» significa ${meaning}.`,
      tags: ["lectura"],
    });
  });

  loop("titulo", (ctx, tpl, i) => {
    const others = cleanStories[(i + 5) % count].tit;
    const options = shuffle(rng, [tpl.tit[0], tpl.tit[1], tpl.tit[2], i % 4 === 3 ? others[1] : others[2]]);
    push<EligeExercise>("titulo", {
      type: "titulo", skill: "lectura", difficulty: diffFor(pool("titulo").length), cefr: cefrFor(diffFor(pool("titulo").length)),
      context: ctx, question: "¿Cuál es el mejor titular para el texto?",
      options, answerIndex: options.indexOf(tpl.tit[0]),
      prompt: "Ponle el mejor titular.",
      explanation: `El titular que resume el texto es «${tpl.tit[0]}».`,
      tags: ["lectura"],
    });
  });

  loop("resumen", (ctx, tpl, i) => {
    const others = cleanStories[(i + 9) % count].res;
    const options = shuffle(rng, [tpl.res[0], tpl.res[1], tpl.res[2], i % 4 === 3 ? others[1] : others[2]]);
    push<EligeExercise>("resumen", {
      type: "resumen", skill: "lectura", difficulty: diffFor(pool("resumen").length), cefr: cefrFor(diffFor(pool("resumen").length)),
      context: ctx, question: "¿Qué resumen es fiel al texto?",
      options, answerIndex: options.indexOf(tpl.res[0]),
      prompt: "Elige el resumen fiel.",
      explanation: `El resumen correcto: ${tpl.res[0].replace(/\{N\}/g, "María")}`,
      tags: ["lectura"],
    });
  });

  loop("secuencia", (ctx, tpl, i) => {
    const [first, second, third] = tpl.txt.map((l) => l.replace(/\{N\}/g, NAMES[0]));
    const variants = [
      { q: "¿Qué ocurrió primero en el texto?", correct: first, wrong: second },
      { q: "¿Qué ocurrió en segundo lugar?", correct: second, wrong: third },
      { q: "¿Cómo termina la historia?", correct: third, wrong: first },
    ];
    const v = variants[i % 3];
    const options = shuffle(rng, [v.correct, v.wrong]);
    push<EligeExercise>("secuencia", {
      type: "secuencia", skill: "lectura", difficulty: diffFor(pool("secuencia").length), cefr: cefrFor(diffFor(pool("secuencia").length)),
      context: ctx, question: v.q,
      options, answerIndex: options.indexOf(v.correct),
      prompt: "Sigue la línea de tiempo.",
      explanation: "El texto narra los hechos en el orden en que suceden.",
      tags: ["lectura"],
    });
  });

  loop("lectura", (ctx, tpl, i) => {
    const name = NAMES[Math.floor(i / count) % NAMES.length];
    const lines = tpl.txt.map((l) => l.replace(/\{N\}/g, name));
    const [q, correct] = [tpl.inf[0], tpl.inf[1]];
    const options = shuffle(rng, [correct, tpl.inf[2], tpl.inf[3]].map((o) => o.replace(/\{N\}/g, name)));
    push<LecturaExercise>("lectura", {
      type: "lectura", skill: "lectura", difficulty: diffFor(pool("lectura").length), cefr: cefrFor(diffFor(pool("lectura").length)),
      title: tpl.tit[0],
      lines, question: q.replace(/\{N\}/g, name), options, answerIndex: options.indexOf(correct.replace(/\{N\}/g, name)),
      prompt: "Lee y responde.",
      explanation: `El texto permite deducir: ${correct.replace(/\{N\}/g, name)}`,
      tags: ["lectura"],
    });
  });

  loop("parrafos", (_ctx, tpl) => {
    const name = pick(rng, NAMES);
    const sentences = tpl.txt.map((l) => l.replace(/\{N\}/g, name));
    push<ParagraphExercise>("parrafos", {
      type: "parrafos", skill: "lectura", difficulty: diffFor(pool("parrafos").length), cefr: cefrFor(diffFor(pool("parrafos").length)),
      title: tpl.tit[0],
      hint: "Ordena las oraciones para que la historia tenga sentido.",
      sentences,
      prompt: "Construye el párrafo.",
      explanation: "El orden narrativo correcto es el del texto original.",
      tags: ["lectura"],
    });
  });
}

/* ============================ 5 · FORJA ============================ */

function genForja(seed: number) {
  const rng = makeRng(seed);

  {
    const clean = METAFORAS.filter((x) => !dirty(x[0], x[1], x[2], x[3], x[4]));
    let i = 0;
    while (pool("metaforas").length < 520 && clean.length > 0) {
      const [stem, image, w1, w2, meaning] = clean[i % clean.length];
      const options = shuffle(rng, [image, w1, w2]);
      push<MetaforasExercise>("metaforas", {
        type: "metaforas", skill: "expresion", difficulty: diffFor(pool("metaforas").length), cefr: cefrFor(diffFor(pool("metaforas").length)),
        stem, options, answerIndex: options.indexOf(image),
        prompt: "Completa la metáfora con la imagen adecuada.",
        explanation: meaning,
        tags: ["retórica"],
      });
      i++;
      if (i > clean.length * 40) break;
    }
  }

  {
    const clean = REGISTRO.filter((x) => !dirty(x[0], x[1], x[2], x[3], x[4]));
    let i = 0;
    while (pool("registro").length < 520 && clean.length > 0) {
      const [context, want, correct, coloquial, formal] = clean[i % clean.length];
      const options = shuffle(rng, [correct, coloquial, formal]);
      push<RegistroExercise>("registro", {
        type: "registro", skill: "expresion", difficulty: diffFor(pool("registro").length), cefr: cefrFor(diffFor(pool("registro").length)),
        context, register: want, options, answerIndex: options.indexOf(correct),
        prompt: `Elige la versión ${want}.`,
        explanation: `En esta situación, lo adecuado es: «${correct}»`,
        tags: ["registro"],
      });
      i++;
      if (i > clean.length * 60) break;
    }
  }

  {
    const clean = CONECTORES.filter((x) => !dirty(x[0], x[1], x[2], x[3], x[4], x[5]));
    let i = 0;
    while (pool("conectores").length < 520 && clean.length > 0) {
      const [sentence, correct, w1, w2, w3, expl] = clean[i % clean.length];
      const options = shuffle(rng, [correct, w1, w2, w3]);
      push<ConectoresExercise>("conectores", {
        type: "conectores", skill: "gramatica", difficulty: diffFor(pool("conectores").length), cefr: cefrFor(diffFor(pool("conectores").length)),
        sentence, options, answerIndex: options.indexOf(correct),
        prompt: "Elige el conector lógico exacto.",
        explanation: expl,
        tags: ["conectores"],
      });
      i++;
      if (i > clean.length * 40) break;
    }
  }

  {
    const clean = IRONIA.filter((x) => !dirty(x[0], x[1], x[2]));
    let i = 0;
    while (pool("ironia").length < 520 && clean.length > 0) {
      const [statement, context, answer] = clean[i % clean.length];
      push<IroniaExercise>("ironia", {
        type: "ironia", skill: "lectura", difficulty: diffFor(pool("ironia").length), cefr: cefrFor(diffFor(pool("ironia").length)),
        statement, context, answer,
        prompt: "¿La frase es literal o irónica?",
        explanation: `Con ese contexto, la frase es ${answer === "ironico" ? "irónica: dice lo contrario de lo que parece" : "literal: significa lo que dice"}.`,
        tags: ["ironía"],
      });
      i++;
      if (i > clean.length * 60) break;
    }
  }

  {
    const clean = REDUNDANCIAS.filter((x) => !dirty(x[0], x[1]));
    let i = 0;
    while (pool("titulos").length < 520 && clean.length > 0) {
      const [sentence, redundant] = clean[i % clean.length];
      const tokens = sentence.split(" ");
      const answerIndex = tokens.findIndex((t) => t.replace(/[.,]/g, "") === redundant);
      if (answerIndex < 0) { i++; continue; }
      push<TitulosExercise>("titulos", {
        type: "titulos", skill: "expresion", difficulty: diffFor(pool("titulos").length), cefr: cefrFor(diffFor(pool("titulos").length)),
        sentence, tokens, answerIndex,
        prompt: "Tacha la palabra redundante.",
        explanation: `«${redundant}» sobra: la frase ya lo da por hecho.`,
        tags: ["redundancia"],
      });
      i++;
      if (i > clean.length * 60) break;
    }
  }

  {
    const MATICES_OPTIONS = ["sorpresa", "enfado", "alegría", "tristeza", "súplica", "ironía", "neutral"];
    const ctx: [string, string][] = [
      ["¡No puede ser, otra vez!", "enfado"],
      ["Por favor, no te vayas todavía…", "súplica"],
      ["¡Hemos ganado el premio!", "alegría"],
      ["Se me ha roto el jarrón de la abuela…", "tristeza"],
      ["¡Anda, pero si eres tú!", "sorpresa"],
      ["Menuda puntualidad la tuya… (llevas dos horas tarde)", "ironía"],
      ["El autobús llega a las ocho.", "neutral"],
      ["¡Qué maravilla de día!", "alegría"],
      ["Otra vez dejaste la puerta abierta…", "enfado"],
      ["¿Puedes repetírmelo, porfa?", "súplica"],
      ["No esperaba verte por aquí…", "sorpresa"],
      ["Se acabaron las vacaciones…", "tristeza"],
      ["¡Genial, justo lo que faltaba! (se ha caído el pastel al suelo)", "ironía"],
      ["Hoy es jueves.", "neutral"],
      ["¡Por fin te veo!", "alegría"],
    ];
    let i = 0;
    while (pool("matices").length < 520) {
      const [frase, tono] = ctx[i % ctx.length];
      const opts = shuffle(rng, [tono, ...sample(rng, MATICES_OPTIONS.filter((o) => o !== tono), 3)]);
      push<MaticesExercise>("matices", {
        type: "matices", skill: "audicion", difficulty: diffFor(pool("matices").length), cefr: cefrFor(diffFor(pool("matices").length)),
        sentence: frase, options: opts, answerIndex: opts.indexOf(tono),
        prompt: "¿Qué intención tiene la frase?",
        explanation: `La frase transmite ${tono}.`,
        tags: ["matices"],
      });
      i++;
      if (i > 3000) break;
    }
  }
}

/* ============================ 6 · FORMATOS ============================ */

function genFormats(seed: number) {
  const rng = makeRng(seed);

  /* --- Memoria: pares palabra↔definición --- */
  const memoriaGames = [
    "memoria-bosque", "memoria-fortaleza", "memoria-biblioteca", "memoria-torre", "memoria-observatorio", "memoria-puerto",
  ] as const;
  for (const gid of memoriaGames) {
    let i = 0;
    while (pool(gid).length < 520) {
      const five = sample(rng, WORDS, 5);
      if (five.length < 5) break;
      push<MemoriaExercise>(gid, {
        type: gid, skill: "vocabulario", difficulty: diffFor(pool(gid).length), cefr: cefrFor(diffFor(pool(gid).length)),
        pairs: five.map((w) => ({ left: w.word, right: w.definition.split(";")[0].slice(0, 60) })),
        prompt: "Empareja cada palabra con su significado.",
        explanation: "Cada palabra tiene su definición correspondiente.",
        tags: ["memoria"],
      });
      i++;
      if (i > 3000) break;
    }
  }

  /* --- Intruso: 3 de una categoría + 1 de otra --- */
  const byTag = new Map<string, string[]>();
  for (const w of WORDS) {
    for (const t of w.tags) {
      if (!byTag.has(t)) byTag.set(t, []);
      byTag.get(t)!.push(w.word);
    }
  }
  const goodTags = [...byTag.entries()].filter(([, ws]) => ws.length >= 8).map(([t, ws]) => [t, [...new Set(ws)]] as [string, string[]]);
  const intrusoGames = ["intruso-bosque", "intruso-ciudad", "intruso-biblioteca", "intruso-observatorio"] as const;
  for (const gid of intrusoGames) {
    let i = 0;
    while (pool(gid).length < 520 && goodTags.length >= 4) {
      const [tagA, wsA] = goodTags[i % goodTags.length];
      const [tagB, wsB] = goodTags[(i + 3) % goodTags.length];
      const three = sample(rng, wsA, 3);
      const odd = pick(rng, wsB);
      if (three.includes(odd) || new Set(three).size < 3) { i++; continue; }
      const options = shuffle(rng, [...three, odd]);
      push<IntrusoExercise>(gid, {
        type: gid, skill: "vocabulario", difficulty: diffFor(pool(gid).length), cefr: cefrFor(diffFor(pool(gid).length)),
        options, answerIndex: options.indexOf(odd),
        category: tagA,
        prompt: "¿Cuál no pertenece a la familia?",
        explanation: `«${odd}» no es de la categoría «${tagA}»; los demás sí.`,
        tags: [tagA, tagB],
      });
      i++;
      if (i > 4000) break;
    }
  }

  /* --- Sortea: clasificar enunciados --- */
  const sorteaDefs: [string, string[], (i: number) => string, string][] = [
    ["sortea-ciudad", ["sustantivo", "verbo", "adjetivo"], (i) => {
      const w = WORDS[i % WORDS.length];
      return `«${capFirst(w.example)}» · la palabra clave es un ${w.pos}.`;
    }, "pos"],
    ["sortea-fortaleza", ["lleva tilde", "no lleva tilde"], (i) => {
      const w = WORDS[(i * 7) % WORDS.length];
      return w.word;
    }, "tilde"],
    ["sortea-biblioteca", ["hecho", "opinión"], (i) => {
      const hechos = ["El tren llega a las ocho en punto.", "El agua hierve a cien grados.", "Gibraltar es un peñón al sur de la península.", "El libro tiene trescientas páginas.", "La biblioteca abre a las nueve.", "La Tierra gira alrededor del Sol."];
      const opiniones = ["La paella con chorizo es una delicia.", "Ese libro es el mejor del año.", "El invierno es la mejor estación.", "Ese color le sienta fenomenal.", "La ópera es aburridísima.", "El café con leche es superior al solo."];
      return i % 2 === 0 ? hechos[(i >> 1) % hechos.length] : opiniones[(i >> 1) % opiniones.length];
    }, "hecho"],
    ["sortea-puerto", ["formal", "coloquial"], (i) => {
      const formales = ["Les ruego disculpen las molestias.", "Adjunto la documentación solicitada.", "Quedo a su entera disposición.", "Agradecería su pronta respuesta.", "Sin otro particular, un cordial saludo."];
      const coloquiales = ["¡Manda narices lo que ha pasado!", "Pos nada, aquí seguimos.", "¡Qué va, si eso no pega ni con cola!", "Te lo digo yo: va que chuta.", "Vamos, que ni te flipes, colega."];
      return i % 2 === 0 ? formales[(i >> 1) % formales.length] : coloquiales[(i >> 1) % coloquiales.length];
    }, "registro"],
    ["sortea-torre", ["literal", "figurado"], (i) => {
      const literales = ["El gato se subió al tejado.", "María bebió medio litro de agua.", "El paquete pesa tres kilos.", "El tren llegó con retraso.", "Llovió toda la noche."];
      const figuradas = ["Se me rompió el corazón al oírlo.", "Le llovieron las ofertas de trabajo.", "Ese examen fue pan comido.", "Está en la nube todo el día.", "Le costó un ojo de la cara."];
      return i % 2 === 0 ? literales[(i >> 1) % literales.length] : figuradas[(i >> 1) % figuradas.length];
    }, "figurado"],
    ["sortea-observatorio", ["viene del árabe", "viene del latín", "viene de una lengua indígena"], (i) => {
      const origin = ORIGINS[i % ORIGINS.length];
      return `La palabra «${origin.word}» ${origin.origin}.`;
    }, "origin"],
  ];
  for (const [gid, buckets, gen, kind] of sorteaDefs) {
    let i = 0;
    while (pool(gid).length < 520) {
      const text = gen(i);
      let answerIndex = 0;
      if (kind === "pos") {
        const m = text.match(/es un (sustantivo|verbo|adjetivo|adverbio)/);
        answerIndex = m ? Math.max(0, buckets.indexOf(m[1])) : 0;
      } else if (kind === "tilde") {
        answerIndex = /[áéíóú]/.test(text) ? 0 : 1;
      } else if (kind === "origin") {
        const m = text.match(/viene del (\w+)/);
        answerIndex = m ? (m[1] === "árabe" ? 0 : m[1] === "latín" || m[1] === "latina" ? 1 : 2) : 0;
      } else {
        answerIndex = i % 2 === 0 ? 0 : 1;
      }
      push<SorteaExercise>(gid, {
        type: gid as "sortea-ciudad", skill: gid.includes("observatorio") ? "cultura" : "gramatica",
        difficulty: diffFor(pool(gid).length), cefr: cefrFor(diffFor(pool(gid).length)),
        statement: text.replace(/ · la palabra clave es un \w+\./, ""),
        buckets, answerIndex,
        prompt: "Clasifica el enunciado.",
        explanation: `Pertenece a: ${buckets[answerIndex]}.`,
        tags: ["clasifica"],
      });
      i++;
      if (i > 3000) break;
    }
  }

  /* --- VF por región --- */
  const vfGames = ["vf-bosque", "vf-ciudad", "vf-fortaleza", "vf-biblioteca", "vf-puerto", "vf-torre", "vf-observatorio"] as const;
  for (const gid of vfGames) {
    let i = 0;
    const words = shuffle(makeRng(hashString(gid)), WORDS);
    while (pool(gid).length < 520 && words.length > 0) {
      const w = words[i % words.length];
      const isTrue = i % 2 === 0;
      if (isTrue) {
        push<VfExercise>(gid, {
          type: gid, skill: "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
          statement: `«${w.word}» significa: ${w.definition.toLowerCase()}`,
          answer: true,
          prompt: "¿Verdadero o falso?",
          explanation: `Correcto: «${w.word}» = ${w.definition.toLowerCase()}`,
          tags: w.tags.slice(0, 3),
        });
      } else {
        const other = pick(rng, WORDS.filter((x) => x.id !== w.id));
        push<VfExercise>(gid, {
          type: gid, skill: "vocabulario", difficulty: w.difficulty, cefr: w.cefr,
          statement: `«${w.word}» significa: ${other.definition.toLowerCase()}`,
          answer: false,
          correction: `«${w.word}» significa: ${w.definition.toLowerCase()}`,
          prompt: "¿Verdadero o falso?",
          explanation: `Falso: «${w.word}» = ${w.definition.toLowerCase()}`,
          tags: w.tags.slice(0, 3),
        });
      }
      i++;
      if (i > words.length * 3) break;
    }
  }

  /* --- Conecta por región --- */
  const conectaDefs: [string, () => { left: string; right: string }[], string][] = [
    ["conecta-ciudad", () => sample(rng, VERBS.length >= 5 ? VERBS : WORDS, 5).map((w) => ({ left: w.word, right: w.definition.split(";")[0].slice(0, 48) })), "verbo ↔ significado"],
    ["conecta-biblioteca", () => sample(rng, WORDS, 5).map((w) => ({ left: w.word, right: w.definition.split(";")[0].slice(0, 48) })), "palabra ↔ definición"],
    ["conecta-puerto", () => sample(rng, WORDS, 5).map((w) => ({ left: w.word, right: w.example.slice(0, 60) })), "palabra ↔ ejemplo"],
    ["conecta-torre", () => sample(rng, REFRANES_PACK, 5).map((r) => ({ left: r.saying, right: r.options[r.answerIndex].slice(0, 60) })), "refrán ↔ significado"],
    ["conecta-observatorio", () => sample(rng, ORIGINS, 5).map((o) => ({ left: o.word, right: o.origin })), "palabra ↔ origen"],
  ];
  for (const [gid, gen, kindDesc] of conectaDefs) {
    let i = 0;
    while (pool(gid).length < 520) {
      const pairs = gen();
      if (pairs.length < 4) { i++; if (i > 2000) break; continue; }
      push<ConectaExercise>(gid, {
        type: gid as "conecta-ciudad", skill: gid.includes("observatorio") ? "cultura" : "vocabulario",
        difficulty: diffFor(pool(gid).length), cefr: cefrFor(diffFor(pool(gid).length)),
        pairs,
        prompt: `Une cada ${kindDesc.split(" ↔ ")[0]} con su pareja.`,
        explanation: `Cada ${kindDesc.split(" ↔ ")[0]} tiene su pareja correcta.`,
        tags: ["conecta"],
      });
      i++;
      if (i > 2500) break;
    }
  }
}

/* ============================ 7 · TORRE ============================ */

function genTorre(seed: number) {
  const rng = makeRng(seed);

  /* --- Refranes con opciones rotadas --- */
  {
    const meanings = REFRANES_PACK.map((r) => r.options[r.answerIndex]);
    let i = 0;
    while (pool("refranes").length < 520 && REFRANES_PACK.length > 0) {
      const r = REFRANES_PACK[i % REFRANES_PACK.length];
      const distract = sample(rng, meanings.filter((m) => m !== r.options[r.answerIndex]), 3);
      const options = shuffle(rng, [r.options[r.answerIndex], ...distract]);
      push<RefranesExercise>("refranes", {
        type: "refranes", skill: "expresion", difficulty: r.difficulty, cefr: r.cefr,
        saying: r.saying, region: r.region,
        options, answerIndex: options.indexOf(r.options[r.answerIndex]),
        prompt: "¿Qué significa este refrán?",
        explanation: r.explanation,
        tags: r.tags.slice(0, 3),
      });
      i++;
      if (i > REFRANES_PACK.length * 40) break;
    }
  }

  /* --- Historias ramificadas --- */
  {
    const frames: [string, string, string, string, string, string, string, string][] = [
      ["El pasaje de {N} decía «cualquier asiento libre».",
        "En el vagón solo quedaban dos sitios: junto a la ventanilla y junto a un jardín portátil.",
        "Sentarse junto a la ventana", "Sentarse junto al jardín",
        "Desde la ventanilla vio campos nuevos y decidió bajar en una parada no planeada.",
        "El perfume del jardín le recordó la casa de su abuela; llegó sonriendo.",
        "¿Cómo terminó el viaje de {N}?", "El viaje trajo un recuerdo o un descubrimiento imprevisto"],
      ["A {N} le encargaron el cartel de la fiesta del pueblo.",
        "Tenía dos ideas: letras doradas sobrias o un arcoíris de colores vivos.",
        "Elegir las letras doradas", "Elegir el arcoíris",
        "Las letras doradas brillaron bajo el sol y el alcalde las felicitó.",
        "El arcoíris se veía desde la otra orilla y vinieron visitantes nuevos.",
        "¿Qué pasó con el cartel?", "El cartel destacó y la fiesta fue un éxito"],
      ["{N} encontró una llave oxidada en la playa.",
        "La cerradura podía ser la del cofre del muelle o la del faro viejo.",
        "Probar en el cofre del muelle", "Probar en el faro viejo",
        "El cofre se abrió: dentro había cartas de hace cien años.",
        "La puerta del faro cedió: dentro descubrió una escalera al mar.",
        "¿Qué descubrió {N}?", "La llave abrió una historia escondida"],
      ["La gata de {N} desapareció un martes.",
        "Los vecinos dijeron que la vieron en el tejado del horno o en el jardín del médico.",
        "Buscar en el tejado del horno", "Buscar en el jardín del médico",
        "En el tejado la gata esperaba junto a una camada de gatitos.",
        "En el jardín la gata cazaba saltamontes como si nada hubiera pasado.",
        "¿Cómo acabó la búsqueda?", "La gata apareció y todo volvió a la normalidad"],
      ["A {N} le tocó guardar el farol de la verbena.",
        "Podía colgarlo del viejo olmo o del nuevo poste de la plaza.",
        "Colgarlo del olmo", "Colgarlo del poste nuevo",
        "El olmo lo abrazó con sus ramas y el farol parecía una fruta de luz.",
        "El poste nuevo realzaba la plaza y se veía desde el puente.",
        "¿Cómo quedó la plaza esa noche?", "La plaza quedó iluminada de maravilla"],
    ];
    let i = 0;
    while (pool("historias").length < 520 && frames.length > 0) {
      const [intro, situation, choiceA, choiceB, outcomeA, outcomeB, question, correctAnswer] = frames[i % frames.length];
      const name = NAMES[Math.floor(i / frames.length) % NAMES.length];
      const distract = frames[(i + 2) % frames.length][7];
      const options = shuffle(rng, [correctAnswer, distract, "La historia terminó en desastre y nadie lo resolvió"]);
      const nodes = [
        {
          id: "n0",
          text: `${intro.replace(/\{N\}/g, name)} ${situation.replace(/\{N\}/g, name)}`,
          choices: [
            { label: choiceA, next: 1 },
            { label: choiceB, next: 2 },
          ],
        },
        { id: "n1", text: outcomeA.replace(/\{N\}/g, name), choices: [{ label: "Terminar", next: -1 }] },
        { id: "n2", text: outcomeB.replace(/\{N\}/g, name), choices: [{ label: "Terminar", next: -1 }] },
      ];
      push<HistoriasExercise>("historias", {
        type: "historias", skill: "expresion", difficulty: diffFor(pool("historias").length), cefr: cefrFor(diffFor(pool("historias").length)),
        title: `La historia de ${name}`,
        nodes, start: 0,
        question: question.replace(/\{N\}/g, name),
        options, answerIndex: options.indexOf(correctAnswer),
        prompt: "Explora la historia y responde.",
        explanation: correctAnswer,
        tags: ["historias"],
      });
      i++;
      if (i > frames.length * NAMES.length * 8) break;
    }
  }

  /* --- Minuto --- */
  {
    const prompts = [
      "Describe el sonido del mar para alguien que nunca lo ha oído.",
      "Escribe la carta que le mandarías a tu yo de dentro de diez años.",
      "Inventa un refrán nuevo y cuéntalo con orgullo de abuelo.",
      "Describe tu desayuno perfecto sin nombrar ninguna comida.",
      "Escribe dos frases que se odien entre sí.",
      "Cuéntale a un alienígena por qué los humanos aplaudimos.",
      "Describe la lluvia usando solo palabras alegres.",
      "Escribe el anuncio de una tienda que vende silencio.",
      "Inventa el nombre de un color nuevo y defiéndelo.",
      "Describe tu calle favorita como si fuera un personaje.",
      "Escribe la receta de un buen día.",
      "Cuéntale a un niño qué es la nostalgia.",
      "Inventa la primera frase de una novela de piratas educados.",
      "Describe el olor de un libro viejo con cariño.",
      "Escribe una nota de disculpa firmada por un gato.",
      "Describe la luna como si la vieras por primera vez.",
      "Escribe la lista de la compra de un mago despistado.",
      "Inventa un deporte que se juegue sin moverse del sofá.",
      "Describe la risa de tu persona favorita.",
      "Escribe el pregón de una fiesta en honor a las siestas.",
      "Cuenta un secreto a gritos sin decir el secreto.",
      "Describe la sensación de llegar a casa empapado.",
      "Inventa un idioma con solo diez palabras y estrena una.",
      "Escribe el marcapáginas perfecto para tu libro favorito.",
      "Describe el tranvía de tu ciudad a un turista curioso.",
      "Escribe la dedicatoria de un libro que regalas a tu mejor amigo.",
      "Inventa una excusa elegante por llegar tarde a una boda.",
      "Describe un atasco como si fuera un río.",
      "Escribe dos versos sobre lo que pesa una mochila llena de lunes.",
      "Describe el último día de las vacaciones sin tristeza.",
      "Escribe las instrucciones de uso de un abrazo.",
      "Inventa la banda sonora de un desayuno de domingo.",
      "Describe el bullicio del mercado a alguien con prisa.",
      "Escribe el titular de una noticia buena de tu barrio.",
      "Describe tu sombra como si fuera tu compañera de juegos.",
      "Inventa el premio de un concurso de gente despistada.",
      "Escribe una postal desde el año 3024.",
      "Describe el olor de la biblioteca de tu infancia.",
      "Inventa un brindis para un cumpleaños de cien años.",
      "Escribe el menú de un restaurante que solo sirve recuerdos.",
      "Describe la primera brisa de otoño con palabras de mapas.",
      "Inventa la señal de tráfico que falta en tu ciudad.",
      "Escribe la contraportada de tu propia biografía de aventuras.",
      "Describe a tu mascota como el héroe de una epopeya.",
      "Inventa un juego de mesa sobre esperar el autobús.",
      "Escribe el comunicado oficial del descubrimiento del jueves.",
      "Describe el sabor de la palabra «mañana».",
      "Inventa un faro para torrenteras de ciudad y ponle nombre.",
      "Escribe una nota alegre sobre un paraguas roto.",
      "Describe el mundo desde la altura de un gato asomado a la ventana.",
    ];
    let i = 0;
    while (pool("minuto").length < 520) {
      const challenge = prompts[i % prompts.length];
      push<MinutoExercise>("minuto", {
        type: "minuto", skill: "expresion", difficulty: diffFor(pool("minuto").length), cefr: cefrFor(diffFor(pool("minuto").length)),
        challenge,
        criteria: ["Hay una imagen original", "La frase respira sin prisa", "Aparece un detalle sensorial", "Cuida la ortografía"],
        wordGoal: 40 + (i % 3) * 10,
        prompt: "Reto del minuto: escritura libre cronometrada.",
        explanation: "La escritura libre entrena la fluidez: lo importante es no parar.",
        tags: ["escritura"],
      });
      i++;
      if (i > 2000) break;
    }
  }

  /* --- Iniciadores, cierre, descripciones --- */
  {
    const cleanIn = INICIADORES.filter((x) => !dirty(x[0], x[1], x[2], x[3]));
    let i = 0;
    while (pool("iniciadores").length < 520 && cleanIn.length > 0) {
      const [tpl, correct, w1, w2] = cleanIn[i % cleanIn.length];
      const options = shuffle(rng, [correct, w1, w2]);
      push<EligeExercise>("iniciadores", {
        type: "iniciadores", skill: "expresion", difficulty: diffFor(pool("iniciadores").length), cefr: cefrFor(diffFor(pool("iniciadores").length)),
        context: fill(tpl, rng), question: "Elige la palabra que abre bien la historia.",
        options, answerIndex: options.indexOf(correct),
        prompt: "Enciende la chispa inicial.",
        explanation: `La apertura queda así: ${fill(tpl, rng).replace("«___»", `«${correct}»`)}`,
        tags: ["narración"],
      });
      i++;
      if (i > cleanIn.length * 60) break;
    }
  }
  {
    const cleanC = CIERRE.filter((x) => !dirty(x[0], x[1], x[2], x[3]));
    let i = 0;
    while (pool("cierre").length < 520 && cleanC.length > 0) {
      const [tpl, correct, w1, w2] = cleanC[i % cleanC.length];
      const options = shuffle(rng, [correct, w1, w2]);
      push<EligeExercise>("cierre", {
        type: "cierre", skill: "expresion", difficulty: diffFor(pool("cierre").length), cefr: cefrFor(diffFor(pool("cierre").length)),
        context: fill(tpl, rng), question: "Elige el cierre redondo.",
        options, answerIndex: options.indexOf(correct),
        prompt: "Cierra la historia con broche.",
        explanation: `El cierre queda así: ${fill(tpl, rng).replace("«___»", `«${correct}»`)}`,
        tags: ["narración"],
      });
      i++;
      if (i > cleanC.length * 60) break;
    }
  }
  {
    const cleanD = DESCRIPCIONES.filter((x) => !dirty(x[0], x[1], x[2], x[3]));
    let i = 0;
    while (pool("descripciones").length < 520 && cleanD.length > 0) {
      const [noun, correct, w1, w2] = cleanD[i % cleanD.length];
      const options = shuffle(rng, [correct, w1, w2]);
      push<EligeExercise>("descripciones", {
        type: "descripciones", skill: "expresion", difficulty: diffFor(pool("descripciones").length), cefr: cefrFor(diffFor(pool("descripciones").length)),
        context: `En la bitácora aparece «${noun}» sin adjetivo.`,
        question: "¿Qué adjetivo lo retrata con verdad?",
        options, answerIndex: options.indexOf(correct),
        prompt: "Retrato con palabras.",
        explanation: `«${noun}» puede describirse como ${correct}.`,
        tags: ["descripción"],
      });
      i++;
      if (i > cleanD.length * 60) break;
    }
  }
}

/* ============================ 8 · SINÓNIMOS ============================ */

function genSinonimos(seed: number) {
  const rng = makeRng(seed);
  const pairs: [string, string, string][] = SINONIMOS_PACK.map((s) => {
    const target = (s.sentence.match(/\*([^*]+)\*/) ?? ["", "palabra"])[1];
    return [s.sentence, target, s.options[s.answerIndex]];
  });
  const allAnswers = [...new Set(pairs.map((p) => p[2]))];
  let i = 0;
  while (pool("sinonimos").length < 520 && pairs.length > 0) {
    const [sentence, target, correct] = pairs[i % pairs.length];
    const distract = sample(rng, allAnswers.filter((a) => a !== correct), 3);
    if (distract.length < 3) { i++; continue; }
    const options = shuffle(rng, [correct, ...distract]);
    push<SinonimosExercise>("sinonimos", {
      type: "sinonimos", skill: "vocabulario", difficulty: diffFor(pool("sinonimos").length), cefr: cefrFor(diffFor(pool("sinonimos").length)),
      sentence, relation: "sinónimo",
      options, answerIndex: options.indexOf(correct),
      prompt: "Elige la palabra que mejor sustituye a la destacada.",
      explanation: `«${target}» ≈ «${correct}» en este contexto.`,
      tags: ["sinónimos"],
    });
    i++;
    if (i > pairs.length * 40) break;
  }
}

/* ============================ EMISIÓN ============================ */

function serializeExercise(ex: Exercise): string {
  const entries = Object.entries(ex as Record<string, unknown>)
    .filter(([k]) => k !== "id")
    .map(([k, v]) => `    ${k}: ${JSON.stringify(v)},`)
    .join("\n");
  return `  {\n    id: ${JSON.stringify(ex.id)},\n${entries}\n  },`;
}

function emit() {
  const groups: [string, string[]][] = [
    ["core", ["trivia", "sprint", "cloze", "dictado", "puzzle", "definiciones", "escribe-bosque", "escribe-ciudad", "escribe-fortaleza", "escribe-torre", "oye-bosque", "oye-fortaleza", "oye-puerto", "abecedario", "acentos", "silabas", "oye-acento", "cifras", "oyenumero"]],
    ["grammar", ["concordancia", "serestar", "porpara", "subjuntivo", "tiempos", "pronombres", "relativos", "estilo", "pasiva", "genero", "puntuacion", "entonacion", "mayusculas"]],
    ["lexicon", ["bv", "gj", "hach", "lly", "csz", "homofonos", "colocaciones", "analogias", "grados", "polisemia", "familias", "derivadas", "regiones", "falsosamigos"]],
    ["reading", ["idea", "tono", "inferencia", "proposito", "vocabctx", "titulo", "resumen", "secuencia", "lectura", "parrafos"]],
    ["forja", ["metaforas", "registro", "conectores", "ironia", "titulos", "matices"]],
    ["formats", ["memoria-bosque", "memoria-fortaleza", "memoria-biblioteca", "memoria-torre", "memoria-observatorio", "memoria-puerto", "intruso-bosque", "intruso-ciudad", "intruso-biblioteca", "intruso-observatorio", "sortea-ciudad", "sortea-fortaleza", "sortea-biblioteca", "sortea-puerto", "sortea-torre", "sortea-observatorio", "vf-bosque", "vf-ciudad", "vf-fortaleza", "vf-biblioteca", "vf-puerto", "vf-torre", "vf-observatorio", "conecta-ciudad", "conecta-biblioteca", "conecta-puerto", "conecta-torre", "conecta-observatorio"]],
    ["torre", ["refranes", "historias", "minuto", "iniciadores", "cierre", "descripciones", "sinonimos"]],
  ];

  const sizes: Record<string, number> = {};
  let total = 0;
  const report: string[] = [];
  for (const [group, gameIds] of groups) {
    const lines: string[] = [];
    lines.push('import type { Exercise } from "@/types";');
    lines.push("");
    lines.push("/**");
    lines.push(` * PAQUETE MEGA-8 · ${group.toUpperCase()} · generado automáticamente.`);
    lines.push(" * Se carga bajo demanda (dynamic import) para no engordar el paquete inicial.");
    lines.push(" */");
    lines.push("");
    for (const gid of gameIds) {
      const list = pools.get(gid) ?? [];
      sizes[gid] = list.length;
      total += list.length;
      const constName = `M8_${gid.replace(/-/g, "_").toUpperCase()}`;
      lines.push(`export const ${constName}: Exercise[] = [`);
      for (const ex of list) lines.push(serializeExercise(ex));
      lines.push("];");
      lines.push("");
      report.push(`${gid}: ${list.length}`);
    }
    lines.push(`export const M8_${group.toUpperCase()}_SIZES: Record<string, number> = {`);
    for (const gid of gameIds) lines.push(`  ${JSON.stringify(gid)}: ${sizes[gid]},`);
    lines.push("};");
    fs.writeFileSync(path.join(OUT_DIR, `${group}.ts`), lines.join("\n"));
  }
  console.log("=== REPORTE MEGA-8 ===");
  for (const r of report) console.log(r);
  console.log(`TOTAL generados: ${total}`);
  fs.writeFileSync(path.join(OUT_DIR, "sizes.json"), JSON.stringify(sizes, null, 2));
}

/* ============================ MAIN ============================ */

const SEED = 0x8BADF00D;
genCoreFromWords(SEED);
genGrammar(SEED + 1);
genLexicon(SEED + 2);
genReading(SEED + 3);
genForja(SEED + 4);
genFormats(SEED + 5);
genTorre(SEED + 6);
genSinonimos(SEED + 7);
emit();
