import type { AchievementDef } from "@/types";
import { SRS_WORDS } from "./words-srs";

/**
 * Catálogo de logros. Cada definición evalúa el núcleo de progreso puro,
 * por lo que pueden probarse con datos sintéticos en los tests.
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "ac-primer-paso",
    name: "Primer paso en el Archipiélago",
    description: "Completa tu primera sesión.",
    icon: "Footprints",
    xpReward: 25,
    check: (c) => c.stats.totalSessions >= 1,
    progress: (c) => Math.min(c.stats.totalSessions, 1),
  },
  {
    id: "ac-nivel-3",
    name: "Explorador en ciernes",
    description: "Alcanza el nivel 3 de jugador.",
    icon: "TrendingUp",
    xpReward: 40,
    check: () => false, // se evalúa con el nivel; ver note en engine/achievements
    progress: () => 0,
  },
  {
    id: "ac-nivel-5",
    name: "Cartógrafo de palabras",
    description: "Alcanza el nivel 5 de jugador.",
    icon: "Map",
    xpReward: 60,
    check: () => false,
    progress: () => 0,
  },
  {
    id: "ac-nivel-10",
    name: "Veterano del Archipiélago",
    description: "Alcanza el nivel 10 de jugador.",
    icon: "Crown",
    xpReward: 120,
    check: () => false,
    progress: () => 0,
  },
  {
    id: "ac-xp-500",
    name: "Pluma de bronce",
    description: "Acumula 500 XP en total.",
    icon: "Feather",
    xpReward: 30,
    check: (c) => c.xp >= 500,
    progress: (c) => c.xp / 500,
  },
  {
    id: "ac-xp-2500",
    name: "Pluma de plata",
    description: "Acumula 2500 XP en total.",
    icon: "Feather",
    xpReward: 80,
    check: (c) => c.xp >= 2500,
    progress: (c) => c.xp / 2500,
  },
  {
    id: "ac-racha-3",
    name: "Tres días seguidos",
    description: "Consigue una racha de 3 días.",
    icon: "Flame",
    xpReward: 30,
    check: (c) => c.streak.best >= 3,
    progress: (c) => c.streak.best / 3,
  },
  {
    id: "ac-racha-7",
    name: "Semana encendida",
    description: "Consigue una racha de 7 días.",
    icon: "Flame",
    xpReward: 70,
    check: (c) => c.streak.best >= 7,
    progress: (c) => c.streak.best / 7,
  },
  {
    id: "ac-racha-14",
    name: "Fuego de dos semanas",
    description: "Consigue una racha de 14 días.",
    icon: "Flame",
    xpReward: 140,
    check: (c) => c.streak.best >= 14,
    progress: (c) => c.streak.best / 14,
  },
  {
    id: "ac-palabras-25",
    name: "Semillero",
    description: "Aprende 25 palabras del jardín.",
    icon: "Sprout",
    xpReward: 40,
    check: (_c, ctx) => ctx.learnedWords >= 25,
    progress: (_c, ctx) => ctx.learnedWords / 25,
  },
  {
    id: "ac-palabras-50",
    name: "Jardín en flor",
    description: "Aprende 50 palabras del jardín.",
    icon: "Flower2",
    xpReward: 90,
    check: (_c, ctx) => ctx.learnedWords >= 50,
    progress: (_c, ctx) => ctx.learnedWords / 50,
  },
  {
    id: "ac-dominio-10",
    name: "Diez palabras dominadas",
    description: "Dominio verificado de 10 palabras (intervalo largo en el SRS).",
    icon: "Brain",
    xpReward: 60,
    check: (_c, ctx) => ctx.masteredWords >= 10,
    progress: (_c, ctx) => ctx.masteredWords / 10,
  },
  {
    id: "ac-sesion-perfecta",
    name: "Sesión impecable",
    description: "Completa una sesión de 10 o más respuestas sin fallar ninguna.",
    icon: "Sparkles",
    xpReward: 50,
    check: (c) => c.sessions.some((s) => s.total >= 10 && s.accuracy === 1),
  },
  {
    id: "ac-5-juegos",
    name: "Mente versátil",
    description: "Juega a 5 minijuegos distintos.",
    icon: "Shapes",
    xpReward: 50,
    check: (c) => Object.keys(c.stats.byGame).length >= 5,
    progress: (c) => Object.keys(c.stats.byGame).length / 5,
  },
  {
    id: "ac-7-juegos",
    name: "Los siete caminos",
    description: "Juega al menos una vez a cada minijuego de la Etapa 1.",
    icon: "Trophy",
    xpReward: 100,
    check: (c) => ["srs", "trivia", "puzzle", "cloze", "errores", "tildes", "parrafos"].every((g) => c.stats.byGame[g]),
    progress: (c) => ["srs", "trivia", "puzzle", "cloze", "errores", "tildes", "parrafos"].filter((g) => c.stats.byGame[g]).length / 7,
  },
  {
    id: "ac-cazador-errores",
    name: "Cazador incansable",
    description: "Repasa 10 ejercicios fallados desde tu cuaderno de errores.",
    icon: "Undo2",
    xpReward: 50,
    check: (c) => c.stats.byGame["review"]?.plays >= 10,
  },
  {
    id: "ac-50-sesiones",
    name: "Constancia de cronista",
    description: "Completa 50 sesiones.",
    icon: "BookHeart",
    xpReward: 150,
    check: (c) => c.stats.totalSessions >= 50,
    progress: (c) => c.stats.totalSessions / 50,
  },
  {
    id: "ac-coleccionista",
    name: "Coleccionista de vocablos",
    description: "Descubre la mitad de las palabras del jardín.",
    icon: "Layers",
    xpReward: 80,
    check: (_c, ctx) => ctx.learnedWords >= Math.ceil(SRS_WORDS.length / 2),
    progress: (_c, ctx) => ctx.learnedWords / Math.ceil(SRS_WORDS.length / 2),
  },

  /* ==================== Etapa 2 ==================== */
  {
    id: "ac-oido-marino",
    name: "Oído de marino",
    description: "Escribe 10 dictados del faro correctamente.",
    icon: "Ear",
    xpReward: 60,
    check: (c) => (c.stats.byGame["dictado"]?.correct ?? 0) >= 10,
    progress: (c) => (c.stats.byGame["dictado"]?.correct ?? 0) / 10,
  },
  {
    id: "ac-lector-atento",
    name: "Lector de faros",
    description: "Acierta 8 preguntas de lectura inmersiva.",
    icon: "BookOpenText",
    xpReward: 60,
    check: (c) => (c.stats.byGame["lectura"]?.correct ?? 0) >= 8,
    progress: (c) => (c.stats.byGame["lectura"]?.correct ?? 0) / 8,
  },
  {
    id: "ac-cuentacuentos",
    name: "Cuentacuentos del Archipiélago",
    description: "Termina 3 historias ramificadas.",
    icon: "GitBranch",
    xpReward: 70,
    check: (c) => (c.stats.byGame["historias"]?.plays ?? 0) >= 3,
    progress: (c) => (c.stats.byGame["historias"]?.plays ?? 0) / 3,
  },
  {
    id: "ac-sabio-popular",
    name: "Sabio del refranero",
    description: "Descifra 15 refranes y modismos.",
    icon: "ScrollText",
    xpReward: 60,
    check: (c) => (c.stats.byGame["refranes"]?.correct ?? 0) >= 15,
    progress: (c) => (c.stats.byGame["refranes"]?.correct ?? 0) / 15,
  },
  {
    id: "ac-cronista-minuto",
    name: "Cronista del minuto",
    description: "Completa 5 Retos del Minuto (esfuerzo honesto, sin corrección automática).",
    icon: "PenLine",
    xpReward: 60,
    check: (c) => (c.stats.byGame["minuto"]?.plays ?? 0) >= 5,
    progress: (c) => (c.stats.byGame["minuto"]?.plays ?? 0) / 5,
  },
  {
    id: "ac-explorador-total",
    name: "Explorador de las siete islas",
    description: "Completa misiones en las 7 regiones del Archipiélago.",
    icon: "MapPin",
    xpReward: 150,
    check: (c) => {
      const regions = new Set<string>();
      for (const list of Object.values(c.stats.regionsByDay)) for (const r of list) regions.add(r);
      return ["bosque", "ciudad", "fortaleza", "biblioteca", "puerto", "torre", "observatorio"].every((r) => regions.has(r));
    },
    progress: (c) => {
      const regions = new Set<string>();
      for (const list of Object.values(c.stats.regionsByDay)) for (const r of list) regions.add(r);
      return regions.size / 7;
    },
  },
  {
    id: "ac-coleccionista-formatos",
    name: "Coleccionista de formatos",
    description: "Prueba 20 minijuegos distintos.",
    icon: "Layers",
    xpReward: 80,
    check: (c) => (c.stats.uniqueGames ?? []).length >= 20,
    progress: (c) => Math.min(1, (c.stats.uniqueGames ?? []).length / 20),
  },
  {
    id: "ac-etimologo",
    name: "Etimólogo del telescopio",
    description: "Alcanza nivel 4 de cultura lingüística.",
    icon: "Telescope",
    xpReward: 90,
    check: (c) => c.skills.cultura >= 4,
    progress: (c) => c.skills.cultura / 4,
  },
];

/**
 * Logros que dependen directamente del nivel de jugador.
 * Se evalúan aparte porque el nivel deriva del XP.
 */
export const LEVEL_ACHIEVEMENTS: Record<string, number> = {
  "ac-nivel-3": 3,
  "ac-nivel-5": 5,
  "ac-nivel-10": 10,
};

export const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> = ACHIEVEMENTS.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, AchievementDef>,
);
