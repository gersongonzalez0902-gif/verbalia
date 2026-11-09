import type { VozExercise } from "@/types";

/**
 * Pack · Dictado por Voz (Puerto de las Voces) · Etapa 2 completa
 * ----------------------------------------------------------------
 * 30 frases conversacionales para el micrófono: saludos, mercado,
 * direcciones y vida de puerto, de 5 a 9 palabras, con tildes y
 * signos para que el reconocimiento honesto tenga trabajo. Si el
 * navegador no reconoce voz (o el puerto niega el permiso), el
 * juego recae en escritura a mano con la misma frase.
 */

const ROWS: [string, string, number][] = [
  // [frase, pista, dificultad]
  ["Buenos días, ¿va a llover hoy?", "saludo + clima", 1],
  ["Muchas gracias por la ayuda.", "agradecimiento", 1],
  ["¿Dónde está la estación de tren?", "dirección", 1],
  ["Me pones un kilo de naranjas.", "mercado", 1],
  ["Hasta mañana, que descanses.", "despedida", 1],
  ["La cuenta, por favor.", "restaurante", 1],
  ["Perdone, ¿puede repetirlo más despacio?", "cortesía", 2],
  ["Quisiera reservar una mesa para dos.", "restaurante", 2],
  ["El próximo barco zarpa a las ocho.", "puerto", 2],
  ["No entiendo, ¿lo puede escribir?", "comunicación", 2],
  ["¿Cuánto cuesta el pasaje a la isla?", "billetes", 2],
  ["Necesito un médico, es urgente.", "emergencia", 2],
  ["Tengo una habitación con vistas al mar.", "hotel", 2],
  ["¿Me dejas pasar, por favor?", "cortesía", 2],
  ["El farero dijo que la marea sube.", "puerto", 3],
  ["Deberíamos comprar el pan de mañana.", "plan", 3],
  ["Mi primo vive cerca de la costa.", "familia", 3],
  ["Han avistado delfines en la bahía.", "naturaleza", 3],
  ["El examen era más difícil de lo que pensaba.", "estudio", 3],
  ["Ayer llovió toda la tarde sin parar.", "clima", 3],
  ["Quedo en la esquina del muelle a las seis.", "cita", 3],
  ["¿Le importaría abrir la ventana un momento?", "petición formal", 4],
  ["Según el parte, mañana hará viento del norte.", "clima", 4],
  ["Le comunico que su envío llegó con retraso.", "correo formal", 4],
  ["Habíamos quedado en vernos antes de la partida.", "plan", 4],
  ["Agradecería que me lo explicara con detalle.", "formalidad", 4],
  ["El capitán asegura que no habrá tormenta.", "puerto", 4],
  ["Cuando llegues, avísame para ir a buscarla.", "instrucción", 5],
  ["Sin ti no habría encontrado la casa de la abuela.", "emoción", 5],
  ["Dice el cartel que la biblioteca abre los domingos.", "información", 5],
];

function cefrOf(d: number): VozExercise["cefr"] {
  return d <= 1 ? "A1" : d === 2 ? "A2" : d === 3 ? "B1" : d === 4 ? "B2" : "C1";
}

export const VOZ_PACK: VozExercise[] = ROWS.map(([sentence, hint, d], i) => ({
  id: `vz-${String(i + 1).padStart(2, "0")}`,
  type: "voz" as const,
  skill: "expresion" as const,
  difficulty: d as VozExercise["difficulty"],
  cefr: cefrOf(d),
  prompt: "Lee la frase en voz alta",
  explanation:
    "Pronuncia con naturalidad y ritmo de conversación: el micrófono premia la calma, no las prisas. Si la transcripción no fue exacta, compara palabra a palabra y reinténtalo.",
  tags: ["voz", "micrófono", "pronunciación"],
  sentence,
  hint,
}));
