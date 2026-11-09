/**
 * VERBALIA · Tipos centrales del dominio
 * Separa contenido, lógica de juego, progreso e interfaz.
 */

/* ============================== Habilidades ============================== */

/** Habilidades lingüísticas que entrena el juego (una por región). */
export type SkillId =
  | "vocabulario"
  | "gramatica"
  | "ortografia"
  | "lectura"
  | "audicion"
  | "expresion"
  | "cultura"; // Observatorio de la Palabra (etimologías, regionalismos, historia)

/** Minijuegos de los formatos nuevos (Etapa 3 · «cielo de formatos»). */
export type MemoriaGameId =
  | "memoria-bosque"
  | "memoria-fortaleza"
  | "memoria-biblioteca"
  | "memoria-puerto"
  | "memoria-torre"
  | "memoria-observatorio";

export type IntrusoGameId =
  | "intruso-bosque"
  | "intruso-ciudad"
  | "intruso-biblioteca"
  | "intruso-observatorio";

export type SorteaGameId =
  | "sortea-ciudad"
  | "sortea-fortaleza"
  | "sortea-biblioteca"
  | "sortea-puerto"
  | "sortea-torre"
  | "sortea-observatorio";

export type VfGameId =
  | "vf-bosque"
  | "vf-ciudad"
  | "vf-fortaleza"
  | "vf-biblioteca"
  | "vf-puerto"
  | "vf-torre"
  | "vf-observatorio";

export type EscribeGameId =
  | "escribe-bosque"
  | "escribe-ciudad"
  | "escribe-fortaleza"
  | "escribe-torre";

export type OyeGameId =
  | "oye-bosque"
  | "oye-fortaleza"
  | "oye-puerto";

export type ConectaGameId =
  | "conecta-bosque"
  | "conecta-ciudad"
  | "conecta-biblioteca"
  | "conecta-puerto"
  | "conecta-torre"
  | "conecta-observatorio";

/* ==== Mega-7 · 45 minijuegos nuevos (hasta 100 en total) ==== */

/** Juegos de «elige la opción» (contexto opcional + 4 opciones). */
export type EligeGameId =
  | "analogias" // Puentes analógicos (Bosque)
  | "colocaciones" // Parejas naturales de palabras (Bosque)
  | "polisemia" // Un dos sentidos: significado en contexto (Bosque)
  | "concordancia" // Acuerdos perfectos (Ciudad)
  | "serestar" // Faro Ser/Estar (Ciudad)
  | "porpara" // Brújula Por/Para (Ciudad)
  | "subjuntivo" // Modo subjuntivo (Ciudad)
  | "tiempos" // Reloj de tiempos verbales (Ciudad)
  | "pronombres" // Relevo de pronombres (Ciudad)
  | "relativos" // Prismas relativos (Ciudad)
  | "estilo" // Eco directo: estilo directo→indirecto (Ciudad)
  | "pasiva" // Voz pasiva (Ciudad)
  | "genero" // Género y número (Ciudad)
  | "homofonos" // Gemelos de sonido (Fortaleza)
  | "cifras" // Números a letras (Fortaleza)
  | "puntuacion" // Semáforo de puntuación (Fortaleza)
  | "titulo" // El mejor titular (Biblioteca)
  | "idea" // Idea central (Biblioteca)
  | "resumen" // Resumen fiel (Biblioteca)
  | "tono" // Termómetro de tono (Biblioteca)
  | "inferencia" // Entre líneas (Biblioteca)
  | "secuencia" // Línea de tiempo (Biblioteca)
  | "proposito" // ¿Para qué se escribió? (Biblioteca)
  | "vocabctx" // Detective de contexto (Biblioteca)
  | "regiones" // Mapa de regionalismos (Observatorio)
  | "falsosamigos" // Falsos amigos ES-EN (Observatorio)
  | "iniciadores" // Chispa inicial (Torre)
  | "cierre" // Cierre redondo (Torre)
  | "descripciones"; // Retrato con palabras (Torre)

/** Juegos de ordenar tocando en secuencia. */
export type OrdenaGameId =
  | "grados" // Escalera de grados: intensidad creciente (Bosque)
  | "abecedario" // Orden alfabético (Bosque)
  | "silabas"; // Taller de sílabas (Bosque)

/** Juegos de clasificación en 3 cubos. */
export type ClasificaGameId =
  | "acentos" // Ritmo de acentos: aguda/llana/esdrújula (Bosque)
  | "entonacion"; // Onda de entonación (Puerto)

/** Juegos de escribir la respuesta. */
export type EscribeLibreGameId =
  | "definiciones" // Adivinanzas de diccionario (Bosque)
  | "derivadas"; // Forja de palabras: raíz + afijos (Bosque)

/** Juegos de selección múltiple (elige TODAS las correctas). */
export type MultiGameId =
  | "familias" // Familia de palabras (Bosque)
  | "mayusculas"; // Coronas mayúsculas (Fortaleza)

/** Duelos de grafías: elegir la letra correcta. */
export type GrafiaGameId =
  | "bv" // Batalla B-V (Fortaleza)
  | "gj" // Duelo G-J (Fortaleza)
  | "hach" // Caza de haches (Fortaleza)
  | "lly" // Lío de Y-LL (Fortaleza)
  | "csz"; // C-S-Z al acecho (Fortaleza)

/** Juegos de escucha (TTS). */
export type OyeNuevoGameId =
  | "oye-acento" // Sílaba tónica al oído (Puerto)
  | "oyenumero"; // Números al oído (Puerto)

/** Minijuegos de la Forja del Escritor (Etapa 4 · «El Códice Infinito»). */
export type ForjaGameId =
  | "metaforas" // Forja de Metáforas: completa la imagen literaria
  | "registro" // Registro Correcto: versión adecuada al contexto
  | "conectores" // Taller de Conectores: enlace lógico exacto
  | "ironia" // Detector de Ironía: tono literal vs. irónico
  | "titulos"; // Censura del Editor: elimina la redundancia

/** Minijuegos que completan la Etapa 2 («Experiencia avanzada»). */
export type Etapa2BGameId =
  | "rasca" // Tarjetas Rasca-Rasca: rascar y emparejar definición (Bosque)
  | "tinder" // Tinder de Sinónimos: deslizar pares equivalentes (Bosque)
  | "tipeo" // Duelo de Tipeo: frases y trabalenguas a toda velocidad (Fortaleza)
  | "labpunt" // Laboratorio de Puntuación: los signos cambian el sentido (Fortaleza)
  | "jeroglificos" // Jeroglíficos Modernos: mensajes de emojis y abreviaturas (Biblioteca)
  | "mitos" // Biblioteca de Mitos y Leyendas: patrimonio oral ramificado (Biblioteca)
  | "fonetica" // Laboratorio de Fonética Visual: pares mínimos al oído (Puerto)
  | "voz" // Dictado por Voz: el micrófono escribe por ti (Puerto)
  | "eco"; // Eco del Mar: graba, escúchate y evalúate (Puerto)

/** Identificadores de los minijuegos implementados (Etapas 1-4). */
export type GameId =
  | "srs" // Repetición espaciada (Bosque)
  | "trivia" // Trivia Relámpago (Bosque)
  | "puzzle" // Puzzles sintácticos (Ciudad)
  | "cloze" // Cloze contextual (Ciudad y Biblioteca)
  | "errores" // Caza de errores (Fortaleza)
  | "tildes" // Tribunal de las Tildes (Fortaleza)
  | "parrafos" // Constructor de párrafos (Biblioteca)
  // ---- Etapa 2 ----
  | "dictado" // Dictado del Faro (Puerto)
  | "matices" // Ecos del Puerto (Puerto)
  | "lectura" // Lectura Inmersiva (Biblioteca)
  | "sprint" // Sprint de Vocabulario (Bosque)
  | "sinonimos" // Batalla de Sinónimos (Bosque)
  | "historias" // Historias Ramificadas (Torre)
  | "refranes" // Sabiduría Popular (Torre)
  | "minuto" // Reto del Minuto (Torre)
  // ---- Etapa 3 · cinco nuevos por ciudad ----
  | MemoriaGameId
  | IntrusoGameId
  | SorteaGameId
  | VfGameId
  | EscribeGameId
  | OyeGameId
  | ConectaGameId
  // ---- Mega-7 · 45 minijuegos nuevos (hasta 100) ----
  | EligeGameId
  | OrdenaGameId
  | ClasificaGameId
  | EscribeLibreGameId
  | MultiGameId
  | GrafiaGameId
  | OyeNuevoGameId
  // ---- Etapa 4 · Forja del Escritor ----
  | ForjaGameId
  // ---- Etapa 2 completa · los 9 formatos restantes de la experiencia avanzada ----
  | Etapa2BGameId;

/** Identificadores de las regiones del Archipiélago. */
export type RegionId =
  | "bosque"
  | "ciudad"
  | "fortaleza"
  | "biblioteca"
  | "puerto"
  | "torre"
  | "observatorio"
  | "forja";

/** Nivel MCER de referencia (orientativo, no certificativo). */
export type Cefr = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** Dificultad interna 1-5 (equivalente aproximado A1-C2). */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

/** Etapa del producto en la que entra cada módulo. */
export type Stage = 1 | 2 | 3 | 4;

/* ============================== Contenido ============================== */

interface ExerciseBase {
  /** Identificador único y estable del ejercicio. */
  id: string;
  /** Habilidad principal que entrena. */
  skill: SkillId;
  /** Dificultad 1-5. */
  difficulty: Difficulty;
  /** Referencia MCER orientativa. */
  cefr: Cefr;
  /** Consigna específica del ejercicio. */
  prompt: string;
  /** Explicación breve de la regla o el porqué (retroalimentación). */
  explanation: string;
  /** Etiquetas temáticas. */
  tags: string[];
}

/** Palabra del paquete SRS (colección + repetición espaciada). */
export interface SrsWord {
  id: string;
  word: string;
  pos: string;
  definition: string;
  example: string;
  difficulty: Difficulty;
  cefr: Cefr;
  tags: string[];
}

/** Trivia Relámpago: clasificar la palabra destacada en contexto. */
export interface TriviaExercise extends ExerciseBase {
  type: "trivia";
  /** Frase con la palabra objetivo destacada con asteriscos: "Ana *canta* bien." */
  sentence: string;
  answer: "sustantivo" | "verbo" | "adjetivo" | "adverbio";
}

/** Puzzle sintáctico: ordenar fragmentos (los chunks ya están en orden correcto). */
export interface PuzzleExercise extends ExerciseBase {
  type: "puzzle";
  chunks: string[];
}

/** Cloze contextual: completar un espacio con una de las opciones. */
export interface ClozeExercise extends ExerciseBase {
  type: "cloze";
  /** Texto con «___» marcando el hueco. */
  text: string;
  options: string[];
  answerIndex: number;
}

/** Caza de errores: encontrar la palabra errónea y corregirla. */
export interface ErrorHuntExercise extends ExerciseBase {
  type: "errores";
  /** Frase troceada por espacios. */
  tokens: string[];
  /** Índice del token con error (-1 = no hay error). */
  errorIndex: number;
  /** Correcciones propuestas para el token elegido. */
  options: string[];
  /** Índice de la opción correcta. */
  answerIndex: number;
}

/** Tribunal de las Tildes: elegir la sílaba que lleva tilde (o "no lleva"). */
export interface TildeExercise extends ExerciseBase {
  type: "tildes";
  /** Frase de contexto con la palabra sin tilde. */
  sentence: string;
  /** Palabra tal como se muestra (sin tilde). */
  word: string;
  /** Palabra dividida en sílabas (sin tildes). */
  syllables: string[];
  /** Índice de la sílaba con tilde, o -1 si la palabra no lleva. */
  answerSyllable: number;
  /** Forma correcta completa. */
  correctForm: string;
}

/** Constructor de párrafos: ordenar oraciones de un texto. */
export interface ParagraphExercise extends ExerciseBase {
  type: "parrafos";
  title: string;
  hint: string;
  /** Oraciones en el orden correcto. */
  sentences: string[];
}

/* ============================ Etapa 2 ============================ */

/** Dictado del Faro: escuchar (o leer en modo sin voz) y escribir la frase. */
export interface DictadoExercise extends ExerciseBase {
  type: "dictado";
  /** Frase a dictar (forma correcta). */
  sentence: string;
  /** Pista leve sobre tema o longitud. */
  hint: string;
}

/** Ecos del Puerto: identificar el tono o la intención de una frase. */
export interface MaticesExercise extends ExerciseBase {
  type: "matices";
  /** Frase que se escucha (o se lee en modo sin voz). */
  sentence: string;
  options: string[];
  answerIndex: number;
}

/** Lectura Inmersiva: lectura guiada frase a frase + comprensión. */
export interface LecturaExercise extends ExerciseBase {
  type: "lectura";
  title: string;
  /** Frases para la lectura sincronizada con la voz. */
  lines: string[];
  question: string;
  options: string[];
  answerIndex: number;
}

/** Sprint de Vocabulario: elegir la definición correcta a contrarreloj. */
export interface SprintExercise extends ExerciseBase {
  type: "sprint";
  word: string;
  options: string[];
  answerIndex: number;
}

/** Batalla de Sinónimos: sinónimo o antónimo que encaja en el contexto. */
export interface SinonimosExercise extends ExerciseBase {
  type: "sinonimos";
  /** Frase con la palabra objetivo destacada con asteriscos. */
  sentence: string;
  /** Relación que se pide. */
  relation: "sinónimo" | "antónimo";
  options: string[];
  answerIndex: number;
}

/** Un punto de decisión de una historia ramificada. */
export interface StoryNode {
  id: string;
  /** Narración del nodo. */
  text: string;
  /** Opciones; next apunta al índice del nodo siguiente (-1 = final). */
  choices: { label: string; next: number; feedback?: string }[];
}

/** Historias Ramificadas: explorar decisiones + pregunta final de comprensión. */
export interface HistoriasExercise extends ExerciseBase {
  type: "historias";
  title: string;
  nodes: StoryNode[];
  start: number;
  question: string;
  options: string[];
  answerIndex: number;
}

/** Sabiduría Popular: significado real de refranes y modismos. */
export interface RefranesExercise extends ExerciseBase {
  type: "refranes";
  /** El refrán o modismo. */
  saying: string;
  /** Variante regional (para celebrar la diversidad del español). */
  region: string;
  options: string[];
  answerIndex: number;
}

/** Reto del Minuto: escritura libre cronometrada con autoevaluación honesta. */
export interface MinutoExercise extends ExerciseBase {
  type: "minuto";
  /** La consigna creativa. */
  challenge: string;
  /** Criterios de autoevaluación guiada. */
  criteria: string[];
  /** Meta de palabras para el bonus de esfuerzo. */
  wordGoal: number;
}

/* ============================ Etapa 3 · nuevos formatos ============================ */

/** Memoria de pares: emparejar tarjetas volteando (palabra↔definición, etc.). */
export interface MemoriaExercise extends ExerciseBase {
  type: MemoriaGameId;
  /** Pares a emparejar (4-6 por tablero). */
  pairs: { left: string; right: string }[];
}

/** El intruso: cuatro elementos, uno no pertenece a la familia. */
export interface IntrusoExercise extends ExerciseBase {
  type: IntrusoGameId;
  options: string[];
  answerIndex: number;
  /** Familía a la que pertenecen los otros tres. */
  category: string;
}

/** Clasifica: asignar cada enunciado al cubo correcto (2-4 cubos). */
export interface SorteaExercise extends ExerciseBase {
  type: SorteaGameId;
  statement: string;
  buckets: string[];
  answerIndex: number;
}

/** Verdadero o falso con corrección pedagógica. */
export interface VfExercise extends ExerciseBase {
  type: VfGameId;
  statement: string;
  answer: boolean;
  /** Forma correcta cuando la afirmación es falsa. */
  correction?: string;
}

/** Escribe la palabra: teclear el término a partir de la pista. */
export interface EscribeExercise extends ExerciseBase {
  type: EscribeGameId;
  /** Pista (definición, conjugación pedida, etc.). */
  clue: string;
  /** Palabra exacta esperada (se normalizan tildes al validar en flexivo). */
  word: string;
  /** Segunda pista corta (categoría o inicial). */
  hint?: string;
}

/** Oye: escucha (TTS) y elige la escritura correcta. */
export interface OyeExercise extends ExerciseBase {
  type: OyeGameId;
  /** Palabra o frase corta que suena. */
  word: string;
  /** Escrituras erróneas verosímiles. */
  wrongs: string[];
}

/** Conecta: unir columnas (inicio↔final, palabra↔origen, etc.). */
export interface ConectaExercise extends ExerciseBase {
  type: ConectaGameId;
  /** Pares correctos; en pantalla la columna derecha se baraja. */
  pairs: { left: string; right: string }[];
}

/* ====================== Mega-7 · 45 juegos nuevos ====================== */

/** Formato «elige»: contexto opcional (párrafo, frase…) + opciones. */
export interface EligeExercise extends ExerciseBase {
  type: EligeGameId;
  /** Frase con «___» o párrafo de contexto (según el juego). */
  context?: string;
  /** Consigna corta que acompaña al contexto. */
  question: string;
  options: string[];
  answerIndex: number;
}

/** Formato «ordena»: toca los elementos en el orden pedido. */
export interface OrdenaExercise extends ExerciseBase {
  type: OrdenaGameId;
  /** Elementos en el ORDEN CORRECTO (la pantalla los baraja). */
  items: string[];
  /** Criterio que se pide (p. ej. «de menor a mayor intensidad»). */
  criteria: string;
}

/** Formato «clasifica»: un elemento y 3 cubos de destino. */
export interface ClasificaExercise extends ExerciseBase {
  type: ClasificaGameId;
  item: string;
  buckets: string[];
  answerIndex: number;
}

/** Formato «escribe libre»: teclea la palabra exacta (con pista). */
export interface EscribeLibreExercise extends ExerciseBase {
  type: EscribeLibreGameId;
  clue: string;
  word: string;
  hint?: string;
}

/** Formato «multi»: marca TODAS las opciones correctas. */
export interface MultiExercise extends ExerciseBase {
  type: MultiGameId;
  prompt: string;
  statement?: string;
  options: string[];
  /** Índices correctos (2-3 de 4). */
  answerIndexes: number[];
}

/** Duelo de grafías: palabra/frase con hueco y letras rivales. */
export interface GrafiaExercise extends ExerciseBase {
  type: GrafiaGameId;
  /** Frase con «___» donde va la grafía dudosa. */
  sentence: string;
  /** Palabra completa correcta (se muestra al corregir). */
  word: string;
  options: string[];
  answerIndex: number;
}

/** Escucha y marca la sílaba tónica. */
export interface OyeAcentoExercise extends ExerciseBase {
  type: "oye-acento";
  word: string;
  syllables: string[];
  answerSyllable: number;
}

/** Escucha un número/fecha y elige su escritura o cifra. */
export interface OyeNumeroExercise extends ExerciseBase {
  type: "oyenumero";
  /** Lo que suena (para TTS). */
  speech: string;
  /** Respuesta correcta en pantalla (cifras o letras). */
  options: string[];
  answerIndex: number;
}

/* ================= Etapa 2 completa · 9 formatos restantes ================= */

/** Tarjetas Rasca-Rasca: rascar la capa y emparejar la palabra con su definición. */
export interface RascaExercise extends ExerciseBase {
  type: "rasca";
  /** Palabra oculta bajo la capa de rascar. */
  word: string;
  /** Definición correcta de la palabra. */
  options: string[];
  answerIndex: number;
}

/** Tinder de Sinónimos: decidir si dos términos son intercambiables. */
export interface TinderExercise extends ExerciseBase {
  type: "tinder";
  /** Palabra A (la fija). */
  wordA: string;
  /** Palabra B (la que se desliza). */
  wordB: string;
  /** ¿Son sinónimos intercambiables en la mayoría de contextos? */
  isSynonym: boolean;
  /** Nota que explica el matiz (se muestra al corregir). */
  note: string;
}

/** Duelo de Tipeo: transcribir la frase exacta antes de que se apague el faro. */
export interface TipeoExercise extends ExerciseBase {
  type: "tipeo";
  /** Frase objetivo (con puntuación y tildes exactas). */
  sentence: string;
  /** Segundos objetivo para el duelo (WPM de referencia). */
  targetSeconds: number;
  /** Trabalenguas u otra etiqueta de estilo. */
  flavor: "frase" | "trabalenguas" | "cita";
}

/** Laboratorio de Puntuación: elige la puntuación que produce el sentido pedido. */
export interface LabPuntExercise extends ExerciseBase {
  type: "labpunt";
  /** Palabras idénticas en todas las versiones (solo cambian los signos). */
  base: string;
  /** Versión con huecos: «Vamos a comer ___ niños». */
  options: string[];
  answerIndex: number;
  /** Qué sentido debe tener la frase correcta. */
  meaning: string;
}

/** Jeroglíficos Modernos: descodificar un mensaje de emojis y abreviaturas. */
export interface JeroglificosExercise extends ExerciseBase {
  type: "jeroglificos";
  /** El mensaje cifrado (emojis, cifras, abreviaturas). */
  cipher: string;
  options: string[];
  answerIndex: number;
}

/** Biblioteca de Mitos y Leyendas: patrimonio oral con decisiones y pregunta final. */
export interface MitosExercise extends ExerciseBase {
  type: "mitos";
  title: string;
  /** Región o tradición de la leyenda (p. ej. «México · tradición oral»). */
  origin: string;
  nodes: StoryNode[];
  start: number;
  question: string;
  options: string[];
  answerIndex: number;
}

/** Laboratorio de Fonética Visual: pares mínimos, oído y forma del sonido. */
export interface FoneticaExercise extends ExerciseBase {
  type: "fonetica";
  /** Par mínimo: las dos palabras rivales. */
  pair: [string, string];
  /** Índice (0/1) de la palabra que suena. */
  answerIndex: number;
  /** Contraste fonético explicado (al corregir). */
  contrast: string;
  /** Descripción visual de la forma del sonido (boca/sonido). */
  shape: string;
}

/** Dictado por Voz: habla y el micrófono transcribe; o escribe a mano si no hay voz. */
export interface VozExercise extends ExerciseBase {
  type: "voz";
  /** Frase objetivo que hay que pronunciar. */
  sentence: string;
  /** Pista de contexto. */
  hint: string;
}

/** Eco del Mar: escucha el modelo, grábate y autoevalúate con honestidad. */
export interface EcoExercise extends ExerciseBase {
  type: "eco";
  /** Frase modelo para pronunciar. */
  sentence: string;
  /** Criterios de autoevaluación (checklist honesta). */
  criteria: string[];
}

export type Exercise =
  | TriviaExercise
  | PuzzleExercise
  | ClozeExercise
  | ErrorHuntExercise
  | TildeExercise
  | ParagraphExercise
  | DictadoExercise
  | MaticesExercise
  | LecturaExercise
  | SprintExercise
  | SinonimosExercise
  | HistoriasExercise
  | RefranesExercise
  | MinutoExercise
  | MemoriaExercise
  | IntrusoExercise
  | SorteaExercise
  | VfExercise
  | EscribeExercise
  | OyeExercise
  | ConectaExercise
  /* ---- Etapa 4 · Forja del Escritor ---- */
  | MetaforasExercise
  | RegistroExercise
  | ConectoresExercise
  | IroniaExercise
  | TitulosExercise
  /* ---- Mega-7 · 45 juegos nuevos ---- */
  | EligeExercise
  | OrdenaExercise
  | ClasificaExercise
  | EscribeLibreExercise
  | MultiExercise
  | GrafiaExercise
  | OyeAcentoExercise
  | OyeNumeroExercise
  /* ---- Etapa 2 completa ---- */
  | RascaExercise
  | TinderExercise
  | TipeoExercise
  | LabPuntExercise
  | JeroglificosExercise
  | MitosExercise
  | FoneticaExercise
  | VozExercise
  | EcoExercise;

/* ====================== Etapa 4 · Forja del Escritor ====================== */

/** Forja de Metáforas: elige la imagen que completa la figura literaria. */
export interface MetaforasExercise extends ExerciseBase {
  type: "metaforas";
  /** Frase incompleta con «___» donde va la imagen. */
  stem: string;
  options: string[];
  answerIndex: number;
}

/** Registro Correcto: versión de la misma idea según la situación. */
export interface RegistroExercise extends ExerciseBase {
  type: "registro";
  /** Situación comunicativa. */
  context: string;
  /** Registro que se pide. */
  register: "formal" | "coloquial" | "neutro";
  options: string[];
  answerIndex: number;
}

/** Taller de Conectores: el conector lógico que encaja en el hueco. */
export interface ConectoresExercise extends ExerciseBase {
  type: "conectores";
  /** Frase con «___» donde va el conector. */
  sentence: string;
  options: string[];
  answerIndex: number;
}

/** Detector de Ironía: tono real de una frase con contexto. */
export interface IroniaExercise extends ExerciseBase {
  type: "ironia";
  /** La frase que hay que interpretar. */
  statement: string;
  /** Contexto que desvela el tono. */
  context: string;
  /** Tono real del enunciado. */
  answer: "literal" | "ironico";
}

/** Censura del Editor: tacha la palabra redundante del enunciado. */
export interface TitulosExercise extends ExerciseBase {
  type: "titulos";
  /** Enunciado con una redundancia léxica escondida. */
  sentence: string;
  /** Palabras seleccionables. */
  tokens: string[];
  /** Índice del token redundante. */
  answerIndex: number;
}

/* ============================== SRS ============================== */

/** Estado de una tarjeta SRS (SM-2 simplificado). */
export interface SrsCard {
  wordId: string;
  /** Factor de facilidad (1.3 - 2.8). */
  ease: number;
  /** Intervalo actual en días. */
  intervalDays: number;
  /** Repeticiones correctas consecutivas. */
  reps: number;
  /** Veces que se olvidó. */
  lapses: number;
  /** Marca de tiempo (epoch ms) de la próxima revisión. */
  dueAt: number;
  /** Cuándo se vio por primera vez. */
  introducedAt: number;
  lastReviewedAt: number | null;
  state: "learning" | "review";
}

/** Calificaciones posibles de una tarjeta. */
export type SrsGrade = "again" | "hard" | "good" | "easy";

/* ============================== Sesiones ============================== */

export type SessionMode =
  | "mission" // Misión de región (actividades mixtas)
  | "training" // Entrenamiento de un minijuego concreto
  | "review" // Repaso de errores
  | "placement"; // Evaluación inicial

export type SessionItem =
  | { kind: "srs"; word: SrsWord }
  | { kind: "exercise"; exercise: Exercise };

export interface SessionSpec {
  /** Etiqueta para el historial. */
  label: string;
  mode: SessionMode;
  regionId?: RegionId;
  gameId?: GameId;
  items: SessionItem[];
}

/** Respuesta registrada a un ítem de sesión. */
export interface AnswerRecord {
  itemId: string;
  kind: "srs" | "exercise";
  gameId: GameId;
  skill: SkillId;
  difficulty: Difficulty;
  correct: boolean | null; // null para tarjetas SRS autoevaluadas
  grade?: SrsGrade;
  /** Respuesta elegida por el usuario (texto descriptivo). */
  userAnswer: string;
  /** Respuesta correcta (texto descriptivo). */
  correctAnswer: string;
  /** Ejercicio original para el registro de errores. */
  exercise?: Exercise;
  timeMs: number;
  wasSeenRecently: boolean;
}

export interface SessionRecord {
  id: string;
  at: number;
  mode: SessionMode;
  label: string;
  regionId?: RegionId;
  gameId?: GameId;
  total: number;
  correct: number;
  accuracy: number | null;
  xpEarned: number;
  durationMs: number;
  bestCombo: number;
}

export interface SessionResult {
  record: SessionRecord;
  xpTotal: number;
  xpBreakdown: { base: number; comboBonus: number; completionBonus: number; capped: number };
  /** Tinta ganada en la sesión (1 por cada 10 XP). */
  tintaEarned: number;
  correctCount: number;
  totalCount: number;
  accuracy: number | null;
  bestCombo: number;
  leveledUp: boolean;
  newLevel: number;
  newAchievements: string[];
  missionsCompleted: string[];
  shieldUsed: boolean;
  answers: AnswerRecord[];
}

/* ============================== Progreso ============================== */

/** Núcleo de progreso puro (se actualiza con reductores del motor). */
export interface GameCore {
  xp: number;
  /** Nivel de habilidad 1-10 por habilidad. */
  skills: Record<SkillId, number>;
  stats: {
    totalSessions: number;
    totalAnswers: number;
    totalCorrect: number;
    byGame: Record<string, { plays: number; answers: number; correct: number; bestCombo: number }>;
    xpByDay: Record<string, number>;
    sessionsByDay: Record<string, number>;
    correctByDay: Record<string, number>;
    /** Juegos distintos jugados ese día. */
    gamesByDay: Record<string, string[]>;
    regionsByDay: Record<string, string[]>;
    srsReviewsByDay: Record<string, number>;
    comboByDay: Record<string, number>;
    activeDays: string[];
    startedAt: number;
    /** Milisegundos de juego acumulados (sesiones completas). */
    totalTimeMs: number;
    /** Suma de tiempos de respuesta (para la media). */
    answerTimeSumMs: number;
    /** Mejor combo histórico de todo el juego. */
    bestComboEver: number;
    /** Número de formatos distintos probados (juegos únicos jugados). */
    uniqueGames: string[];
  };
  streak: {
    current: number;
    best: number;
    lastActiveDay: string | null;
    shields: number;
  };
  missions: {
    daily: { dateKey: string; claimed: string[] };
    weekly: { weekKey: string; claimed: string[] };
  };
  /** Logros desbloqueados: id -> timestamp. */
  achievements: Record<string, number>;
  /** Registro de errores para repaso (acotado). */
  errors: ErrorRecord[];
  /** Última vez que se vio cada ejercicio (para el decaimiento anti-farmeo). */
  seenExercises: Record<string, number>;
  sessions: SessionRecord[];
  /** Economía del Bazar: tinta, cosméticos y mejoras (Etapa 4). */
  wallet: Wallet;
  /** Salón de Juegos Educativos: retos de lógica, cálculo y reflejos. */
  arcade: ArcadeProgress;
  /** Logros cuya recompensa ya fue recogida por el jugador. */
  achievementsClaimed: string[];
}

/** Billetera del jugador: tinta ganada jugando y cosméticos comprados. */
export interface Wallet {
  /** Moneda de tinta (se gana 1 por cada 10 XP de sesión). */
  tinta: number;
  /** Ids de catálogo comprados (marcos, títulos… los escudos no se guardan aquí). */
  owned: string[];
  /** Marco de avatar equipado (id de catálogo o "frame-none"). */
  frame: string;
  /** Título equipado (id de catálogo o "title-none"). */
  title: string;
  /** Tinta gastada acumulada (para récords). */
  spent: number;
  /** Día (YYYY-MM-DD) en que se reclamó el último regalo diario del Bazar. */
  lastGiftDay: string;
}

export interface ErrorRecord {
  exerciseId: string;
  type: GameId;
  skill: SkillId;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  at: number;
}

/* ============================== Salón de Juegos ============================== */


/** Récords del Taller de Escritura (mecanografía y tipeo). */
export interface TypingStats {
  /** Mejor velocidad registrada (palabras por minuto). */
  bestWpm: number;
  /** Mejor precisión registrada (0-100). */
  bestAccuracy: number;
  /** Pruebas de velocidad completadas. */
  testsDone: number;
  /** Palabras correctamente tecleadas en total. */
  totalWords: number;
  /** Racha de días consecutivos con al menos una prueba. */
  streak: number;
  /** Fecha (YYYY-MM-DD) de la última prueba. */
  lastDay: string;
  /** Ejercicios de teclas completados por nivel del teclado. */
  drillsDone: number;
}

export interface ArcadeProgress {
  /** Juegos desbloqueados con tinta (los gratuitos no se guardan aquí). */
  unlocked: string[];
  /** Mejor puntuación por juego (récord personal). */
  best: Record<string, number>;
  /** Partidas jugadas por juego. */
  plays: Record<string, number>;
  /** Partidas jugadas por juego y día (para límites de XP). */
  playsByDay: Record<string, number>;
  /** Cosecha total de XP en el salón. */
  xpEarned: number;
  /** Récords del Taller de Escritura. */
  typing: TypingStats;
}

export interface PlayerProfile {
  name: string;
  avatar: string;
  goal: string;
  experience: "principiante" | "intermedio" | "avanzado";
  /** Género elegido para el tratamiento (rangos, saludos). */
  gender: "m" | "f" | "x";
  /** Descripción personal (bio, máx. 160 caracteres). */
  bio: string;
  /** Banner del perfil: id predefinido («preset:aurora») o data-URL propia. */
  banner: string;
  /** Foto del avatar: data-URL propia o «» para usar la predeterminada. */
  photo: string;
  /** Logro destacado en la ficha (id de logro o ""). */
  featuredBadge: string;
  createdAt: number;
  onboarded: boolean;
  placementDone: boolean;
}

/** Identificadores de paleta de color (tema). Las cuatro últimas son
 *  premium: se desbloquean en el Bazar con tinta. */
export type ThemeColorId =
  | "aurora"
  | "coral"
  | "miel"
  | "lavanda"
  | "oceano"
  | "magenta"
  | "bosque"
  | "atardecer"
  | "turquesa"
  | "ciruela"
  | "midnight"
  | "selva"
  | "brasa"
  | "perla";

export interface GameSettings {
  reduceMotion: boolean;
  textSize: "md" | "lg" | "xl";
  sound: boolean;
  /** Volumen de la música ambiental generativa (0-1). */
  musicVolume: number;
  /** Volumen de los efectos de interacción (0-1). */
  sfxVolume: number;
  dailyGoalXp: number;
  newCardsPerDay: number;
  offlineMode: boolean;
  /** Modo lectura nocturna: paleta cálida y tenue (Etapa 2). */
  nightMode: boolean;
  /** Paleta de color de la interfaz (Etapa 3). */
  themeColor: ThemeColorId;
  /** ¿Suena la música ambiental dentro de las partidas? */
  musicInGames: boolean;
  /** Volumen de la estación de música del jugador (0-1). */
  stationVolume: number;
  /** ¿La estación sigue sonando durante las partidas? */
  stationInGames: boolean;
  /** Velocidad de la voz del navegador TTS (0.5-1.3). */
  ttsRate: number;
  /** Vibración/háptics en aciertos y combos (si el dispositivo lo permite). */
  haptics: boolean;
  /** ¿Suena la tecla al teclear en el Taller de Escritura? */
  typingSounds: boolean;
}

/* ============================== Misiones / logros ============================== */

export type MissionMetric =
  | "sessions"
  | "correct"
  | "xp"
  | "games"
  | "regions"
  | "combo"
  | "srsReviews"
  | "activeDays"
  | "tinta";

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  metric: MissionMetric;
  target: number;
  xpReward: number;
  /** Recompensa de escudo de racha (misión semanal). */
  shieldReward?: boolean;
  /** Gotas de tinta extra al recoger la recompensa. */
  tintaReward?: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  /** Gotas de tinta que acompañan al XP al recoger el logro. */
  tintaReward?: number;
  /** Evalúa si está cumplido. */
  check: (core: GameCore, ctx: AchievementCtx) => boolean;
  /** Progreso 0-1 para la UI (opcional). */
  progress?: (core: GameCore, ctx: AchievementCtx) => number;
}

export interface AchievementCtx {
  masteredWords: number;
  learnedWords: number;
  now: number;
}

/* ============================== Enrutador de pantallas ============================== */

export type Screen =
  | { name: "welcome" }
  | { name: "onboarding" }
  | { name: "placement" }
  | { name: "home" }
  | { name: "map" }
  | { name: "game"; gameId: GameId; mode: SessionMode; regionId?: RegionId }
  | { name: "results" }
  | { name: "profile" }
  | { name: "stats" }
  | { name: "collection" }
  | { name: "errors" }
  | { name: "missions" }
  | { name: "settings" }
  | { name: "music" }
  | { name: "shop" }
  | { name: "arcade" }
  | { name: "library" }
  | { name: "frases" }
  | { name: "training" }
  | { name: "writing" }
  | { name: "legal" };
