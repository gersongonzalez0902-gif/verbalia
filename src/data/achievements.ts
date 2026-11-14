import type { AchievementDef } from "@/types";
import { SRS_WORDS } from "./words-srs";
import { levelFromXp, cumulativeXpForLevel } from "@/engine/xp";

/**
 * Catálogo de logros. Cada definición evalúa el núcleo de progreso puro,
 * por lo que pueden probarse con datos sintéticos en los tests.
 */

/** Logro por nivel (Área 8 · evaluación real): el nivel sale del XP con
 *  la MISMA curva del motor, y el progreso es el XP acumulado frente al
 *  que pide el nivel destino. Nada de checks falsos. */
const levelCheck = (lvl: number) => (c: { xp: number }) => levelFromXp(c.xp) >= lvl;
const levelProgress = (lvl: number) => (c: { xp: number }) =>
  Math.min(1, c.xp / cumulativeXpForLevel(lvl));

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "ac-primer-paso",
    name: "Primer paso en el Archipiélago",
    description: "Completa tu primera sesión.",
    icon: "Footprints",
    xpReward: 25,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 2,
    check: (c) => c.stats.totalSessions >= 1,
    progress: (c) => Math.min(c.stats.totalSessions, 1),
  },
  {
    id: "ac-nivel-3",
    name: "Explorador en ciernes",
    description: "Alcanza el nivel 3 de jugador.",
    icon: "TrendingUp",
    xpReward: 40,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 2,
    check: levelCheck(3),
    progress: levelProgress(3),
  },
  {
    id: "ac-nivel-5",
    name: "Cartógrafo de palabras",
    description: "Alcanza el nivel 5 de jugador.",
    icon: "Map",
    xpReward: 60,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 3,
    check: levelCheck(5),
    progress: levelProgress(5),
  },
  {
    id: "ac-nivel-10",
    name: "Veterano del Archipiélago",
    description: "Alcanza el nivel 10 de jugador.",
    icon: "Crown",
    xpReward: 120,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 6,
    check: levelCheck(10),
    progress: levelProgress(10),
  },
  {
    id: "ac-nivel-15",
    name: "Leyenda del Códice",
    description: "Alcanza el nivel 15 de jugador y entra en la leyenda del Archipiélago.",
    icon: "Crown",
    xpReward: 200,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 10,
    check: levelCheck(15),
    progress: levelProgress(15),
  },
  {
    id: "ac-xp-500",
    name: "Pluma de bronce",
    description: "Acumula 500 XP en total.",
    icon: "Feather",
    xpReward: 30,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 2,
    check: (c) => c.xp >= 500,
    progress: (c) => c.xp / 500,
  },
  {
    id: "ac-xp-2500",
    name: "Pluma de plata",
    description: "Acumula 2500 XP en total.",
    icon: "Feather",
    xpReward: 80,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
    check: (c) => c.xp >= 2500,
    progress: (c) => c.xp / 2500,
  },
  {
    id: "ac-racha-3",
    name: "Tres días seguidos",
    description: "Consigue una racha de 3 días.",
    icon: "Flame",
    xpReward: 30,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 2,
    check: (c) => c.streak.best >= 3,
    progress: (c) => c.streak.best / 3,
  },
  {
    id: "ac-racha-7",
    name: "Semana encendida",
    description: "Consigue una racha de 7 días.",
    icon: "Flame",
    xpReward: 70,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
    check: (c) => c.streak.best >= 7,
    progress: (c) => c.streak.best / 7,
  },
  {
    id: "ac-palabras-25",
    name: "Semillero",
    description: "Aprende 25 palabras del jardín.",
    icon: "Sprout",
    xpReward: 40,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 2,
    check: (_c, ctx) => ctx.learnedWords >= 25,
    progress: (_c, ctx) => ctx.learnedWords / 25,
  },
  {
    id: "ac-palabras-50",
    name: "Jardín en flor",
    description: "Aprende 50 palabras del jardín.",
    icon: "Flower2",
    xpReward: 90,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
    check: (_c, ctx) => ctx.learnedWords >= 50,
    progress: (_c, ctx) => ctx.learnedWords / 50,
  },
  {
    id: "ac-dominio-10",
    name: "Diez palabras dominadas",
    description: "Dominio verificado de 10 palabras (intervalo largo en el SRS).",
    icon: "Brain",
    xpReward: 60,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 3,
    check: (_c, ctx) => ctx.masteredWords >= 10,
    progress: (_c, ctx) => ctx.masteredWords / 10,
  },
  {
    id: "ac-sesion-perfecta",
    name: "Sesión impecable",
    description: "Completa una sesión de 10 o más respuestas sin fallar ninguna.",
    icon: "Sparkles",
    xpReward: 50,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 2,
    check: (c) => c.sessions.some((s) => s.total >= 10 && s.accuracy === 1),
  },
  {
    id: "ac-5-juegos",
    name: "Mente versátil",
    description: "Juega a 5 minijuegos distintos.",
    icon: "Shapes",
    xpReward: 50,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 2,
    check: (c) => Object.keys(c.stats.byGame).length >= 5,
    progress: (c) => Object.keys(c.stats.byGame).length / 5,
  },
  {
    id: "ac-7-juegos",
    name: "Los siete caminos",
    description: "Juega al menos una vez a cada minijuego de la Etapa 1.",
    icon: "Trophy",
    xpReward: 100,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 5,
    check: (c) => ["srs", "trivia", "puzzle", "cloze", "errores", "tildes", "parrafos"].every((g) => c.stats.byGame[g]),
    progress: (c) => ["srs", "trivia", "puzzle", "cloze", "errores", "tildes", "parrafos"].filter((g) => c.stats.byGame[g]).length / 7,
  },
  {
    id: "ac-cazador-errores",
    name: "Cazador incansable",
    description: "Repasa 10 ejercicios fallados desde tu cuaderno de errores.",
    icon: "Undo2",
    xpReward: 50,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 2,
    check: (c) => c.stats.byGame["review"]?.plays >= 10,
  },
  {
    id: "ac-50-sesiones",
    name: "Constancia de cronista",
    description: "Completa 50 sesiones.",
    icon: "BookHeart",
    xpReward: 150,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 8,
    check: (c) => c.stats.totalSessions >= 50,
    progress: (c) => c.stats.totalSessions / 50,
  },
  {
    id: "ac-coleccionista",
    name: "Coleccionista de vocablos",
    description: "Descubre la mitad de las palabras del jardín.",
    icon: "Layers",
    xpReward: 80,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
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
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 3,
    check: (c) => (c.stats.byGame["dictado"]?.correct ?? 0) >= 10,
    progress: (c) => (c.stats.byGame["dictado"]?.correct ?? 0) / 10,
  },
  {
    id: "ac-lector-atento",
    name: "Lector de faros",
    description: "Acierta 8 preguntas de lectura inmersiva.",
    icon: "BookOpenText",
    xpReward: 60,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 3,
    check: (c) => (c.stats.byGame["lectura"]?.correct ?? 0) >= 8,
    progress: (c) => (c.stats.byGame["lectura"]?.correct ?? 0) / 8,
  },
  {
    id: "ac-cuentacuentos",
    name: "Cuentacuentos del Archipiélago",
    description: "Termina 3 historias ramificadas.",
    icon: "GitBranch",
    xpReward: 70,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
    check: (c) => (c.stats.byGame["historias"]?.plays ?? 0) >= 3,
    progress: (c) => (c.stats.byGame["historias"]?.plays ?? 0) / 3,
  },
  {
    id: "ac-sabio-popular",
    name: "Sabio del refranero",
    description: "Descifra 15 refranes y modismos.",
    icon: "ScrollText",
    xpReward: 60,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 3,
    check: (c) => (c.stats.byGame["refranes"]?.correct ?? 0) >= 15,
    progress: (c) => (c.stats.byGame["refranes"]?.correct ?? 0) / 15,
  },
  {
    id: "ac-cronista-minuto",
    name: "Cronista del minuto",
    description: "Completa 5 Retos del Minuto (esfuerzo honesto, sin corrección automática).",
    icon: "PenLine",
    xpReward: 60,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 3,
    check: (c) => (c.stats.byGame["minuto"]?.plays ?? 0) >= 5,
    progress: (c) => (c.stats.byGame["minuto"]?.plays ?? 0) / 5,
  },
  {
    id: "ac-explorador-total",
    name: "Explorador de las siete islas",
    description: "Completa misiones en las 7 regiones del Archipiélago.",
    icon: "MapPin",
    xpReward: 150,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 8,
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
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
    check: (c) => (c.stats.uniqueGames ?? []).length >= 20,
    progress: (c) => Math.min(1, (c.stats.uniqueGames ?? []).length / 20),
  },
  {
    id: "ac-etimologo",
    name: "Etimólogo del telescopio",
    description: "Alcanza nivel 4 de cultura lingüística.",
    icon: "Telescope",
    xpReward: 90,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
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
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 2,
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
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
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
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 8,
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
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 3,
    check: (c) => (c.wallet?.tinta ?? 0) + (c.wallet?.spent ?? 0) >= 100,
    progress: (c) => ((c.wallet?.tinta ?? 0) + (c.wallet?.spent ?? 0)) / 100,
  },
  {
    id: "ac-tinta-500",
    name: "Tinta en las venas",
    description: "Acumula 500 de tinta ganada en total.",
    icon: "Droplet",
    xpReward: 120,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 6,
    check: (c) => (c.wallet?.tinta ?? 0) + (c.wallet?.spent ?? 0) >= 500,
    progress: (c) => ((c.wallet?.tinta ?? 0) + (c.wallet?.spent ?? 0)) / 500,
  },
  {
    id: "ac-mecenas",
    name: "Mecenas del Bazar",
    description: "Compra 3 artículos en el Bazar del Copista.",
    icon: "ShoppingBag",
    xpReward: 80,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
    check: (c) => (c.wallet?.owned?.length ?? 0) >= 3,
    progress: (c) => (c.wallet?.owned?.length ?? 0) / 3,
  },
  {
    id: "ac-ocho-islas",
    name: "Cartógrafo de las ocho islas",
    description: "Completa misiones en las 8 regiones del Archipiélago.",
    icon: "Map",
    xpReward: 200,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 10,
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
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
    check: (_c, ctx) => ctx.learnedWords >= 75,
    progress: (_c, ctx) => ctx.learnedWords / 75,
  },
  {
    id: "ac-palabras-125",
    name: "Bosque infinito",
    description: "Aprende 125 palabras del jardín.",
    icon: "TreePine",
    xpReward: 130,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 6,
    check: (_c, ctx) => ctx.learnedWords >= 125,
    progress: (_c, ctx) => ctx.learnedWords / 125,
  },
  {
    id: "ac-combo-15",
    name: "Cadena de quince",
    description: "Consigue un combo de 15 aciertos seguidos.",
    icon: "Zap",
    xpReward: 120,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 6,
    check: (c) => (c.stats.bestComboEver ?? 0) >= 15,
    progress: (c) => (c.stats.bestComboEver ?? 0) / 15,
  },
  {
    id: "ac-tiempo-10h",
    name: "Diez horas de navegación",
    description: "Juega durante 10 horas acumuladas.",
    icon: "Hourglass",
    xpReward: 100,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 5,
    check: (c) => (c.stats.totalTimeMs ?? 0) >= 10 * 3_600_000,
    progress: (c) => (c.stats.totalTimeMs ?? 0) / (10 * 3_600_000),
  },
  /* ==================== Mega-6: logros del Salón de Juegos ==================== */
  {
    id: "ac-arcade-primera",
    name: "Primera partida del salón",
    description: "Juega tu primera partida en el Salón de Juegos Educativos.",
    icon: "Gamepad2",
    xpReward: 30,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 2,
    check: (c) => Object.values(c.arcade.plays).reduce((a, b) => a + b, 0) >= 1,
    progress: (c) => Math.min(Object.values(c.arcade.plays).reduce((a, b) => a + b, 0), 1),
  },
  {
    id: "ac-arcade-coleccionista",
    name: "Habitual del salón",
    description: "Desbloquea 8 juegos del salón con tinta.",
    icon: "Droplets",
    xpReward: 100,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 5,
    check: (c) => c.arcade.unlocked.length >= 8,
    progress: (c) => Math.min(c.arcade.unlocked.length / 8, 1),
  },
  {
    id: "ac-arcade-record",
    name: "Cazador de récords",
    description: "Logra un récord personal en 5 juegos distintos.",
    icon: "Trophy",
    xpReward: 90,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 4,
    check: (c) => Object.keys(c.arcade.best).length >= 5,
    progress: (c) => Math.min(Object.keys(c.arcade.best).length / 5, 1),
  },
  {
    id: "ac-arcade-maraton",
    name: "Maratón de mareas",
    description: "Juega 50 partidas en el Salón de Juegos.",
    icon: "Zap",
    xpReward: 110,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 6,
    check: (c) => Object.values(c.arcade.plays).reduce((a, b) => a + b, 0) >= 50,
    progress: (c) => Math.min(Object.values(c.arcade.plays).reduce((a, b) => a + b, 0) / 50, 1),
  },

  /* ================= Mega-7 · progresión ampliada ================= */
  {
    id: "ac-nivel-20",
    name: "Titán de las palabras",
    description: "Alcanza el nivel 20 de jugador.",
    icon: "Crown",
    xpReward: 150,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 8,
    check: levelCheck(20),
    progress: levelProgress(20),
  },
  {
    id: "ac-nivel-25",
    name: "Leyenda del faro",
    description: "Alcanza el nivel 25 de jugador.",
    icon: "Crown",
    xpReward: 200,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 10,
    check: levelCheck(25),
    progress: levelProgress(25),
  },
  {
    id: "ac-nivel-35",
    name: "Almirante del idioma",
    description: "Alcanza el nivel 35 de jugador.",
    icon: "Crown",
    xpReward: 300,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 15,
    check: levelCheck(35),
    progress: levelProgress(35),
  },
  {
    id: "ac-nivel-50",
    name: "Mito del Archipiélago",
    description: "Alcanza el nivel 50 de jugador.",
    icon: "Crown",
    xpReward: 500,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 25,
    check: levelCheck(50),
    progress: levelProgress(50),
  },
  {
    id: "ac-centenas",
    name: "Cien formas de jugar",
    description: "Prueba 25 minijuegos distintos (hay 100 esperándote).",
    icon: "Shapes",
    xpReward: 120,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 6,
    check: (c) => (c.stats.uniqueGames?.length ?? 0) >= 25,
    progress: (c) => Math.min((c.stats.uniqueGames?.length ?? 0), 25),
  },
  {
    id: "ac-media-centuria",
    name: "Media centuria",
    description: "Prueba 50 minijuegos distintos.",
    icon: "Shapes",
    xpReward: 250,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 12,
    check: (c) => (c.stats.uniqueGames?.length ?? 0) >= 50,
    progress: (c) => Math.min((c.stats.uniqueGames?.length ?? 0), 50),
  },
  {
    id: "ac-todas-regiones",
    name: "Las siete coronas",
    description: "Juega al menos una sesión en las ocho regiones del Archipiélago.",
    icon: "Globe",
    xpReward: 180,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 9,
    check: (c) => {
      const regions = new Set<string>();
      for (const list of Object.values(c.stats.regionsByDay ?? {})) for (const r of list) regions.add(r);
      return regions.size >= 8;
    },
    progress: (c) => {
      const regions = new Set<string>();
      for (const list of Object.values(c.stats.regionsByDay ?? {})) for (const r of list) regions.add(r);
      return Math.min(regions.size, 8);
    },
  },
  {
    id: "ac-palabras-100",
    name: "Jardín centenario",
    description: "Aprende 100 palabras del jardín SRS.",
    icon: "Sprout",
    xpReward: 150,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 8,
    check: (_c, ctx) => (ctx?.learnedWords ?? 0) >= 100,
    progress: (_c, ctx) => Math.min((ctx?.learnedWords ?? 0), 100),
  },
  {
    id: "ac-palabras-300",
    name: "Sembrador de siglos",
    description: "Aprende 300 palabras del jardín SRS.",
    icon: "TreePine",
    xpReward: 350,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 18,
    check: (_c, ctx) => (ctx?.learnedWords ?? 0) >= 300,
    progress: (_c, ctx) => Math.min((ctx?.learnedWords ?? 0), 300),
  },
  {
    id: "ac-sesiones-100",
    name: "Cien puertos",
    description: "Completa 100 sesiones en total.",
    icon: "Anchor",
    xpReward: 200,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 10,
    check: (c) => c.stats.totalSessions >= 100,
    progress: (c) => Math.min(c.stats.totalSessions, 100),
  },
  {
    id: "ac-racha-14",
    name: "Quincena encendida",
    description: "Consigue una racha de 14 días.",
    icon: "Flame",
    xpReward: 220,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 11,
    check: (c) => c.streak.best >= 14,
    progress: (c) => Math.min(c.streak.best, 14),
  },
  {
    id: "ac-racha-30",
    name: "Mes de mareas",
    description: "Consigue una racha de 30 días.",
    icon: "Flame",
    xpReward: 400,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 20,
    check: (c) => c.streak.best >= 30,
    progress: (c) => Math.min(c.streak.best, 30),
  },
  {
    id: "ac-combo-20",
    name: "Combo de faro",
    description: "Encadena un combo de 20 aciertos seguidos.",
    icon: "Zap",
    xpReward: 180,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 9,
    check: (c) => (c.stats.bestComboEver ?? 0) >= 20,
    progress: (c) => Math.min((c.stats.bestComboEver ?? 0), 20),
  },
  {
    id: "ac-arcade-10",
    name: "Habitual del salón",
    description: "Juega 25 partidas en el Salón de Juegos.",
    icon: "Gamepad2",
    xpReward: 140,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 7,
    check: (c) => Object.values(c.arcade.plays ?? {}).reduce((a, b) => a + b, 0) >= 25,
    progress: (c) => Math.min(Object.values(c.arcade.plays ?? {}).reduce((a, b) => a + b, 0), 25),
  },
  {
    id: "ac-xp-10000",
    name: "Río de tinta",
    description: "Acumula 10.000 XP en total.",
    icon: "Feather",
    xpReward: 300,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 15,
    check: (c) => c.xp >= 10_000,
    progress: (c) => Math.min(c.xp / 10_000, 1),
  },
  {
    id: "ac-nivel-30",
    name: "Treinta faros",
    description: "Alcanza el nivel 30: treinta faros encendidos a tu nombre.",
    icon: "Sparkles",
    xpReward: 300,
    tintaReward: 15,
    check: levelCheck(30),
    progress: levelProgress(30),
  },
  {
    id: "ac-nivel-42",
    name: "Luz de faro vivo",
    description: "Alcanza el nivel 42: tu luz guía a toda la flota del idioma.",
    icon: "Sparkles",
    xpReward: 400,
    tintaReward: 20,
    check: levelCheck(42),
    progress: levelProgress(42),
  },
  {
    id: "ac-nivel-60",
    name: "Palabra Eterna",
    description: "Alcanza el nivel 60: el nivel máximo del Archipiélago.",
    icon: "Crown",
    xpReward: 600,
    tintaReward: 30,
    check: levelCheck(60),
    progress: levelProgress(60),
  },
  {
    id: "ac-typing-first",
    name: "Primera pluma veloz",
    description: "Completa tu primera prueba del Taller de Escritura.",
    icon: "Keyboard",
    xpReward: 30,
    tintaReward: 2,
    check: (c) => (c.arcade.typing?.testsDone ?? 0) >= 1,
    progress: (c) => Math.min((c.arcade.typing?.testsDone ?? 0), 1),
  },
  {
    id: "ac-typing-40",
    name: "Dedos de farero",
    description: "Alcanza 40 palabras por minuto en el taller.",
    icon: "Gauge",
    xpReward: 120,
    tintaReward: 6,
    check: (c) => (c.arcade.typing?.bestWpm ?? 0) >= 40,
    progress: (c) => Math.min((c.arcade.typing?.bestWpm ?? 0) / 40, 1),
  },
  {
    id: "ac-typing-70",
    name: "Teclado domado",
    description: "Alcanza 70 palabras por minuto en el taller.",
    icon: "Keyboard",
    xpReward: 260,
    tintaReward: 13,
    check: (c) => (c.arcade.typing?.bestWpm ?? 0) >= 70,
    progress: (c) => Math.min((c.arcade.typing?.bestWpm ?? 0) / 70, 1),
  },
  {
    id: "ac-typing-drills",
    name: "Mecanógrafo del faro",
    description: "Completa 15 ejercicios de filas del teclado.",
    icon: "Keyboard",
    xpReward: 90,
    tintaReward: 5,
    check: (c) => (c.arcade.typing?.drillsDone ?? 0) >= 15,
    progress: (c) => Math.min((c.arcade.typing?.drillsDone ?? 0) / 15, 1),
  },
  {
    id: "ac-typing-precision",
    name: "Pluma de cirujano",
    description: "Logra un 98 % de precisión en el taller de escritura.",
    icon: "Target",
    xpReward: 150,
    tintaReward: 8,
    check: (c) => (c.arcade.typing?.bestAccuracy ?? 0) >= 98,
    progress: (c) => Math.min((c.arcade.typing?.bestAccuracy ?? 0) / 98, 1),
  },
  {
    id: "ac-typing-week",
    name: "Callo de escritor",
    description: "Encadena 7 días seguidos del Taller de Escritura.",
    icon: "Flame",
    xpReward: 200,
    tintaReward: 10,
    check: (c) => (c.arcade.typing?.streak ?? 0) >= 7,
    progress: (c) => Math.min((c.arcade.typing?.streak ?? 0) / 7, 1),
  },
  {
    id: "ac-variety-40",
    name: "Probador de formatos",
    description: "Juega 40 minijuegos distintos.",
    icon: "Shapes",
    xpReward: 180,
    tintaReward: 9,
    check: (c) => (c.stats.uniqueGames?.length ?? 0) >= 40,
    progress: (c) => Math.min((c.stats.uniqueGames?.length ?? 0) / 40, 1),
  },
  {
    id: "ac-variety-75",
    name: "Nauta universal",
    description: "Juega 75 minijuegos distintos del Archipiélago.",
    icon: "Compass",
    xpReward: 400,
    tintaReward: 20,
    check: (c) => (c.stats.uniqueGames?.length ?? 0) >= 75,
    progress: (c) => Math.min((c.stats.uniqueGames?.length ?? 0) / 75, 1),
  },

  /* ==================== Etapa 2 completa ==================== */
  {
    id: "ac-voz-del-faro",
    name: "La voz del faro",
    description: "Deja que el micrófono trabaje por ti: completa tu primera sesión de Dictado por Voz.",
    icon: "Mic",
    xpReward: 60,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 3,
    check: (c) => (c.stats.byGame["voz"]?.plays ?? 0) >= 1,
    progress: (c) => Math.min(1, c.stats.byGame["voz"]?.plays ?? 0),
  },
  {
    id: "ac-mecanografo-marino",
    name: "Mecanógrafo marino",
    description: "Acierta 20 duelos de tipeo con la frase exacta.",
    icon: "Keyboard",
    xpReward: 120,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 6,
    check: (c) => (c.stats.byGame["tipeo"]?.correct ?? 0) >= 20,
    progress: (c) => Math.min(1, (c.stats.byGame["tipeo"]?.correct ?? 0) / 20),
  },
  {
    id: "ac-leyendas-vivas",
    name: "Guardián de leyendas",
    description: "Vive tres mitos y leyendas del patrimonio oral.",
    icon: "BookMarked",
    xpReward: 100,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 5,
    check: (c) => (c.stats.byGame["mitos"]?.plays ?? 0) >= 3,
    progress: (c) => Math.min(1, (c.stats.byGame["mitos"]?.plays ?? 0) / 3),
  },
  {
    id: "ac-etapa2-completa",
    name: "Experiencia avanzada",
    description: "Prueba los 9 formatos nuevos de la Etapa 2: rasca-rasca, tinder, tipeo, laboratorios, jeroglíficos, mitos, fonética, voz y eco.",
    icon: "BadgeCheck",
    xpReward: 300,
    /** Gotas de tinta al recoger el logro. */
    tintaReward: 15,
    check: (c) =>
      ["rasca", "tinder", "tipeo", "labpunt", "jeroglificos", "mitos", "fonetica", "voz", "eco"].every(
        (g) => (c.stats.byGame[g]?.plays ?? 0) >= 1,
      ),
    progress: (c) =>
      ["rasca", "tinder", "tipeo", "labpunt", "jeroglificos", "mitos", "fonetica", "voz", "eco"].reduce(
        (acc, g) => acc + Math.min(1, c.stats.byGame[g]?.plays ?? 0),
        0,
      ) / 9,
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
  "ac-nivel-20": 20,
  "ac-nivel-25": 25,
  "ac-nivel-30": 30,
  "ac-nivel-35": 35,
  "ac-nivel-42": 42,
  "ac-nivel-50": 50,
  "ac-nivel-60": 60,
};

export const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> = ACHIEVEMENTS.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, AchievementDef>,
);

