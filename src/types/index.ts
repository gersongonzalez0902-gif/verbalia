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
  | "expresion";

/** Identificadores de los minijuegos implementados (Etapas 1 y 2). */
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
  | "minuto"; // Reto del Minuto (Torre)

/** Identificadores de las regiones del Archipiélago. */
export type RegionId =
  | "bosque"
  | "ciudad"
  | "fortaleza"
  | "biblioteca"
  | "puerto"
  | "torre";

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
  | MinutoExercise;

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

export interface PlayerProfile {
  name: string;
  avatar: string;
  goal: string;
  experience: "principiante" | "intermedio" | "avanzado";
  createdAt: number;
  onboarded: boolean;
  placementDone: boolean;
}

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
  | "activeDays";

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
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
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
  | { name: "library" };
