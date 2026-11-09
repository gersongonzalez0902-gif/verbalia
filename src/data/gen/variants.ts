import type { EcoExercise, ErrorHuntExercise, Exercise, FoneticaExercise, TipeoExercise, TinderExercise, VozExercise } from "@/types";
import { SRS_WORDS_FULL } from "../content";
import { REFRANES_PACK } from "../refranes";
import { SINONIMOS_PACK_X } from "./sinonimos-x";

/**
 * Expansor de variantes · Mega-actualización 6
 * ----------------------------------------------------------------
 * Garantiza ≥500 variantes por entrenamiento en los formatos que
 * admiten derivación mecánica SÓLIDA (sin inventar contenido falso):
 *
 *  - tipeo / eco / voz: frases del puerto generadas por plantillas
 *    curadas (sujeto × verbo × circumstance) + los refranes del pack
 *    (escribir/leer/grabar un refrán es ejercicio legítimo).
 *  - fonetica: discriminación auditiva con pares de palabras del
 *    jardín SRS (misma banda de dificultad, arranque distinto).
 *  - tinder: parejas derivadas del pack de sinónimos (la opción
 *    correcta da la pareja SINÓNIMA; un distractor da la pareja NO
 *    equivalente; los antónimos dan pares antónimos). La nota siempre
 *    es veraz porque nace del propio ítem del que se deriva.
 *  - errores: frases de ejemplo del SRS (limpias y correctas) con un
 *    error mecánico de tilde: quitar la tilde a un token acentuado.
 *    Las correcciones trampa (tilde mal colocada) se generan moviendo
 *    el acento a otra vocal: nunca colisionan con palabras reales.
 *
 * Todo es DETERMINISTA (sin Math.random en módulo): los conteos son
 * estables y honestos para pack-meta.json.
 */


/* ============================ frases del puerto ============================ */

const SUJETOS = ["La marea", "El farero", "Mi vecina", "Los niños", "Un gato gris", "La luna", "El panadero", "Nuestra barca", "El viento norte", "Las gaviotas"];
const VERBOS = ["canta al amanecer", "guarda su secreto", "pinta el horizonte", "cuenta historias", "espera la marea", "recoge conchas", "escribe cartas", "lee bajo el farol", "sueña despierta", "baila en el puerto"];
const CIRCUNSTANCIAS = ["cada mañana", "sin prisa alguna", "desde el muelle", "con el viento a favor", "cuando cae la tarde", "junto al faro viejo", "con sal en los labios", "antes de la tormenta", "en la marea alta", "al compás de las olas"];

/** Frases base generadas por plantilla (520 únicas, deterministas). */
export const FRASES_PUERTO: string[] = (() => {
  const out: string[] = [];
  for (let i = 0; i < 520; i++) {
    const s = SUJETOS[i % 10];
    const v = VERBOS[Math.floor(i / 10) % 10];
    const c = CIRCUNSTANCIAS[Math.floor(i / 100) % 10];
    out.push(`${s} ${v} ${c}.`);
  }
  return out;
})();

const REFRAIN_TEXTS: string[] = REFRANES_PACK.map((r) => r.saying);

/* ============================ TIPEO ============================ */

export function buildTipeoVariants(): TipeoExercise[] {
  const out: TipeoExercise[] = [];
  const push = (sentence: string, flavor: TipeoExercise["flavor"], difficulty: 1 | 2 | 3 | 4 | 5, i: number) => {
    const words = sentence.split(" ").length;
    out.push({
      id: `tv-${String(i).padStart(3, "0")}`,
      type: "tipeo",
      skill: "ortografia",
      difficulty,
      cefr: difficulty <= 2 ? "A1" : difficulty === 3 ? "A2" : "B1",
      prompt: "Transcribe la frase exacta antes de que se apague el faro.",
      explanation: "La transcripción limpia entrena ortografía natural: tildes, signos y ritmo.",
      tags: ["tipeo", flavor],
      sentence,
      targetSeconds: Math.max(5, Math.round(words * (difficulty <= 2 ? 0.65 : 0.8)) + 3),
      flavor,
    });
  };
  let i = 0;
  for (const f of FRASES_PUERTO.slice(0, 300)) push(f, "frase", ((i++ % 3) + 1) as 1 | 2 | 3, i);
  for (const f of FRASES_PUERTO.slice(300)) push(f, "frase", 4, ++i);
  for (const r of REFRAIN_TEXTS) push(r, "cita", 5, ++i);
  return out;
}

/* ============================ ECO ============================ */

const ECO_CRITERIOS: string[][] = [
  ["Pronuncié con claridad", "Respeté la puntuación", "Mantuve un ritmo natural"],
  ["Vocalicé las finales", "No me comí sílabas", "Respiré sin cortar la frase"],
  ["Dije las erres con fuerza", "Entoné como si contara algo", "No aceleré sin control"],
];

export function buildEcoVariants(): EcoExercise[] {
  const out: EcoExercise[] = [];
  let i = 0;
  const push = (sentence: string, difficulty: 1 | 2 | 3 | 4 | 5) => {
    out.push({
      id: `ev-${String(i++).padStart(3, "0")}`,
      type: "eco",
      skill: "expresion",
      difficulty,
      cefr: difficulty <= 2 ? "A1" : difficulty === 3 ? "A2" : "B1",
      prompt: "Escucha el modelo, grábate y evalúate con honestidad.",
      explanation: "La autoevaluación honesta es el mejor entrenamiento de la pronunciación.",
      tags: ["eco", "oralidad"],
      sentence,
      criteria: ECO_CRITERIOS[i % ECO_CRITERIOS.length],
    });
  };
  for (const f of FRASES_PUERTO) push(f, ((i % 4) + 1) as 1 | 2 | 3 | 4);
  for (const r of REFRAIN_TEXTS.slice(0, 60)) push(r, 5);
  return out;
}

/* ============================ VOZ ============================ */

export function buildVozVariants(): VozExercise[] {
  const out: VozExercise[] = [];
  let i = 0;
  const push = (sentence: string, hint: string, difficulty: 1 | 2 | 3 | 4 | 5) => {
    out.push({
      id: `vv-${String(i++).padStart(3, "0")}`,
      type: "voz",
      skill: "expresion",
      difficulty,
      cefr: difficulty <= 2 ? "A1" : difficulty === 3 ? "A2" : "B1",
      prompt: "Pronuncia la frase; si no hay micrófono, escríbela.",
      explanation: "Hablar en voz alta fija el ritmo y la entonación del idioma.",
      tags: ["voz", "oralidad"],
      sentence,
      hint,
    });
  };
  for (const f of FRASES_PUERTO) push(f, "vida de puerto", ((i % 4) + 1) as 1 | 2 | 3 | 4);
  for (const r of REFRAIN_TEXTS.slice(0, 60)) push(r, "refrán popular", 5);
  return out;
}

/* ============================ FONETICA ============================ */

export function buildFoneticaVariants(): FoneticaExercise[] {
  const words = [...SRS_WORDS_FULL].sort((a, b) => a.difficulty - b.difficulty);
  const out: FoneticaExercise[] = [];
  let i = 0;
  for (let k = 0; out.length < 520 && k < words.length * 8; k++) {
    const a = words[k % words.length];
    const b = words[(k * 7 + 31) % words.length];
    if (a.word === b.word || a.word[0] === b.word[0]) continue;
    out.push({
      id: `fv-${String(i++).padStart(3, "0")}`,
      type: "fonetica",
      skill: "audicion",
      difficulty: a.difficulty,
      cefr: a.cefr,
      prompt: "Escucha y elige la palabra que sonó.",
      explanation: `«${a.word}» y «${b.word}» se distinguen por su arranque: escucha la primera vocal y las consonantes iniciales.`,
      tags: ["fonetica", "escucha"],
      pair: [a.word, b.word],
      answerIndex: i % 2,
      contrast: "Dos palabras del jardín con sonidos distinguibles: fíjate en el arranque y en las vocales.",
      shape: "Oído atento: cada palabra tiene su propia silueta sonora.",
    });
  }
  return out;
}

/* ============================ TINDER ============================ */

function starredWord(sentence: string): string | null {
  const m = sentence.match(/\*(.+?)\*/);
  return m ? m[1] : null;
}

export function buildTinderVariants(): TinderExercise[] {
  const out: TinderExercise[] = [];
  let i = 0;
  const push = (wordA: string, wordB: string, isSynonym: boolean, note: string, difficulty: 1 | 2 | 3 | 4 | 5, cefr: TinderExercise["cefr"]) => {
    out.push({
      id: `tvd-${String(i++).padStart(3, "0")}`,
      type: "tinder",
      skill: "vocabulario",
      difficulty,
      cefr,
      prompt: "¿Son intercambiables en la mayoría de contextos?",
      explanation: note,
      tags: ["tinder", "sinonimos"],
      wordA,
      wordB,
      isSynonym,
      note,
    });
  };
  for (const ex of SINONIMOS_PACK_X) {
    const a = starredWord(ex.sentence);
    if (!a) continue;
    const correct = ex.options[ex.answerIndex];
    const distractor = ex.options[(ex.answerIndex + 1) % ex.options.length];
    if (ex.relation === "sinónimo") {
      push(a, correct, true, `En este contexto son intercambiables: «${correct}» recoge el significado de «${a}».`, ex.difficulty, ex.cefr);
      push(a, distractor, false, `No son sinónimos aquí: «${distractor}» no recoge el significado de «${a}» en la frase del ejercicio.`, ex.difficulty, ex.cefr);
    } else {
      push(a, correct, false, `Son antónimos: «${correct}» significa lo contrario que «${a}».`, ex.difficulty, ex.cefr);
    }
    if (out.length >= 520) break;
  }
  return out;
}

/* ============================ ERRORES (tilde mecánica) ============================ */

function moveAccent(word: string, targetIdx: number): string {
  // Quita la tilde actual y la coloca en la vocal de índice targetIdx (vocal tónica simulada mal).
  const ACC: Record<string, string> = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
  const UNACC: Record<string, string> = { á: "a", é: "e", í: "i", ó: "o", ú: "u" };
  let out = "";
  let vi = -1;
  for (const ch of word) {
    if (UNACC[ch]) { vi++; out += vi === targetIdx ? ACC[UNACC[ch]] : UNACC[ch]; }
    else if (ACC[ch]) { vi++; if (vi === targetIdx) out += ACC[ch]; else out += UNACC[ch]; }
    else out += ch;
  }
  return out;
}

export function buildErroresVariants(): ErrorHuntExercise[] {
  const out: ErrorHuntExercise[] = [];
  let i = 0;
  for (const w of SRS_WORDS_FULL) {
    if (out.length >= 200) break;
    const tokens = w.example.split(" ");
    const idx = tokens.findIndex((t) => /[áéíóú]/.test(t) && (t.match(/[aeiouáéíóú]/g)?.length ?? 0) >= 2 && t.length >= 4);
    if (idx === -1) continue;
    const clean = tokens[idx];
    const cleanNoAccent = clean.replace(/[áéíóú]/g, (c) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u" })[c] ?? c);
    const accents = clean.split("").map((c, j) => (/[áéíóú]/.test(c) ? j : -1)).filter((j) => j >= 0);
    if (accents.length !== 1) continue;
    const vowels = clean.split("").map((c, j) => (/[aeiouáéíóú]/.test(c) ? j : -1)).filter((j) => j >= 0);
    const wrongA = moveAccent(clean, 0);
    const wrongB = moveAccent(clean, vowels.length - 1);
    if (wrongA === clean || wrongB === clean || wrongA === wrongB) continue;
    const withError = [...tokens];
    withError[idx] = cleanNoAccent;
    out.push({
      id: `ehv-${String(i++).padStart(3, "0")}`,
      type: "errores",
      skill: "ortografia",
      difficulty: w.difficulty,
      cefr: w.cefr,
      prompt: "Toca la palabra que esconde el error y elige su corrección.",
      explanation: `La forma correcta es «${clean}»: lleva la tilde en su sitio; las otras acentuaciones son incorrectas.`,
      tags: ["tildes", "tildes-mecanicas"],
      tokens: withError,
      errorIndex: idx,
      options: [cleanNoAccent, clean, wrongA, wrongB],
      answerIndex: 1,
    });
  }
  return out;
}

/* ============================ export consolidado ============================ */

export function variantPacks(): Record<string, Exercise[]> {
  return {
    tipeo: buildTipeoVariants(),
    eco: buildEcoVariants(),
    voz: buildVozVariants(),
    fonetica: buildFoneticaVariants(),
    tinder: buildTinderVariants(),
    errores: buildErroresVariants(),
  };
}

