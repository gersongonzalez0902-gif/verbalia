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

  /* ==================== Etapa 3 · cinco nuevos por ciudad ==================== */
  "memoria-bosque": {
    id: "memoria-bosque",
    name: "Memoria del Bosque",
    tagline: "Pares de palabra y significado",
    description:
      "Las tarjetas del jardín se han mezclado. Voltéalas de dos en dos y empareja cada palabra con su significado.",
    skill: "vocabulario",
    icon: "Brain",
    instructions:
      "Toca dos tarjetas para voltearlas. Si forman un par (palabra y su significado), se quedan descubiertas. Empareja todas con los menores intentos posibles.",
    secondsPerItem: 45,
    timeLimit: null,
  },
  "intruso-bosque": {
    id: "intruso-bosque",
    name: "El Intruso del Bosque",
    tagline: "Encuentra la palabra que no encaja",
    description:
      "Tres palabras de la misma familia y una intrusa escondida entre la maleza. Señálala para despejar el claro.",
    skill: "vocabulario",
    icon: "Shapes",
    instructions:
      "Mira las cuatro palabras: tres comparten una familia semántica. Toca la que no pertenece.",
    secondsPerItem: 20,
    timeLimit: null,
  },
  "escribe-bosque": {
    id: "escribe-bosque",
    name: "Pluma Salvaje",
    tagline: "Escribe la palabra escondida",
    description:
      "La definición aparece, la palabra se esconde. Escríbela letra a letra con la ayuda de su categoría.",
    skill: "vocabulario",
    icon: "PenLine",
    instructions:
      "Lee la definición y escribe la palabra correcta. Puedes pedir una pista (categoría y número de letras), pero la pluma recuerda los intentos.",
    secondsPerItem: 30,
    timeLimit: null,
  },
  "conecta-bosque": {
    id: "conecta-bosque",
    name: "Senda del Léxico",
    tagline: "Palabra, sinónimo y campo",
    description:
      "Las palabras del bosque cuelgan de las ramas y sus parejas descansan entre los helechos: definiciones, sinónimos y campos de significado.",
    skill: "vocabulario",
    icon: "Waypoints",
    instructions:
      "Toca una palabra de la columna izquierda y después su pareja en la derecha: su definición, su sinónimo o su campo. Cada acierto tiende un puente más en la senda.",
    secondsPerItem: 40,
    timeLimit: null,
  },
  "vf-bosque": {
    id: "vf-bosque",
    name: "Verdad o Hierba",
    tagline: "Afirmaciones sobre palabras",
    description:
      "Afirmaciones sobre el uso y el significado de las palabras. Decide si florecen verdaderas o se marchitan falsas.",
    skill: "vocabulario",
    icon: "Sprout",
    instructions:
      "Lee la afirmación sobre una palabra y decide: verdadera o falsa. Si es falsa, verás la explicación correcta.",
    secondsPerItem: 18,
    timeLimit: null,
  },
  "oye-bosque": {
    id: "oye-bosque",
    name: "Oído del Bosque",
    tagline: "Escucha y elige la escritura",
    description:
      "El viento susurra una palabra. Escúchala y elige la escritura correcta entre trampas fonéticas.",
    skill: "vocabulario",
    icon: "Ear",
    instructions:
      "Pulsa el altavoz para oír la palabra (voz de tu navegador) y toca la escritura correcta.",
    secondsPerItem: 20,
    timeLimit: null,
  },
  "sortea-ciudad": {
    id: "sortea-ciudad",
    name: "Semáforo Gramático",
    tagline: "Clasifica en el cubo correcto",
    description:
      "Las frases cruzan la ciudad sin dirección. Enróscalas al cubo correcto: ser o estar, por o para, bien o mal.",
    skill: "gramatica",
    icon: "ArrowDownUp",
    instructions:
      "Lee la frase y toca el cubo al que pertenece. Los cubos cambian según la ronda: fíjate en sus etiquetas.",
    secondsPerItem: 16,
    timeLimit: null,
  },
  "vf-ciudad": {
    id: "vf-ciudad",
    name: "Juzgado Gramatical",
    tagline: "¿Se dice o no se dice?",
    description:
      "Frases que pasan por el juzgado de la ciudad: unas son correctas y otras esconden un delito gramatical.",
    skill: "gramatica",
    icon: "BadgeCheck",
    instructions:
      "Lee la frase del juzgado y decide si es gramaticalmente correcta (verdadera) o incorrecta (falsa).",
    secondsPerItem: 16,
    timeLimit: null,
  },
  "conecta-ciudad": {
    id: "conecta-ciudad",
    name: "Puentes Incompletos",
    tagline: "Une inicio y final",
    description:
      "Los puentes de la ciudad quedaron a medias. Conecta cada inicio de oración con el final que le corresponde.",
    skill: "gramatica",
    icon: "Waypoints",
    instructions:
      "Toca un inicio de la columna izquierda y después su final en la derecha. Los puentes se dibujan solos cuando aciertas.",
    secondsPerItem: 40,
    timeLimit: null,
  },
  "intruso-ciudad": {
    id: "intruso-ciudad",
    name: "Intruso Urbano",
    tagline: "Cuatro palabras, una disfrazada",
    description:
      "En la avenida desfilan cuatro palabras: tres hacen la misma función y una se ha colado con documentación falsa.",
    skill: "gramatica",
    icon: "Building2",
    instructions:
      "Tres palabras comparten función o estructura gramatical. Toca el intruso que no pertenece al grupo.",
    secondsPerItem: 20,
    timeLimit: null,
  },
  "escribe-ciudad": {
    id: "escribe-ciudad",
    name: "Pluma Urbana",
    tagline: "Conjuga bajo presión",
    description:
      "El ayuntamiento exige formas verbales exactas. Escríbelas con tilde y todo, sin redondear la esquina.",
    skill: "gramatica",
    icon: "PenLine",
    instructions:
      "Lee la persona, el tiempo y el verbo pedidos, y escribe la forma exacta. Las tildes cuentan.",
    secondsPerItem: 26,
    timeLimit: null,
  },
  "sortea-fortaleza": {
    id: "sortea-fortaleza",
    name: "Clasifica Acentos",
    tagline: "Agudas, llanas y esdrújulas",
    description:
      "Las palabras asaltan la fortaleza por tres puertas: aguda, llana o esdrújula. Colócalas en su torre.",
    skill: "ortografia",
    icon: "Scale",
    instructions:
      "Mira la palabra (sin tilde) y clasifícala por donde llevaría el acento: aguda, llana o esdrújula. Después de responder verás dónde va la tilde.",
    secondsPerItem: 16,
    timeLimit: null,
  },
  "vf-fortaleza": {
    id: "vf-fortaleza",
    name: "Muro de Verdades",
    tagline: "Ortografía verdadera o falsa",
    description:
      "Cada ladrillo del muro trae una afirmación ortográfica. Los falsos se caen solos cuando los señalas.",
    skill: "ortografia",
    icon: "Castle",
    instructions:
      "Lee la afirmación sobre escritura de una palabra y decide si es verdadera o falsa. La corrección aparece al fallar.",
    secondsPerItem: 16,
    timeLimit: null,
  },
  "escribe-fortaleza": {
    id: "escribe-fortaleza",
    name: "Pluma Blindada",
    tagline: "Escribe la palabra trampa",
    description:
      "Palabras con b/v, g/j, h y tildes traicioneras. La fortaleza te dicta la definición y tú escribes sin fallar.",
    skill: "ortografia",
    icon: "Feather",
    instructions:
      "Lee la definición y escribe la palabra con ortografía exacta. Las tildes valen tanto como las letras.",
    secondsPerItem: 28,
    timeLimit: null,
  },
  "oye-fortaleza": {
    id: "oye-fortaleza",
    name: "Eco Guardián",
    tagline: "b/v, g/j, h… ¿cuál oíste?",
    description:
      "El eco del muro pronuncia palabras trampa. Elige la escritura correcta: el oído engaña, la fortaleza no.",
    skill: "ortografia",
    icon: "Ear",
    instructions:
      "Escucha la palabra y elige su escritura correcta entre las cuatro opciones (solo una es la válida).",
    secondsPerItem: 18,
    timeLimit: null,
  },
  "memoria-fortaleza": {
    id: "memoria-fortaleza",
    name: "Memoria de Homófonos",
    tagline: "Suena igual, se escribe distinto",
    description:
      "Pares de homófonos grabados en los muros: azar y azahar, haber y a ver. Voltéalos y emparéjalos.",
    skill: "ortografia",
    icon: "Layers",
    instructions:
      "Empareja cada palabra con su compañera de sonido: suenan igual pero se escriben y significan cosas distintas.",
    secondsPerItem: 45,
    timeLimit: null,
  },
  "conecta-biblioteca": {
    id: "conecta-biblioteca",
    name: "Conecta Páginas",
    tagline: "Conceptos y definiciones",
    description:
      "Los conceptos de la Biblioteca se han despegado de sus definiciones. Vuelve a encuadernarlos por pares.",
    skill: "lectura",
    icon: "Waypoints",
    instructions:
      "Toca un concepto y después su definición. Cada pareja correcta ilumina una página más del libro.",
    secondsPerItem: 40,
    timeLimit: null,
  },
  "vf-biblioteca": {
    id: "vf-biblioteca",
    name: "Lector Detectivo",
    tagline: "¿Dice el texto lo que crees?",
    description:
      "Afirmaciones sobre textos, tono y sentido literal. Detecta las que el autor nunca escribió.",
    skill: "lectura",
    icon: "Library",
    instructions:
      "Lee la afirmación sobre un texto o su lenguaje y decide: verdadera o falsa. La explicación llega al final.",
    secondsPerItem: 20,
    timeLimit: null,
  },
  "intruso-biblioteca": {
    id: "intruso-biblioteca",
    name: "Intruso Literario",
    tagline: "El que no pertenece al estante",
    description:
      "Cuatro palabras comparten un estante por registro o campo… menos una, que alguien dejó en el lugar equivocado.",
    skill: "lectura",
    icon: "Shapes",
    instructions:
      "Observa las cuatro palabras: tres comparten campo semántico o registro. Toca la intrusa del estante.",
    secondsPerItem: 20,
    timeLimit: null,
  },
  "memoria-puerto": {
    id: "memoria-puerto",
    name: "Memoria de Ecos",
    tagline: "Pares de regionalismos",
    description:
      "En el puerto desembarcan palabras gemelas de países distintos: plátano y banana, palta y aguacate. Emparéjalas.",
    skill: "audicion",
    icon: "Languages",
    instructions:
      "Voltea dos tarjetas y une cada palabra con su variante regional. La tripulación te observa.",
    secondsPerItem: 45,
    timeLimit: null,
  },
  "memoria-biblioteca": {
    id: "memoria-biblioteca",
    name: "Memoria de Cultismos",
    tagline: "Pares de vocabulario culto",
    description:
      "Las palabras más viajadas de la Biblioteca juegan al escondite con sus significados. Encuéntralos por pares.",
    skill: "lectura",
    icon: "BookHeart",
    instructions:
      "Voltea las tarjetas y empareja cada cultismo (C1-C2) con su definición. Menos intentos, más mérito.",
    secondsPerItem: 45,
    timeLimit: null,
  },
  "sortea-biblioteca": {
    id: "sortea-biblioteca",
    name: "Hecho u Opinión",
    tagline: "Clasifica lo que lees",
    description:
      "La Biblioteca separa los hechos de las opiniones. Tú eres el bibliotecario de guardia: clasifica cada frase.",
    skill: "lectura",
    icon: "BookOpenText",
    instructions:
      "Lee la frase y decide: ¿es un hecho comprobable o una opinión? Clasifícala en el cubo correcto.",
    secondsPerItem: 16,
    timeLimit: null,
  },
  "oye-puerto": {
    id: "oye-puerto",
    name: "Reflejos del Faro",
    tagline: "Escucha la frase exacta",
    description:
      "El faro dicta y las gaviotas confunden. Escucha la frase completa y elige la transcripción exacta.",
    skill: "audicion",
    icon: "AudioLines",
    instructions:
      "Escucha la frase corta (puedes repetirla) y toca la escritura que copia exactamente lo que oíste.",
    secondsPerItem: 22,
    timeLimit: null,
  },
  "vf-puerto": {
    id: "vf-puerto",
    name: "Tono Verdadero",
    tagline: "¿Qué intención esconde la voz?",
    description:
      "Afirmaciones sobre tono, ironía y cortesía. El puerto murmura: distingue la voz sincera de la burlona.",
    skill: "audicion",
    icon: "MessageCircle",
    instructions:
      "Lee (o escucha) la afirmación sobre una frase y su tono, y decide si es verdadera o falsa.",
    secondsPerItem: 18,
    timeLimit: null,
  },
  "conecta-puerto": {
    id: "conecta-puerto",
    name: "Conecta Intenciones",
    tagline: "Frase y propósito",
    description:
      "Cada frase del puerto llegó con un propósito distinto: pedir, ironizar, tranquilizar. Conéctalas.",
    skill: "audicion",
    icon: "Waypoints",
    instructions:
      "Une cada frase con la intención que transmite. Piensa en el tono, no solo en las palabras.",
    secondsPerItem: 36,
    timeLimit: null,
  },
  "sortea-puerto": {
    id: "sortea-puerto",
    name: "Registro del Puerto",
    tagline: "¿Formal o coloquial?",
    description:
      "Los marineros hablan de mil maneras. Clasifica cada frase por su registro antes de que zape el barco.",
    skill: "audicion",
    icon: "Filter",
    instructions:
      "Lee la frase y clasifícala: registro formal o coloquial. Piensa en el contexto donde encajaría.",
    secondsPerItem: 16,
    timeLimit: null,
  },
  "vf-torre": {
    id: "vf-torre",
    name: "Refrán Verdadero",
    tagline: "¿Significa eso el refrán?",
    description:
      "Los refranes de la torre se presentan con un significado atribuido. Algunos dicen la verdad; otros, puro cuento.",
    skill: "expresion",
    icon: "ScrollText",
    instructions:
      "Lee el refrán y el significado que se le atribuye: ¿es el verdadero o es una trampa? Decide.",
    secondsPerItem: 18,
    timeLimit: null,
  },
  "conecta-torre": {
    id: "conecta-torre",
    name: "Conecta Sabidurías",
    tagline: "Refrán y significado",
    description:
      "Los refranes cuelgan de la torre con los significados en bolsas separadas. Vuelve a unir cada dicho con su sentido.",
    skill: "expresion",
    icon: "Waypoints",
    instructions:
      "Toca un refrán y después su significado verdadero. Cada acierto cuelga una linterna más en la torre.",
    secondsPerItem: 40,
    timeLimit: null,
  },
  "sortea-torre": {
    id: "sortea-torre",
    name: "Literal o Figurado",
    tagline: "¿Qué sentido esconde?",
    description:
      "Frases que pueden tomarse al pie de la letra… o no. Clasifícalas según el sentido con que se usan.",
    skill: "expresion",
    icon: "Lightbulb",
    instructions:
      "Lee la frase y decide si se usa en sentido literal o figurado. Después, la torre te cuenta el porqué.",
    secondsPerItem: 16,
    timeLimit: null,
  },
  "escribe-torre": {
    id: "escribe-torre",
    name: "Pluma de la Torre",
    tagline: "La palabra justa evocada",
    description:
      "Una pista desde la terraza más alta y una palabra que solo tu vocabulario puede alcanzar. Escríbela.",
    skill: "expresion",
    icon: "PenLine",
    instructions:
      "Lee la pista (una frase con el hueco de la palabra buscada) y escribe el término exacto que encaja.",
    secondsPerItem: 28,
    timeLimit: null,
  },
  "memoria-torre": {
    id: "memoria-torre",
    name: "Memoria de Sinónimos",
    tagline: "Pares que significan lo mismo",
    description:
      "La torre guarda parejas de palabras casi gemelas: dichoso y afortunado, pena y tristeza. Encuéntralas.",
    skill: "expresion",
    icon: "Swords",
    instructions:
      "Voltea las tarjetas y empareja cada palabra con su sinónimo. Ojo: hay distractores que se parecen mucho.",
    secondsPerItem: 45,
    timeLimit: null,
  },
  "vf-observatorio": {
    id: "vf-observatorio",
    name: "Mitos y Etimologías",
    tagline: "¿De dónde viene esa palabra?",
    description:
      "El Observatorio recibe informes sobre el origen de las palabras: unos son ciertos, otros son leyendas urbanas.",
    skill: "cultura",
    icon: "Telescope",
    instructions:
      "Lee la afirmación etimológica y decide: ¿historia verdadera o mito? La ficha del telescopio corrige al final.",
    secondsPerItem: 18,
    timeLimit: null,
  },
  "conecta-observatorio": {
    id: "conecta-observatorio",
    name: "Ruta de Orígenes",
    tagline: "Palabra y puerto de origen",
    description:
      "Las palabras anclan en el Observatorio tras un largo viaje. Conecta cada una con el idioma que la trajo.",
    skill: "cultura",
    icon: "Globe",
    instructions:
      "Toca una palabra y después el idioma de origen que le corresponde (latín, griego, árabe, náhuatl, quechua…).",
    secondsPerItem: 36,
    timeLimit: null,
  },
  "sortea-observatorio": {
    id: "sortea-observatorio",
    name: "Mapa de la Lengua",
    tagline: "¿Dónde se dice así?",
    description:
      "Regionalismos de toda la hispanofonía piden su lugar en el mapa. Asigna cada palabra a su región.",
    skill: "cultura",
    icon: "MapPin",
    instructions:
      "Mira la palabra regional y toca la región donde es habitual. Al responder verás un apunte del Observatorio.",
    secondsPerItem: 18,
    timeLimit: null,
  },
  "memoria-observatorio": {
    id: "memoria-observatorio",
    name: "Memoria de Orígenes",
    tagline: "Pares de palabra y puerto",
    description:
      "Las tarjetas del Observatorio esconden palabras y los idiomas que las trajeron. Emparéjalas antes del anochecer.",
    skill: "cultura",
    icon: "Layers",
    instructions:
      "Voltea dos tarjetas y une cada palabra con el idioma del que procede. Los viajes largos merecen memoria larga.",
    secondsPerItem: 45,
    timeLimit: null,
  },
  "intruso-observatorio": {
    id: "intruso-observatorio",
    name: "Intruso Etimológico",
    tagline: "Tres viajeras y una nativa",
    description:
      "Cuatro palabras, tres llegadas del mismo puerto y una que desembarcó de otro barco. Señala a la pasajera intrusa.",
    skill: "cultura",
    icon: "Shapes",
    instructions:
      "Tres palabras comparten idioma de origen. Toca la que llegó de un viaje distinto.",
    secondsPerItem: 22,
    timeLimit: null,
  },

  /* ==================== Etapa 4 · Forja del Escritor ==================== */
  metaforas: {
    id: "metaforas",
    name: "Forja de Metáforas",
    tagline: "Enciende la imagen exacta",
    description:
      "El fuego de la Forja funde sentidos: completa cada metáfora eligiendo la imagen literaria justa, la que brilla y la que pega.",
    skill: "expresion",
    icon: "FlameKindling",
    instructions:
      "Lee la frase con su hueco y elige la imagen que completa la metáfora. Descarta las descripciones planas: aquí se pide fuego, no inventario.",
    secondsPerItem: 26,
    timeLimit: null,
  },
  registro: {
    id: "registro",
    name: "Registro Correcto",
    tagline: "La misma idea, el traje justo",
    description:
      "Una misma cosa se dice de mil maneras: formal, coloquial, neutra. Viste cada mensaje con el registro que su situación pide.",
    skill: "expresion",
    icon: "MessagesSquare",
    instructions:
      "Lee la situación y fíjate en el registro que se pide (formal, coloquial o neutro). Elige la versión que mejor encaja.",
    secondsPerItem: 28,
    timeLimit: null,
  },
  conectores: {
    id: "conectores",
    name: "Taller de Conectores",
    tagline: "Remaches lógicos del texto",
    description:
      "Los conectores son los remaches que sostienen un texto: sin embargo, por lo tanto, aunque… elige el que une estas ideas.",
    skill: "gramatica",
    icon: "Link2",
    instructions:
      "Mira la frase con el hueco y elige el conector lógico que encaja: contraste, causa, consecuencia, concesión…",
    secondsPerItem: 22,
    timeLimit: null,
  },
  ironia: {
    id: "ironia",
    name: "Detector de Ironía",
    tagline: "¿Dice lo que dice… o lo contrario?",
    description:
      "En la Forja también se forja el tono: frases que dicen una cosa y quieren decir la otra. Con el contexto como brújula, decide.",
    skill: "lectura",
    icon: "Smile",
    instructions:
      "Lee la frase y su contexto. Di si va en sentido literal o con ironía: las comillas, la exageración y el contexto delatan al tono.",
    secondsPerItem: 24,
    timeLimit: null,
  },
  titulos: {
    id: "titulos",
    name: "Censura del Editor",
    tagline: "Tacha la palabra que sobra",
    description:
      "El editor de la Forja es despiadado con las redundancias: «subir arriba», «mi opinión personal»… encuentra la palabra que repite la idea.",
    skill: "ortografia",
    icon: "Eraser",
    instructions:
      "Toca la palabra redundante del enunciado. Si el texto está limpio, elige «Sin censura»: el buen editor también sabe perdonar.",
    secondsPerItem: 22,
    timeLimit: null,
  },
  /* ================= Mega-7 · 45 juegos nuevos (hasta 100) ================= */
  acentos: {
    id: "acentos", name: "Ritmo de Acentos", tagline: "Aguda, llana o esdrújula",
    description: "Escucha el latido de cada palabra: ¿la fuerza cae en la última sílaba, en la penúltima o retrocede hasta la antepenúltima?",
    skill: "vocabulario", icon: "AudioLines",
    instructions: "Clasifica la palabra según dónde cae la sílaba tónica: aguda (última), llana (penúltima) o esdrújula (antepenúltima).",
    secondsPerItem: 14, timeLimit: null,
  },
  silabas: {
    id: "silabas", name: "Taller de Sílabas", tagline: "Construye la palabra paso a paso",
    description: "Las palabras llegan desmontadas al taller: une sus sílabas en el orden exacto para volver a armarlas.",
    skill: "vocabulario", icon: "Blocks",
    instructions: "Toca las sílabas en orden (primera, segunda, tercera…) hasta completar la palabra. Puedes deshacer el último paso.",
    secondsPerItem: 20, timeLimit: null,
  },
  analogias: {
    id: "analogias", name: "Puentes Analógicos", tagline: "A es a B como C es a…",
    description: "Puentes de lógica verbal: si la semilla es al árbol, el huevo es a… Encuentra la pareja que sostiene el puente.",
    skill: "vocabulario", icon: "GitBranch",
    instructions: "Lee la analogía y elige la opción que repite la misma relación que la primera pareja.",
    secondsPerItem: 24, timeLimit: null,
  },
  colocaciones: {
    id: "colocaciones", name: "Parejas Naturales", tagline: "Las palabras que van de la mano",
    description: "En español se cometen errores y se toman decisiones: descubre qué parejas de palabras están destinadas a ir juntas.",
    skill: "vocabulario", icon: "Heart",
    instructions: "Elige la combinación que usaría un hablante nativo: las colocaciones son parejas fijas del idioma.",
    secondsPerItem: 18, timeLimit: null,
  },
  grados: {
    id: "grados", name: "Escalera de Grados", tagline: "De tibio a hirviente",
    description: "Las palabras tienen temperatura: ordena los sinónimos de menor a mayor intensidad, peldaño a peldaño.",
    skill: "vocabulario", icon: "TrendingUp",
    instructions: "Toca las palabras en orden creciente de intensidad: de lo suave a lo extremo.",
    secondsPerItem: 22, timeLimit: null,
  },
  polisemia: {
    id: "polisemia", name: "Un Dos Sentidos", tagline: "La misma palabra, otro mundo",
    description: "Banca, pie, hoja… una palabra, muchos significados: el contexto decide cuál vive en cada frase.",
    skill: "vocabulario", icon: "Shapes",
    instructions: "Lee la frase y decide qué sentido tiene la palabra destacada al final del enunciado.",
    secondsPerItem: 22, timeLimit: null,
  },
  derivadas: {
    id: "derivadas", name: "Forja de Palabras", tagline: "De la raíz nace la familia",
    description: "Del pan nace la panadería y del mar el marino: forja la palabra derivada escribiéndola con tus propias manos.",
    skill: "vocabulario", icon: "Hammer",
    instructions: "Escribe la palabra derivada que se pide. Si te atascas, la pista te da la inicial y el número de letras.",
    secondsPerItem: 26, timeLimit: null,
  },
  familias: {
    id: "familias", name: "Familia de Palabras", tagline: "Marcas a los parientes verdaderos",
    description: "No todo lo que suena parecido es familia: marca las dos palabras que comparten raíz verdadera con la guía.",
    skill: "vocabulario", icon: "Sprout",
    instructions: "Marca exactamente DOS opciones: las que comparten origen real con la palabra guía (¡cuidado con los falsos parientes!).",
    secondsPerItem: 26, timeLimit: null,
  },
  abecedario: {
    id: "abecedario", name: "Orden Alfabético", tagline: "Como en el diccionario",
    description: "El diccionario tiene sus leyes: ordena las palabras tal como aparecen en sus páginas, letra a letra.",
    skill: "vocabulario", icon: "ListOrdered",
    instructions: "Toca las palabras en el orden en que las encontrarías en el diccionario. ¡Ojo con las letras segunda y tercera!",
    secondsPerItem: 24, timeLimit: null,
  },
  definiciones: {
    id: "definiciones", name: "Adivinanzas de Diccionario", tagline: "De la idea a la palabra",
    description: "Te damos la definición y tú escribes la palabra: el camino inverso del diccionario, a puro ingenio.",
    skill: "vocabulario", icon: "BookOpenText",
    instructions: "Lee la definición y escribe la palabra exacta. La pista te da la inicial si la necesitas.",
    secondsPerItem: 28, timeLimit: null,
  },
  concordancia: {
    id: "concordancia", name: "Acuerdos Perfectos", tagline: "Sustantivo, adjetivo y verbo en paz",
    description: "La gramática es un contrato: sustantivo, adjetivo y verbo deben firmar en el mismo género y número.",
    skill: "gramatica", icon: "BadgeCheck",
    instructions: "Elige la forma que concuerda con el resto de la frase. ¡Cuidado con las palabras tramposas como «el agua»!",
    secondsPerItem: 20, timeLimit: null,
  },
  serestar: {
    id: "serestar", name: "Faro Ser / Estar", tagline: "Dos faros, dos luces",
    description: "Cualidad o estado, esencia o foto del momento: el eterno dilema del español decidido jugada a jugada.",
    skill: "gramatica", icon: "Lightbulb",
    instructions: "Elige ser o estar para completar la frase. Pregúntate: ¿hablo de cómo es o de cómo está?",
    secondsPerItem: 16, timeLimit: null,
  },
  porpara: {
    id: "porpara", name: "Brújula Por / Para", tagline: "Causa, destino y demás corrientes",
    description: "Por y para navegan en direcciones distintas: causa contra finalidad, recorrido contra destino.",
    skill: "gramatica", icon: "Compass",
    instructions: "Elige por o para según el sentido de la frase: ¿causa o intención?, ¿trayecto o destino?",
    secondsPerItem: 16, timeLimit: null,
  },
  subjuntivo: {
    id: "subjuntivo", name: "Modo Subjuntivo", tagline: "El modo de los deseos",
    description: "Ojalá, quizá, cuando… ciertas palabras abren la puerta del subjuntivo. Aprende a cruzarla.",
    skill: "gramatica", icon: "Sparkles",
    instructions: "Elige la forma verbal que pide la frase: los «disparadores» como ojalá o no creo que llaman al subjuntivo.",
    secondsPerItem: 20, timeLimit: null,
  },
  tiempos: {
    id: "tiempos", name: "Reloj de Tiempos", tagline: "Ayer, hoy y mañana en el verbo",
    description: "Cada marca temporal pide su tiempo verbal: ayer pedía pretérito, mañana pedirá futuro.",
    skill: "gramatica", icon: "Timer",
    instructions: "Fíjate en los marcadores de tiempo (ayer, cada verano, para diciembre…) y elige la forma correcta del verbo.",
    secondsPerItem: 20, timeLimit: null,
  },
  pronombres: {
    id: "pronombres", name: "Relevo de Pronombres", tagline: "Lo, la, le, se: el reemplazo perfecto",
    description: "Los pronombres relevan a los nombres: practica el cambio, incluida la famosa regla «le lo → se lo».",
    skill: "gramatica", icon: "Repeat",
    instructions: "Elige el pronombre o la combinación que sustituye correctamente a lo subrayado en la pregunta.",
    secondsPerItem: 22, timeLimit: null,
  },
  relativos: {
    id: "relativos", name: "Prismas Relativos", tagline: "Que, quien, donde, el cual",
    description: "Los relativos conectan ideas como puentes de cristal: cada uno brilla en su contexto preciso.",
    skill: "gramatica", icon: "Waypoints",
    instructions: "Elige el relativo que encaja en el hueco: persona, cosa, lugar o tiempo piden prismas distintos.",
    secondsPerItem: 22, timeLimit: null,
  },
  estilo: {
    id: "estilo", name: "Eco Directo", tagline: "De la cita al relato",
    description: "«Vendré mañana», dijo él → dijo que vendría: transforma citas directas en estilo indirecto.",
    skill: "gramatica", icon: "Quote",
    instructions: "Convierte la cita al estilo indirecto: los tiempos verbales retroceden y las personas se adaptan.",
    secondsPerItem: 26, timeLimit: null,
  },
  pasiva: {
    id: "pasiva", name: "Voz Pasiva", tagline: "El sujeto pasa al banquillo",
    description: "«El cartero entrega las cartas» → «Las cartas son entregadas…»: gira la frase y respeta la concordancia.",
    skill: "gramatica", icon: "Repeat",
    instructions: "Elige la versión pasiva correcta de la frase activa, con el verbo ser y el participio bien acordados.",
    secondsPerItem: 24, timeLimit: null,
  },
  genero: {
    id: "genero", name: "Género y Número", tagline: "El y la en buena armonía",
    description: "El problema es masculino y la mano es femenina: doma los sustantivos tramposos del español.",
    skill: "gramatica", icon: "Scale",
    instructions: "Elige la forma correcta: artículos, sustantivos y plurales que el diccionario firmaría.",
    secondsPerItem: 18, timeLimit: null,
  },
  bv: {
    id: "bv", name: "Batalla B-V", tagline: "Tuvo o tubo, esa es la cuestión",
    description: "Las dos letras más confundidas del español se baten en duelo: tuvo/tubo, valla/vaya, cabo/cavo…",
    skill: "ortografia", icon: "Swords",
    instructions: "Elige la grafía correcta para completar la frase. La palabra completa aparece al corregir.",
    secondsPerItem: 18, timeLimit: null,
  },
  gj: {
    id: "gj", name: "Duelo G-J", tagline: "Jirafa o girafa, elige bando",
    description: "Jirafa con j, gente con g: el duelo de las guturales con las palabras que más equivocan.",
    skill: "ortografia", icon: "Swords",
    instructions: "Elige la grafía correcta. Recuerda: los verbos en -ger/-gir solo usan j ante e/o (elijo, coge).",
    secondsPerItem: 18, timeLimit: null,
  },
  hach: {
    id: "hach", name: "Caza de Haches", tagline: "¿Haber o a ver? Sigue el rastro",
    description: "La hache muda hace ruido en los dictados: hecho/echo, hora/ora, hay/ay… cázala donde se esconde.",
    skill: "ortografia", icon: "Search",
    instructions: "Elige la opción con (o sin) hache correcta para la frase.",
    secondsPerItem: 18, timeLimit: null,
  },
  lly: {
    id: "lly", name: "Lío de Y-LL", tagline: "Cayó o calló, no te caigas",
    description: "La ye y la doble ele se disfrazan la una de la otra: cayó/calló, cayado/callado… ordénalas.",
    skill: "ortografia", icon: "Shuffle",
    instructions: "Elige la grafía correcta para la frase: ¿y griega o doble ele?",
    secondsPerItem: 18, timeLimit: null,
  },
  csz: {
    id: "csz", name: "C-S-Z al Acecho", tagline: "Caza, casa, caza…",
    description: "El trío sibilante de la ortografía: aceptar con c, guiso con s, zapato con z.",
    skill: "ortografia", icon: "Target",
    instructions: "Elige la grafía correcta para la palabra dudosa de la frase.",
    secondsPerItem: 18, timeLimit: null,
  },
  homofonos: {
    id: "homofonos", name: "Gemelos de Sonido", tagline: "Suenan igual, escriben distinto",
    description: "Sino/si no, hecho/echo, hay/ay… los gemelos del español se distinguen solo al escribirlos.",
    skill: "ortografia", icon: "Ear",
    instructions: "Elige el gemelo correcto para la frase: piensa en el significado, no en el sonido.",
    secondsPerItem: 20, timeLimit: null,
  },
  puntuacion: {
    id: "puntuacion", name: "Semáforo de Puntos", tagline: "Comas, puntos y demás señales",
    description: "La puntuación es el semáforo de la lectura: elige la señal correcta para cada frase.",
    skill: "ortografia", icon: "Palette",
    instructions: "Elige la opción que puntúa correctamente el enunciado.",
    secondsPerItem: 22, timeLimit: null,
  },
  mayusculas: {
    id: "mayusculas", name: "Coronas Mayúsculas", tagline: "Marca a los que llevan corona",
    description: "Nombres propios, ríos y fiestas llevan corona; meses y dones van a pie llano. Márcalos.",
    skill: "ortografia", icon: "Crown",
    instructions: "Marca exactamente DOS palabras que necesitan mayúscula en la frase.",
    secondsPerItem: 24, timeLimit: null,
  },
  cifras: {
    id: "cifras", name: "Números a Letras", tagline: "Del 42 al cuarenta y dos",
    description: "La cifra y su nombre: practica cómo se escriben los números en letras, del dieciséis al millón.",
    skill: "ortografia", icon: "Landmark",
    instructions: "Elige la escritura correcta con letras de la cifra que ves.",
    secondsPerItem: 18, timeLimit: null,
  },
  titulo: {
    id: "titulo", name: "El Mejor Titular", tagline: "Titulares de faro",
    description: "Un buen titular condensa el enfoque, no solo el tema: practica el periodismo con textos reales del Archipiélago.",
    skill: "lectura", icon: "PenLine",
    instructions: "Lee el texto y elige el titular que mejor captura su enfoque central.",
    secondsPerItem: 30, timeLimit: null,
  },
  idea: {
    id: "idea", name: "Idea Central", tagline: "El esqueleto del texto",
    description: "Detrás de cada texto late una idea que lo sostiene todo: aprende a encontrarla entre los adornos.",
    skill: "lectura", icon: "Brain",
    instructions: "Elige la idea que resume el sentido global del párrafo.",
    secondsPerItem: 30, timeLimit: null,
  },
  resumen: {
    id: "resumen", name: "Resumen Fiel", tagline: "Lo mismo, con menos palabras",
    description: "Resumir no es copiar ni recortar: es reformular lo esencial. Elige el resumen que no traiciona al texto.",
    skill: "lectura", icon: "ScrollText",
    instructions: "Elige la opción que resume mejor el texto sin inventar ni perder lo esencial.",
    secondsPerItem: 32, timeLimit: null,
  },
  tono: {
    id: "tono", name: "Termómetro de Tono", tagline: "¿Solemne, irónico o de anuncio?",
    description: "Cada texto tiene una voz: aprende a leer entre las comas el tono con el que habla.",
    skill: "lectura", icon: "MessageCircle",
    instructions: "Lee el fragmento y elige su tono: irónico, solemne, coloquial, poético…",
    secondsPerItem: 26, timeLimit: null,
  },
  inferencia: {
    id: "inferencia", name: "Entre Líneas", tagline: "Lo que el texto no dice (pero piensa)",
    description: "El radiador mudo y el abrigo puesto lo dicen todo: deduce lo que el texto calla.",
    skill: "lectura", icon: "Search",
    instructions: "Elige la conclusión que se deduce del texto: la única que el texto sostiene sin decir.",
    secondsPerItem: 28, timeLimit: null,
  },
  secuencia: {
    id: "secuencia", name: "Línea de Tiempo", tagline: "¿Qué pasó antes de qué?",
    description: "Los relatos tienen cronología interna: ordénala en tu cabeza y responde con precisión.",
    skill: "lectura", icon: "ListOrdered",
    instructions: "Lee la historia y responde la pregunta sobre el orden de los hechos.",
    secondsPerItem: 26, timeLimit: null,
  },
  proposito: {
    id: "proposito", name: "¿Para qué se escribió?", tagline: "Informar, persuadir, entretener",
    description: "Todo texto nace con una misión: identificarla es el primer paso de la lectura crítica.",
    skill: "lectura", icon: "Target",
    instructions: "Elige el propósito del texto: informar, persuadir, entretener, instruir o expresar.",
    secondsPerItem: 24, timeLimit: null,
  },
  vocabctx: {
    id: "vocabctx", name: "Detective de Contexto", tagline: "Palabras raras sin diccionario",
    description: "Encrespado, parca, pericia… descubre el significado de palabras desconocidas por pura deducción contextual.",
    skill: "lectura", icon: "Search",
    instructions: "Deduce el significado de la palabra destacada a partir de las pistas del contexto.",
    secondsPerItem: 26, timeLimit: null,
  },
  entonacion: {
    id: "entonacion", name: "Onda de Entonación", tagline: "¿Sube, sorprende o afirma?",
    description: "Escucha la frase y decide su onda: pregunta, exclamación o afirmación. El oído manda.",
    skill: "audicion", icon: "AudioLines",
    instructions: "Escucha (o lee) la frase y clasifícala: interrogación, exclamación o enunciado.",
    secondsPerItem: 16, timeLimit: null,
  },
  "oye-acento": {
    id: "oye-acento", name: "Sílaba al Oído", tagline: "Dónde pega la voz",
    description: "Escucha la palabra y marca la sílaba que carga la fuerza: el acento se oye antes de verse.",
    skill: "audicion", icon: "Volume2",
    instructions: "Toca el altavoz para escuchar y marca la sílaba tónica de la palabra.",
    secondsPerItem: 18, timeLimit: null,
  },
  oyenumero: {
    id: "oyenumero", name: "Números al Oído", tagline: "Fechas, horas y cifras",
    description: "«Mil novecientos noventa y cuatro» → 1994: entrena el oído con las cifras de la vida real.",
    skill: "audicion", icon: "Ear",
    instructions: "Escucha el número y elige su escritura correcta. Puedes repetir la escucha.",
    secondsPerItem: 20, timeLimit: null,
  },

  /* ==================== Etapa 2 completa ==================== */
  rasca: {
    id: "rasca", name: "Tarjetas Rasca-Rasca", tagline: "Rasca la capa, halla la palabra",
    description: "Bajo una capa dorada duerme una palabra del jardín: ráscala con el dedo y elige su definición verdadera entre tres impostoras.",
    skill: "vocabulario", icon: "Sparkles",
    instructions: "Rasca la tarjeta (arrastrando el dedo o con «Rascar de un toque») y, cuando la palabra aparezca, elige su definición.",
    secondsPerItem: 30, timeLimit: null,
  },
  tinder: {
    id: "tinder", name: "Tinder de Sinónimos", tagline: "Desliza: ¿se cambian la corbata?",
    description: "Dos palabras se presentan: si son intercambiables en casi cualquier frase, deslízalas a la derecha; si esconden una trampa, a la izquierda.",
    skill: "vocabulario", icon: "Heart",
    instructions: "Arrastra la tarjeta hacia la derecha (sí, equivalen) o hacia la izquierda (no, trampa). Botones y flechas valen igual.",
    secondsPerItem: 14, timeLimit: null,
  },
  tipeo: {
    id: "tipeo", name: "Duelo de Tipeo", tagline: "La mecha corre, la frase manda",
    description: "Frases, trabalenguas y citas del mar contra el cronómetro del faro: transcribe exacto, con tildes y signos, antes de que la mecha se apague.",
    skill: "ortografia", icon: "Keyboard",
    instructions: "Escribe la frase exacta (tildes, mayúsculas y signos incluidos). La velocidad solo cuenta si la frase sale limpia.",
    secondsPerItem: 26, timeLimit: null,
  },
  labpunt: {
    id: "labpunt", name: "Laboratorio de Puntuación", tagline: "Los signos fabrican sentido",
    description: "Tres probetas con las mismas palabras y distinta puntuación: solo una produce el sentido pedido. Comas vocativas, dos puntos, incisos… experimenta.",
    skill: "ortografia", icon: "FlaskConical",
    instructions: "Lee el sentido buscado y elige la versión puntuada que lo produce.",
    secondsPerItem: 26, timeLimit: null,
  },
  jeroglificos: {
    id: "jeroglificos", name: "Jeroglíficos Modernos", tagline: "Mensajes que llegan por chat",
    description: "«2LLO xq t kiero»: los emojis, las cifras homófonas y las abreviaturas son la escritura de hoy. Descifra el mensaje y elige su traducción.",
    skill: "lectura", icon: "MessageSquareText",
    instructions: "Lee el mensaje cifrado y elige lo que dice de verdad.",
    secondsPerItem: 24, timeLimit: null,
  },
  mitos: {
    id: "mitos", name: "Mitos y Leyendas", tagline: "Patrimonio oral, tú decides",
    description: "La Llorona, el Cadejo, el Silbón… ocho leyendas vivas de la tradición hispanoamericana, recorridas desde dentro, con decisiones y pregunta final.",
    skill: "lectura", icon: "BookMarked",
    instructions: "Vive la leyenda con decisiones (explorar nunca se castiga) y responde la pregunta final sobre su sentido.",
    secondsPerItem: 110, timeLimit: null,
  },
  fonetica: {
    id: "fonetica", name: "Fonética Visual", tagline: "Pares mínimos al oído",
    description: "Pero/perro, calló/cayó, casa/caza… el laboratorio suena una de las dos y tú decides cuál oyó tu oído, con la forma del sonido a la vista.",
    skill: "audicion", icon: "Waves",
    instructions: "Escucha la palabra (puedes repetir) y elige cuál de las dos sonó. La corrección explica el truco de boca.",
    secondsPerItem: 18, timeLimit: null,
  },
  voz: {
    id: "voz", name: "Dictado por Voz", tagline: "Habla y el micrófono escribe",
    description: "Lee la frase en voz alta y el reconocimiento del navegador la transcribe: la pronunciación clara es la moneda. Sin micrófono, se escribe a mano.",
    skill: "expresion", icon: "Mic",
    instructions: "Toca el micrófono y lee la frase con calma. Tienes dos escuchas; si el navegador no escucha, escríbela a mano.",
    secondsPerItem: 35, timeLimit: null,
  },
  eco: {
    id: "eco", name: "Eco del Mar", tagline: "Grábate y escúchate con honestidad",
    description: "Escucha el modelo, graba tu voz, reprodúcela y compárala con una checklist honesta. La grabación vive solo durante el ítem: nada se guarda.",
    skill: "expresion", icon: "AudioLines",
    instructions: "Escucha el modelo, grábate leyendo la frase, escúchate y marca solo los criterios cumplidos.",
    secondsPerItem: 50, timeLimit: null,
  },
  iniciadores: {
    id: "iniciadores", name: "Chispa Inicial", tagline: "La primera frase que engancha",
    description: "Correos, cuentos y ensayos viven o mueren por su primera frase: elige la chispa que enciende cada texto.",
    skill: "expresion", icon: "Zap",
    instructions: "Lee el tipo de texto y elige la mejor frase de apertura.",
    secondsPerItem: 28, timeLimit: null,
  },
  cierre: {
    id: "cierre", name: "Cierre Redondo", tagline: "La última frase que se recuerda",
    description: "Cada texto merece su remate: elige el cierre que resume, emociona o invita sin desinflarse.",
    skill: "expresion", icon: "Flag",
    instructions: "Elige la frase que cierra mejor cada texto según su tono y propósito.",
    secondsPerItem: 26, timeLimit: null,
  },
  descripciones: {
    id: "descripciones", name: "Retrato con Palabras", tagline: "Mostrar sin decir «bonito»",
    description: "«Estaba cansado» o «las piernas le pesaban como anclas»: elige siempre la versión que muestra.",
    skill: "expresion", icon: "Camera",
    instructions: "Elige la descripción más precisa y viva: la que pinta la escena sin adjetivos vagos.",
    secondsPerItem: 26, timeLimit: null,
  },
  regiones: {
    id: "regiones", name: "Mapa de Regionalismos", tagline: "¿Dónde se dice así?",
    description: "Che, órale, pololear, guagua… un viaje por las veinte voces del español de América y España.",
    skill: "cultura", icon: "Globe",
    instructions: "Lee la expresión y elige dónde se usa así.",
    secondsPerItem: 20, timeLimit: null,
  },
  falsosamigos: {
    id: "falsosamigos", name: "Falsos Amigos ES-EN", tagline: "Embarazada no es embarrassed",
    description: "Los falsos amigos tienden trampas entre idiomas: library, actually, sensible… no son lo que parecen.",
    skill: "cultura", icon: "Languages",
    instructions: "Elige el significado correcto: cuidado con las trampas entre el inglés y el español.",
    secondsPerItem: 20, timeLimit: null,
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
