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
};

export const GAME_IDS = Object.keys(GAMES) as GameId[];

/** Etiquetas legibles de categorías gramaticales para Trivia. */
export const GRAMMAR_CLASSES = [
  { id: "sustantivo", label: "Sustantivo", example: "casa, libertad, faro" },
  { id: "verbo", label: "Verbo", example: "corre, soñé, será" },
  { id: "adjetivo", label: "Adjetivo", example: "ligero, difícil, amable" },
  { id: "adverbio", label: "Adverbio", example: "despacio, quizá, hoy" },
] as const;
