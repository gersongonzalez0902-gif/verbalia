import type { FoneticaExercise } from "@/types";

/**
 * Pack · Laboratorio de Fonética Visual (Puerto de las Voces) · Etapa 2 completa
 * ----------------------------------------------------------------
 * 28 pares mínimos con contraste REAL en español: vibrantes, laterales,
 * seseo/distinción, sonoras/sordas y calidad vocálica. El juego suena
 * una de las dos palabras y el navegante elige cuál oyó; el laboratorio
 * explica el contraste y dibuja la forma del sonido con palabras.
 */

/* [palabra sonada, pareja rival, explicación del contraste, forma visual, dificultad] */
const ROWS: [string, string, string, string, number][] = [
  // ---- vibrantes: /r/ múltiple vs /ɾ/ simple ----
  ["perro", "pero", "La /rr/ vibra varias veces golpeando el paladar (vibrante múltiple); la /r/ sola toca una vez, como un tambor que pasa de largo.", "Lengua que ametralla vs lengua que golpea y suelta.", 2],
  ["carro", "caro", "Igual que perro/pero: la vibrante múltiple ametralla; la simple pasa rozando.", "Ametralla corta vs roce largo de lengua.", 2],
  ["correr", "corer", "«Corer» no existe: la vibrante simple entre vocales suena una vez sola, sin rodar.", "Un solo toque de tambor, no una ruleta.", 3],
  ["barreno", "bareno", "«Bareno» no existe: la /rr/ del barreno perfora con varias vibraciones.", "Taladro que vibra vs toque que apenas asoma.", 3],
  // ---- /ʎ/ lateral palatal vs /ʝ/ aproximante (distinción ll/y) ----
  ["calló", "cayó", "En los dialectos con distinción, «ll» se apoya toda la lengua en el paladar (lateral); «y» deja pasar el aire por el centro.", "Lengua en puentes vs lengua en canal.", 4],
  ["gallina", "gayina", "«Gayina» es la pronunciación yeísta de «gallina»: en distinción, la ll apoya el cuerpo de la lengua entero.", "Manta que se extiende vs canal central.", 4],
  ["rallar", "rayar", "Rallar el queso (superficie) y rayar un verso (línea): en distinción suenan distintas; en yeísmo se vuelven gemelas.", "Rallos laterales vs rayas centrales.", 5],
  ["hierro", "yerro", "La «h» es muda: hierro se apoya en la lateral ll/y palatal; yerro es el yeísmo de errar.", "Hierro con manta de lengua; yerro con canal fino.", 5],
  // ---- /θ/ vs /s/ (distinción vs seseo) ----
  ["caza", "casa", "Con distinción, la /z/ de caza saca la lengua entre los dientes (/θ/); la /s/ de casa sopla detrás. En seseo, las dos suenan /s/.", "Lengua asomada vs soplo de serpiente.", 3],
  ["cocer", "coser", "Se cuece con /θ/ (en distinción) y se cose con /s/: el seseo las hace gemelas, la distinción las separa como olla y dedal.", "Lengua entre dientes vs aire por la ranura.", 3],
  ["zumo", "sumo", "La z con distinción es /θ/ (zumo inglés en España); la s sopla fina. En América ambas dan /s/.", "Lengua asoma para el zumo; soplo para el sumo.", 4],
  ["cima", "sima", "Cima (la cima de la montaña) con /θ/; sima (el abismo) con /s/. En seseo se confían y el contexto rescata.", "Pico asomado vs abismo soplado.", 5],
  ["cebo", "sebo", "Cebo con /θ/ es lo que se echa al agua o al ganado; sebo con /s/ es la grasa. La distinción evita cebar a nadie con sebo.", "Lengua entre dientes vs soplo lateral.", 5],
  // ---- sonoras vs sordas ----
  ["bata", "pata", "La /b/ vibra en la garganta (sonora); la /p/ acumula aire y estalla (sorda).", "Garganta que ronronea vs bomba que estalla.", 1],
  ["toma", "doma", "La /t/ estalla seca; la /d/ vibra suave y a veces casi se deshace entre vocales.", "Golpe seco vs casi una fricción de dedo.", 2],
  ["gata", "cata", "La /g/ vibra en la garganta; la /k/ acumula y suelta el aire de golpe.", "Ronquido corto vs corcho que salta.", 2],
  ["jala", "cala", "La /j/ raspa en la garganta como vapor; la /k/ estalla atrás del paladar.", "Vapor que raspa vs corcho seco.", 3],
  // ---- calidad vocálica ----
  ["misa", "masa", "La /i/ cierra y sonríe; la /a/ abre la mandíbula de par en par.", "Boca casi cerrada vs boca de bostezo.", 1],
  ["piso", "peso", "La /i/ cierra el gesto; la /e/ abre a medias: medio centímetro de mandíbula separa un piso de un peso.", "Sonrisa apretada vs media apertura.", 2],
  ["bota", "bata", "La /o/ redondea los labios; la /a/ los estira sin curva.", "Beso redondo vs bostezo plano.", 2],
  ["camas", "comas", "La /a/ abre; la /o/ redondea: cambia la cama por una coma y el sueño por una pausa.", "Bostezo abierto vs beso redondo.", 3],
  ["ducha", "dicha", "La /u/ se besa a sí misma; la /i/ estira la comisura: la ducha y la dicha se bañan en vocales distintas.", "Beso cerrado vs sonrisa estirada.", 4],
  // ---- acento prosódico (posición del golpe) ----
  ["paso", "pasó", "PASO golpea en la primera (el paso del camino); pasó golpea en la última (el verbo pasar).", "Golpe al inicio vs golpe final que resuena.", 2],
  ["tomo", "tomó", "TOmo la taza (primera); tomÓ el barco (última): el mismo golpe cambia de sílaba.", "Redoble primero vs redoble postrero.", 2],
  ["canto", "cantó", "El CANTO del grillo (primera); cantÓ la sirena (última): el acento cambia oficio a la palabra.", "Pájaro primero vs verbo final.", 3],
  ["público", "publicó", "PÚ-bli-co (esdrújula) es la gente; pu-bli-CÓ (aguda) es el verbo publicar: tres golpes distintos, tres palabras en una.", "Golpe en antepenúltimo vs golpe al final.", 4],
  ["sabía", "sabia", "sa-BÍ-a hiato en tres sílabas (el que sabe o la que sabe); SA-bia diptongo en dos (la persona sabia).", "Tres olas abiertas vs dos olas juntas.", 5],
  ["término", "terminó", "TÉR-mi-no es el límite o la palabra; ter-mi-NÓ es el verbo terminar: el acento decide si la palabra frena o remata.", "Freno en la primera vs meta en la última.", 5],
];

function cefrOf(d: number): FoneticaExercise["cefr"] {
  return d <= 1 ? "A1" : d === 2 ? "A2" : d === 3 ? "B1" : d === 4 ? "B2" : "C1";
}

export const FONETICA_PACK: FoneticaExercise[] = ROWS.map(
  ([word, rival, contrast, shape, d], i) => {
    // Alterna en qué posición suena la correcta para no concentrar
    // respuestas en la primera carta (paridad del índice).
    const answerIndex = i % 2 === 0 ? 0 : 1;
    const pair: [string, string] = answerIndex === 0 ? [word, rival] : [rival, word];
    return {
      id: `fn-${String(i + 1).padStart(2, "0")}`,
      type: "fonetica" as const,
      skill: "audicion" as const,
      difficulty: d as FoneticaExercise["difficulty"],
      cefr: cefrOf(d),
      prompt: "¿Cuál de las dos sonó?",
      explanation: contrast,
      tags: ["fonética", "pares mínimos", "escucha"],
      pair,
      answerIndex,
      contrast,
      shape,
    };
  },
);
