import type { RegionId, SkillId, GameId, Stage } from "@/types";

/** Metadatos de una región del Archipiélago de las Palabras. */
export interface RegionInfo {
  id: RegionId;
  name: string;
  subtitle: string;
  description: string;
  skill: SkillId;
  /** Nivel de jugador necesario para desbloquearla (solo Etapa 1). */
  unlockLevel: number;
  /** Etapa del producto en la que la región se vuelve jugable. */
  stage: Stage;
  /** Minijuegos disponibles en la región. */
  games: GameId[];
  /** Posición en el mapa (porcentaje sobre el contenedor). */
  map: { x: number; y: number };
  /** Icono lucide. */
  icon: string;
  colorVar: string;
  /** Frase de Tinta al llegar. */
  tip: string;
}

export const REGIONS: RegionInfo[] = [
  {
    id: "bosque",
    name: "Bosque del Vocabulario",
    subtitle: "Sinónimos, raíces y significados",
    description:
      "Un bosque frondoso donde crecen las palabras. Cada árbol guarda un significado y cada claro esconde un desafío de vocabulario.",
    skill: "vocabulario",
    unlockLevel: 1,
    stage: 1,
    games: ["srs", "trivia", "sprint", "sinonimos"],
    map: { x: 18, y: 26 },
    icon: "TreePine",
    colorVar: "--region-bosque",
    tip: "Aquí las palabras echan raíces. Riega las tarjetas y volverán a florecer justo cuando estés a punto de olvidarlas.",
  },
  {
    id: "ciudad",
    name: "Ciudad de la Gramática",
    subtitle: "Sintaxis, conectores y estructura",
    description:
      "Una ciudad de puentes y avenidas donde las oraciones se construyen ladrillo a ladrillo. Sus habitantes exigen que todo esté en su sitio.",
    skill: "gramatica",
    unlockLevel: 2,
    stage: 1,
    games: ["puzzle", "cloze"],
    map: { x: 45, y: 14 },
    icon: "Building2",
    colorVar: "--region-ciudad",
    tip: "En esta ciudad cada palabra tiene su dirección. Ordena los fragmentos y el puente se construirá solo.",
  },
  {
    id: "fortaleza",
    name: "Fortaleza de la Ortografía",
    subtitle: "Tildes, puntuación y errores ocultos",
    description:
      "Una fortaleza de piedra donde se custodian las reglas de escritura. Los errores intentan escalar sus muros cada noche.",
    skill: "ortografia",
    unlockLevel: 3,
    stage: 1,
    games: ["errores", "tildes"],
    map: { x: 74, y: 24 },
    icon: "Castle",
    colorVar: "--region-fortaleza",
    tip: "Los guardianes de la fortaleza no castigan: corrigen. Un error encontrado es una grieta reparada.",
  },
  {
    id: "biblioteca",
    name: "Biblioteca Infinita",
    subtitle: "Lectura, comprensión y narrativa",
    description:
      "Una biblioteca cuyas estanterías se multiplican sin fin. Cada libro se reordena solo… salvo cuando necesita que tú lo hagas.",
    skill: "lectura",
    unlockLevel: 4,
    stage: 1,
    games: ["parrafos", "cloze", "lectura"],
    map: { x: 32, y: 55 },
    icon: "Library",
    colorVar: "--region-biblioteca",
    tip: "Leer es escuchar con los ojos. En la Biblioteca, además, los libros te miran a ti.",
  },
  {
    id: "puerto",
    name: "Puerto de las Voces",
    subtitle: "Escucha, tono y dictados",
    description:
      "Un puerto donde atracan rumores, ecos y dictados. Sus faros convierten el sonido en escritura, tilde a tilde.",
    skill: "audicion",
    unlockLevel: 5,
    stage: 2,
    games: ["dictado", "matices"],
    map: { x: 63, y: 48 },
    icon: "Anchor",
    colorVar: "--region-puerto",
    tip: "Aquí las palabras llegan por el oído. La voz es la de tu navegador: escúchala con paciencia de mar.",
  },
  {
    id: "torre",
    name: "Torre de la Expresión",
    subtitle: "Escritura, decisiones y dichos",
    description:
      "La torre más alta del Archipiélago. En sus terrazas se escriben historias que cambian contigo, dichos viejos y retos de un minuto.",
    skill: "expresion",
    unlockLevel: 6,
    stage: 2,
    games: ["historias", "refranes", "minuto"],
    map: { x: 84, y: 68 },
    icon: "TowerControl",
    colorVar: "--region-torre",
    tip: "En la torre nadie te corrige a mitad de frase: primero escribe, después mira tu texto con ojos amables.",
  },
];

export const REGION_BY_ID: Record<RegionId, RegionInfo> = REGIONS.reduce(
  (acc, r) => {
    acc[r.id] = r;
    return acc;
  },
  {} as Record<RegionId, RegionInfo>,
);

/** Nombres legibles de habilidades. */
export const SKILL_LABELS: Record<SkillId, string> = {
  vocabulario: "Vocabulario",
  gramatica: "Gramática",
  ortografia: "Ortografía",
  lectura: "Lectura",
  audicion: "Audición",
  expresion: "Expresión",
};

/** Colores (variables CSS) por habilidad, para gráficos. */
export const SKILL_COLORS: Record<SkillId, string> = {
  vocabulario: "var(--region-bosque)",
  gramatica: "var(--region-ciudad)",
  ortografia: "var(--region-fortaleza)",
  lectura: "var(--region-biblioteca)",
  audicion: "var(--region-puerto)",
  expresion: "var(--region-torre)",
};
