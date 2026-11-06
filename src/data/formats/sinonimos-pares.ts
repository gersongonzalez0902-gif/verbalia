/**
 * Curated data · Pares de sinónimos para la Memoria de la Torre y
 * la Pluma de la Torre. Parejas de palabras intercambiables en contexto.
 */

export interface SinonimoPar {
  a: string;
  b: string;
  note: string;
}

export const SINONIMOS: SinonimoPar[] = [
  { a: "dichoso", b: "afortunado", note: "Los dos riman con suerte; «dichoso» también puede ser irónico." },
  { a: "pena", b: "tristeza", note: "«Pena» añade un matiz de pesar moral." },
  { a: "antiguo", b: "vetusto", note: "«Vetusto» es el cultismo del par: suena a archivo y polvo." },
  { a: "calmar", b: "serenar", note: "«Serenar» evoca mar en calma; ambos apagan la tormenta." },
  { a: "estafar", b: "timar", note: "«Timar» es el coloquial: suena a trilero y a baraja marcada." },
  { a: "obscuro", b: "oscuro", note: "Ob- es grafía antigua tolerada; hoy se prefiere «oscuro»." },
  { a: "regalo", b: "presente", note: "Ambos se envuelven en papel; «regalo» es el más cotidiano." },
  { a: "labor", b: "faena", note: "«Faena» huele a campo y a mar; «labor», a taller." },
  { a: "camino", b: "sendero", note: "El sendero es estrecho y de a pie; el camino admite carretas." },
  { a: "contento", b: "satisfecho", note: "«Contento» es el gozo del cuerpo entero; «satisfecho», la cuenta que cierra." },
  { a: "edificio", b: "inmueble", note: "El arquitecto dice edificio; el notario, inmueble." },
  { a: "vacilante", b: "tímido", note: "El tímido no se atreve; el vacilante sí, pero duda mil veces." },
  { a: "hurto", b: "robo", note: "El hurto es furtivo, sin fuerza ni violencia." },
  { a: "trabajo", b: "empleo", note: "El trabajo existe desde siempre; el empleo, con las nóminas." },
  { a: "zarpar", b: "partir", note: "Todo barco parte, pero solo zarpa si promete sal y horizonte." },
  { a: "gigante", b: "colosal", note: "«Colosal» mide; «gigante» personifica la estatura." },
  { a: "espantado", b: "aterrado", note: "El espanto asusta de golpe; el terror no avisa." },
  { a: "nostalgia", b: "añoranza", note: "La añoranza extraña lo vivido; la nostalgia lo llora con música." },
  { a: "adorno", b: "ornamento", note: "El ornamento viene de la retórica; el adorno, del escaparate." },
  { a: "soledad", b: "desamparo", note: "Se puede estar solo sin desamparo; el desamparo duele de compañía." },
  { a: "apresurado", b: "precipitado", note: "El precipitado ya cayó; el apresurado todavía corre." },
  { a: "asequible", b: "económico", note: "Asequible se dice del precio; económico, del que lo paga." },
  { a: "franco", b: "sincero", note: "El franco no mide el tono; el sincero elige la verdad con cuidado." },
  { a: "fatiga", b: "cansancio", note: "La fatiga acumula jornadas; el cansancio se cura durmiendo." },
  { a: "humilde", b: "modesto", note: "El humilde se sabe pequeño; el modesto prefiere no presumir." },
  { a: "ansia", b: "deseo", note: "El ansia aprieta el pecho; el deseo abre la puerta." },
  { a: "murmullo", b: "susurro", note: "El susurro cabe en una oreja; el murmullo llena la sala." },
  { a: "peregrino", b: "viajero", note: "El peregrino viaja con meta sagrada; el viajero, con billete." },
  { a: "bondad", b: "benevolencia", note: "La benevolencia juzga con suavidad; la bondad no juzga." },
  { a: "densa", b: "espesa", note: "La niebla puede ser ambas; la sopa, solo espesa." },
  { a: "tregua", b: "pausa", note: "La tregua firman dos ejércitos; la pausa la firma una coma." },
  { a: "engaño", b: "bulo", note: "El engaño es el género; el bulo, su versión que corre en voz baja." },
  { a: "candor", b: "ingenuidad", note: "El candor se elogia; la ingenuidad se disculpa." },
];
