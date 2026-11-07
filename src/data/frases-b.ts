/**
 * Frases del día · parte B (aforismos del Archipiélago).
 */
export type FraseTag = "escritura" | "lectura" | "palabras" | "idiomas" | "aprendizaje" | "archipielago";

export interface FraseDelDia {
  text: string;
  author: string;
  tag: string;
}

export const FRASES_B: FraseDelDia[] = [
  // ── Sabiduría del Archipiélago · 85 aforismos ──────────────────────────────
  { text: "Un diccionario abierto es una carta de marear: no existe palabra que quede fuera del mapa.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "La tinta se seca en un minuto; lo escrito con ella navega siglos.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Cada lector es capitán de su travesía: el libro solo presta el barco.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Las comas son pequeños fondeaderos donde la voz recupera el aliento.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Quien ignora el faro de las reglas encalla en la orilla de las tildes.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Un silencio a tiempo es un puerto donde atracan las frases importantes.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Una buena pregunta es una brújula: con ella en la mano nadie está perdido.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Un vocabulario rico no pesa en la bodega: aligera cada travesía.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "La gramática es el aparejo del idioma: bien tensado, cualquier viento es bueno.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "La inspiración es un viento variable; la bitácora diaria, un motor fiable.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "En el Bosque del Vocabulario las palabras crecen solas; las conversaciones hay que regarlas.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Las tildes son boyas: avisan donde el sentido toca fondo.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Los sinónimos son rutas alternativas al mismo puerto: elige la que mejor viento tenga.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Los versos miden la marea: suben y bajan con un compás que se siente, no que se cuenta.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Traducir es tender puentes entre islas: cada orilla conserva su paisaje.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Un idioma nuevo es una segunda bandera: no sustituye a la tuya, te da más cielo.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "El texto breve navega ligero; el recargado se hunde con su propio cargamento.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "La página en blanco no está vacía: está en alta mar, llena de rutas posibles.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "El punto final no cierra la travesía: te deja en la orilla de otra lectura.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Un clásico es un casco curtido en mil tormentas: flota sobre cualquier moda.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Prestar un libro es soltar amarras: solo puede volver con historia nueva a bordo.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "La goma de borrar es una marea baja: retira la arena equivocada y deja la concha.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Los márgenes son playas: ahí encallan las mejores notas del lector.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Una biblioteca es un astillero donde nunca dejan de botar barcos.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Las palabras olvidadas no naufragan: vuelven con la marea cuando menos lo esperas.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "Toda palabra escrita y guardada es una botella en reserva: el mar decidirá cuándo lanzarla.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "La pluma fina y la pluma barata escriben igual de hondo si la mano lleva intención.", author: "Sabiduría del Archipiélago", tag: "archipielago" },
  { text: "El diccionario es el único faro que contesta cuando lo llamas.", author: "Sabiduría del Archipiélago", tag: "archipielago" },

  // ── Voces del archipiélago · 25 firmas ─────────────────────────────────────
  { text: "Dicen que los búhos somos sabios; en realidad, solo somos lectores con buen insomnio.", author: "Léxico, búho bibliotecario", tag: "lectura" },
  { text: "Yo no cazo ratones: rondo a las erratas hasta encontrar su escondite.", author: "Léxico, búho bibliotecario", tag: "escritura" },
  { text: "Un búho gira la cabeza; un lector, las ideas: ambos ven lo que otros dejan pasar.", author: "Léxico, búho bibliotecario", tag: "lectura" },
  { text: "No temas a las palabras largas: solo son barcos con más velamen.", author: "Léxico, búho bibliotecario", tag: "palabras" },
  { text: "De noche, cuando la biblioteca ronca, las palabras despiertas son todas mías.", author: "Léxico, búho bibliotecario", tag: "palabras" },
  { text: "Cada libro devuelto a su estante me deja una pluma nueva en el ala.", author: "Léxico, búho bibliotecario", tag: "lectura" },
  { text: "Mi trabajo no es guardar libros: es guardar rutas para quien quiera zarpar.", author: "Léxico, búho bibliotecario", tag: "lectura" },
  { text: "Pregunta en voz alta lo que no sepas: en una biblioteca, la pregunta es el saludo.", author: "Léxico, búho bibliotecario", tag: "aprendizaje" },
  { text: "El silencio de una biblioteca no está vacío: está lleno de voces leyendo.", author: "Léxico, búho bibliotecario", tag: "lectura" },
  { text: "Un búho que lee en dos idiomas ve el doble de lunas.", author: "Léxico, búho bibliotecario", tag: "idiomas" },
  { text: "Todo acento es una bandera amarrada a un puerto distinto: se saluda, no se corrige.", author: "La capitana del Puerto de las Voces", tag: "idiomas" },
  { text: "Nadie naufragó por decirlo mal; muchos se hundieron por quedárselo callado.", author: "La capitana del Puerto de las Voces", tag: "palabras" },
  { text: "Leer en voz alta es izar la vela: el texto cobra viento y se le oye navegar.", author: "La capitana del Puerto de las Voces", tag: "lectura" },
  { text: "En mi puerto atracan cien lenguas y todas amarran con el mismo cabo: la palabra amable.", author: "La capitana del Puerto de las Voces", tag: "idiomas" },
  { text: "Aquí hasta las sirenas recitan: pierde el rumbo quien se queda a escuchar versos.", author: "La capitana del Puerto de las Voces", tag: "palabras" },
  { text: "La ortografía no es un muro para rechazarte: es un malecón que te salva de la marea.", author: "El guardián de la Fortaleza", tag: "escritura" },
  { text: "En la Fortaleza las reglas no son rejas: son pasamanos de escalera empinada.", author: "El guardián de la Fortaleza", tag: "aprendizaje" },
  { text: "La 'h' muda no es un error de la lengua: es un pasajero silencioso con billete antiguo.", author: "El guardián de la Fortaleza", tag: "escritura" },
  { text: "El único arsenal de esta fortaleza es una regla de tres: leer, escribir, repetir.", author: "El guardián de la Fortaleza", tag: "aprendizaje" },
  { text: "La 'b' y la 'v' no están en guerra: solo piden que aprendas el rumbo de cada una.", author: "El guardián de la Fortaleza", tag: "aprendizaje" },
  { text: "Toda bitácora empieza igual: con la valentía de una primera línea torpe.", author: "La cronista de la Torre", tag: "escritura" },
  { text: "Reescribir no es naufragar: es corregir el rumbo con la misma tripulación.", author: "La cronista de la Torre", tag: "escritura" },
  { text: "La Torre no premia al que escribe bonito: premia al que dice verdad con viento en contra.", author: "La cronista de la Torre", tag: "escritura" },
  { text: "Un buen cronista escucha dos veces, escribe una y revisa tres.", author: "La cronista de la Torre", tag: "aprendizaje" },
  { text: "Guardo crónicas de todo el archipiélago; la más difícil de escribir sigue siendo la mía.", author: "La cronista de la Torre", tag: "escritura" },
];
