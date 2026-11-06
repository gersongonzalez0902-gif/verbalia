/**
 * Curated data · Etimologías para el Observatorio de la Palabra.
 * Cada fila: palabra, idioma de origen (etiqueta corta), nota del Observatorio.
 * Determinista: es un fichero de datos estático.
 */

export interface OriginEntry {
  word: string;
  origin: string;
  note: string;
}

export const ORIGINS: OriginEntry[] = [
  { word: "aceite", origin: "árabe", note: "De «az-zayt», jugo de oliva: el árabe andalusí lo destiló antes que las cocinas." },
  { word: "almohada", origin: "árabe", note: "De «al-mikhadda»: la «al-» inicial es artículo árabe, como en almendra y alcalde." },
  { word: "ojalá", origin: "árabe", note: "De «law šāʾ allāh», «si Dios quisiera»: un deseo condensado en una sola palabra." },
  { word: "azúcar", origin: "árabe", note: "De «as-sukkar», que a su vez viajó del sánscrito al persa y al árabe." },
  { word: "algoritmo", origin: "árabe", note: "Del nombre del matemático Al-Juarismi, latinizado en el medievo." },
  { word: "naranja", origin: "árabe", note: "De «nāranj», que tomó el persa del sánscrito «nāranga»." },
  { word: "hasta", origin: "árabe", note: "De «ḥattā», la preposición que más se usa en el español cotidiano." },
  { word: "chocolate", origin: "náhuatl", note: "De «xocolātl», espuma amarga del cacao: la bebida ritual de Mesoamérica." },
  { word: "jitomate", origin: "náhuatl", note: "De «xītomatl», tomate con chapote de náhuatl: México sigue llamándolo así." },
  { word: "aguacate", origin: "náhuatl", note: "De «āhuacatl», el fruto del árbol de testículo: la palta del Cono Sur." },
  { word: "cacao", origin: "náhuatl", note: "De «kakawatl»: la semilla que fue moneda en los mercados mexicas." },
  { word: "coyote", origin: "náhuatl", note: "De «koyotl», el mamífero que cruzó la frontera antes que la palabra." },
  { word: "cóndor", origin: "quechua", note: "De «kuntur», el ave mensajera de los Andes que anida a 5000 metros." },
  { word: "pampa", origin: "quechua", note: "De «pampa», llanura: el vocablo que nombró la hierba infinita argentina." },
  { word: "carpa", origin: "quechua", note: "De «karpa», tienda de campaña: los Andes la prestaron al circo." },
  { word: "chaucha", origin: "quechua", note: "De «chawcha», vaina de judía: en Chile y Argentina la chaucha es moneda y habichuela." },
  { word: "cancha", origin: "quechua", note: "De «kancha», patio de juego: el español le puso fútbol y tenis encima." },
  { word: "panaca", origin: "quechua", note: "De «panaka», linaje: en el español coloquial andino, la familia ruidosa." },
  { word: "huracán", origin: "taíno", note: "De «jurakán», dios de la tormenta del Caribe que Colón escuchó nombrar." },
  { word: "hamaca", origin: "taíno", note: "De «hamaka», la red colgante que meció el sueño del Caribe precolombino." },
  { word: "maíz", origin: "taíno", note: "De «mahís»: el grano sagrado que los taínos regalaron al mundo." },
  { word: "caníbal", origin: "taíno", note: "De «caribal», de donde también salió «caribe»: los malentendidos viajan." },
  { word: "barbacoa", origin: "taíno", note: "De «barbakoa», parrilla de palos: el asado criollo nació en el Caribe." },
  { word: "escuela", origin: "latín", note: "De «schola», ocio: para los romanos, estudiar era un tipo de descanso." },
  { word: "ventana", origin: "latín", note: "De «ventus», viento: el agujero se nombró por la brisa que dejaba entrar." },
  { word: "pared", origin: "latín", note: "De «paries, parietis», el muro que separa sin cerrar del todo." },
  { word: "cabeza", origin: "latín", note: "De «caput»: la cabeza romana terminó capitaneando el cuerpo español." },
  { word: "milagro", origin: "latín", note: "De «miraculum», cosa digna de mirar: mirar y maravillarse era lo mismo." },
  { word: "silla", origin: "latín", note: "De «sella», el asiento que el latín dejó listo para sentarse." },
  { word: "hospital", origin: "latín", note: "De «hospitalia», el techo para el huésped: curar y alojar fueron un oficio." },
  { word: "biblioteca", origin: "griego", note: "De «bibliothēkē», estante de papiros: biblioteca es literalmente una estantería." },
  { word: "filosofía", origin: "griego", note: "De «philo-sophía», amor a la sabiduría: la disciplina que se definió amando." },
  { word: "música", origin: "griego", note: "De «mousikē», arte de las musas: todo arte era suyo al principio." },
  { word: "teatro", origin: "griego", note: "De «theáomai», contemplar: primero se miraba, después se actuó." },
  { word: "planeta", origin: "griego", note: "De «planētēs», errante: los astros que no se quedaban quietos en el cielo." },
  { word: "croquis", origin: "francés", note: "De «croquer», bocetar: el francés del siglo XIX dibujó el vocablo en el español." },
  { word: "buró", origin: "francés", note: "De «bureau», escritorio de paño: la oficina viajó con ese nombre." },
  { word: "chofer", origin: "francés", note: "De «chauffeur», el que calienta: primero la máquina de vapor, luego el motor." },
  { word: "ganster", origin: "inglés", note: "De «gangster», préstamo del cine: el español lo dobló como gánster." },
  { word: "fútbol", origin: "inglés", note: "De «football», del inglés Victoriano: el deporte llegó con su nombre en la maleta." },
  { word: "yoga", origin: "sánscrito", note: "De «yoga», yugo: unir cuerpo y aliento, como el campo une al buey." },
  { word: "kárate", origin: "japonés", note: "De «kara-te», mano vacía: el Japón del siglo XX lo exportó entero." },
  { word: "tsunami", origin: "japonés", note: "De «tsu-nami», ola de puerto: el mar que entra donde amarran los barcos." },
  { word: "manga", origin: "japonés", note: "Del japonés «manga», viñeta cómica: el cómic japonés trajo su propio nombre." },
  { word: "patio", origin: "latín", note: "Posible eco de «pactum» en el derecho romano: el espacio compartido y cerrado." },
  { word: "chiquero", origin: "taíno", note: "Corral de cerdos: en Cuba, chiquero; la palabra criolla cruzó el mar." },
  { word: "sabana", origin: "taíno", note: "De «sabana», manta de hierba: la llanura caribeña que el español extendió a África." },
  { word: "ñandú", origin: "guaraní", note: "De «ñandú»: el ave corredora que los guaraníes nombraron con el cuerpo entero." },
  { word: "tapioca", origin: "guaraní", note: "De «tipiʼog»: la yuca exprimida que el guaraní convirtió en harina." },
  { word: "jaguar", origin: "guaraní-tupí", note: "De «yaguareté»: el felino pintado que cambió de nombre en cada frontera." },
  { word: "hurón", origin: "gótico", note: "Del gótico «hūs», hurón: el latín vulgar lo adoptó de los germanos." },
];

/** Palabras agrupadas por familia de origen, para «Conecta» e «Intruso etimológico». */
export const ORIGIN_GROUPS: Record<string, string[]> = ORIGINS.reduce(
  (acc, o) => {
    (acc[o.origin] ||= []).push(o.word);
    return acc;
  },
  {} as Record<string, string[]>,
);
