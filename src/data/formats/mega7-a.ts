import type {
  ClasificaExercise,
  EligeExercise,
  EscribeLibreExercise,
  MultiExercise,
  OrdenaExercise,
  SkillId,
} from "@/types";
import { CEFR_BY_DIFFICULTY, fmtId } from "./shared";

/**
 * Mega-7 · Pack A (Bosque del Vocabulario, 10 juegos nuevos).
 * Mecánicas: clasificar acentos, ordenar sílabas/grados/alfabeto,
 * analogías, colocaciones, polisemia, derivación, familias y
 * adivinanzas de diccionario.
 */

const SKILL: SkillId = "vocabulario";

/* ============================ Ritmo de acentos ============================ */
/** [palabra, tipo: a(aguda) | l(llana) | e(esdrújula), explicación, dif] */
const ACENTOS_ROWS: [string, "a" | "l" | "e", string, 1 | 2 | 3 | 4 | 5][] = [
  ["canción", "a", "Termina en -n: la fuerza cae en la última sílaba y lleva tilde.", 1],
  ["mesa", "l", "Termina en vocal y carga la fuerza en la penúltima: llana sin tilde.", 1],
  ["árbol", "l", "Llana terminada en consonante distinta de n/s: por eso su tilde.", 2],
  ["comí", "a", "Aguda terminada en vocal: tilde obligatoria.", 1],
  ["relámpago", "e", "La fuerza retrocede hasta la antepenúltima sílaba: esdrújula.", 2],
  ["cárcel", "l", "Llana terminada en -l: la tilde es obligatoria.", 2],
  ["sofá", "a", "Aguda terminada en vocal: siempre tildada.", 1],
  ["teléfono", "e", "Esdrújula: todas las esdrújulas llevan tilde sin excepción.", 2],
  ["razón", "a", "Aguda en -n con tilde diacrítica de origen latino.", 2],
  ["débil", "l", "Llana terminada en -l: la sílaba fuerte es dé- y lleva tilde.", 3],
  ["chícharo", "e", "Esdrújula mexicana: la fuerza cae en chí-.", 3],
  ["balón", "a", "Aguda terminada en -n: el acento cae en la última.", 1],
  ["examen", "l", "Llana terminada en -n: por eso NO lleva tilde.", 3],
  ["brújula", "e", "Esdrújula: fuerza en brú-, tilde irrenunciable.", 2],
  ["cortés", "a", "Aguda terminada en -s con tilde.", 3],
  ["azúcar", "l", "Llana terminada en -r: su tilde es obligatoria.", 3],
  ["sacapuntas", "a", "Compuesto agudo sin tilde: termina en -s y la fuerza cae al final.", 4],
  ["aeroplano", "l", "Llana terminada en vocal: aero-PLA-no, sin tilde.", 3],
  ["química", "e", "Esdrújula de las que adornan la ciencia.", 2],
  ["ajedrez", "a", "Aguda terminada en -z: la fuerza cae en -rez y no lleva tilde.", 4],
];

export const ACENTOS_PACK: ClasificaExercise[] = ACENTOS_ROWS.map(([word, type, explanation, difficulty], i) => {
  const buckets = ["Aguda", "Llana", "Esdrújula"];
  return {
    id: fmtId("ac", "bosque", i),
    type: "acentos",
    skill: SKILL,
    difficulty,
    cefr: CEFR_BY_DIFFICULTY[difficulty],
    prompt: "¿Dónde cae la fuerza de la palabra?",
    explanation,
    tags: ["acentuación", "prosodia"],
    item: word,
    buckets,
    answerIndex: type === "a" ? 0 : type === "l" ? 1 : 2,
  };
});

/* ============================ Taller de sílabas ============================ */
const SILABAS_ROWS: [string, string[], 1 | 2 | 3 | 4 | 5][] = [
  ["gato", ["ga", "to"], 1],
  ["mariposa", ["ma", "ri", "po", "sa"], 1],
  ["banana", ["ba", "na", "na"], 1],
  ["ventana", ["ven", "ta", "na"], 2],
  ["chocolate", ["cho", "co", "la", "te"], 2],
  ["elefante", ["e", "le", "fan", "te"], 2],
  ["biblioteca", ["bi", "bli", "o", "te", "ca"], 3],
  ["rayo", ["ra", "yo"], 2],
  ["estrella", ["es", "tre", "lla"], 3],
  ["murciélago", ["mur", "cié", "la", "go"], 4],
  ["aeropuerto", ["a", "e", "ro", "puer", "to"], 4],
  ["institución", ["ins", "ti", "tu", "ción"], 4],
];

export const SILABAS_PACK: OrdenaExercise[] = SILABAS_ROWS.map(([word, syllables, difficulty], i) => ({
  id: fmtId("si", "bosque", i),
  type: "silabas",
  skill: SKILL,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Une las sílabas en orden",
  explanation: `«${word}» se divide en ${syllables.join("-")}.`,
  tags: ["sílabas", "pronunciación"],
  items: syllables,
  criteria: "Toca las sílabas en el orden correcto para formar la palabra.",
}));

/* ============================ Puentes analógicos ============================ */
/** [A, B, C, respuesta correcta, señuelos, explicación, dif] */
const ANALOGIAS_ROWS: [string, string, string, string, string[], string, 1 | 2 | 3 | 4 | 5][] = [
  ["El perro", "el cachorro", "El gato", "el gatito", ["el minino", "la garra", "el maullido"], "Cachorro y gatito son las crías: la relación es adulto→cría.", 1],
  ["El pan", "la panadería", "El zapato", "el zapatero", ["el pie", "la tienda", "el cordón"], "El oficio que lo fabrica: panadería→pan, zapatero→zapato.", 2],
  ["La luz", "la lámpara", "El sonido", "el altavoz", ["el oído", "la música", "el eco"], "La fuente que lo produce.", 2],
  ["La semilla", "el árbol", "El huevo", "el pollito", ["la cáscara", "la nidada", "la pluma"], "De lo pequeño inicial nace el ser desarrollado.", 2],
  ["El poeta", "el poema", "El carpintero", "la silla", ["la madera", "el taller", "el martillo"], "Creador→obra creada.", 2],
  ["El frío", "el abrigo", "la oscuridad", "la linterna", ["la noche", "el miedo", "el sueño"], "Lo que nos protege de ello.", 3],
  ["La gota", "el océano", "el grano", "la montaña", ["la arena", "la playa", "la duna"], "La parte mínima frente al conjunto inmenso.", 3],
  ["El reloj", "el tiempo", "el termómetro", "la temperatura", ["el calor", "el mercurio", "el clima"], "El instrumento y lo que mide.", 3],
  ["La errata", "el libro", "la nota falsa", "la melodía", ["el ruido", "el concierto", "el silencio"], "El defecto que afeara la obra.", 4],
  ["Efímero", "eterno", "claro", "oscuro", ["diáfano", "brillante", "opaco"], "Relación de antonimia pura.", 4],
  ["El bostezo", "el sueño", "la sonrisa", "la alegría", ["la boca", "los dientes", "el gesto"], "El gesto externo del estado interno.", 3],
  ["La brújula", "el norte", "la gramática", "la corrección", ["la norma", "el idioma", "la palabra"], "La guía que conduce a la meta.", 5],
];

export const ANALOGIAS_PACK: EligeExercise[] = ANALOGIAS_ROWS.map(([a, b, c, answer, decoys, explanation, difficulty], i) => {
  // Posición determinista de la respuesta dentro de las opciones.
  const pos = i % 4;
  const options = [...decoys];
  options.splice(pos, 0, answer);
  return {
    id: fmtId("an", "bosque", i),
    type: "analogias",
    skill: SKILL,
    difficulty,
    cefr: CEFR_BY_DIFFICULTY[difficulty],
    prompt: "Completa el puente",
    context: `${a} es a ${b} como ${c} es a «___».`,
    question: "¿Qué completa la analogía?",
    options,
    answerIndex: pos,
    explanation,
    tags: ["analogías", "lógica verbal"],
  };
});

/* ============================ Parejas naturales ============================ */
const COLOCACIONES_ROWS: [string, string, string[], string, 1 | 2 | 3 | 4 | 5][] = [
  ["cometer", "un error", ["hacer una error", "un error"], "En español se cometen errores (y delitos); los errores no se hacen.", 1],
  ["echar", "de menos", ["hacer de menos", "tirar de menos"], "Echar de menos es la pareja fija para la nostalgia.", 1],
  ["tomar", "una decisión", ["coger una decisión", "hacer una decisión"], "Las decisiones se toman, nunca se hacen.", 2],
  ["hacer", "caso", ["dar caso", "obedecer caso"], "Hacer caso: pareja inquebrantable.", 1],
  ["prestar", "atención", ["dar atención", "poner atención", "hacer atención"], "Se presta atención (y también oídos: prestame atención).", 2],
  ["cumplir", "una promesa", ["hacer una promesa cumplida", "acabar una promesa"], "Las promesas se cumplen; las palabras se mantienen.", 2],
  ["soltar", "una risa", ["verter una risa", "abrir una risa"], "Coloquialmente, la risa se suelta.", 3],
  ["guardar", "silencio", ["conservar silencio", "mantener silencio"], "Guardar silencio es la fórmula fijada.", 2],
  ["correr", "un rumor", ["andar un rumor", "acelerar un rumor"], "Los rumores corren solos… y se corren.", 3],
  ["plantar", "cara", ["sembrar cara", "poner cara"], "Plantar cara: enfrentarse con valor.", 3],
  ["tomar", "el pelo", ["coger el pelo", "tirar del pelo"], "Tomar el pelo: burlarse con cariño.", 2],
  ["levantar", "la voz", ["subir la voz", "agrandar la voz"], "La voz se levanta cuando se enfada.", 2],
];

export const COLOCACIONES_PACK: EligeExercise[] = COLOCACIONES_ROWS.map(([verb, complement, wrongs, explanation, difficulty], i) => {
  const options = [`${verb} ${complement}`, ...wrongs.slice(0, 3)];
  // Barajado determinista: la correcta se mueve según el índice.
  const pos = [0, 2, 1, 3][i % 4];
  const reordered: string[] = [];
  let k = 0;
  for (let j = 0; j < 4; j++) reordered[j] = j === pos ? options[0] : options[1 + (k++ % 3)];
  return {
    id: fmtId("co", "bosque", i),
    type: "colocaciones",
    skill: SKILL,
    difficulty,
    cefr: CEFR_BY_DIFFICULTY[difficulty],
    prompt: "Elige la pareja natural del español",
    context: "¿Cuál suena de verdad en la boca de un hablante nativo?",
    question: "¿Qué combinación es la correcta?",
    options: reordered,
    answerIndex: pos,
    explanation,
    tags: ["colocaciones", "usos fijos"],
  };
});

/* ============================ Escalera de grados ============================ */
/** Cuatro palabras de MENOR a MAYOR intensidad (en orden correcto). */
const GRADOS_ROWS: [string[], string, 1 | 2 | 3 | 4 | 5][] = [
  [["tibio", "caliente", "hirviente"], "De calor suave a ebullición: tibio → caliente → hirviente.", 2],
  [["molesto", "enfadado", "furioso"], "La escalera del enfado sube en tres peldaños.", 2],
  [["bueno", "estupendo", "extraordinario"], "El elogio crece peldaño a peldaño.", 2],
  [["claro", "luminoso", "deslumbrante"], "La luz gana intensidad.", 3],
  [["flaco", "delgado", "esquelético"], "De fino a extremo, con humor.", 3],
  [["llovizna", "lluvia", "diluvio"], "El agua del cielo en tres tamaños.", 2],
  [["susurro", "voz", "grito"], "El volumen del Arquímedes", 3],
  [["pequeño", "diminuto", "microscópico"], "El tamaño se encoge.", 3],
  [["sombra", "penumbra", "oscuridad"], "La luz se retira por etapas.", 4],
  [["adorno", "decoración", "ornamento fastuoso"], "El lujo sube de grado.", 5],
];

export const GRADOS_PACK: OrdenaExercise[] = GRADOS_ROWS.map(([items, explanation, difficulty], i) => ({
  id: fmtId("gr", "bosque", i),
  type: "grados",
  skill: SKILL,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Ordena por intensidad",
  explanation,
  tags: ["gradación", "semántica"],
  items,
  criteria: "Toca las palabras de MENOR a MAYOR intensidad.",
}));

/* ============================ Un dos sentidos (polisemia) ============================ */
const POLISEMIA_ROWS: [string, string, string[], string, 1 | 2 | 3 | 4 | 5][] = [
  ["En la banca guardo mi dinero; el niño se sentó en la banca del parque.", "banca = asiento", ["banca = banco financiero", "banca = madera"], "En la frase, la banca es el asiento del parque.", 2],
  ["El pie de la montaña estaba cubierto de niebla; me duele el pie derecho.", "pie = extremidad del cuerpo", ["pie = base de la montaña", "pie = verso"], "La segunda parte pide el cuerpo: me duele el pie.", 2],
  ["La hoja del árbol cayó al suelo; necesito otra hoja de papel.", "En la frase del árbol, hoja = lámina vegetal", ["hoja = papel", "hoja = cuchilla"], "El contexto manda: primero cae la vegetal, luego se pide papel.", 2],
  ["Le puso una pila de libros encima; mi reloj no tiene pila.", "En el reloj, pila = energía eléctrica", ["pila = montón", "pila = columna de agua"], "El reloj funciona con energía, no con libros.", 2],
  ["La cola del león espanta moscas; hicimos cola para entrar.", "En la segunda, cola = fila de gente", ["cola = apéndice del león", "cola = pegamento"], "Hacer cola: esperar en fila.", 3],
  ["El vaso de agua se rompió; cruzó el vaso de la puerta.", "En la puerta, vaso = batiente", ["vaso = recipiente", "vaso = florero"], "Las puertas tienen vasos, no recipientes.", 4],
  ["La sierra corta la madera; pasamos el verano en la sierra.", "En el verano, sierra = montaña", ["sierra = herramienta", "sierra = siesta"], "La sierra de verano es la montaña.", 3],
  ["La carta llegó con retraso; el chef preparó una carta de postres.", "En el restaurante, carta = menú", ["carta = misiva", "carta = naipe"], "El chef escribe su menú, no una misiva.", 3],
  ["El banco del parque cruje; el banco me prestó dinero.", "En el préstamo, banco = entidad financiera", ["banco = asiento", "banco = banco de peces"], "Quien presta es la entidad.", 2],
  ["La bola de cristal adivina el futuro; la bola de helado se derritió.", "En la heladería, bola = porción redonda", ["bola = esfera adivina", "bola = pelota de juego"], "El helado llega en bolas.", 3],
];

export const POLISEMIA_PACK: EligeExercise[] = POLISEMIA_ROWS.map(([context, answer, decoys, explanation, difficulty], i) => {
  const pos = i % 4;
  const options = [...decoys];
  options.splice(pos, 0, answer);
  return {
    id: fmtId("po", "bosque", i),
    type: "polisemia",
    skill: SKILL,
    difficulty,
    cefr: CEFR_BY_DIFFICULTY[difficulty],
    prompt: "Un dos sentidos",
    context,
    question: "¿Qué sentido tiene la palabra destacada al final de la frase?",
    options,
    answerIndex: pos,
    explanation,
    tags: ["polisemia", "contexto"],
  };
});

/* ============================ Forja de palabras (derivadas) ============================ */
const DERIVADAS_ROWS: [string, string, string, 1 | 2 | 3 | 4 | 5][] = [
  ["pan", "panadería", "El lugar donde se hace: pan + adería.", 1],
  ["mar", "marino", "El adjetivo del mar: mar + ino.", 2],
  ["flor", "florería", "La tienda de flores: flor + ería.", 1],
  ["libro", "librería", "Ojo: librería es la tienda (biblioteca es la de préstamo).", 2],
  ["café", "cafetería", "El local del café: café + tería.", 1],
  ["pueblo", "poblado", "Lo que está poblado: pueblo → poblado.", 3],
  ["campo", "campestre", "El adjetivo culto del campo.", 4],
  ["buque", "buque insignia", "No es derivación: es una locución de la mar.", 5],
  ["vid", "viñedo", "La vid se cultiva en el viñedo (con epéntesis de la ñ).", 4],
  ["huerto", "hortelano", "Del latín hortus: el que cuida el huerto es hortelano.", 5],
];

export const DERIVADAS_PACK: EscribeLibreExercise[] = DERIVADAS_ROWS.map(([base, word, explanation, difficulty], i) => ({
  id: fmtId("de", "bosque", i),
  type: "derivadas",
  skill: SKILL,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Forja la palabra",
  clue: `De «${base}»: el lugar o el oficio que corresponde.`,
  word,
  hint: `Empieza por «${word[0]}» y tiene ${word.length} letras.`,
  explanation,
  tags: ["derivación", "morfología"],
}));

/* ============================ Familia de palabras ============================ */
/** [palabra guía, correctas (2), intrusos (2), explicación, dif] */
const FAMILIAS_ROWS: [string, string[], string[], string, 1 | 2 | 3 | 4 | 5][] = [
  ["mar", ["marino", "marea"], ["marisco", "marcar"], "Marisco comparte mar- pero es comida; marcar viene de marca.", 2],
  ["pan", ["panadero", "panecillo"], ["panorama", "panda"], "Panorama viene del griego pan (todo), no del pan de comer.", 3],
  ["flor", ["florista", "floración"], ["flauta", "inflar"], "Flauta viene del provenzal flaüt; inflar del latín flare… ¡cuidado!", 4],
  ["libro", ["librero", "libreta"], ["liberal", "libertad"], "Liberal y libertad vienen de liber (libre), no de liber (libro).", 4],
  ["noche", ["nocturno", "anochecer"], ["anochecida", "nochebuena"], "Ambas comparten noche- de verdad… esta familia es más grande.", 3],
  ["campo", ["campestre", "acampar"], ["campaña", "campana"], "La campana suena por el latín campana; campaña, de las campañas romanas.", 5],
  ["sol", ["solar", "asolearse"], ["solo", "suelo"], "Solo viene de solus (único); suelo, de solum (terreno).", 4],
  ["puerto", ["portuario", "embarcar"], ["puerta", "aportar"], "La puerta abre en la pared; el puerto abre en la costa.", 3],
  ["leche", ["lactosa", "lechería"], ["lección", "lectura"], "Lección y lectura vienen de legere (leer).", 4],
  ["tinta", ["tintar", "tintero"], ["tienta", "atento"], "Atento viene de tendere (tender la atención).", 3],
];

export const FAMILIAS_PACK: MultiExercise[] = FAMILIAS_ROWS.map(([guide, correct, wrong, explanation, difficulty], i) => {
  // Posiciones deterministas de las correctas: {0,2} o {1,3} alternando.
  const correctAt = i % 2 === 0 ? [0, 2] : [1, 3];
  const options = ["", "", "", ""];
  correctAt.forEach((pos, k) => { options[pos] = correct[k]; });
  let w = 0;
  for (let j = 0; j < 4; j++) if (!options[j]) options[j] = wrong[w++];
  return {
    id: fmtId("fa", "bosque", i),
    type: "familias",
    skill: SKILL,
    difficulty,
    cefr: CEFR_BY_DIFFICULTY[difficulty],
    prompt: "Marca las DOS palabras de la familia",
    statement: `Familia de «${guide}»`,
    options,
    answerIndexes: correctAt,
    explanation,
    tags: ["familias léxicas", "etimología popular"],
  };
});

/* ============================ Orden alfabético ============================ */
const ABECEDARIO_ROWS: [string[], string, 1 | 2 | 3 | 4 | 5][] = [
  [["árbol", "casa", "flor"], "Árbol < casa < flor: el diccionario empieza por la a.", 1],
  [["playa", "sol", "viento"], "Playa < sol < viento.", 1],
  [["cama", "casa", "coma"], "Cama < casa < coma: tercera letra decide (m < s).", 2],
  [["gato", "gota", "gruta"], "Gato < gruta < gota: segunda letra decide (a < r < o).", 3],
  [["hablar", "hambre", "haz"], "Hablar < hambre < haz: la b va antes que la m y que la z.", 3],
  [["llave", "llama", "lluvia"], "Llama < llave < lluvia: en el diccionario, la m precede a la v.", 4],
  [["kilo", "kiosco", "karma"], "Karma < kilo < kiosco: por la segunda letra (a < i < i+o).", 3],
  [["vaca", "baca", "bacalao"], "Baca < bacalao < vaca: la b siempre precede a la v.", 4],
  [["wagneriano", "whisky", "waterpolo"], "Wagneriano < waterpolo < whisky: el orden real de la w.", 5],
  [["ñandú", "ñoño", "ñu"], "La eñe va tras la n en el alfabeto español: ñandú < ñoño < ñu.", 5],
];

export const ABECEDARIO_PACK: OrdenaExercise[] = ABECEDARIO_ROWS.map(([items, explanation, difficulty], i) => ({
  id: fmtId("ab", "bosque", i),
  type: "abecedario",
  skill: SKILL,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Ordena alfabéticamente",
  explanation,
  tags: ["alfabeto", "diccionario"],
  items: items.map((x) => x.trim()),
  criteria: "Toca las palabras en el orden en que aparecen en el diccionario.",
}));

/* ============================ Adivinanzas de diccionario ============================ */
const DEFINICIONES_ROWS: [string, string, string, 1 | 2 | 3 | 4 | 5][] = [
  ["Lugar con libros para leer en silencio", "biblioteca", "Empieza por b.", 1],
  ["Aparato que mide la temperatura", "termómetro", "Empieza por t.", 2],
  ["Persona que escribe libros", "escritor", "Empieza por e.", 1],
  ["Animal que trabaja haciendo miel", "abeja", "Empieza por a.", 1],
  ["Mueble para dormir", "cama", "Empieza por c.", 1],
  ["Vehículo que vuela con alas fijas", "avión", "Empieza por a.", 1],
  ["Líquido que lloran los ojos", "lágrima", "Empieza por l.", 2],
  ["Palabra que significa lo mismo que otra", "sinónimo", "Empieza por s.", 3],
  ["Palabra contraria a otra", "antónimo", "Empieza por a.", 3],
  ["Figura que compara sin usar «como»", "metáfora", "Empieza por m.", 4],
  ["Repeticion de sonidos al final de los versos", "rima", "Empieza por r.", 2],
  ["Palabra que imita un sonido: quiquiriquí", "onomatopeya", "Empieza por o.", 5],
];

export const DEFINICIONES_PACK: EscribeLibreExercise[] = DEFINICIONES_ROWS.map(([clue, word, hint, difficulty], i) => ({
  id: fmtId("df", "bosque", i),
  type: "definiciones",
  skill: SKILL,
  difficulty,
  cefr: CEFR_BY_DIFFICULTY[difficulty],
  prompt: "Escribe la palabra",
  clue,
  word,
  hint,
  explanation: `«${word}»: ${clue.toLowerCase()}.`,
  tags: ["definiciones", "vocabulario"],
}));
