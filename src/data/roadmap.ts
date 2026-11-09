import type { SkillId, Stage } from "@/types";

/**
 * Hoja de ruta de producto: los 25 módulos obligatorios del catálogo
 * y los 26 módulos innovadores, cada uno con su etapa asignada.
 * Ningún módulo queda fuera de la planificación.
 */

export interface RoadmapModule {
  name: string;
  description: string;
  skill: SkillId;
  stage: Stage;
  status: "listo" | "previsto";
}

/** Catálogo obligatorio (25 mecánicas). */
export const CORE_MECHANICS: RoadmapModule[] = [
  { name: "Repetición Espaciada Dinámica (SRS)", description: "Tarjetas inteligentes que reaparecen según el rendimiento.", skill: "vocabulario", stage: 1, status: "listo" },
  { name: "Candados Ampliados de Formatos", description: "Los formatos de colección se abren con isla + logros, tinta gastada o nivel: la progresión se gana jugando.", skill: "vocabulario", stage: 2, status: "listo" },
  { name: "Cofre de 2000 Frases", description: "La bitácora de frases llega a las 2000 notas de escritores y del Archipiélago, sin repetir una sola.", skill: "lectura", stage: 2, status: "listo" },
  { name: "Panel «Tu siguiente paso»", description: "El inicio recomienda la prioridad real del navegante: recompensas, cuaderno de errores, jardín vencido u objetivo del día.", skill: "vocabulario", stage: 2, status: "listo" },
  { name: "Sprint de Vocabulario", description: "Relacionar palabras bajo presión de tiempo (10 s por definición).", skill: "vocabulario", stage: 2, status: "listo" },
  { name: "Trivia Relámpago", description: "Clasificar palabras en sustantivos, verbos, adjetivos y adverbios.", skill: "vocabulario", stage: 1, status: "listo" },
  { name: "Tarjetas Rasca-Rasca", description: "Revelar palabras y definiciones ocultas.", skill: "vocabulario", stage: 2, status: "listo" },
  { name: "Batallas de Sinónimos", description: "Sinónimos y antónimos que encajan en contexto.", skill: "vocabulario", stage: 2, status: "listo" },
  { name: "Mapas Mentales de Familias de Palabras", description: "Conectar raíces, derivados y palabras relacionadas.", skill: "vocabulario", stage: 3, status: "previsto" },
  { name: "Adivinanzas Etimológicas", description: "Descubrir el origen y significado de palabras.", skill: "vocabulario", stage: 3, status: "previsto" },
  { name: "Crucigramas y Sopas de Letras Adaptativas", description: "Generados según el nivel del usuario.", skill: "vocabulario", stage: 3, status: "previsto" },
  { name: "Puzzles Sintácticos", description: "Ordenar fragmentos para construir oraciones.", skill: "gramatica", stage: 1, status: "listo" },
  { name: "Cloze Test Contextual", description: "Completar espacios vacíos dentro de textos.", skill: "gramatica", stage: 1, status: "listo" },
  { name: "Caza de Errores", description: "Encontrar y corregir errores ortográficos y sintácticos.", skill: "ortografia", stage: 1, status: "listo" },
  { name: "Traducción Inversa Rápida", description: "Interpretar una frase y reconstruirla en el idioma objetivo.", skill: "gramatica", stage: 4, status: "previsto" },
  { name: "Constructor de Párrafos", description: "Organizar oraciones para conseguir un texto coherente.", skill: "lectura", stage: 1, status: "listo" },
  { name: "El Tribunal de las Tildes", description: "Identificar correctamente las reglas de acentuación.", skill: "ortografia", stage: 1, status: "listo" },
  { name: "Lectura Inmersiva", description: "Texto resaltado frase a frase, sincronizado con narración de audio.", skill: "lectura", stage: 2, status: "listo" },
  { name: "Cuestionarios Auditivos de Matices", description: "Identificar emociones e intenciones en entonaciones (Ecos del Puerto).", skill: "audicion", stage: 2, status: "listo" },
  { name: "Dictados Cruzados", description: "Transcribir audio y evaluar ortografía y puntuación (Dictado del Faro).", skill: "audicion", stage: 2, status: "listo" },
  { name: "Dictado y Transcripción por Voz", description: "Usar el micrófono para reconocer y evaluar el habla.", skill: "expresion", stage: 2, status: "listo" },
  { name: "Role-Play Conversacional con IA", description: "Practicar conversaciones simuladas.", skill: "expresion", stage: 3, status: "previsto" },
  { name: "Grabación y Autoevaluación", description: "Grabar una frase y consultar una comparación orientativa.", skill: "expresion", stage: 2, status: "listo" },
  { name: "Retos de Fluidez Continua", description: "Hablar durante 30 segundos sobre un tema.", skill: "expresion", stage: 3, status: "previsto" },
  { name: "Corrección Colaborativa", description: "Corregir textos de otros usuarios, con moderación.", skill: "expresion", stage: 4, status: "previsto" },
  { name: "Editor Fantasma de Estilo", description: "Sugerir mejoras de vocabulario y claridad sin borrar la voz del escritor.", skill: "expresion", stage: 3, status: "previsto" },
  { name: "Historias Ramificadas", description: "Aventuras narrativas con decisiones libres y pregunta final.", skill: "lectura", stage: 2, status: "listo" },
  { name: "Forja de Metáforas", description: "Completar imágenes literarias eligiendo la figura exacta (Etapa 4).", skill: "expresion", stage: 4, status: "listo" },
  { name: "Registro Correcto", description: "Adaptar el mismo mensaje al contexto: formal, coloquial o neutro.", skill: "expresion", stage: 4, status: "listo" },
  { name: "Detector de Ironía", description: "Distinguir sentido literal y tono irónico con el contexto como brújula.", skill: "lectura", stage: 4, status: "listo" },
  { name: "Desafíos de Modismos y Refranes", description: "Interpretar expresiones figuradas con variantes regionales.", skill: "lectura", stage: 2, status: "listo" },
];

/** Módulos innovadores (26 conceptos). */
export const INNOVATIVE_MODULES: RoadmapModule[] = [
  { name: "Modo Escritor con IA", description: "Diario de escritura con sugerencias de estilo.", skill: "expresion", stage: 3, status: "previsto" },
  { name: "Tinder de Sinónimos", description: "Deslizar tarjetas para decidir si dos términos son equivalentes.", skill: "vocabulario", stage: 2, status: "listo" },
  { name: "Karaoke Literario", description: "Lectura guiada con ritmo visual y audio (entregado dentro de Lectura Inmersiva).", skill: "lectura", stage: 2, status: "listo" },
  { name: "Detective de Fake News", description: "Análisis de falacias, sesgos y redacción con ejemplos ficticios.", skill: "lectura", stage: 3, status: "previsto" },
  { name: "Podcast Interactivo Personalizado", description: "Miniaudios centrados en los errores frecuentes del usuario.", skill: "audicion", stage: 3, status: "previsto" },
  { name: "Duelo de Tipeo Rápido", description: "Transcripción de frases y trabalenguas.", skill: "ortografia", stage: 2, status: "listo" },
  { name: "Archivista de Neologismos", description: "Aprendizaje de palabras nuevas de la lengua viva.", skill: "vocabulario", stage: 3, status: "previsto" },
  { name: "Jeroglíficos Modernos", description: "Interpretar mensajes con emojis y abreviaturas.", skill: "lectura", stage: 2, status: "listo" },
  { name: "Laboratorio de Puntuación", description: "Descubrir cómo los signos cambian el significado.", skill: "ortografia", stage: 2, status: "listo" },
  { name: "Asistente de Debate Virtual", description: "Práctica de argumentación con IA.", skill: "expresion", stage: 3, status: "previsto" },
  { name: "Constructor de Cómics de Texto", description: "Organizar diálogos y escenas.", skill: "expresion", stage: 3, status: "previsto" },
  { name: "Desafío de Conectores Discursivos", description: "Dominar sin embargo, puesto que, no obstante…", skill: "gramatica", stage: 2, status: "listo" },
  { name: "Caza de Pleonasmos y Redundancias", description: "Detectar y eliminar repeticiones innecesarias.", skill: "ortografia", stage: 2, status: "listo" },
  { name: "Rincón del Orador", description: "Prácticas de dicción y expresión.", skill: "expresion", stage: 3, status: "previsto" },
  { name: "Simulador de Entrevistas y Exposiciones", description: "Ensayar situaciones comunicativas reales.", skill: "expresion", stage: 3, status: "previsto" },
  { name: "Biblioteca de Mitos y Leyendas Interactivos", description: "Lecturas ramificadas del patrimonio oral.", skill: "lectura", stage: 2, status: "listo" },
  { name: "Trivia de Figuras Retóricas", description: "Metáforas, símiles, hipérboles y compañía.", skill: "lectura", stage: 3, status: "listo" },
  { name: "Generador de Retos Diarios por Enlace", description: "Retos compartibles con un solo URL.", skill: "gramatica", stage: 4, status: "previsto" },
  { name: "Modo Lectura Nocturna", description: "Modo de lectura cálida y serena para jugar de noche (Ajustes).", skill: "lectura", stage: 2, status: "listo" },
  { name: "Estudio de Refranes del Mundo Hispanohablante", description: "Refranero panhispánico comentado (Sabiduría Popular, con región y explicación).", skill: "lectura", stage: 2, status: "listo" },
  { name: "Mural de Vocabulario", description: "Mural colaborativo de palabras vivas.", skill: "vocabulario", stage: 4, status: "previsto" },
  { name: "Laboratorio de Fonética Visual", description: "Ver y comparar la forma de los sonidos.", skill: "audicion", stage: 2, status: "listo" },
  { name: "Reto del Minuto en Blanco", description: "Escribir sin parar durante sesenta segundos, con autoevaluación guiada.", skill: "expresion", stage: 2, status: "listo" },
  { name: "Traducción de Memes y Cultura Pop", description: "Lengua coloquial y humor en contexto.", skill: "lectura", stage: 3, status: "previsto" },
  { name: "Misiones de Corrección Urbana", description: "Corregir errores reales del paisaje urbano (cartelería, menús).", skill: "ortografia", stage: 3, status: "previsto" },
  { name: "Duelos de Desafíos", description: "Competir en tiempo real con otros jugadores.", skill: "vocabulario", stage: 4, status: "previsto" },
];

export const STAGE_LABELS: Record<Stage, string> = {
  1: "Etapa 1 · MVP jugable",
  2: "Etapa 2 · Experiencia avanzada",
  3: "Etapa 3 · Cielo de formatos",
  4: "Etapa 4 · El Códice Infinito",
};

export const STAGE_DESCRIPTIONS: Record<Stage, string> = {
  1: "La base completa y jugable: onboarding, evaluación, mapa, 7 minijuegos, progresión, misiones, repaso de errores y modo sin conexión.",
  2: "Audio, voz y expresión: Puerto de las Voces y Torre de la Expresión, lectura sincronizada, dictados, matices, historias ramificadas, refranes, sprint, sinónimos, reto del minuto y modo nocturno. Ahora también rasca-rasca, tinder de sinónimos, duelo de tipeo, laboratorio de puntuación, jeroglíficos modernos, mitos y leyendas, fonética visual y dictado por voz con grabación: los 22 módulos de la etapa, todos listos.",
  3: "Cielo de formatos: 35 minijuegos nuevos (memoria, el intruso, clasifica, verdadero/falso, escribe, oye, conecta), la isla del Observatorio, mascota reactiva, 6 paletas, estación de música y bóveda cifrada.",
  4: "El Códice Infinito: la octava isla (Forja del Escritor) con 5 formatos de estilo, economía de tinta con el Bazar del Copista, +150 palabras, +100 frases, perfil 3.0 con marcos y títulos, estadísticas 3.0, háptics y ajustes de voz.",
};
