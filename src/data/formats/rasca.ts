import type { RascaExercise } from "@/types";
import { SRS_WORDS_FULL } from "../content";
import { createRng, shuffle } from "@/engine/rng";

/**
 * Pack · Tarjetas Rasca-Rasca (Bosque del Vocabulario) · Etapa 2 completa
 * ----------------------------------------------------------------
 * Se construye de forma determinista a partir del jardín SRS: cada
 * tarjeta esconde una palabra del jardín y ofrece su definición real
 * entre dos distractores de la misma banda de dificultad y categoría
 * gramatical. Cero texto nuevo en el paquete inicial (las definiciones
 * ya viajan con el SRS) y cero ids repetidos (prefijo «rk-»).
 *
 * Rasca-Rasca es el primer encuentro amable con las palabras: no se
 * castiga la curiosidad y la capa se raya sola con el dedo.
 */

/** Cuántas tarjetas por nivel de dificultad (total ≈ 520). */
const PER_DIFFICULTY = 104;
/** Palabras por tarjeta: la buena + 2 distractores. */
const OPTION_COUNT = 3;

function buildRascaPack(): RascaExercise[] {
  const rng = createRng("rasca-bosque-v5");
  const out: RascaExercise[] = [];
  const byDifficulty = new Map<number, typeof SRS_WORDS_FULL>();
  for (const w of SRS_WORDS_FULL) {
    const list = byDifficulty.get(w.difficulty) ?? [];
    list.push(w);
    byDifficulty.set(w.difficulty, list);
  }

  for (const [difficulty, words] of [...byDifficulty.entries()].sort((a, b) => a[0] - b[0])) {
    // Baraja estable y recorta: variedad sin hinchar el tablón.
    const chosen = shuffle(words, rng).slice(0, PER_DIFFICULTY);
    // Candidatos a distractor: banda cercana y definición con sustancia.
    const distractorPool = (SRS_WORDS_FULL ?? []).filter(
      (w) =>
        Math.abs(w.difficulty - difficulty) <= 1 &&
        w.definition.length >= 14 &&
        w.definition !== "",
    );
    for (let i = 0; i < chosen.length; i++) {
      const w = chosen[i];
      if (!w.definition || w.definition.length < 8) continue;
      // Distractores: misma categoría si es posible; si no, banda cercana.
      const samePos = distractorPool.filter((d) => d.id !== w.id && d.pos === w.pos);
      const anyPos = distractorPool.filter((d) => d.id !== w.id);
      const source = samePos.length >= OPTION_COUNT ? samePos : anyPos;
      if (source.length < OPTION_COUNT - 1) continue;
      const picks: typeof SRS_WORDS_FULL = [];
      const shuffledSource = shuffle(source, rng);
      for (const cand of shuffledSource) {
        if (picks.length >= OPTION_COUNT - 1) break;
        if (cand.definition === w.definition) continue;
        if (picks.some((p) => p.definition === cand.definition)) continue;
        picks.push(cand);
      }
      if (picks.length < OPTION_COUNT - 1) continue;
      // Posición de la correcta: rota 0/1/2 para no concentrar respuestas.
      const answerIndex = i % OPTION_COUNT;
      const options: string[] = [];
      const others = picks.map((p) => p.definition);
      others.forEach((def, j) => {
        const slot = j >= answerIndex ? j + 1 : j;
        options[slot] = def;
      });
      options[answerIndex] = w.definition;
      out.push({
        id: `rk-${w.id.replace(/^w-?/, "")}`,
        type: "rasca",
        skill: "vocabulario",
        difficulty: difficulty as RascaExercise["difficulty"],
        cefr: w.cefr,
        prompt: "Rasca la tarjeta y elige la definición",
        explanation: `«${w.word}» (${w.pos}): ${w.definition} Ejemplo: ${w.example}`,
        tags: ["rasca", "definiciones", ...(w.tags ?? [])].slice(0, 5),
        word: w.word,
        options,
        answerIndex,
      });
    }
  }
  return out;
}

export const RASCA_PACK: RascaExercise[] = buildRascaPack();
