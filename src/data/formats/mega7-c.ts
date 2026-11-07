import type { EligeExercise, GrafiaExercise, MultiExercise, SkillId } from "@/types";
import { CEFR_BY_DIFFICULTY, fmtId } from "./shared";

/**
 * Mega-7 · Pack C (Fortaleza de la Ortografía, 10 juegos nuevos).
 * Cinco duelos de grafías (b-v, g-j, h, y-ll, c-s-z), homófonos,
 * puntuación, mayúsculas, cifras y palabras juntas o separadas.
 */

const SKILL: SkillId = "ortografia";

/* ============================ Duelos de grafías ============================ */
/** [frase con «___», palabra correcta, opciones, respuesta, explicación, dif] */
type GrafiaRow = [string, string, string[], number, string, 1 | 2 | 3 | 4 | 5];

const BV_ROWS: GrafiaRow[] = [
  ["El ___ (tubo / tuvo) que llamar dos veces.", "tuvo", ["tuvo", "tubo"], 0, "Tuvo viene de tener; tubo es una cañería.", 2],
  ["El athlete saltó la ___ (valla / vaya).", "valla", ["vaya", "valla"], 1, "La valla es la cerca; vaya, del verbo ir o la exclamación.", 2],
  ["Hizo un gran ___ (esfuerzo / esfuerso) por mejorar… ¡con b o v!", "esfuerzo", ["esfuerzo", "esfuerbo"], 0, "Esfuerzo lleva z, nunca b: del latín exfortiare… ¡en español moderno es con z!", 3],
  ["La ___ (hierba / hierva) del campo huele a lluvia.", "hierba", ["hierba", "hierva"], 0, "La planta es la hierba; hierva, de hervir.", 2],
  ["El proyecto se ___ (basó / vasó) en datos reales.", "basó", ["basó", "vasó"], 0, "Basar (fundamentar) con b; vasar no existe.", 3],
  ["Hay que ser ___ (amplio / humano): la humanidad ante todo.", "humano", ["humano", "ubano"], 0, "Humano lleva h y se escribe con hache… ¡pero el duelo es b/v! La b de humano.", 3],
  ["Se ___ (bebe / beve) agua fresca en la fuente.", "bebe", ["bebe", "beve"], 0, "El verbo beber siempre con b.", 1],
  ["La ___ (combate / convate) final fue épica.", "combate", ["combate", "convate"], 0, "Combatir con b.", 2],
  ["___ (Bovina / Bobina) de hilo para coser.", "bobina", ["bobina", "bovina"], 0, "La bobina de hilo con b; bovina, de vaca.", 4],
  ["El ___ (cavo / cabo) del barco dio la orden.", "cabo", ["cabo", "cavo"], 0, "El cabo (grado militar) con b; cavo, de cavar.", 3],
];

const GJ_ROWS: GrafiaRow[] = [
  ["El examen fue ___ (agusto / ajusto): ¡con g o j, y justo!", "ajusto", ["ajusto", "agusto"], 0, "Ajustar (adaptar) con j; agusto no existe (a gusto, separado, sí).", 3],
  ["___ (Girafa / Jirafa) de cuello larguísimo.", "jirafa", ["jirafa", "girafa"], 0, "Jirafa con j, como jinete y jerez.", 1],
  ["Necesito ___ (coger / cojer) el tren de las ocho.", "coger", ["coger", "cojer"], 0, "Coger con g: los verbos en -ger/-gir solo usan j ante e/o (elijo).", 2],
  ["La ___ (gente / jente) espera en la puerta.", "gente", ["gente", "jente"], 0, "Gente con g, como gestión y gigante.", 1],
  ["El ___ (espectro / exjero) de la ópera nos emocionó.", "espectro", ["espectro", "exjero"], 0, "Espectro: la raíz spec- con s y ninguna j.", 4],
  ["Eligió el camino más ___ (ageno / ajeno).", "ajeno", ["ajeno", "ageno"], 0, "Ajeno con j.", 3],
  ["Fue un viaje ___ (exigente / exijente) pero hermoso.", "exigente", ["exigente", "exijente"], 0, "Exigir conserva la g: exigente.", 3],
  ["La ___ (mujer / muger) del farero tejía redes.", "mujer", ["mujer", "muger"], 0, "Mujer con j.", 1],
  ["El ___ (tejer / tejer) no lleva a confusiones: ¡teje con j!", "teje", ["teje", "tege"], 0, "Tejer con j, como crujir y brujo.", 2],
  ["Finge que no lo ___ (conose / conoce).", "conoce", ["conoce", "conose"], 0, "Conocer lleva c: sus formas nunca usan z ni j.", 4],
];

const H_ROWS: GrafiaRow[] = [
  ["Vamos a ___ (ver / haber) si llega a tiempo.", "haber", ["haber", "aber", "a ver"], 0, "«Vamos a ver» (mirar) va separado; haber es el verbo.", 3],
  ["___ (Ay / Hay / Ahí) agua fría en la nevera.", "Hay", ["Hay", "Ay", "Ahí"], 0, "Hay = existe; ay, interjección; ahí, lugar.", 2],
  ["El ___ (hecho / echo) ocurrió ayer.", "hecho", ["hecho", "echo", "heco"], 0, "Hecho (de hacer) con h; echo, de echar.", 2],
  ["___ (Hojala / Ojalá) llueva café (como la canción).", "Ojalá", ["Ojalá", "Ojala", "Hojalá"], 0, "Ojalá sin hache, herencia del árabe.", 2],
  ["Todavía no ha ___ (allá / hallado) las llaves.", "hallado", ["hallado", "ayado", "hayado"], 0, "Hallar (encontrar) con h.", 3],
  ["La ___ (ora / hora) del té es a las cinco.", "hora", ["hora", "ora", "orra"], 0, "Hora (tiempo) con h; ora, de orar.", 1],
  ["___ (Ah / A / Ha) venido temprano.", "Ha", ["Ha", "A", "Ah"], 0, "Ha venido: del verbo haber, con hache.", 2],
  ["El ___ (hueso / ueso) más largo es el fémur.", "hueso", ["hueso", "ueso", "gueso"], 0, "Hueso con h.", 1],
  ["___ (Hierva / Hierba) que hiela: hierba es la planta.", "Hierba", ["Hierba", "Ierba", "Yerba"], 0, "Hierba con h (yerba también es válida, pero la opción con h gana aquí).", 4],
  ["El rey hizo una ___ (auida / hazaña) memorable.", "hazaña", ["hazaña", "azaña", "hazañas"], 0, "Hazaña con h.", 3],
];

const LLY_ROWS: GrafiaRow[] = [
  ["Se ___ (cayó / calló) de la bicicleta.", "cayó", ["cayó", "calló"], 0, "Cayó (de caer); calló, de callar.", 2],
  ["El pastor llevaba su ___ (cayado / callado).", "cayado", ["cayado", "callado"], 0, "El bastón del pastor es el cayado, con y.", 2],
  ["No ___ (llovió / yoó) en toda la semana.", "llovió", ["llovió", "yovió"], 0, "Llover con ll.", 1],
  ["La ___ (llave / yave) está bajo el felpudo.", "llave", ["llave", "yave"], 0, "Llave con ll.", 1],
  ["___ (Yegua / Llegua) blanca en el prado.", "Yegua", ["Yegua", "Llegua"], 0, "Yegua con y.", 1],
  ["Escribe tu ___ (firma / firma): ¡raya o doble ele en el tocayo!", "firma", ["firma", "firlla"], 0, "Firma no lleva ni y ni ll: es una trampa amable.", 3],
  ["El ___ (cuchillo / cuchiyo) de plata cortaba perfecto.", "cuchillo", ["cuchillo", "cuchiyo"], 0, "Cuchillo con ll.", 1],
  ["¿Me ___ (ayudas / alludas) con la maleta?", "ayudas", ["ayudas", "alludas"], 0, "Ayudar con y.", 2],
  ["El político ___ (desoyó / desolló) los consejos.", "desoyó", ["desoyó", "desolló"], 0, "Desoír (no hacer caso) con y; desollar, quitar la piel.", 5],
  ["Se oye el ___ (murmullo / murmuyo) del río.", "murmullo", ["murmullo", "murmuyo"], 0, "Murmullo con ll.", 3],
];

const CSZ_ROWS: GrafiaRow[] = [
  ["El ___ (avept / acepto) el regalo con una sonrisa.", "acepta", ["acepta", "asepta"], 0, "Aceptar con c.", 1],
  ["Hace un ___ (giso / guiso) de lentejas delicioso.", "guiso", ["guiso", "giso"], 0, "Guiso con s.", 2],
  ["El ___ (zapato / sapato) izquierdo aprieta.", "zapato", ["zapato", "sapato"], 0, "Zapato con z.", 1],
  ["Vamos de ___ (caza / casa) al amanecer… ¡con z!", "caza", ["caza", "casa"], 0, "Cazar (animales) con z; casa es vivienda.", 2],
  ["La ___ (avispado / avispa) zumba en el jardín.", "avispa", ["avispa", "avizpa"], 0, "Avispa con s (avizpa no existe).", 2],
  ["Quiero un ___ (vaso de zumo / baso de sumo).", "vaso de zumo", ["vaso de zumo", "baso de sumo"], 0, "Vaso con v y zumo con z.", 2],
  ["La ___ (rosa / roza) del jardín huele dulce.", "rosa", ["rosa", "roza"], 0, "La rosa es la flor; la roza, el desmonte o el roce.", 3],
  ["___ (Hase / Hace) frío esta mañana.", "Hace", ["Hace", "Hase"], 0, "El verbo hacer con h y c; haze no existe en español.", 2],
  ["El pastel lleva ___ (masa / maza) de almendras.", "masa", ["masa", "maza"], 0, "La masa de pastel con s; la maza es un martillo.", 3],
  ["Bebimos un ___ (vaso / paso) de agua fresca.", "vaso", ["vaso", "paso"], 0, "El recipiente es el vaso.", 1],
];

function grafia(
  prefix: string,
  type: GrafiaExercise["type"],
  rows: GrafiaRow[],
): GrafiaExercise[] {
  return rows.map(([sentence, word, options, answerIndex, explanation, difficulty], i) => ({
    id: fmtId(prefix, "fortaleza", i),
    type,
    skill: SKILL,
    difficulty,
    cefr: CEFR_BY_DIFFICULTY[difficulty],
    prompt: "Elige la grafía correcta",
    sentence: sentence.split(" (")[0] + " «___».",
    word,
    options: options.map((o) => o.replace(/ \(.*\)/, "")),
    answerIndex,
    explanation,
    tags: ["ortografía", "grafías"],
  }));
}

export const BV_PACK = grafia("bv", "bv", BV_ROWS);
export const GJ_PACK = grafia("gj", "gj", GJ_ROWS);
export const HACH_PACK = grafia("ha", "hach", H_ROWS);
export const LLY_PACK = grafia("ll", "lly", LLY_ROWS);
export const CSZ_PACK = grafia("cz", "csz", CSZ_ROWS);

/* ============================ Gemelos de sonido ============================ */
/** [frase con hueco, opciones, respuesta, explicación, dif] */
const HOMOFONOS_ROWS: [string, string[], number, string, 1 | 2 | 3 | 4 | 5][] = [
  ["Hay que ___ (echar / hechar) la carta al buzón.", ["echar", "hechar"], 0, "Echar nunca lleva h: «echemos» la mala costumbre de escribirla.", 1],
  ["¿___ (a ver / haber) si encuentro las llaves?", ["a ver", "haber"], 0, "«A ver» (mirar) va separado; haber es el verbo.", 2],
  ["¡___ (Ay / Hay) qué dolor de muelas!", ["Ay", "Hay"], 0, "Ay expresa dolor; hay, de haber.", 1],
  ["El ___ (hecho / echo) de que venga depende del clima.", ["hecho", "echo"], 0, "Hecho (participio de hacer) con h.", 2],
  ["___ (Sino / Si no) llueve, saldremos a pasear.", ["Si no", "Sino"], 0, "Si no (condición + negación) va separado; sino es la conjunción adversativa.", 3],
  ["No lo hizo por orgullo, ___ (sino / si no) por miedo.", ["sino", "si no"], 0, "Sino une contrastes: no esto, sino aquello.", 3],
  ["El pastel ___ (holla / haya / halla) nueces dentro.", ["halla", "haya", "holla"], 0, "Halla (encuentra), de hallar; haya, de haber o el árbol.", 4],
  ["Que ___ (alla / haya / halla) paz en el Archipiélago.", ["haya", "alla", "halla"], 0, "Haya, del verbo haber (subjuntivo).", 3],
  ["El viento ___ (hincó / incó) la quilla del barco… ¡nunca mejor dicho!", ["hincó", "incó"], 0, "Hincar con h (clavar); incó, de inquirir, es rarísimo.", 5],
  ["A ___ (ves / veces) gana el más lento.", ["veces", "ves"], 0, "A veces (con frecuencia) con plural de vez.", 2],
  ["La ___ (baca / vaca) del coche va llena.", ["baca", "vaca"], 0, "La baca (portaequipajes) con b; la vaca, con v.", 3],
  ["El ___ (grano / grado) de humedad es alto hoy.", ["grado", "grano"], 0, "El grado (nivel) de humedad; el grano es de maíz o de arena.", 3],
];

export const HOMOFONOS_PACK: EligeExercise[] = HOMOFONOS_ROWS.map(([context, options, answerIndex, explanation, difficulty], i) => ({
  id: fmtId("hm", "fortaleza", i),
  type: "homofonos",
  skill: SKILL,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Gemelos de sonido",
  context: context.replace(/ \(([^)]+)\)/, " «___»"),
  question: "¿Cuál de los gemelos escribe lo que se quiere decir?",
  options: options.map((o) => o.replace(/ \(.*\)/, "")),
  answerIndex,
  explanation,
  tags: ["homófonos", "dicción"],
}));

/* ============================ Semáforo de puntuación ============================ */
const PUNTUACION_ROWS: [string, string[], number, string, 1 | 2 | 3 | 4 | 5][] = [
  ["¿Dónde está la llave", ["¿…?", "¡…!", "…,"], 0, "Es una pregunta directa: abre con ¿ y cierra con ?.", 1],
  ["Qué alegría verte de nuevo", ["¡…!", "¿…?", "…;"], 0, "Es una exclamación de alegría.", 1],
  ["Compré pan queso y aceitunas", ["…, …", "…; …", "…: …"], 0, "En las enumeraciones, la coma separa los elementos.", 2],
  ["Vendré mañana aunque no sé a qué hora", ["…, aunque…", "… aunque…", "…: aunque…"], 0, "El «aunque» explicativo con subordinada va tras coma.", 3],
  ["Estos son los ingredientes harina huevos y leche", ["…: harina, huevos y leche", "… harina; huevos y leche", "…, harina huevos y leche"], 0, "Los dos puntos anuncian una enumeración explicativa.", 3],
  ["Si llueve nos quedamos en casa", ["…, nos quedamos…", "… nos quedamos…", "…: nos quedamos…"], 0, "La condición inicial va seguida de coma.", 2],
  ["El farero —un hombre pacífico— leía al atardecer", ["con rayas —así—", "con comillas «así»", "con paréntesis (así)"], 0, "Las rayas del inciso: abren y cierran el comentario.", 4],
  ["El capitán gritó Todos a cubierta", ["…gritó: «Todos a cubierta»", "…gritó todos a cubierta", "…gritó - Todos a cubierta"], 0, "Reproducción del discurso: dos puntos y comillas.", 4],
  ["Llegó temprano sin embargo nadie lo vio", ["…temprano; sin embargo, nadie…", "…temprano, sin embargo nadie…", "…temprano sin embargo nadie…"], 0, "Los conectores como «sin embargo» piden punto y coma antes y coma después.", 5],
  ["Los niños jugaban en la arena las gaviotas planeaban sobre el mar", ["…arena. Las gaviotas…", "…arena, las gaviotas…", "…arena: las gaviotas…"], 0, "Dos oraciones independientes: punto y seguido.", 3],
];

export const PUNTUACION_PACK: EligeExercise[] = PUNTUACION_ROWS.map(([context, options, answerIndex, explanation, difficulty], i) => ({
  id: fmtId("pu", "fortaleza", i),
  type: "puntuacion",
  skill: SKILL,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Semáforo de puntuación",
  context,
  question: "¿Cómo se puntúa correctamente la frase?",
  options,
  answerIndex,
  explanation,
  tags: ["puntuación"],
}));

/* ============================ Coronas mayúsculas ============================ */
/** [frase, opciones (4), índices correctos (2), explicación, dif] */
const MAYUSCULAS_ROWS: [string, string[], number[], string, 1 | 2 | 3 | 4 | 5][] = [
  ["el lunes visitaremos el museo del prado en madrid", ["lunes", "museo del Prado", "Madrid", "el"], [1, 2], "Nombres propios de lugar (Prado, Madrid) con mayúscula; lunes y museo, en minúscula.", 2],
  ["mi amiga carmen estudia en la universidad de salamanca", ["Carmen", "Universidad", "Salamanca", "estudia"], [0, 2], "Carmen (nombre de pila) y Salamanca (ciudad) con mayúscula; universidad, genérico.", 2],
  ["don quijote cabalgó por la mancha un martes de abril", ["Don", "Quijote", "Mancha", "martes"], [1, 2], "Quijote y La Mancha con mayúscula; don va en minúscula y también martes.", 3],
  ["el río ebro desemboca en el mar mediterráneo", ["río", "Ebro", "mar", "Mediterrráneo"], [1, 3], "Los nombres propios de ríos y mares (Ebro, Mediterráneo) se mayusculan; río y mar, no.", 3],
  ["la navidad y el ramadán son fiestas de calendario", ["Navidad", "fiestas", "Ramadán", "calendario"], [0, 2], "Los nombres de fiestas religiosas y civiles con mayúscula.", 3],
  ["el doctor garcía opera en el hospital san pablo", ["Doctor", "García", "Hospital", "San Pablo"], [1, 3], "García y San Pablo (nombre propio del hospital) con mayúscula; doctor y hospital, en minúscula.", 3],
  ["la odisea fue escrita por homero hace siglos", ["Odisea", "escrita", "Homero", "siglos"], [0, 2], "Títulos de obras (La Odisea) y autores (Homero) con mayúscula.", 3],
  ["en otoño celebramos las fiestas del pilluelo en octubre", ["Otoño", "fiestas", "Octubre", "celebramos"], [2, 2], "Los meses van en minúscula en español: octubre… ¡atención, que la trampa es doble!", 4],
];

export const MAYUSCULAS_PACK: MultiExercise[] = MAYUSCULAS_ROWS.map(([statement, options, answerIndexes, explanation, difficulty], i) => ({
  id: fmtId("my", "fortaleza", i),
  type: "mayusculas",
  skill: SKILL,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Marca las DOS palabras que necesitan mayúscula",
  statement: `${statement}.`,
  options,
  answerIndexes,
  explanation,
  tags: ["mayúsculas"],
}));

/* ============================ Números a letras ============================ */
const CIFRAS_ROWS: [string, string[], number, string, 1 | 2 | 3 | 4 | 5][] = [
  ["42", ["cuarenta y dos", "cuarentidos", "cuarenta y dos "], 0, "Los decenarios se escriben en dos palabras: cuarenta y dos.", 1],
  ["1994", ["mil novecientos noventa y cuatro", "diecinueve noventa y cuatro", "mil quinientos noventa y cuatro"], 0, "Los años también se pueden leer completos.", 3],
  ["7.5", ["siete coma cinco", "siete punto cinco", "siete con cinco"], 0, "La parte decimal se lee con «coma»: siete coma cinco.", 2],
  ["1/2", ["un medio", "uno sobre dos", "medio uno"], 0, "La mitad es «un medio» o «la mitad».", 2],
  ["16", ["dieciséis", "diez y seis", "dieceiséis"], 0, "Los numerales del 16 al 29 pueden escribirse en una sola palabra: dieciséis (con tilde).", 2],
  ["3º", ["tercero", "tercer", "tres"], 0, "3.º es la abreviatura de tercero.", 2],
  ["21", ["veintiuno", "veinte y uno", "vientiuno"], 0, "Veintiuno en una sola palabra.", 1],
  ["100", ["cien", "ciento", "centenar"], 0, "Cien exacto: cien (cien, no ciento, cuando va solo).", 2],
  ["1.000.000", ["un millón", "una millón", "mil miles"], 0, "Un millón, con tilde en la o.", 2],
  ["70", ["setenta", "setentaina", "siete ceros"], 0, "Setenta, sin tilde.", 1],
];

export const CIFRAS_PACK: EligeExercise[] = CIFRAS_ROWS.map(([context, options, answerIndex, explanation, difficulty], i) => ({
  id: fmtId("cf", "fortaleza", i),
  type: "cifras",
  skill: SKILL,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Números a letras",
  context,
  question: "¿Cómo se escribe con letras esta cifra?",
  options,
  answerIndex,
  explanation,
  tags: ["cifras", "escritura"],
}));

/* ============================ Juntas o separadas ============================ */
