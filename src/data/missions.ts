import type { MissionDef } from "@/types";

/**
 * Plantillas de misiones diarias y semanales.
 * El motor selecciona plantillas y parámetros de forma determinista
 * a partir de la fecha, de modo que las misiones son estables durante
 * el día y reproducibles en los tests.
 */

export interface MissionTemplate {
  id: string;
  icon: string;
  title: (n: number) => string;
  /** Rango del objetivo en función del nivel del jugador. */
  range: [number, number];
  metric: MissionDef["metric"];
  xpReward: number;
  description: (n: number) => string;
}

export const DAILY_TEMPLATES: MissionTemplate[] = [
  {
    id: "md-sesiones",
    icon: "Play",
    title: (n) => `Completa ${n} ${n === 1 ? "sesión" : "sesiones"}`,
    range: [2, 3],
    metric: "sessions",
    xpReward: 30,
    description: () => "Cualquier misión de región o entrenamiento cuenta.",
  },
  {
    id: "md-aciertos",
    icon: "Target",
    title: (n) => `Acierta ${n} respuestas`,
    range: [12, 22],
    metric: "correct",
    xpReward: 35,
    description: () => "Los aciertos de tarjetas con nota «bien» o «fácil» también cuentan.",
  },
  {
    id: "md-xp",
    icon: "Sparkles",
    title: (n) => `Gana ${n} XP`,
    range: [70, 140],
    metric: "xp",
    xpReward: 25,
    description: () => "El XP de hoy desde las 00:00, misiones incluidas.",
  },
  {
    id: "md-variedad",
    icon: "Shapes",
    title: (n) => `Juega a ${n} minijuegos distintos`,
    range: [2, 3],
    metric: "games",
    xpReward: 40,
    description: () => "Explora el Archipiélago: la variedad entrena más habilidades.",
  },
  {
    id: "md-region",
    icon: "MapPin",
    title: (n) => `Juega en ${n} ${n === 1 ? "región" : "regiones"} distinta${n === 1 ? "" : "s"}`,
    range: [1, 2],
    metric: "regions",
    xpReward: 30,
    description: () => "Las misiones de región y los entrenamientos cuentan.",
  },
  {
    id: "md-combo",
    icon: "Zap",
    title: (n) => `Encadena un combo de ${n}`,
    range: [5, 8],
    metric: "combo",
    xpReward: 45,
    description: () => "Respuestas correctas consecutivas en una misma sesión.",
  },
  {
    id: "md-repaso",
    icon: "Sprout",
    title: (n) => `Repasa ${n} tarjetas del jardín`,
    range: [8, 14],
    metric: "srsReviews",
    xpReward: 35,
    description: () => "El jardín de tarjetas agradece la constancia.",
  },
];

export const WEEKLY_TEMPLATES: MissionTemplate[] = [
  {
    id: "ms-dias",
    icon: "CalendarCheck",
    title: () => "Juega 5 días esta semana",
    range: [5, 5],
    metric: "activeDays",
    xpReward: 100,
    description: () => "Recompensa: un Escudo de Racha que protege tu racha si un día no puedes jugar.",
  },
  {
    id: "ms-aciertos",
    icon: "Target",
    title: (n) => `Acierta ${n} respuestas esta semana`,
    range: [50, 80],
    metric: "correct",
    xpReward: 80,
    description: () => "La suma de toda la semana cuenta.",
  },
  {
    id: "ms-variedad",
    icon: "Shapes",
    title: () => "Prueba 5 minijuegos distintos",
    range: [5, 5],
    metric: "games",
    xpReward: 70,
    description: () => "Descubre los siete caminos del Archipiélago.",
  },
];

/** Misión semanal que otorga escudo de racha. */
export const SHIELD_MISSION_ID = "ms-dias";
