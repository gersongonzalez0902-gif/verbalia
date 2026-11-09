import type { EcoExercise } from "@/types";

/**
 * Pack · Eco del Mar (Puerto de las Voces) · Etapa 2 completa
 * ----------------------------------------------------------------
 * 24 frases para grabarse y escucharse: trabalenguas suaves, hiatos,
 * erres dobles y preguntas con entonación. La autoevaluación es una
 * checklist honesta (como el Reto del Minuto): la grabación vive
 * solo en memoria durante el ejercicio y jamás se guarda.
 */

const ROWS: [string, string[], number][] = [
  // [frase modelo, criterios, dificultad]
  ["El barco bravo trae bruma de abril.", ["Pronuncié las erres fuertes", "No me comí sílabas", "Mantuve el ritmo tranquilo"], 2],
  ["¿Vienes conmigo a ver la marea?", ["Subí el tono al final (pregunta)", "Las palabras salieron claras", "No atropellé el final"], 2],
  ["El cielo está enladrillado.", ["Pronuncié el grupo -dr- limpio", "Respeté la tilde de está", "Respiré antes de empezar"], 2],
  ["San Roque tiene un perro sin rabo.", ["Las eses sonaron nítidas", "La erre de Roque vibró", "La frase quedó completa"], 2],
  ["Tres tristes tigres tragaban trigo.", ["Cada erre sonó fuerte", "No fusioné las palabras", "Terminé sin tropezar"], 3],
  ["La marea subía mientras la luna bajaba.", ["Marqué el ritmo de la frase larga", "Subí/bajé la voz con el sentido", "No perdí el aire a mitad"], 3],
  ["María dijo que la vía era fea.", ["Distinguí María / marea al oído", "La v sonó suave como debe", "La frase terminó con punto en la voz"], 3],
  ["Rey reía reina ríe.", ["Pronuncié el hiato re-í-a", "Cada palabra quedó separada", "La repetición no me atropelló"], 3],
  ["¡Qué maravilla de isla!", ["Abrí la exclamación con energía", "La exclamación se notó en la voz", "La palabra maravilla salió entera"], 3],
  ["El agua tranquila refleja estrellas.", ["Pronuncié tranquila con -nqu-", "La frase salió serena como su tema", "Respeté todas las eses"], 3],
  ["Pablito clavó un clavito en la calva de un calvito.", ["Todas las l de clavito sonaron", "El ritmo no se rompió", "La frase llegó al final entera"], 4],
  ["Como poco coco como, poco coco compro.", ["Las c de coco sonaron limpias", "No metí una e de más", "Mantuve la velocidad controlada"], 4],
  ["¿Cuántos cuentos cuenta tu tía Concha?", ["La pregunta subió al final", "Cu/cue sonaron distintas y claras", "No me comí la tilde de tía"], 4],
  ["El perro de San Roque no tiene rabo porque Ramón Ramírez se lo ha cortado.", ["Las erres dobles vibraron", "La frase larga respiró en sus comas", "La velocidad fue pareja"], 4],
  ["La lluvia en Sevilla es una maravilla.", ["La LL/Y sonaron claras", "Las í de Sevilla y maravilla lucieron", "El ritmo fue juguetón"], 4],
  ["Cuando cuentes cuentos, cuenta cuántos cuentos cuentas.", ["Distinguí cuento/cuenta sin trabarme", "Las comas marcaron pausas en la voz", "La frase no se desarmó"], 4],
  ["Erre con erre cigarro, erre con erre barril.", ["La erre vibró en las cuatro palabras", "Cigarro/barril no se fundieron", "Respiré donde correspondía"], 5],
  ["El cielo está enladrillado, ¿quién lo desenladrillará?", ["El trabalingua salió sin tropezar", "La pregunta final subió", "El grupo -dr- quedó limpio"], 5],
  ["Los tristes tigres del oriente comían trigo con miel.", ["La r de tristes sonó suave", "Oriente y miel quedaron limpias", "El aire me duró toda la frase"], 5],
  ["Hoy ya es ayer, y mañana será hoy.", ["Las haches no sonaron (son mudas)", "Marqué el contraste de tiempos con la voz", "Las tres partes quedaron claras"], 5],
  ["Presta tu pluma a Plutarco para escribir el prólogo.", ["La pl de pluma sonó unida", "Prólogo llevó su tilde entera", "La frase sonó elegante, no corrida"], 5],
  ["Vended vuestras velas velozes.", ["Las v sonaron como deben (suaves)", "Vuestras y velozes salieron enteras", "El ritmo no se aceleró"], 5],
  ["El sol sala el seso del pez sin sal.", ["Sol/sal/seso/sal sonaron distintas", "Las eses finales no se tragaron", "La broma del verso se entendió"], 5],
  ["Zapatero, zapatos de seda; sillero, sillas de acero.", ["Zapato y silla quedaron nítidas", "Las c de acero sonaron limpias", "El paralelismo se oyó en la voz"], 5],
];

function cefrOf(d: number): EcoExercise["cefr"] {
  return d <= 2 ? "A2" : d === 3 ? "B1" : d === 4 ? "B2" : "C1";
}

export const ECO_PACK: EcoExercise[] = ROWS.map(([sentence, criteria, d], i) => ({
  id: `ec-${String(i + 1).padStart(2, "0")}`,
  type: "eco" as const,
  skill: "expresion" as const,
  difficulty: d as EcoExercise["difficulty"],
  cefr: cefrOf(d),
  prompt: "Escucha, graba y autoevalúate",
  explanation:
    "La pronunciación se afina con el oído propio: escucha el modelo, grábate y compáralas con honestidad. La grabación no se guarda: vive solo durante el ejercicio.",
  tags: ["eco", "grabación", "pronunciación"],
  sentence,
  criteria,
}));
