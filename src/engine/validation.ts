import type { AnswerRecord } from "@/types";

/**
 * Motor de validación de respuestas.
 * Cada minijuego reporta una respuesta descriptiva; aquí se comparan
 * con la solución. Toda la validación es de opciones (no escritura
 * libre), por lo que no hay ambigüedad posible.
 */

export interface ValidationResult {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
}

function normalizeText(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

/** Trivia: clase gramatical elegida vs. correcta (comparación insensible a mayúsculas). */
export function checkTrivia(exercise: any, chosen: string): ValidationResult {
  const norm = (s: string) => s.trim().toLowerCase();
  return {
    correct: norm(chosen) === norm(exercise.answer),
    userAnswer: chosen,
    correctAnswer: exercise.answer,
  };
}

/** Puzzle sintáctico: orden de fragmentos (array de índices originales). */
export function checkPuzzle(exercise: any, order: number[]): ValidationResult {
  const correct = order.length === exercise.chunks.length && order.every((v, i) => v === i);
  return {
    correct,
    userAnswer: order.map((i) => exercise.chunks[i]).join(" "),
    correctAnswer: exercise.chunks.join(" "),
  };
}

/** Cloze: índice de opción elegida. */
export function checkCloze(exercise: any, optionIndex: number): ValidationResult {
  return {
    correct: optionIndex === exercise.answerIndex,
    userAnswer: exercise.options[optionIndex] ?? "—",
    correctAnswer: exercise.options[exercise.answerIndex],
  };
}

/** Caza de errores: palabra elegida + corrección elegida. */
export function checkErrorHunt(
  exercise: any,
  tokenIndex: number | "none",
  correctionIndex: number | null,
): ValidationResult {
  // Frase limpia: solo es correcto declarar "no hay error".
  if (exercise.errorIndex === -1) {
    const correct = tokenIndex === "none";
    return {
      correct,
      userAnswer: tokenIndex === "none" ? "No hay error" : `corrigió «${exercise.tokens[tokenIndex as number]}»`,
      correctAnswer: "No había error",
    };
  }
  if (tokenIndex === "none") {
    return {
      correct: false,
      userAnswer: "No hay error",
      correctAnswer: `«${exercise.tokens[exercise.errorIndex]}» → «${exercise.options[exercise.answerIndex]}»`,
    };
  }
  const rightWord = tokenIndex === exercise.errorIndex;
  const rightFix = correctionIndex === exercise.answerIndex;
  const correct = rightWord && rightFix;
  return {
    correct,
    userAnswer: correct
      ? `«${exercise.tokens[tokenIndex]}» → «${exercise.options[correctionIndex!]}»`
      : rightWord
        ? `«${exercise.tokens[tokenIndex]}» → «${correctionIndex !== null ? exercise.options[correctionIndex] : "—"}»`
        : `señaló «${exercise.tokens[tokenIndex]}»`,
    correctAnswer: `«${exercise.tokens[exercise.errorIndex]}» → «${exercise.options[exercise.answerIndex]}»`,
  };
}

/** Tribunal de las Tildes: sílaba elegida (-1 = no lleva). */
export function checkTildes(exercise: any, syllableIndex: number): ValidationResult {
  const correct = syllableIndex === exercise.answerSyllable;
  const label = (i: number) => (i === -1 ? "no lleva tilde" : `«${exercise.syllables[i]}»`);
  return {
    correct,
    userAnswer: label(syllableIndex),
    correctAnswer: label(exercise.answerSyllable),
  };
}

/** Constructor de párrafos: orden de oraciones (índices originales). */
export function checkParagraph(exercise: any, order: number[]): ValidationResult {
  const correct = order.length === exercise.sentences.length && order.every((v, i) => v === i);
  return {
    correct,
    userAnswer: order.map((i) => exercise.sentences[i]).join(" "),
    correctAnswer: exercise.sentences.join(" "),
  };
}

/* ============================ Etapa 2 ============================ */

/**
 * Dictado del Faro: comparación tolerante a mayúsculas, espacios
 * redundantes y el punto final, pero estricta con tildes, eñes y
 * signos de apertura (¿¡): son el corazón ortográfico del juego.
 */
export function normalizeDictado(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?…]+$/, "");
}

export function checkDictado(exercise: any, typed: string): ValidationResult {
  const correct = normalizeDictado(typed) === normalizeDictado(exercise.sentence);
  return {
    correct,
    userAnswer: typed.trim() || "—",
    correctAnswer: exercise.sentence,
  };
}

/** Diff palabra a palabra para la retroalimentación visual del dictado. */
export type DictadoDiffToken = { word: string; status: "ok" | "wrong" | "missing" | "extra" };

export function dictadoDiff(typed: string, sentence: string): DictadoDiffToken[] {
  const strip = (w: string) => w.toLowerCase().replace(/[.,;:!?¿¡«»"…]+/g, "");
  const typedWords = typed.trim().split(/\s+/).filter(Boolean);
  const targetWords = sentence.trim().split(/\s+/).filter(Boolean);
  const out: DictadoDiffToken[] = [];

  // Alineación simple (LCS reducido a palabras exactas).
  const t = typedWords.map(strip);
  const s = targetWords.map(strip);
  let i = 0;
  let j = 0;
  while (i < t.length && j < s.length) {
    if (t[i] === s[j]) {
      out.push({ word: targetWords[j], status: "ok" });
      i++; j++;
    } else if (t[i] === s[j + 1]) {
      out.push({ word: targetWords[j], status: "missing" });
      j++;
    } else if (t[i + 1] === s[j]) {
      out.push({ word: typedWords[i], status: "extra" });
      i++;
    } else {
      out.push({ word: typedWords[i], status: "wrong" });
      i++; j++;
    }
  }
  while (j < s.length) {
    out.push({ word: targetWords[j], status: "missing" });
    j++;
  }
  while (i < t.length) {
    out.push({ word: typedWords[i], status: "extra" });
    i++;
  }
  return out;
}

/** Ecos del Puerto / Lectura / Sprint / Sinónimos / Refranes / Historias: índice de opción. */
export function checkOptionIndex(exercise: any, chosenIndex: number): ValidationResult {
  const correct = chosenIndex === exercise.answerIndex;
  return {
    correct,
    userAnswer: exercise.options[chosenIndex] ?? "—",
    correctAnswer: exercise.options[exercise.answerIndex],
  };
}

/**
 * Reto del Minuto: no hay acierto ni fallo, solo esfuerzo honesto.
 * correct=null (como las tarjetas SRS); la «grade» se deriva del
 * esfuerzo real (palabras) y de la autoevaluación con criterios.
 */
export function checkMinuto(
  exercise: any,
  wordCount: number,
  checkedCriteria: number,
): Omit<ValidationResult, "correct"> & { correct: boolean | null; grade: "again" | "hard" | "good" | "easy" } {
  const goal = exercise.wordGoal ?? 40;
  const criteria = exercise.criteria?.length ?? 3;
  let grade: "again" | "hard" | "good" | "easy";
  if (wordCount < 5) grade = "again";
  else if (wordCount >= goal && checkedCriteria >= Math.ceil(criteria / 2)) grade = "easy";
  else if (wordCount >= Math.round(goal * 0.6) || checkedCriteria >= 2) grade = "good";
  else grade = "hard";
  return {
    correct: null,
    grade,
    userAnswer: `${wordCount} palabras · ${checkedCriteria}/${criteria} criterios`,
    correctAnswer: `Meta: ${goal} palabras`,
  };
}

/** Traduce una validación a un AnswerRecord (lo rellena la pantalla de juego). */
export function toAnswerRecord(
  base: Omit<AnswerRecord, "correct" | "userAnswer" | "correctAnswer">,
  validation: ValidationResult,
): AnswerRecord {
  return { ...base, ...validation };
}

/* ============================ Etapa 3 · nuevos formatos ============================ */

/** El Intruso: índice de la palabra intrusa. */
export function checkIntruso(exercise: any, chosenIndex: number): ValidationResult {
  const correct = chosenIndex === exercise.answerIndex;
  return {
    correct,
    userAnswer: exercise.options[chosenIndex] ?? "—",
    correctAnswer: exercise.options[exercise.answerIndex],
  };
}

/** Clasifica (sortea): índice del cubo elegido. */
export function checkSortea(exercise: any, bucketIndex: number): ValidationResult {
  const correct = bucketIndex === exercise.answerIndex;
  return {
    correct,
    userAnswer: exercise.buckets[bucketIndex] ?? "—",
    correctAnswer: exercise.buckets[exercise.answerIndex],
  };
}

/** Verdadero o falso: booleano directo. */
export function checkVf(exercise: any, chosen: boolean): ValidationResult {
  return {
    correct: chosen === exercise.answer,
    userAnswer: chosen ? "Verdadero" : "Falso",
    correctAnswer: exercise.answer ? "Verdadero" : "Falso",
  };
}

/** Normalización para escribir: minúsculas, espacios y puntuación final fuera. */
function normalizeEscribe(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!?…]+$/, "");
}

/**
 * Escribe la palabra: estricta con tildes y eñes en la Fortaleza
 * (el juego es ortográfico); tolerante con tildes en el resto (la
 * palabra correcta se acepta aunque falte el acento escrito).
 */
export function checkEscribe(exercise: any, typed: string): ValidationResult {
  const target = exercise.word as string;
  const norm = normalizeEscribe(typed);
  const strict = norm === normalizeEscribe(target);
  const loose = norm.normalize("NFD").replace(/\p{Diacritic}/gu, "") ===
    normalizeEscribe(target).normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const isOrtografia = (exercise.type as string).startsWith("escribe-fortaleza");
  const correct = isOrtografia ? strict : strict || loose;
  return {
    correct,
    userAnswer: typed.trim() || "—",
    correctAnswer: target,
  };
}

/** Oye: la escritura elegida (cadena) frente a la palabra correcta. */
export function checkOye(exercise: any, chosen: string): ValidationResult {
  return {
    correct: chosen === exercise.word,
    userAnswer: chosen,
    correctAnswer: exercise.word,
  };
}

/**
 * Memoria de pares: cooperativo (siempre se resuelve); registra los
 * intentos. El decaimiento anti-farmeo del motor se ocupa de las
 * repeticiones de un mismo tablero.
 */
export function checkMemoria(exercise: any, attempts: number): ValidationResult {
  return {
    correct: true,
    userAnswer: `${attempts} intentos`,
    correctAnswer: `${exercise.pairs.length} pares`,
  };
}

/** Conecta: cooperativo; registra los fallos de conexión. */
export function checkConecta(exercise: any, mistakes: number): ValidationResult {
  return {
    correct: true,
    userAnswer: mistakes === 0 ? "sin fallos" : `${mistakes} fallo${mistakes === 1 ? "" : "s"}`,
    correctAnswer: `${exercise.pairs.length} pares`,
  };
}

/* ====================== Etapa 4 · Forja del Escritor ====================== */

/** Forja de Metáforas / Registro Correcto / Taller de Conectores: índice de opción. */
export function checkForjaOption(exercise: any, chosenIndex: number): ValidationResult {
  const list: string[] = exercise.options;
  return {
    correct: chosenIndex === exercise.answerIndex,
    userAnswer: list[chosenIndex] ?? "—",
    correctAnswer: list[exercise.answerIndex],
  };
}

/** Detector de Ironía: tono elegido frente al real. */
export function checkIronia(exercise: any, chosen: "literal" | "ironico"): ValidationResult {
  const label = (t: "literal" | "ironico") => (t === "ironico" ? "Con ironía" : "Sentido literal");
  return {
    correct: chosen === exercise.answer,
    userAnswer: label(chosen),
    correctAnswer: label(exercise.answer),
  };
}

/** Censura del Editor: token tachado (o -1 = texto limpio). */
export function checkCensura(exercise: any, tokenIndex: number | "limpio"): ValidationResult {
  const target = exercise.answerIndex as number;
  if (target === -1) {
    const correct = tokenIndex === "limpio";
    return {
      correct,
      userAnswer: tokenIndex === "limpio" ? "Sin censura" : `tachó «${exercise.tokens[tokenIndex as number]}»`,
      correctAnswer: "El texto estaba limpio",
    };
  }
  if (tokenIndex === "limpio") {
    return {
      correct: false,
      userAnswer: "Sin censura",
      correctAnswer: `tachar «${exercise.tokens[target]}»`,
    };
  }
  const correct = tokenIndex === target;
  return {
    correct,
    userAnswer: `tachó «${exercise.tokens[tokenIndex]}»`,
    correctAnswer: `tachar «${exercise.tokens[target]}»`,
  };
}
