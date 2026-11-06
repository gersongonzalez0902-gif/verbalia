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
    id: "ac-nivel-15",
    name: "Leyenda del Códice",
    description: "Alcanza el nivel 15 de jugador y entra en la leyenda del Archipiélago.",
    icon: "Crown",
    xpReward: 200,
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

  /* ==================== Etapa 4 · Códice y Forja ==================== */
  {
    id: "ac-forja-1",
    name: "Chispa de la Forja",
    description: "Completa tu primera sesión en la Forja del Escritor.",
    icon: "Flame",
    xpReward: 40,
    check: (c) =>
      ["metaforas", "registro", "conectores", "ironia", "titulos"].some(
        (g) => (c.stats.byGame[g]?.plays ?? 0) >= 1,
      ),
    progress: (c) =>
      Math.min(
        1,
        ["metaforas", "registro", "conectores", "ironia", "titulos"].reduce(
          (acc, g) => acc + Math.min(1, c.stats.byGame[g]?.plays ?? 0),
          0,
        ),
      ),
  },
  {
    id: "ac-forja-25",
    name: "Herrero de palabras",
    description: "Acierta 25 ejercicios entre los cinco formatos de la Forja.",
    icon: "Hammer",
    xpReward: 90,
    check: (c) =>
      ["metaforas", "registro", "conectores", "ironia", "titulos"].reduce(
        (acc, g) => acc + (c.stats.byGame[g]?.correct ?? 0),
        0,
      ) >= 25,
    progress: (c) =>
      ["metaforas", "registro", "conectores", "ironia", "titulos"].reduce(
        (acc, g) => acc + (c.stats.byGame[g]?.correct ?? 0),
        0,
      ) / 25,
  },
  {
    id: "ac-forja-completa",
    name: "Maestro de la Forja",
    description: "Prueba los cinco minijuegos de la Forja del Escritor.",
    icon: "FlameKindling",
    xpReward: 150,
    check: (c) =>
      ["metaforas", "registro", "conectores", "ironia", "titulos"].every(
        (g) => (c.stats.byGame[g]?.plays ?? 0) >= 1,
      ),
    progress: (c) =>
      ["metaforas", "registro", "conectores", "ironia", "titulos"].filter(
        (g) => (c.stats.byGame[g]?.plays ?? 0) >= 1,
      ).length / 5,
  },
  {
    id: "ac-tinta-100",
    name: "Tintero lleno",
    description: "Acumula 100 de tinta ganada en el Bazar.",
    icon: "Droplets",
    xpReward: 60,
    check: (c) => (c.wallet?.tinta ?? 0) + (c.wallet?.spent ?? 0) >= 100,
    progress: (c) => ((c.wallet?.tinta ?? 0) + (c.wallet?.spent ?? 0)) / 100,
  },
  {
    id: "ac-tinta-500",
    name: "Tinta en las venas",
    description: "Acumula 500 de tinta ganada en total.",
    icon: "Droplet",
    xpReward: 120,
    check: (c) => (c.wallet?.tinta ?? 0) + (c.wallet?.spent ?? 0) >= 500,
    progress: (c) => ((c.wallet?.tinta ?? 0) + (c.wallet?.spent ?? 0)) / 500,
  },
  {
    id: "ac-mecenas",
    name: "Mecenas del Bazar",
    description: "Compra 3 artículos en el Bazar del Copista.",
    icon: "ShoppingBag",
    xpReward: 80,
    check: (c) => (c.wallet?.owned?.length ?? 0) >= 3,
    progress: (c) => (c.wallet?.owned?.length ?? 0) / 3,
  },
  {
    id: "ac-ocho-islas",
    name: "Cartógrafo de las ocho islas",
    description: "Completa misiones en las 8 regiones del Archipiélago.",
    icon: "Map",
    xpReward: 200,
    check: (c) => {
      const regions = new Set<string>();
      for (const list of Object.values(c.stats.regionsByDay)) for (const r of list) regions.add(r);
      return ["bosque", "ciudad", "fortaleza", "biblioteca", "puerto", "torre", "observatorio", "forja"].every((r) => regions.has(r));
    },
    progress: (c) => {
      const regions = new Set<string>();
      for (const list of Object.values(c.stats.regionsByDay)) for (const r of list) regions.add(r);
      return ["bosque", "ciudad", "fortaleza", "biblioteca", "puerto", "torre", "observatorio", "forja"].filter((r) => regions.has(r)).length / 8;
    },
  },
  {
    id: "ac-palabras-75",
    name: "Jardín frondoso",
    description: "Aprende 75 palabras del jardín.",
    icon: "Leaf",
    xpReward: 70,
    check: (_c, ctx) => ctx.learnedWords >= 75,
    progress: (_c, ctx) => ctx.learnedWords / 75,
  },
  {
    id: "ac-palabras-125",
    name: "Bosque infinito",
    description: "Aprende 125 palabras del jardín.",
    icon: "TreePine",
    xpReward: 130,
    check: (_c, ctx) => ctx.learnedWords >= 125,
    progress: (_c, ctx) => ctx.learnedWords / 125,
  },
  {
    id: "ac-racha-30",
    name: "Mes inquebrantable",
    description: "Consigue una racha de 30 días.",
    icon: "Flame",
    xpReward: 250,
    check: (c) => c.streak.best >= 30,
    progress: (c) => c.streak.best / 30,
  },
  {
    id: "ac-combo-15",
    name: "Cadena de quince",
    description: "Consigue un combo de 15 aciertos seguidos.",
    icon: "Zap",
    xpReward: 120,
    check: (c) => (c.stats.bestComboEver ?? 0) >= 15,
    progress: (c) => (c.stats.bestComboEver ?? 0) / 15,
  },
  {
    id: "ac-tiempo-10h",
    name: "Diez horas de navegación",
    description: "Juega durante 10 horas acumuladas.",
    icon: "Hourglass",
    xpReward: 100,
    check: (c) => (c.stats.totalTimeMs ?? 0) >= 10 * 3_600_000,
    progress: (c) => (c.stats.totalTimeMs ?? 0) / (10 * 3_600_000),
  },
  {
    id: "ac-sesiones-100",
    name: "Cien sesiones a bordo",
    description: "Completa 100 sesiones de juego.",
    icon: "Flag",
    xpReward: 120,
    check: (c) => c.stats.totalSessions >= 100,
    progress: (c) => c.stats.totalSessions / 100,
  },
  /* ==================== Mega-6: logros del Salón de Juegos ==================== */
  {
    id: "ac-arcade-primera",
    name: "Primera partida del salón",
    description: "Juega tu primera partida en el Salón de Juegos Educativos.",
    icon: "Gamepad2",
    xpReward: 30,
    check: (c) => Object.values(c.arcade.plays).reduce((a, b) => a + b, 0) >= 1,
    progress: (c) => Math.min(Object.values(c.arcade.plays).reduce((a, b) => a + b, 0), 1),
  },
  {
    id: "ac-arcade-ajedrez",
    name: "El faro cae",
    description: "Gana tu primera partida de ajedrez al motor local.",
    icon: "Crown",
    xpReward: 120,
    check: (c) => c.arcade.chessRecord.w >= 1,
    progress: (c) => Math.min(c.arcade.chessRecord.w, 1),
  },
  {
    id: "ac-arcade-elo",
    name: "Mente de farero",
    description: "Alcanza 1400 de ELO en el ajedrez del salón.",
    icon: "Swords",
    xpReward: 150,
    check: (c) => (c.arcade.chessElo ?? 1200) >= 1400,
    progress: (c) => Math.min(((c.arcade.chessElo ?? 1200) - 1200) / 200, 1),
  },
  {
    id: "ac-arcade-coleccionista",
    name: "Habitual del salón",
    description: "Desbloquea 8 juegos del salón con tinta.",
    icon: "Droplets",
    xpReward: 100,
    check: (c) => c.arcade.unlocked.length >= 8,
    progress: (c) => Math.min(c.arcade.unlocked.length / 8, 1),
  },
  {
    id: "ac-arcade-record",
    name: "Cazador de récords",
    description: "Logra un récord personal en 5 juegos distintos.",
    icon: "Trophy",
    xpReward: 90,
    check: (c) => Object.keys(c.arcade.best).length >= 5,
    progress: (c) => Math.min(Object.keys(c.arcade.best).length / 5, 1),
  },
  {
    id: "ac-arcade-maraton",
    name: "Maratón de mareas",
    description: "Juega 50 partidas en el Salón de Juegos.",
    icon: "Zap",
    xpReward: 110,
    check: (c) => Object.values(c.arcade.plays).reduce((a, b) => a + b, 0) >= 50,
    progress: (c) => Math.min(Object.values(c.arcade.plays).reduce((a, b) => a + b, 0) / 50, 1),
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
  "ac-nivel-15": 15,
};

export const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> = ACHIEVEMENTS.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, AchievementDef>,
);

