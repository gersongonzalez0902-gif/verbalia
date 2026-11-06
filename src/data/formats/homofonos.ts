/**
 * Curated data · Pares de homófonos (o cuasi homófonos) para la
 * Memoria de la Fortaleza. Suenan igual o casi, pero se escriben distinto.
 */

export interface HomofonoPair {
  a: string;
  b: string;
  noteA: string;
  noteB: string;
}

export const HOMOFONOS: HomofonoPair[] = [
  { a: "azar", b: "azahar", noteA: "casualidad o fortuna imprevista", noteB: "flor blanca del naranjo" },
  { a: "haber", b: "a ver", noteA: "verbo o sustantivo: «debe haber pan»", noteB: "perífrasis: «vamos a ver»" },
  { a: "echo", b: "hecho", noteA: "del verbo echar: «lo echo al cesto»", noteB: "participio de hacer; también suceso" },
  { a: "ay", b: "hay", noteA: "interjección: «¡ay, me duele!»", noteB: "del verbo haber: «hay agua fría»" },
  { a: "hola", b: "ola", noteA: "saludo al abrir la puerta", noteB: "la que rompe en la playa" },
  { a: "bello", b: "vello", noteA: "hermoso, de gran belleza", noteB: "pelo fino que cubre la piel" },
  { a: "votar", b: "botar", noteA: "elegir con papeleta o a mano alzada", noteB: "arrojar fuera o despedir" },
  { a: "cima", b: "sima", noteA: "punto más alto de la montaña", noteB: "abismo u oquedad profunda" },
  { a: "caza", b: "casa", noteA: "acción de cazar; el búho caza de noche", noteB: "edificio donde se vive" },
  { a: "coser", b: "cocer", noteA: "unir telas con hilo y aguja", noteB: "hervir o guisar un alimento" },
  { a: "onda", b: "honda", noteA: "vibración u ola: la onda sonora", noteB: "profunda o antigua; también la honda del pastor" },
  { a: "graba", b: "grava", noteA: "del verbo grabar: registra el audio", noteB: "piedra menuda de los caminos" },
  { a: "hierba", b: "hierva", noteA: "planta; la yerba del mate", noteB: "del verbo hervir: «que hierva un minuto»" },
  { a: "barón", b: "varón", noteA: "noble de rango inferior al vizconde", noteB: "hombre, frente a hembra" },
  { a: "caso", b: "cazo", noteA: "suceso o situación que se estudia", noteB: "recipiente con mango para guisos" },
  { a: "ojal", b: "ojalá", noteA: "abertura para pasar el botón", noteB: "fórmula de deseo, herencia del árabe" },
  { a: "abría", b: "habría", noteA: "de abrir: «abría la ventana al alba»", noteB: "de haber: «habría llegado antes»" },
  { a: "callado", b: "cayado", noteA: "silencioso, que no habla", noteB: "bastón del pastor" },
  { a: "sabía", b: "savia", noteA: "del verbo saber: «ella lo sabía»", noteB: "líquido que alimenta la planta" },
  { a: "talego", b: "talega", noteA: "colchón de la cárcel (coloquial)", noteB: "saco de tela para el pan" },
  { a: "raya", b: "ralla", noteA: "línea o señal: «la raya del cuaderno»", noteB: "del verbo rallar: «ralla el queso»" },
  { a: "vaya", b: "valla", noteA: "del verbo ir o sorpresa: «¡vaya susto!»", noteB: "cerca de madera o valla publicitaria" },
  { a: "halla", b: "aya", noteA: "del verbo hallar: «halla la solución»", noteB: "niñera que cuida niños" },
  { a: "cosido", b: "cocido", noteA: "unido con puntadas: «el cosido del bolsillo»", noteB: "guiso hervido a fuego lento" },
];
