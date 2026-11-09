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
  /** Frase de Léxico al llegar. */
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
    games: ["srs", "trivia", "sprint", "sinonimos", "rasca", "tinder", "memoria-bosque", "intruso-bosque", "escribe-bosque", "conecta-bosque", "vf-bosque", "oye-bosque", "acentos", "silabas", "analogias", "colocaciones", "grados", "polisemia", "derivadas", "familias", "abecedario", "definiciones"],
    map: { x: 22.4, y: 32 },
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
    games: ["puzzle", "cloze", "sortea-ciudad", "vf-ciudad", "conecta-ciudad", "intruso-ciudad", "escribe-ciudad", "concordancia", "serestar", "porpara", "subjuntivo", "tiempos", "pronombres", "relativos", "estilo", "pasiva", "genero"],
    map: { x: 49.1, y: 18.3 },
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
    games: ["errores", "tildes", "tipeo", "labpunt", "sortea-fortaleza", "vf-fortaleza", "escribe-fortaleza", "oye-fortaleza", "memoria-fortaleza", "bv", "gj", "hach", "lly", "csz", "homofonos", "puntuacion", "mayusculas", "cifras"],
    map: { x: 78.5, y: 30 },
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
    games: ["parrafos", "cloze", "lectura", "jeroglificos", "mitos", "conecta-biblioteca", "vf-biblioteca", "intruso-biblioteca", "memoria-biblioteca", "sortea-biblioteca", "titulo", "idea", "resumen", "tono", "inferencia", "secuencia", "proposito", "vocabctx"],
    map: { x: 67.4, y: 50.8 },
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
    games: ["dictado", "matices", "fonetica", "voz", "eco", "oye-puerto", "memoria-puerto", "vf-puerto", "conecta-puerto", "sortea-puerto", "entonacion", "oye-acento", "oyenumero"],
    map: { x: 73.9, y: 68 },
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
    games: ["historias", "refranes", "minuto", "vf-torre", "conecta-torre", "sortea-torre", "escribe-torre", "memoria-torre", "iniciadores", "cierre", "descripciones"],
    map: { x: 88, y: 73.8 },
    icon: "TowerControl",
    colorVar: "--region-torre",
    tip: "En la torre nadie te corrige a mitad de frase: primero escribe, después mira tu texto con ojos amables.",
  },
  {
    id: "observatorio",
    name: "Observatorio de la Palabra",
    subtitle: "Etimologías, regionalismos y cultura",
    description:
      "La cúpula de cristal más alta del Archipiélago. Su telescopio no mira las estrellas: mira el viaje de las palabras, desde el latín y el árabe hasta el náhuatl y el quechua.",
    skill: "cultura",
    unlockLevel: 7,
    stage: 2,
    games: ["vf-observatorio", "conecta-observatorio", "sortea-observatorio", "memoria-observatorio", "intruso-observatorio", "regiones", "falsosamigos"],
    map: { x: 16.4, y: 81.8 },
    icon: "Telescope",
    colorVar: "--region-observatorio",
    tip: "Cada palabra llegó aquí en un barco distinto. Descubre de dónde viene la tuya: el Observatorio guarda los mapas de esos viajes.",
  },
  {
    id: "forja",
    name: "Forja del Escritor",
    subtitle: "Metáforas, ironía, registro y estilo",
    description:
      "La octava isla solo se abre a quienes ya dominan las otras siete: un taller de lava y yunques donde las palabras se funden hasta volverse estilo. Aquí se entrena la pluma, no solo la lengua.",
    skill: "expresion",
    unlockLevel: 8,
    stage: 4,
    games: ["metaforas", "registro", "conectores", "ironia", "titulos"],
    map: { x: 49.6, y: 81.7 },
    icon: "Flame",
    colorVar: "--region-forja",
    tip: "Bienvenid@ a la Forja. Aquí no se responde: se escribe con la cabeza. Elige la imagen exacta y el fuego hará el resto.",
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
  cultura: "Cultura lingüística",
};

/** Colores (variables CSS) por habilidad, para gráficos. */
export const SKILL_COLORS: Record<SkillId, string> = {
  vocabulario: "var(--region-bosque)",
  gramatica: "var(--region-ciudad)",
  ortografia: "var(--region-fortaleza)",
  lectura: "var(--region-biblioteca)",
  audicion: "var(--region-puerto)",
  expresion: "var(--region-torre)",
  cultura: "var(--region-observatorio)",
};
