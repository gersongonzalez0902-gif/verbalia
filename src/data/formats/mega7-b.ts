import type { EligeExercise, SkillId } from "@/types";
import { CEFR_BY_DIFFICULTY, fmtId } from "./shared";

/**
 * Mega-7 · Pack B (Ciudad de la Gramática, 10 juegos nuevos).
 * Acuerdos, ser/estar, por/para, subjuntivo, tiempos, pronombres,
 * relativos, estilo indirecto, pasiva y género gramatical.
 */

const SKILL: SkillId = "gramatica";

type Row = [string, string[], number, string, 1 | 2 | 3 | 4 | 5];

function elige(
  prefix: string,
  type: EligeExercise["type"],
  rows: Row[],
  prompt: string,
  question: string,
): EligeExercise[] {
  return rows.map(([context, options, answerIndex, explanation, difficulty], i) => ({
    id: fmtId(prefix, "ciudad", i),
    type,
    skill: SKILL,
    difficulty,
    cefr: CEFR_BY_DIFFICULTY[difficulty],
    prompt,
    context,
    question,
    options,
    answerIndex,
    explanation,
    tags: ["gramática"],
  }));
}

/* ============================ Acuerdos perfectos ============================ */
export const CONCORDANCIA_PACK = elige(
  "cc",
  "concordancia",
  [
    ["Las ___ flores del jardín ya brotaron.", ["blancas", "blancos", "blanca"], 0, "Flores es femenino plural: el adjetivo debe ser blancas.", 1],
    ["El problema ___ sin resolver desde ayer.", ["sigue", "siguen", "seguen"], 0, "Problema es masculino singular aunque acaba en -a: el verbo va en singular.", 2],
    ["Me gustan ___ música clásica.", ["la", "el", "las"], 0, "Música es femenina singular: la.", 1],
    ["La mitad de los alumnos ___ ausente.", ["está", "están", "estamos"], 0, "Con «la mitad de…» la concordancia habitual respeta el núcleo singular: está.", 4],
    ["El agua ___ cristalina.", ["está", "están", "estamos"], 0, "Agua va con artículo el, pero sigue siendo singular femenina: está.", 2],
    ["___ fotos que enseñaste son preciosas.", ["Estas", "Estos", "Esto"], 0, "Fotos (fotografías) es femenino: estas.", 1],
    ["El arma ___ en la vitrina.", ["estaba", "estaban", "estabamos"], 0, "Arma: femenina con artículo el por empezar en a tónica; verbo en singular.", 3],
    ["La mitad de los estudiantes ___ hoy.", ["falta", "faltan", "faltáis"], 0, "Con «la mitad de + plural» la concordancia más común respeta el sujeto singular: falta (aunque falta/faltan conviven).", 5],
    ["Un y dos ___ cien.", ["son", "es", "ser"], 0, "En las operaciones, el verbo copia al resultado: son.", 3],
    ["Una ___ muy simpática nos atendió.", ["señora", "señor", "señoras"], 0, "El artículo una exige femenino singular: señora.", 2],
  ],
  "Acuerdos perfectos",
  "¿Qué opción concuerda con la frase?",
);

/* ============================ Faro Ser/Estar ============================ */
export const SERESTAR_PACK = elige(
  "se",
  "serestar",
  [
    ["La sopa ___ muy caliente: acaba de salir del fuego.", ["está", "es", "sea"], 0, "El calor de la sopa es un estado pasajero: estar.", 1],
    ["María ___ de Argentina.", ["es", "está", "esta"], 0, "El origen se dice con ser.", 1],
    ["La fiesta ___ en casa de Luis.", ["es", "está", "será"], 0, "El lugar de un evento: ser.", 2],
    ["Hoy ___ muy cansado: corrí diez kilómetros.", ["estoy", "soy", "este"], 0, "El cansancio es estado: estar.", 1],
    ["La ventana ___ abierta.", ["está", "es", "esta"], 0, "La condición de la ventana: estar.", 1],
    ["Ese señor ___ muy aburrido (es aburrido por naturaleza).", ["es", "está", "sea"], 0, "Ser aburrido = cualidad permanente; estar aburrido = estado de hoy.", 3],
    ["¡Cuánta gente! El metro ___ lleno hoy.", ["está", "es", "están"], 0, "Hoy lleno, mañana vacío: estado con estar.", 2],
    ["___ las diez de la noche.", ["Son", "Están", "Es"], 0, "La hora se dice con ser: son las diez.", 2],
    ["La manzana ___ verde (todavía no madura).", ["está", "es", "sea"], 0, "Verde por no madurar: estado, estar.", 3],
    ["Mi hermano ___ alto como mi padre.", ["es", "está", "esta"], 0, "La altura es cualidad: ser.", 2],
  ],
  "Faro Ser / Estar",
  "¿Ser o estar completa la frase?",
);

/* ============================ Brújula Por/Para ============================ */
export const PORPARA_PACK = elige(
  "pp",
  "porpara",
  [
    ["Este regalo es ___ ti.", ["para", "por", "por a"], 0, "Destinatario: para.", 1],
    ["Caminamos ___ el parque toda la tarde.", ["por", "para", "par"], 0, "Lugar por donde se camina: por.", 1],
    ["Gracias ___ venir.", ["por", "para", "por a"], 0, "La causa del agradecimiento: por.", 2],
    ["Salimos ___ Madrid mañana.", ["para", "por", "por el"], 0, "Destino del viaje: para.", 2],
    ["Todavía no está listo: está ___ hacer.", ["por", "para", "pro"], 0, "Estar por + infinitivo = pendiente.", 3],
    ["Pagó veinte euros ___ el libro.", ["por", "para", "par"], 0, "El precio de intercambio: por.", 2],
    ["Estudio ___ ser médico.", ["para", "por", "por fin"], 0, "Finalidad u objetivo: para.", 2],
    ["___ mí que miente, no lo llames.", ["Para", "Por", "Por"], 0, "Para mí (en mi opinión): con matiz subjetivo.", 4],
    ["Lo hizo ___ ti, no por él.", ["por", "para", "par"], 0, "La causa o motivo: por ti.", 3],
    ["Está lloviendo ___ todas partes.", ["por", "para", "pro"], 0, "Distribución en el espacio: por.", 3],
  ],
  "Brújula Por / Para",
  "¿Por o para encaja en la frase?",
);

/* ============================ Modo subjuntivo ============================ */
export const SUBJUNTIVO_PACK = elige(
  "sj",
  "subjuntivo",
  [
    ["Quiero que ___ pronto.", ["vengas", "vienes", "vendrás"], 0, "Querer que + subjuntivo: vengas.", 2],
    ["Ojalá ___ sol mañana.", ["haga", "hace", "hará"], 0, "Ojalá siempre llama al subjuntivo: haga.", 2],
    ["Cuando ___ mayores, entenderás.", ["seas", "eres", "serás"], 0, "Futuro con «cuando»: subjuntivo (seas).", 3],
    ["Espero que no ___ nada.", ["pese", "pesa", "pesará"], 0, "Esperar que + subjuntivo.", 2],
    ["Si ___ tiempo, viajaría.", ["tuviera", "tengo", "tendré"], 0, "Hipótesis irreal: imperfecto de subjuntivo (tuviera).", 3],
    ["Me molesta que ___ tan ruido.", ["hagan", "hacen", "harán"], 0, "Me molesta que + subjuntivo.", 3],
    ["Es posible que ___ a la fiesta.", ["vaya", "va", "irá"], 0, "Es posible que + subjuntivo: vaya.", 2],
    ["No creo que ___ razón.", ["tenga", "tiene", "tendrá"], 0, "No creer que + subjuntivo.", 3],
    ["Antes de que ___, cierra la puerta.", ["salgas", "sales", "saldrás"], 0, "Antes de que + subjuntivo.", 4],
    ["Aunque me lo pidas, no ___ el secreto.", ["revele", "revelo", "revelaré"], 0, "Aunque + subjuntivo con valor concesivo: no revele.", 5],
  ],
  "Modo subjuntivo",
  "¿Qué forma del verbo pide la frase?",
);

/* ============================ Reloj de tiempos ============================ */
export const TIEMPOS_PACK = elige(
  "tm",
  "tiempos",
  [
    ["Ayer ___ al cine con Ana.", ["fui", "voy", "iré"], 0, "Pasado terminado de ayer: pretérito perfecto simple, fui.", 1],
    ["Ahora mismo ___ un pastel.", ["horneo", "horneé", "horneaba"], 0, "Acción en curso ahora: presente.", 1],
    ["Cuando era niño, ___ en un árbol.", ["jugaba", "jugué", "juego"], 0, "Acción habitual en el pasado: imperfecto, jugaba.", 2],
    ["Mañana a esta hora ___ en la playa.", ["estaré", "estoy", "estuve"], 0, "Futuro: estaré.", 1],
    ["Si hubieras llamado, ___ contestado.", ["habría", "habré", "he"], 0, "Condicional compuesto: habría contestado.", 4],
    ["___ vivido aquí desde 2010.", ["He", "Hago", "Habré"], 0, "Desde 2010 hasta ahora: pretérito perfecto compuesto, he vivido.", 2],
    ["El año pasado ___ a Galicia.", ["viajamos", "viajábamos", "viajaremos"], 0, "Acción acabada el año pasado: viajamos (perfecto simple).", 2],
    ["Cada verano ___ a la sierra.", ["subimos", "subimos ayer", "subiremos"], 0, "Cada verano marca costumbre: presente habitual, subimos.", 2],
    ["Antes ___ más despacio, ahora todo va rápido.", ["vivíamos", "vivimos", "viviremos"], 0, "El «antes» pide imperfecto: vivíamos.", 3],
    ["Para diciembre ___ el libro.", ["habré terminado", "he terminado", "terminaba"], 0, "Futuro perfecto: habré terminado.", 5],
  ],
  "Reloj de tiempos",
  "¿Qué tiempo verbal encaja?",
);

/* ============================ Relevo de pronombres ============================ */
export const PRONOMBRES_PACK = elige(
  "pn",
  "pronombres",
  [
    ["¿Le das el libro a María? — Sí, ___ doy.", ["se lo", "le lo", "se le"], 0, "Le + lo se convierte en se lo.", 2],
    ["¿Compraste las entradas? — Sí, ___ compré.", ["las", "los", "les"], 0, "Entradas femeninas: las.", 1],
    ["Ayer ___ entregaron el premio.", ["me", "mío", "yo"], 0, "Pronombre de objeto directo: me.", 2],
    ["¿Le escribiste a tu abuela? — Sí, ___ escribí anoche.", ["le", "lo", "la"], 0, "Objeto indirecto: le.", 2],
    ["Estos papeles son para Juan: dáselos. — Ya ___ di.", ["se los", "les los", "se las"], 0, "A Juan (le→se) + los papeles: se los.", 3],
    ["Necesito hablar con ustedes. — ___ escuchamos.", ["Lo", "Les", "Las"], 0, "Hablar A alguien: objeto indirecto, les.", 4],
    ["Mi hermano no levanta la ropa. Nunca ___ levanta.", ["la", "le", "lo"], 0, "La ropa: la.", 1],
    ["¿Os gusta el helado? — Sí, ___ encanta.", ["nos", "os", "se"], 0, "Gustar a vosotros: os encanta.", 3],
    ["El paquete llegó: ___ enviaron desde Lima.", ["me lo", "me le", "lo me"], 0, "A mí (me) + el paquete (lo): me lo enviaron.", 3],
    ["Voy a contar el cuento a los niños. Voy a ___ contar.", ["contárselo", "contarle lo", "contarles el"], 0, "Contar + se (a ellos) + lo (el cuento): contárselo.", 5],
  ],
  "Relevo de pronombres",
  "¿Qué pronombre sustituye lo subrayado?",
);

/* ============================ Prismas relativos ============================ */
export const RELATIVOS_PACK = elige(
  "rl",
  "relativos",
  [
    ["La casa ___ viví era azul.", ["donde", "que", "cual"], 0, "Lugar físico: donde.", 2],
    ["El libro ___ me prestaste es buenísimo.", ["que", "quien", "donde"], 0, "Objeto directo con antecedente cosa: que.", 1],
    ["Ana, ___ vive en Quito, es mi prima.", ["quien", "que", "cual"], 0, "Entre comas con persona: quien (o que, pero quien es el culto aquí).", 3],
    ["Todo ___ dijimos resultó cierto.", ["lo que", "que el", "quien"], 0, "Antecedente difuso «todo»: lo que.", 4],
    ["El motivo por ___ llegué tarde fue el tráfico.", ["el que", "que", "quien"], 0, "Por el que / por el cual: construcciones fijas.", 4],
    ["No hay nada ___ temer.", ["que", "quien", "donde"], 0, "Nada que temer: que.", 2],
    ["Esta es la calle ___ nació mi madre.", ["en la que", "que en", "quien"], 0, "También válido «donde»: en la que.", 3],
    ["Los alumnos ___ estudian aprueban.", ["que", "quienes que", "los que el"], 0, "Con antecedente expreso plural, que (o quienes).", 2],
    ["Fue entonces ___ lo entendí todo.", ["cuando", "que", "donde"], 0, "Tiempo: cuando.", 3],
    ["Su sonrisa, ___ era enorme, iluminó la sala.", ["la cual", "que la", "donde"], 0, "Tras coma y lejos del antecedente: la cual.", 5],
  ],
  "Prismas relativos",
  "¿Qué relativo encaja en el hueco?",
);

/* ============================ Eco directo (estilo) ============================ */
export const ESTILO_PACK = elige(
  "st",
  "estilo",
  [
    ["«Tengo hambre», dijo Ana. → Ana dijo que ___ hambre.", ["tenía", "tiene", "tendrá"], 0, "El presente retrocede a imperfecto en el estilo indirecto.", 2],
    ["«Vendré mañana», dijo él. → Dijo que ___ al día siguiente.", ["vendría", "vendré", "vengo"], 0, "El futuro se convierte en condicional.", 3],
    ["«¿Dónde vives?», me preguntó. → Me preguntó dónde ___.", ["vivía", "vives", "viviría"], 0, "Pregunta indirecta: interrogativo + imperfecto.", 3],
    ["«Cierra la puerta», ordenó. → Me ordenó que ___ la puerta.", ["cerrara", "cierra", "cerraré"], 0, "Las órdenes pasan a subjuntivo: cerrara.", 4],
    ["«Sal de aquí», gritó. → Gritó que ___.", ["saliera", "salgo", "salió"], 0, "Imperativo → subjuntivo imperfecto.", 4],
    ["«He terminado», avisó. → Avisó que ___ terminado.", ["había", "ha", "habrá"], 0, "El perfecto compuesto retrocede a pluscuamperfecto.", 4],
    ["«Mañana es fiesta», anunció. → Anunció que al día siguiente ___ fiesta.", ["era", "es", "será"], 0, "Con marcador de tiempo nuevo, el presente pasa a imperfecto.", 3],
    ["«Lo haré yo mismo», prometió. → Prometió hacerlo ___ .", ["él mismo", "yo mismo", "ella"], 0, "La persona cambia: yo mismo pasa a él mismo (quien promete).", 5],
    ["«Aquí hace frío», comentó. → Comentó que ___ hacía frío.", ["allí", "aquí", "ahora"], 0, "Los deícticos se desplazan: aquí → allí.", 5],
    ["«¿Quieres café?», ofreció. → Me ofreció ___.", ["café", "si quería café", "un café"], 0, "La pregunta directa se integra con «si»: si quería café.", 4],
  ],
  "Eco directo",
  "¿Cómo se dice en estilo indirecto?",
);

/* ============================ Voz pasiva ============================ */
export const PASIVA_PACK = elige(
  "pa",
  "pasiva",
  [
    ["El cartero entrega las cartas. → Las cartas ___ por el cartero.", ["son entregadas", "es entregada", "están entregando"], 0, "Sujeto plural + ser en plural: son entregadas.", 2],
    ["Miguel de Cervantes escribió el Quijote. → El Quijote ___ por Cervantes.", ["fue escrito", "era escrito", "fue escrita"], 0, "Pasado + masculino singular: fue escrito.", 2],
    ["Todos respetan a la maestra. → La maestra ___ por todos.", ["es respetada", "es respetado", "está respetada"], 0, "Ser + participio que concuerda: es respetada.", 2],
    ["La ciudad reconstruirá el puente. → El puente ___ por la ciudad.", ["será reconstruido", "es reconstruido", "fue reconstruido"], 0, "Futuro: será reconstruido.", 3],
    ["Han vendido la casa. → La casa ___ vendida.", ["ha sido", "ha estado", "es sido"], 0, "Perfecto compuesto pasivo: ha sido vendida.", 4],
    ["La gente habla español aquí. → El español ___ aquí.", ["se habla", "es hablado por la gente siempre", "está hablado"], 0, "En español real preferimos la pasiva refleja: se habla.", 3],
    ["Un rayo destruyó el árbol. → El árbol ___ por un rayo.", ["fue destruido", "fue destruida", "era destruido"], 0, "Masculino + pasado: fue destruido.", 2],
    ["Limpiaron las calles. → Las calles ___ .", ["fueron limpiadas", "fueron limpiado", "son limpiado"], 0, "Femenino plural: fueron limpiadas.", 3],
    ["Alguien robará el cuadro. → El cuadro ___ .", ["será robado", "será robada", "ha sido robado"], 0, "Futuro pasivo: será robado.", 3],
    ["Se prohíbe fumar. → Fumar ___ .", ["está prohibido", "es prohíbido", "está prohibiendo"], 0, "Resultado con estar + participio (pasiva de estado): está prohibido.", 4],
  ],
  "Voz pasiva",
  "¿Cuál es la forma pasiva correcta?",
);

/* ============================ Género y número ============================ */
export const GENERO_PACK = elige(
  "ge",
  "genero",
  [
    ["___ problema es complicado.", ["El", "La", "Los"], 0, "Problema es masculino pese a la -a: el.", 1],
    ["___ mano derecha escribe mejor.", ["La", "El", "Las"], 0, "Mano es femenina: la mano.", 2],
    ["___ artista expuso ayer.", ["El/La", "Los", "Las"], 0, "Artista es de género común: el artista o la artista.", 2],
    ["Necesito ___ información adicional.", ["información", "una información", "unas informaciones"], 0, "Información es singular incontable en uso normal (las informaciones es administrativo).", 3],
    ["Compré ___ viaje redondo.", ["un", "una", "uno"], 0, "Viaje es masculino: un.", 1],
    ["Tres ___ de agua, por favor.", ["vasos", "vasas", "vasos y vasas"], 0, "Vaso masculino: vasos.", 1],
    ["La ___ del reloj está rota.", ["aguja", "agujo", "agujas"], 0, "Aguja es femenina: la aguja.", 1],
    ["El ___ avisa del peligro.", ["guardia civil", "guardia civil masculino", "guardias civiles"], 0, "Guardia civil: el agente es masculino (la guardia es la institución, femenina).", 4],
    ["Unos ___ emocionantes.", ["análisis", "análisis", "análises"], 0, "Análisis es invariable en el plural: unos análisis.", 4],
    ["El ___ del año pasado fue bueno.", ["rendimiento", "rendimienta", "rendimientos"], 0, "Rendimiento es masculino singular: el rendimiento.", 3],
  ],
  "Género y número",
  "¿Qué forma es la correcta?",
);
