import type { GameId, SkillId } from "@/types";

/** Metadatos de un minijuego (para el registro de juegos y la biblioteca). */
export interface GameInfo {
  id: GameId;
  name: string;
  tagline: string;
  description: string;
  skill: SkillId;
  icon: string;
  /** Instrucciones que se muestran antes de jugar. */
  instructions: string;
  /** Segundos estimados por ítem. */
  secondsPerItem: number;
  /** Tiempo límite por ítem en segundos (null = sin límite). */
  timeLimit: number | null;
}

export const GAMES: Record<GameId, GameInfo> = {
  srs: {
    id: "srs",
    name: "Jardín de Tarjetas",
    tagline: "Repetición espaciada dinámica",
    description:
      "Tarjetas inteligentes que reaparecen justo cuando estás a punto de olvidar la palabra. Cada respuesta ajusta el calendario del jardín.",
    skill: "vocabulario",
    icon: "Sprout",
    instructions:
      "Piensa el significado de la palabra, toca «Mostrar» y sé sincero al valorarte: el jardín usa tu respuesta para decidir cuándo volver a preguntarte.",
    secondsPerItem: 18,
    timeLimit: null,
  },
  trivia: {
    id: "trivia",
    name: "Trivia Relámpago",
    tagline: "Clasifica palabras a contrarreloj",
    description:
      "Palabras que caen como rayos: clasifícalas como sustantivo, verbo, adjetivo o adverbio antes de que se apague la luz.",
    skill: "vocabulario",
    icon: "Zap",
    instructions:
      "Mira la palabra destacada en la frase y elige su categoría gramatical. Tienes 12 segundos por palabra.",
    secondsPerItem: 10,
    timeLimit: 12,
  },
  puzzle: {
    id: "puzzle",
    name: "Puentes de Palabras",
    tagline: "Puzzles sintácticos",
    description:
      "Los fragmentos de una oración se han caído del puente. Tócalos en orden para reconstruir la sintaxis completa.",
    skill: "gramatica",
    icon: "Blocks",
    instructions:
      "Toca los fragmentos en el orden correcto para construir la oración. Si te equivocas, toca un fragmento ya colocado para devolverlo.",
    secondsPerItem: 30,
    timeLimit: null,
  },
  cloze: {
    id: "cloze",
    name: "Puentes de Contexto",
    tagline: "Cloze test contextual",
    description:
      "Textos con huecos que solo el contexto puede resolver. Ser, estar, por, para… la palabra exacta importa.",
    skill: "gramatica",
    icon: "TextSelect",
    instructions: "Lee el texto con atención y elige la opción que completa el hueco correctamente.",
    secondsPerItem: 22,
    timeLimit: null,
  },
  errores: {
    id: "errores",
    name: "Caza de Errores",
    tagline: "Detective ortográfico",
    description:
      "Una frase se cuela en la Fortaleza con un error escondido. Encuéntralo y elige la corrección correcta.",
    skill: "ortografia",
    icon: "Search",
    instructions:
      "Toca la palabra que esconde el error (o «No hay error» si la frase está limpia) y después elige la corrección adecuada.",
    secondsPerItem: 28,
    timeLimit: null,
  },
  tildes: {
    id: "tildes",
    name: "Tribunal de las Tildes",
    tagline: "Justicia acentual",
    description:
      "La palabra comparece ante el tribunal sin su tilde. Decide qué sílaba la merece… o declárala inocente.",
    skill: "ortografia",
    icon: "Scale",
    instructions:
      "Lee la frase, mira la palabra señalada y toca la sílaba que debe llevar tilde. Si la palabra no lleva ninguna, elige «No lleva tilde».",
    secondsPerItem: 24,
    timeLimit: null,
  },
  parrafos: {
    id: "parrafos",
    name: "Cronista de la Biblioteca",
    tagline: "Constructor de párrafos",
    description:
      "Las páginas de un libro se han mezclado. Ordena las oraciones hasta que la historia recupere su hilo.",
    skill: "lectura",
    icon: "ListOrdered",
    instructions:
      "Toca las oraciones en el orden correcto para reconstruir el párrafo. Fíjate en los conectores y en la lógica del relato.",
    secondsPerItem: 45,
    timeLimit: null,
  },

  /* ==================== Etapa 2 ==================== */
  dictado: {
    id: "dictado",
    name: "Dictado del Faro",
    tagline: "Escucha y escribe, tilde a tilde",
    description:
      "El faro dicta frases con la voz del navegador y tú las escribes. Tildes, eñes y signos de apertura cuentan.",
    skill: "audicion",
    icon: "Ear",
    instructions:
      "Escucha la frase (puedes repetirla hasta tres veces) y escríbela exacta. Se toleran mayúsculas y el punto final, pero no las tildes que faltan.",
    secondsPerItem: 40,
    timeLimit: null,
  },
  matices: {
    id: "matices",
    name: "Ecos del Puerto",
    tagline: "Tono e intención en la voz",
    description:
      "No todo está en las palabras: escucha el eco y decide qué intención esconde la frase.",
    skill: "audicion",
    icon: "AudioLines",
    instructions:
      "Escucha la frase y elige su intención o tono. Cada respuesta explica la pista que lo delata.",
    secondsPerItem: 25,
    timeLimit: null,
  },
  lectura: {
    id: "lectura",
    name: "Lectura Inmersiva",
    tagline: "Leer (y oír) con los ojos y las orejas",
    description:
      "Textos breves que se iluminan frase a frase mientras se leen en voz alta. Al final, una pregunta de comprensión.",
    skill: "lectura",
    icon: "BookOpenText",
    instructions:
      "Escucha (o lee) el texto con calma y responde después la pregunta. La voz es la de tu navegador: varía según el sistema.",
    secondsPerItem: 75,
    timeLimit: null,
  },
  sprint: {
    id: "sprint",
    name: "Sprint de Vocabulario",
    tagline: "Definiciones a contrarreloj",
    description:
      "Una palabra, cuatro definiciones y diez segundos. La velocidad con precisión es la única vía.",
    skill: "vocabulario",
    icon: "Gauge",
    instructions:
      "Elige la definición correcta antes de que se agote el tiempo. Si se agota, cuenta como fallo (con explicación).",
    secondsPerItem: 10,
    timeLimit: 10,
  },
  sinonimos: {
    id: "sinonimos",
    name: "Batalla de Sinónimos",
    tagline: "La palabra justa en el sitio justo",
    description:
      "Sinónimos y antónimos en contexto: la palabra que encaja sin romper la frase.",
    skill: "vocabulario",
    icon: "Swords",
    instructions:
      "Lee la frase y elige la opción pedida (sinónimo o antónimo) que mejor sustituye a la palabra destacada.",
    secondsPerItem: 20,
    timeLimit: null,
  },
  historias: {
    id: "historias",
    name: "Historias Ramificadas",
    tagline: "Tú decides el rumbo",
    description:
      "Relatos del Archipiélago que cambian según tus decisiones. Explorar no se castiga: al final, una pregunta de comprensión.",
    skill: "expresion",
    icon: "GitBranch",
    instructions:
      "Lee y decide el rumbo en cada encrucijada. Cuando la historia termine, responde la pregunta final.",
    secondsPerItem: 90,
    timeLimit: null,
  },
  refranes: {
    id: "refranes",
    name: "Sabiduría Popular",
    tagline: "Refranes y modismos del español",
    description:
      "Dichos de toda la hispanofonía con su significado real. Del Caribe al Cono Sur, la lengua cambia y converge.",
    skill: "expresion",
    icon: "ScrollText",
    instructions:
      "Elige el significado verdadero del dicho. Las distracciones suenan creíbles: busca el sentido figurado.",
    secondsPerItem: 22,
    timeLimit: null,
  },
  minuto: {
    id: "minuto",
    name: "Reto del Minuto",
    tagline: "Escritura libre sin freno",
    description:
      "Sesenta segundos de escritura sin borrar ni juzgar. Después, una autoevaluación honesta con criterios claros.",
    skill: "expresion",
    icon: "PenLine",
    instructions:
      "Escribe sin parar durante un minuto. Sin corrección automática: luego revisas tu texto con una lista de criterios.",
    secondsPerItem: 75,
    timeLimit: null,
  },
};

export const GAME_IDS = Object.keys(GAMES) as GameId[];

/** Etiquetas legibles de categorías gramaticales para Trivia. */
export const GRAMMAR_CLASSES = [
  { id: "sustantivo", label: "Sustantivo", example: "casa, libertad, faro" },
  { id: "verbo", label: "Verbo", example: "corre, soñé, será" },
  { id: "adjetivo", label: "Adjetivo", example: "ligero, difícil, amable" },
  { id: "adverbio", label: "Adverbio", example: "despacio, quizá, hoy" },
] as const;
