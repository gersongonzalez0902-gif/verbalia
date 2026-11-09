import type { TinderExercise } from "@/types";

/**
 * Pack · Tinder de Sinónimos (Bosque del Vocabulario) · Etapa 2 completa
 * ----------------------------------------------------------------
 * 72 parejas curadas a mano: 36 intercambiables en la mayoría de
 * contextos (desliza a la derecha) y 36 con trampa — parónimos,
 * significados cruzados o matices que las hacen NO equivalentes
 * (desliza a la izquierda). Cada tarjeta enseña el porqué.
 */

/* [palabraA, palabraB, nota, dificultad] · SÍ: sinónimos intercambiables */
const SYN: [string, string, string, number][] = [
  ["apacible", "tranquilo", "Los dos calman la escena: un mar apacible es un mar tranquilo.", 1],
  ["luminoso", "brillante", "Las dos devuelven la luz que les llega.", 1],
  ["contento", "alegre", "Las dos andan con la sonrisa puesta.", 1],
  ["veloz", "rápido", "Las dos cruzan antes de que las nombres.", 1],
  ["comenzar", "empezar", "Las dos encienden el mismo interruptor.", 1],
  ["hermoso", "bello", "Las dos son la belleza con acento distinto.", 1],
  ["inmenso", "vasto", "Ambos miden lo que la vista no alcanza a cerrar.", 2],
  ["afable", "cordial", "Las dos son la amabilidad con la mano extendida.", 2],
  ["sereno", "plácido", "Ambas prometen agua sin olas ni sustos.", 2],
  ["remota", "lejana", "Ambas viven donde el mapa se queda corto.", 2],
  ["obvio", "evidente", "Las dos se ven sin esfuerzo, casi antes de mirarlas.", 2],
  ["hábil", "diestro", "Las dos resuelven con las manos lo que otros manosean.", 2],
  ["fino", "delicado", "Las dos trabajan con hilos, no con cuerdas.", 2],
  ["aguante", "resistencia", "Las dos aguantan el golpe sin quejarse.", 2],
  ["robusto", "resistente", "Las dos son madera que no se raja.", 2],
  ["danza", "baile", "La danza suena a escenario y el baile a fiesta, pero se sustituyen en casi todo.", 2],
  ["obstáculo", "impedimento", "Las dos estorban el paso con la misma fuerza.", 3],
  ["drástico", "radical", "Las dos cortan el problema de un solo tajo.", 3],
  ["tenaz", "persistente", "Las dos no sueltan la presa ni el propósito.", 3],
  ["efímero", "fugaz", "Las dos se deshacen antes de que el ojo las sujete.", 3],
  ["frugal", "sobrio", "Las dos hablan de comer y de vivir poco y con esencia.", 3],
  ["intrépido", "valiente", "Las dos entran sin pedir permiso al miedo.", 3],
  ["cándido", "ingenuo", "Las dos miran el mundo sin segunda intención (y por eso se dejan engañar).", 3],
  ["esmero", "cuidado", "«Trabajó con esmero» y «trabajó con cuidado» se intercambian: atención dedicada.", 3],
  ["brío", "energía", "Las dos son el empuje que no pide permiso.", 3],
  ["parco", "escueto", "Las dos dicen lo mínimo y punto aparte.", 4],
  ["deleite", "goce", "Las dos son el placer con la puerta cerrada.", 4],
  ["sospechar", "recelar", "Las dos desconfían antes de tener la prueba.", 4],
  ["mendaz", "mentiroso", "Las dos viven de la mentira (mendaz es el traje elegante de mentiroso).", 4],
  ["usanza", "costumbre", "Las dos son lo que el tiempo repite hasta volverlo ley.", 4],
  ["paradigma", "modelo", "En el uso técnico, un paradigma es un modelo de referencia: se cambian la corbata.", 4],
  ["alborozo", "júbilo", "Las dos celebran por dentro y por fuera a la vez.", 5],
  ["boato", "ostentación", "Las dos gastan en fasto lo que otros guardarían.", 5],
  ["lóbrego", "tenebroso", "Las dos apagan la lámpara y cierran la puerta.", 5],
  ["azorado", "aturullado", "Las dos son el lío con las prisas encima.", 5],
  ["acervo", "patrimonio", "En «acervo cultural» y «patrimonio cultural» se saludan: ambas son el fondo común heredado.", 5],
];

/* [palabraA, palabraB, nota, dificultad] · NO: la trampa */
const NO: [string, string, string, number][] = [
  ["ver", "mirar", "Ver es percibir (llega solo); mirar es dirigir los ojos a propósito.", 1],
  ["oír", "escuchar", "El ruido se oye solo; escuchar es prestarle atención.", 2],
  ["especia", "especie", "La especia sazona la olla; la especie clasifica a los vivos (o es una moneda vieja).", 2],
  ["cocer", "coser", "Se cuecen los garbanzos; se cose la manga rota.", 2],
  ["acto", "apto", "Un acto es algo hecho; apto, alguien capaz de hacerlo.", 2],
  ["casa", "hogar", "La casa es el edificio; el hogar, el edificio con la lumbre dentro.", 2],
  ["melancólico", "nostálgico", "La nostalgia mira al pasado con cariño; la melancolía entristece el presente.", 3],
  ["emergir", "sumergir", "Parónimos contrarios: una sale del agua, la otra entra.", 3],
  ["si", "sí", "«Si» pone la condición; «sí» la confirma con la cabeza.", 3],
  ["delante", "adelante", "«Delante» marca el sitio; «adelante», la dirección (y la invitación a pasar).", 3],
  ["chisme", "rumor", "El rumor corre sin fuente; el chisme lleva intención y embellece al pasar.", 3],
  ["rumbo", "destino", "El rumbo es la dirección que marca la brújula; el destino, el puerto final (y a veces el hado).", 3],
  ["límite", "frontera", "El límite es la línea que corta; la frontera separa territorios y, en lo figurado, hasta abre puertas.", 3],
  ["cifra", "número", "La cifra es el número escrito (o la suma de dinero); el número, el concepto matemático.", 3],
  ["egocéntrico", "egoísta", "El egocéntrico solo se mira; el egoísta, además, no comparte.", 3],
  ["sesión", "sección", "La sesión es el rato que dura algo; la sección, el trozo en que se divide.", 3],
  ["haya", "halla", "«Haya» es del verbo haber (o un árbol); «halla», del verbo hallar (encontrar).", 3],
  ["buscar", "averiguar", "Buscar es intentar hallar algo; averiguar es indagar hasta saberlo.", 3],
  ["porqué", "porque", "«Porque» explica la causa; «porqué» es el sustantivo de la pregunta.", 4],
  ["aún", "aun", "«Aún» es todavía; «aun» es hasta o inclusive.", 4],
  ["mas", "más", "«Mas» es pero con esmoquin; «más» suma y compara.", 4],
  ["apenas", "solo", "«Apenas» es hace un momento o a penas/solamente en frases muy concretas; no se cambia por «solo» en general.", 4],
  ["esquivo", "evasivo", "El esquivo rehúye el trato y a las personas; el evasivo, las respuestas.", 4],
  ["cordial", "obsequioso", "La cordialidad es gratuita; el obsequioso trae un regalo con factura.", 4],
  ["generoso", "pródigo", "El generoso da bien; el pródigo da de más (y a veces arruina).", 4],
  ["dilema", "encrucijada", "El dilema vive en la cabeza (elegir entre dos males); la encrucijada, en el mapa (o en la vida como metáfora).", 4],
  ["prolijo", "extenso", "«Prolijo» es un extenso que ya cansa (o minucioso en América): lleva un reproche dentro.", 4],
  ["taciturno", "callado", "El callado no habla; el taciturno calla por dentro, con su pena de asiento.", 4],
  ["jerarquía", "rango", "La jerarquía es la escalera entera; el rango, un peldaño concreto.", 4],
  ["dudoso", "dubitativo", "Lo dudoso merece duda (una prueba floja); lo dubitativo es la persona que duda.", 4],
  ["opinar", "dictaminar", "Opinar es libre; dictaminar lleva la autoridad del dictamen (no se intercambian en un juzgado).", 4],
  ["burla", "sátira", "La burla ríe de; la sátira ríe para corregir.", 4],
  ["umbral", "puerta", "El umbral es solo la parte baja del marco; la puerta, el conjunto que se abre.", 4],
  ["rescoldo", "braza", "La braza arde a la vista; el rescaldo aguanta el fuego bajo la ceniza, esperando.", 5],
  ["azar", "azahar", "El azar es la suerte sin dueño; el azahar, la flor del naranjo que perfuma la suerte del sur.", 5],
  ["órdago", "amenaza", "El órdago es un reto que se lanza a la cara; la amenaza anuncia daño para mañana.", 5],
];

function toPack(
  rows: [string, string, string, number][],
  isSynonym: boolean,
  prefix: string,
): TinderExercise[] {
  const cefrOf = (d: number) => (d <= 1 ? "A2" : d === 2 ? "B1" : d === 3 ? "B2" : d === 4 ? "C1" : "C2");
  return rows.map(([a, b, note, d], i) => ({
    id: `${prefix}-${String(i + 1).padStart(2, "0")}`,
    type: "tinder" as const,
    skill: "vocabulario" as const,
    difficulty: d as TinderExercise["difficulty"],
    cefr: cefrOf(d),
    prompt: isSynonym ? "¿Son intercambiables?" : "¿Son intercambiables?",
    explanation: note,
    tags: ["tinder", isSynonym ? "sinónimos" : "parónimos"],
    wordA: a,
    wordB: b,
    isSynonym,
    note,
  }));
}

export const TINDER_PACK: TinderExercise[] = [
  ...toPack(SYN, true, "td-s"),
  ...toPack(NO, false, "td-n"),
];
