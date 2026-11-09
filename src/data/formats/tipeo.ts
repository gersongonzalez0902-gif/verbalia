import type { TipeoExercise } from "@/types";

/**
 * Pack · Duelo de Tipeo (Fortaleza de la Ortografía) · Etapa 2 completa
 * ----------------------------------------------------------------
 * 36 duelos de velocidad: frases cortas para abrir boca,
 * trabalenguas para los dedos valientes y citas del mar para
 * escribir con estilo. El faro cronometra: la meta no es
 * machacar teclas, es transcribir limpio y rápido.
 */

/* [frase, targetSeconds, flavor, dificultad] */
const ROWS: [string, number, TipeoExercise["flavor"], number][] = [
  // ---- d1 · calentamiento de dedos (8) ----
  ["El faro guía a los barcos.", 9, "frase", 1],
  ["La marea sube cada tarde.", 9, "frase", 1],
  ["Los gatos miran la luna.", 9, "frase", 1],
  ["Mi isla tiene ocho palmeras.", 10, "frase", 1],
  ["Comemos pan con aceite y sal.", 10, "frase", 1],
  ["El búho lee en la biblioteca.", 10, "frase", 1],
  ["Tres velas y un mapa viejo.", 9, "frase", 1],
  ["La lluvia borra las huellas.", 9, "frase", 1],
  // ---- d2 · frases con tildes y eñes (6) ----
  ["El año nuevo trae más marea.", 11, "frase", 2],
  ["Pingüinos del sur, cada año más.", 11, "frase", 2],
  ["¿Cuántas aún? Más de cien, hoy.", 12, "frase", 2],
  ["La azotea da al mar de Alborán.", 12, "frase", 2],
  ["Búscalo aquí, bajo la hiedra.", 11, "frase", 2],
  ["Quieres café o té con hierbabuena.", 12, "frase", 2],
  // ---- d3 · trabalenguas suaves (7) ----
  ["Pablito clavó un clavito en la calva de un calvito.", 14, "trabalenguas", 3],
  ["Tres tristes tigres tragaban trigo.", 10, "trabalenguas", 3],
  ["El cielo está enladrillado, ¿quién lo desenladrillará?", 15, "trabalenguas", 3],
  ["Como poco coco como, poco coco compro.", 12, "trabalenguas", 3],
  ["Pepe Pecas pica papas con un pico.", 11, "trabalenguas", 3],
  ["El perro de San Roque no tiene rabo.", 11, "trabalenguas", 3],
  ["Erre con erre cigarro, erre con erre barril.", 12, "trabalenguas", 3],
  // ---- d4 · trabalenguas de fondo (7) ----
  ["El perro de San Roque no tiene rabo porque Ramón Ramírez se lo ha cortado.", 18, "trabalenguas", 4],
  ["Rápido ruedan los carros cargados de azúcar del ferrocarril.", 15, "trabalenguas", 4],
  ["París, Pekín y Nueva York: pocos pueblos, pocas plazas.", 14, "trabalenguas", 4],
  ["La lulú le lee la Biblia a Lulú en la lila leonera de Lulo.", 17, "trabalenguas", 4],
  ["Cuando cuentes cuentos, cuenta cuántos cuentos cuentas.", 14, "trabalenguas", 4],
  ["Hoy ya es hoy y no es ayer, porque si fuera ayer, hoy sería mañana.", 17, "trabalenguas", 4],
  ["Coco cocomoco, comadreja con mojo de coco y coca con choco.", 16, "trabalenguas", 4],
  // ---- d5 · citas del mar para los capitanes (8) ----
  ["Navegar es necesario; vivir, no es necesario.", 14, "cita", 5],
  ["El mar es un desierto con olas y el desierto, un mar sin agua.", 16, "cita", 5],
  ["Nadie se baña dos veces en el mismo río, ni dos veces en la misma ola.", 18, "cita", 5],
  ["El que no arriesga un cabo, no pesca una isla entera.", 15, "cita", 5],
  ["Cada ola es una frase que el mar escribe y borra.", 14, "cita", 5],
  ["Mar sereno, navegante atento: la calma también se lee.", 14, "cita", 5],
  ["Escribir es navegar: el puerto lo pone la última coma.", 15, "cita", 5],
  ["La tinta es el mar del escritor y el faro, su ortografía.", 16, "cita", 5],
];

function cefrOf(d: number): TipeoExercise["cefr"] {
  return d <= 1 ? "A1" : d === 2 ? "A2" : d === 3 ? "B1" : d === 4 ? "B2" : "C1";
}

const FLAVOR_LABEL: Record<TipeoExercise["flavor"], string> = {
  frase: "frase",
  trabalenguas: "trabalenguas",
  cita: "cita del mar",
};

export const TIPEO_PACK: TipeoExercise[] = ROWS.map(([sentence, targetSeconds, flavor, d], i) => ({
  id: `tp-${String(i + 1).padStart(2, "0")}`,
  type: "tipeo" as const,
  skill: "ortografia" as const,
  difficulty: d as TipeoExercise["difficulty"],
  cefr: cefrOf(d),
  prompt: `Duelo de tipeo · ${FLAVOR_LABEL[flavor]}`,
  explanation:
    "Copia la frase exacta, con sus tildes y sus signos. La velocidad llega sola cuando la precisión ya vive contigo.",
  tags: ["tipeo", "mecanografía", flavor],
  sentence,
  targetSeconds,
  flavor,
}));
