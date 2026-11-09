import type { GameCore } from "@/types";
import { tintaForXp } from "./shop";

/**
 * El Salón de Juegos Educativos · Lógica pura (Mega-actualización 5).
 *
 * Un apartado nuevo del Archipiélago dedicado a entrenar la mente más
 * allá del idioma: cálculo mental, memoria, lógica, letras veloces
 * y reflejos.
 *
 * - Los juegos se desbloquean con **tinta** (la moneda honesta: nunca
 *   se pierde nivel ni XP por comprar).
 * - Cada partida entrega XP según la puntuación, con tope diario por
 *   juego para que el salón no sustituya al estudio del idioma.
 * - Todo es función pura: se prueba en tests/engine.test.ts.
 */

export type ArcadeCategory = "calculo" | "memoria" | "logica" | "palabras" | "reflejos";

export interface ArcadeGameDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: ArcadeCategory;
  icon: string;
  /** Precio en tinta (0 = gratuito desde el principio). */
  price: number;
  /** XP máximo por partida (tope). */
  xpCap: number;
  /** XP diario máximo por juego (anti-farmeo). */
  dailyXpCap: number;
  /** Nivel de jugador a partir del cual es gratuito (opcional). */
  freeAtLevel?: number;
}

export const ARCADE_CATEGORY_LABEL: Record<ArcadeCategory, string> = {
  calculo: "Cálculo y números",
  memoria: "Memoria",
  logica: "Lógica y puzles",
  palabras: "Letras veloces",
  reflejos: "Reflejos y atención",
};

export const ARCADE_CATEGORY_COLOR: Record<ArcadeCategory, string> = {
  calculo: "--region-ciudad",
  memoria: "--region-bosque",
  logica: "--region-fortaleza",
  palabras: "--region-biblioteca",
  reflejos: "--region-puerto",
};

/** Catálogo del salón: 50 retos entre cálculo, memoria, lógica, letras y reflejos. */
export const ARCADE_GAMES: ArcadeGameDef[] = [
  /* ---------- Cálculo ---------- */
  {
    id: "mates-relampago",
    name: "Mates Relámpago",
    tagline: "Cálculo mental a contrarreloj",
    description: "Sumas, restas, multiplicaciones y divisiones que caen como rayos. 60 segundos para encadenar el mayor número de aciertos.",
    category: "calculo",
    icon: "Zap",
    price: 0,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "numeros-romanos",
    name: "Códice Romano",
    tagline: "Números romanos ida y vuelta",
    description: "Traduce números romanos a arábigos y al revés, del I al MMM. Ideal para leer capítulos, siglos y relojes de la Biblioteca.",
    category: "calculo",
    icon: "Landmark",
    price: 30,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "binario",
    name: "Faro Binario",
    tagline: "Convierte a base 2 y base 10",
    description: "El faro parpadea en unos y ceros: convierte entre binario y decimal mientras el destello te marca el ritmo.",
    category: "calculo",
    icon: "Binary",
    price: 30,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "mayor-menor",
    name: "Mayor o Menor",
    tagline: "Aventuras numéricas",
    description: "Adivina si el siguiente número es mayor o menor. Cada acierto suma a la racha; un fallo y el castillo de naipes se cae.",
    category: "calculo",
    icon: "ArrowDownUp",
    price: 20,
    xpCap: 35,
    dailyXpCap: 70,
  },
  /* ---------- Memoria ---------- */
  {
    id: "simon-marea",
    name: "Simón de la Marea",
    tagline: "Secuencias de luz y sonido",
    description: "El faro repite una secuencia de colores con su propia campana. Repítela creciendo una luz cada ronda. ¿Hasta dónde llega tu oído?",
    category: "memoria",
    icon: "Lightbulb",
    price: 0,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "pares-letras",
    name: "Pares de Letras",
    tagline: "Memoria con el alfabeto",
    description: "Doce cartas boca abajo con parejas de letras del español. Encuéntralas todas con los mínimos intentos posibles.",
    category: "memoria",
    icon: "Layers",
    price: 20,
    xpCap: 35,
    dailyXpCap: 70,
  },
  {
    id: "memoria-digitos",
    name: "Memoria de Dígitos",
    tagline: "Repite la cifra completa",
    description: "Un número aparece un instante y desaparece: escríbelo de memoria. Crece un dígito cada acierto, como en los concursos de memoria.",
    category: "memoria",
    icon: "Gauge",
    price: 30,
    xpCap: 45,
    dailyXpCap: 90,
  },
  /* ---------- Lógica ---------- */
  {
    id: "luces-fuera",
    name: "Luces del Muelle",
    tagline: "Apaga todas las farolas",
    description: "Tocar una farola cambia su luz y la de sus vecinas. Apaga las 25 del muelle en los menos toques posibles.",
    category: "logica",
    icon: "Grid3x3",
    price: 30,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "torres-hanoi",
    name: "Torres de la Fortaleza",
    tagline: "El clásico de Hanoi",
    description: "Mueve los discos de la torre a otra columna sin poner un grande sobre un pequeño. Con 5 discos, 31 movimientos son perfectos.",
    category: "logica",
    icon: "Trophy",
    price: 30,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "sudoku-4",
    name: "Sudoku del Cronista",
    tagline: "Sudoku 4×4 con reloj",
    description: "Sudokus de 4×4 generados al momento: cada fila, columna y caja del 1 al 4. Tres niveles: aprendiz, cronista y maestro.",
    category: "logica",
    icon: "ListOrdered",
    price: 40,
    xpCap: 50,
    dailyXpCap: 100,
  },
  {
    id: "buscaminas",
    name: "Caza de Minas",
    tagline: "Deducción pura 6×6",
    description: "Tablero de 6×6 con 6 minas escondidas. Los números indican cuántas hay alrededor. Deduce las casillas seguras y marca las minas.",
    category: "logica",
    icon: "Bomb",
    price: 40,
    xpCap: 50,
    dailyXpCap: 100,
  },
  {
    id: "puzzle-deslizable",
    name: "Puzle Deslizable",
    tagline: "Ordena el lema 3×3",
    description: "Ocho piezas y un hueco: ordena las letras para formar un lema del Archipiélago. Menos movimientos, más puntos.",
    category: "logica",
    icon: "Blocks",
    price: 20,
    xpCap: 35,
    dailyXpCap: 70,
  },
  {
    id: "tres-raya",
    name: "Tres en Raya Vivo",
    tagline: "Contra un rival perfecto",
    description: "El clásico de toda la vida… contra un rival que jamás se despista. Gánale si puedes: lo más realista es empatar.",
    category: "logica",
    icon: "Grid2x2",
    price: 0,
    xpCap: 30,
    dailyXpCap: 60,
  },
  {
    id: "conecta-4",
    name: "Conecta Cuatro",
    tagline: "Caída estratégica",
    description: "Suelta fichas en la ciudad y alinea cuatro en horizontal, vertical o diagonal antes de que lo haga el rival.",
    category: "logica",
    icon: "Circle",
    price: 40,
    xpCap: 50,
    dailyXpCap: 100,
  },
  /* ---------- Palabras veloces ---------- */
  {
    id: "mecanografia",
    name: "Pluma Veloz",
    tagline: "Mecanografía en español",
    description: "Copia frases de escritores en español con el teclado y mide tus palabras por minuto. La precisión también puntúa.",
    category: "palabras",
    icon: "Keyboard",
    price: 30,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "anagramas",
    name: "Anagramas del Ancla",
    tagline: "Desordena y reordena",
    description: "Las letras de una palabra llegan revueltas al puerto: ordénalas antes de que la marea se las lleve.",
    category: "palabras",
    icon: "Shuffle",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "palabra-secreta",
    name: "Palabra Secreta",
    tagline: "Adivina en 6 intentos",
    description: "Descubre la palabra oculta de cinco letras en seis intentos. Cada intento te colorea las pistas: verde, ámbar y gris.",
    category: "palabras",
    icon: "Lock",
    price: 40,
    xpCap: 50,
    dailyXpCap: 100,
  },
  {
    id: "ahorcado-animales",
    name: "Ahorcado de la Fauna",
    tagline: "Adivina el animal",
    description: "Un animal del Archipiélago se esconde tras guiones y una pista. Siete errores y la partida se hunde.",
    category: "palabras",
    icon: "Bug",
    price: 20,
    xpCap: 35,
    dailyXpCap: 70,
  },
  /* ---------- Reflejos ---------- */
  {
    id: "stroop",
    name: "Test de Stroop",
    tagline: "Color vs. palabra",
    description: "El nombre de un color escrito en otro color. Responde al color de la tinta, no a lo que dice la palabra: atención selectiva pura.",
    category: "reflejos",
    icon: "Palette",
    price: 30,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "reaccion",
    name: "Reflejo del Faro",
    tagline: "Milisegundos al bosque",
    description: "Cuando el faro se encienda, toca. Mide tu tiempo de reacción en cinco rondas y compite contra tu propia media.",
    category: "reflejos",
    icon: "Timer",
    price: 0,
    xpCap: 30,
    dailyXpCap: 60,
  },
  {
    id: "flechas-danza",
    name: "Danza de Flechas",
    tagline: "Secuencias direccionales",
    description: "Las flechas del mapa señalan una secuencia cada vez más larga: repítela con el teclado o los botones sin equivocarte.",
    category: "reflejos",
    icon: "Compass",
    price: 30,
    xpCap: 45,
    dailyXpCap: 90,
  },

  /* ==================== Mega-actualización 6 · +29 juegos ====================
   * Palabras, cálculo, lógica, memoria y reflejos. Los juegos de
   * pregunta rápida usan el motor Quiz Relámpago (quiz-blitz.tsx) y
   * las rejillas traen la sopa de letras y el crucigrama adaptativo
   * (word-grid-games.tsx). El contenido vive en blitz-banks.ts. */

  /* ---------- Palabras ---------- */
  {
    id: "memes-cultura",
    name: "Memes y Cultura Pop",
    tagline: "Traduce el slang al estándar",
    description: "«Ir a su bola», «F en el chat», «canon event»… Traduce el registro coloquial de internet y la cultura popular a español normal. Humor que además enseña.",
    category: "palabras",
    icon: "Globe",
    price: 0,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "crucigrama",
    name: "Crucigrama del Copista",
    tagline: "Cruces que se construyen solas",
    description: "Crucigramas generados al vuelo y adaptados a tu nivel: cuantas más palabras aciertes, más se complica la trama. Pista disponible si te atascas.",
    category: "palabras",
    icon: "Grid3x3",
    price: 0,
    xpCap: 60,
    dailyXpCap: 120,
  },
  {
    id: "sopa-letras",
    name: "Sopa de Letras",
    tagline: "Caza palabras escondidas",
    description: "Palabras camufladas en horizontal, vertical y diagonal. Toca la primera y la última letra. La rejilla crece contigo.",
    category: "palabras",
    icon: "Search",
    price: 0,
    xpCap: 60,
    dailyXpCap: 120,
  },
  {
    id: "sinonimos-relampago",
    name: "Sinónimos Relámpago",
    tagline: "El gemelo exacto de cada palabra",
    description: "Encuentra la palabra que comparte significado. Tu armamento secreto para no repetirte nunca más.",
    category: "palabras",
    icon: "Copy",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "antonimos-relampago",
    name: "Antónimos Relámpago",
    tagline: "El contrario en cámara rápida",
    description: "Blanco y negro, arriba y abajo: encuentra el opuesto de cada palabra antes de que se acabe el tiempo.",
    category: "palabras",
    icon: "Split",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "ortografia-relampago",
    name: "Ortografía Relámpago",
    tagline: "Haber, a ver… ¿cuál toca?",
    description: "Los clásicos que hacen sudar: haber/a ver, hecho/echo, tubo/tuvo, sino/si no. Elige la escritura correcta y sal de dudas para siempre.",
    category: "palabras",
    icon: "PenTool",
    price: 25,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "genero-relampago",
    name: "El o La",
    tagline: "Artículos con trampa",
    description: "El agua, la mano, el mapa… Los sustantivos más traicioneros del español, resueltos a golpe de reflejo.",
    category: "palabras",
    icon: "Scale",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "refranes-relampago",
    name: "Refranes del Puerto",
    tagline: "Completa la sabiduría popular",
    description: "«Más vale tarde que…» Sabiduría de siglos en formato cuesta abajo. Completa el refrán y aprende el que te falte.",
    category: "palabras",
    icon: "MessagesSquare",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "colectivos-relampago",
    name: "Nombres Colectivos",
    tagline: "Manada, enjambre, cardumen…",
    description: "¿Cómo se llama el conjunto de lobos? ¿Y de abejas? Vocabulario preciso que impresiona en cualquier redacción.",
    category: "palabras",
    icon: "Layers",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
    freeAtLevel: 8,
  },
  {
    id: "sufijos-relampago",
    name: "Grande o Pequeñito",
    tagline: "Aumentativos y diminutivos",
    description: "Casona, librote, vozarrón, riachuelo… Aprende lo que dicen los sufijos del español cuando crees que no lo dicen.",
    category: "palabras",
    icon: "Maximize2",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "conectores-relampago",
    name: "Conecta Ideas",
    tagline: "Por lo tanto, sin embargo…",
    description: "El pegamento del texto: elige el conector que une cada frase. Escritura más madura en 60 segundos.",
    category: "palabras",
    icon: "Link",
    price: 25,
    xpCap: 45,
    dailyXpCap: 90,
  },

  /* ---------- Cálculo ---------- */
  {
    id: "fracciones-relampago",
    name: "Fracciones Relámpago",
    tagline: "Mitades, tercios y más",
    description: "¿Cuánto es 3/4 de 80? Fracciones de la vida real a toda velocidad: pizza, tinta y repostería incluidos.",
    category: "calculo",
    icon: "PieChart",
    price: 25,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "potencias-raices",
    name: "Potencias y Raíces",
    tagline: "Cuadrados, cubos y sus reversos",
    description: "Del ² al √: potencias y raíces cuadradas perfectas que dejan de asustar a los diez aciertos.",
    category: "calculo",
    icon: "Superscript",
    price: 25,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "porcentajes-relampago",
    name: "Porcentajes Relámpago",
    tagline: "Descuentos a velocidad récord",
    description: "El 25 % de 240, el 10 % de 90… Cálculo de ofertas, propinas y estadísticas sin depender del móvil.",
    category: "calculo",
    icon: "Percent",
    price: 25,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "series-numericas",
    name: "Series Numéricas",
    tagline: "Adivina el patrón",
    description: "2, 4, 8, 16… Las series que aparecen en test de todo tipo: aritméticas, geométricas y acumulativas.",
    category: "calculo",
    icon: "TrendingUp",
    price: 30,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "unidades-medida",
    name: "Cambio de Unidad",
    tagline: "Kilos, litros y metros",
    description: "¿Cuántos gramos son 3 kilos? Conversiones de medida que resuelven dudas de cocina, bricolaje y exámenes.",
    category: "calculo",
    icon: "Ruler",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "tiempos-horas",
    name: "Contra Reloj",
    tagline: "Suma horas y minutos",
    description: "Son las 09:40 y el viaje dura 50 minutos… ¿a qué hora llegas? Cálculo de tiempo útil de verdad.",
    category: "calculo",
    icon: "Clock",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
  },

  /* ---------- Lógica ---------- */
  {
    id: "curiosidades-vf",
    name: "¿Verdadero o Falso?",
    tagline: "Curiosidades del mundo real",
    description: "Los pulpos tienen tres corazones, las bananas son bayas… Pon a prueba tu intuición contra el mundo real.",
    category: "logica",
    icon: "Brain",
    price: 0,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "analogias-num",
    name: "Analogías Numéricas",
    tagline: "Si 3 → 9, entonces 5 → ?",
    description: "Descubre la relación oculta entre números y aplícala. El ejercicio estrella de los test de razonamiento.",
    category: "logica",
    icon: "GitCompare",
    price: 30,
    xpCap: 45,
    dailyXpCap: 90,
  },
  {
    id: "siguiente-letra",
    name: "Series de Letras",
    tagline: "El alfabeto en secreto",
    description: "A, C, E, G… El mismo patrón que las series numéricas, pero escondido entre letras. Doble entrenamiento.",
    category: "logica",
    icon: "Type",
    price: 30,
    xpCap: 45,
    dailyXpCap: 90,
  },

  /* ---------- Memoria ---------- */
  {
    id: "memoria-palabras",
    name: "Memoria de Palabras",
    tagline: "¿Estaba en la lista?",
    description: "Memoriza la lista y detecta si la palabra apareció. La lista crece con tu nivel: entrena como un campeón de memoria.",
    category: "memoria",
    icon: "ListChecks",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "numeros-inversos",
    name: "Números al Revés",
    tagline: "Repítelos del revés",
    description: "471 → 174. El clásico test de memoria de trabajo: cuanto más aciertas, más cifras caen.",
    category: "memoria",
    icon: "FlipHorizontal2",
    price: 20,
    xpCap: 40,
    dailyXpCap: 80,
  },
  {
    id: "memoria-compras",
    name: "La Lista de la Compra",
    tagline: "Memoria de mercado",
    description: "Memoriza la lista del mercado y responde si el producto estaba. Memoria semántica con sabor a pueblo.",
    category: "memoria",
    icon: "ShoppingBasket",
    price: 0,
    xpCap: 40,
    dailyXpCap: 80,
  },

  /* ---------- Reflejos ---------- */
  {
    id: "par-impar-relampago",
    name: "Par o Impar",
    tagline: "Clasificación instantánea",
    description: "El ejercicio de atención selectiva más honesto: ¿el número que ves es par o impar? Ideal para calentar la mente.",
    category: "reflejos",
    icon: "Divide",
    price: 0,
    xpCap: 30,
    dailyXpCap: 60,
  },
  {
    id: "vocal-consonante",
    name: "¿Vocal o Consonante?",
    tagline: "El abecedario a todo gas",
    description: "Primera letra de la palabra: ¿vocal o consonante? Micro-decisiones que afinan tu conciencia fonológica.",
    category: "reflejos",
    icon: "ABC",
    price: 0,
    xpCap: 30,
    dailyXpCap: 60,
  },
  {
    id: "cuenta-letras",
    name: "Cuenta Letras",
    tagline: "¿Cuántas «a» hay?",
    description: "Escanea la palabra y cuenta ocurrencias de una letra. Atención al detalle en su forma más pura.",
    category: "reflejos",
    icon: "Hash",
    price: 20,
    xpCap: 30,
    dailyXpCap: 60,
  },
  {
    id: "sumas-encadenadas",
    name: "Sumas Encadenadas",
    tagline: "Tres sumandos de un vistazo",
    description: "a + b + c sin papel ni tregua: suma en cadena y siente cómo el cálculo mental se vuelve reflejo.",
    category: "calculo",
    icon: "Sigma",
    price: 0,
    xpCap: 35,
    dailyXpCap: 70,
  },
  {
    id: "orden-numerico",
    name: "El Número Mayor",
    tagline: "Comparación instantánea",
    description: "Cuatro números, un solo ganador: ¿cuál es el mayor? Comparación numérica rápida, base de todo cálculo.",
    category: "reflejos",
    icon: "ArrowBigUpDash",
    price: 0,
    xpCap: 30,
    dailyXpCap: 60,
  },
  {
    id: "letra-vecina",
    name: "La Letra Vecina",
    tagline: "El alfabeto de memoria",
    description: "¿Qué letra vive entre la «M» y la «Ñ»? Orden alfabético sin recitar el abecedario desde el principio.",
    category: "logica",
    icon: "Landmark",
    price: 0,
    xpCap: 30,
    dailyXpCap: 60,
  },
];

export const ARCADE_BY_ID: Record<string, ArcadeGameDef> = ARCADE_GAMES.reduce(
  (acc, g) => {
    acc[g.id] = g;
    return acc;
  },
  {} as Record<string, ArcadeGameDef>,
);

/** XP diario acumulado por juego (registro externo, por simplicidad en stats). */
const dayOf = (now: number) => {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export interface UnlockOutcome {
  ok: boolean;
  reason?: "item-desconocido" | "sin-fondos" | "ya-desbloqueado";
  core?: GameCore;
}

/** ¿El juego está disponible ya (gratis, comprado o por nivel)? */
export function arcadeAvailable(core: GameCore, gameId: string, level: number): boolean {
  const def = ARCADE_BY_ID[gameId];
  if (!def) return false;
  if (def.price === 0) return true;
  if (core.arcade.unlocked.includes(gameId)) return true;
  if (def.freeAtLevel !== undefined && level >= def.freeAtLevel) return true;
  return false;
}

/** Compra el desbloqueo de un juego con tinta. */
export function applyArcadeUnlock(core: GameCore, gameId: string): UnlockOutcome {
  const def = ARCADE_BY_ID[gameId];
  if (!def) return { ok: false, reason: "item-desconocido" };
  if (def.price === 0 || core.arcade.unlocked.includes(gameId)) {
    return { ok: false, reason: "ya-desbloqueado" };
  }
  if (core.wallet.tinta < def.price) return { ok: false, reason: "sin-fondos" };
  return {
    ok: true,
    core: {
      ...core,
      wallet: {
        ...core.wallet,
        tinta: core.wallet.tinta - def.price,
        spent: core.wallet.spent + def.price,
      },
      arcade: {
        ...core.arcade,
        unlocked: [...core.arcade.unlocked, gameId],
      },
    },
  };
}

/** XP real que entrega una partida, respetando el tope diario del juego. */
export function arcadeXpFor(core: GameCore, gameId: string, score: number, now = Date.now()): number {
  const def = ARCADE_BY_ID[gameId];
  if (!def) return 0;
  const raw = Math.max(0, Math.min(def.xpCap, Math.round(score / 10)));
  const key = `${dayOf(now)}:${gameId}`;
  const already = core.arcade.playsByDay?.[key] ?? 0;
  return Math.max(0, Math.min(raw, def.dailyXpCap - already));
}

export interface ArcadeScoreOutcome {
  core: GameCore;
  xp: number;
  tinta: number;
  isRecord: boolean;
}

/** Registra el fin de una partida: récord, partidas, XP y tinta. */
export function applyArcadeScore(
  core: GameCore,
  gameId: string,
  score: number,
  now = Date.now(),
): ArcadeScoreOutcome {
  const def = ARCADE_BY_ID[gameId];
  if (!def) return { core, xp: 0, tinta: 0, isRecord: false };
  const xp = arcadeXpFor(core, gameId, score, now);
  const key = `${dayOf(now)}:${gameId}`;
  const prevBest = core.arcade.best[gameId] ?? 0;
  const isRecord = score > prevBest;
  const tinta = tintaForXp(xp);
  const next: GameCore = {
    ...core,
    xp: core.xp + xp,
    wallet: { ...core.wallet, tinta: core.wallet.tinta + tinta },
    arcade: {
      ...core.arcade,
      best: { ...core.arcade.best, [gameId]: Math.max(prevBest, score) },
      plays: { ...core.arcade.plays, [gameId]: (core.arcade.plays[gameId] ?? 0) + 1 },
      playsByDay: prunePlaysByDay({ ...core.arcade.playsByDay, [key]: (core.arcade.playsByDay?.[key] ?? 0) + xp }, dayOf(now)),
      xpEarned: (core.arcade.xpEarned ?? 0) + xp,
    },
    stats: {
      ...core.stats,
      totalAnswers: core.stats.totalAnswers + 1,
    },
  };
  return { core: next, xp, tinta, isRecord };
}

/** Poda del registro diario «YYYY-MM-DD:juego»: se conservan 400 días. */
function prunePlaysByDay(map: NonNullable<GameCore["arcade"]["playsByDay"]>, today: string): GameCore["arcade"]["playsByDay"] {
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 400);
  const cutoff = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  for (const key of Object.keys(map)) {
    if (key.slice(0, 10) < cutoff) delete map[key];
  }
  return map;
}


/* ================= Taller de Escritura · mecanografía ================= */

export interface TypingResult {
  /** Palabras por minuto netas. */
  wpm: number;
  /** Precisión 0-100. */
  accuracy: number;
  /** Palabras correctas de la prueba. */
  words: number;
  /** Era un ejercicio de teclas (drill) en vez de prueba cronometrada. */
  isDrill?: boolean;
}

/** XP de una prueba de mecanografía (curva suave con tope). */
export function typingXpFor(r: TypingResult): number {
  const base = Math.min(40, Math.round((r.wpm * Math.min(1, r.accuracy / 100)) / 1.8));
  return base + (r.isDrill ? 4 : 0);
}

/** Registra una prueba de mecanografía: récords, racha diaria, XP y tinta. */
export function applyTypingTest(
  core: GameCore,
  r: TypingResult,
  now = Date.now(),
): { core: GameCore; xp: number; tinta: number; isRecord: boolean } {
  const xp = typingXpFor(r);
  const tinta = tintaForXp(xp);
  const t = core.arcade.typing ?? { bestWpm: 0, bestAccuracy: 0, testsDone: 0, totalWords: 0, streak: 0, lastDay: "", drillsDone: 0 };
  const today = dayOf(now);
  const isRecord = r.wpm > t.bestWpm;
  // Racha diaria del taller: +1 si es un día nuevo consecutivo.
  let streak = t.streak;
  if (t.lastDay !== today) {
    // Ayer por fecha local (seguro frente a cambios de hora DST:
    // nunca resta un fijo de 24 h).
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    streak = t.lastDay === dayOf(y.getTime()) ? t.streak + 1 : 1;
  }
  const next: GameCore = {
    ...core,
    xp: core.xp + xp,
    wallet: { ...core.wallet, tinta: core.wallet.tinta + tinta },
    arcade: {
      ...core.arcade,
      xpEarned: (core.arcade.xpEarned ?? 0) + xp,
      typing: {
        bestWpm: Math.max(t.bestWpm, Math.round(r.wpm)),
        bestAccuracy: Math.max(t.bestAccuracy, Math.round(r.accuracy)),
        testsDone: t.testsDone + 1,
        totalWords: t.totalWords + r.words,
        streak,
        lastDay: today,
        drillsDone: t.drillsDone + (r.isDrill ? 1 : 0),
      },
    },
    stats: {
      ...core.stats,
      totalAnswers: core.stats.totalAnswers + 1,
    },
  };
  return { core: next, xp, tinta, isRecord };
}
