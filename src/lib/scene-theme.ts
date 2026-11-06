"use client";

/**
 * Tema dinámico de VERBALIA · la paleta evoluciona con el viaje.
 * ---------------------------------------------------------------
 * El verde de bienvenida es solo el punto de partida: cada región
 * del Archipiélago tiene su propio color y cada pantalla su
 * personalidad. El Inicio adopta el color de la región donde el
 * jugador está progresando, así que la mirada del juego cambia
 * conforme se avanza (como pedía el jugador: «no todo verde»).
 *
 * Solo se rota el MATIZ del color primario manteniendo luminosidad
 * y croma de la paleta base, de modo que el contraste AA queda
 * intacto en claro, oscuro y modo lectura.
 */

export type SceneId =
  | "home"
  | "bosque"
  | "ciudad"
  | "fortaleza"
  | "biblioteca"
  | "puerto"
  | "torre"
  | "observatorio"
  | "music"
  | "map"
  | "missions"
  | "collection"
  | "errors"
  | "stats"
  | "profile"
  | "library"
  | "settings"
  | "results"
  | "welcome"
  | "onboarding"
  | "placement"
  | "arcade";

interface SceneDef {
  /** Matiz oklch del color de escena. */
  hue: number;
  /** Nombre poético (para depurar con cariño). */
  name: string;
  /** Motivo decorativo del fondo. */
  motif: "leaves" | "gears" | "sparks" | "stars" | "bubbles" | "embers" | "confetti" | "pages" | "notes" | "none";
}

const SCENES: Record<SceneId, SceneDef> = {
  home: { hue: 150, name: "esmeralda", motif: "leaves" }, // se sobreescribe por la región activa
  bosque: { hue: 150, name: "esmeralda", motif: "leaves" },
  ciudad: { hue: 72, name: "ámbar", motif: "gears" },
  fortaleza: { hue: 28, name: "terracota", motif: "sparks" },
  biblioteca: { hue: 320, name: "violeta", motif: "stars" },
  puerto: { hue: 212, name: "azul marejada", motif: "bubbles" },
  torre: { hue: 12, name: "coral del alba", motif: "embers" },
  observatorio: { hue: 288, name: "violeta estelar", motif: "stars" },
  music: { hue: 58, name: "oro de la radio", motif: "notes" },
  map: { hue: 62, name: "pergamino soleado", motif: "notes" },
  missions: { hue: 85, name: "oro de misiones", motif: "confetti" },
  collection: { hue: 165, name: "jardín", motif: "leaves" },
  errors: { hue: 25, name: "tinta óxido", motif: "sparks" },
  stats: { hue: 210, name: "tinta azul", motif: "stars" },
  profile: { hue: 292, name: "fucsia", motif: "stars" },
  library: { hue: 268, name: "índigo", motif: "pages" },
  settings: { hue: 178, name: "turquesa", motif: "none" },
  results: { hue: 85, name: "oro de victoria", motif: "confetti" }, // se sobreescribe por la región
  welcome: { hue: 156, name: "verde de bienvenida", motif: "leaves" },
  onboarding: { hue: 156, name: "verde de bienvenida", motif: "leaves" },
  placement: { hue: 95, name: "oliva del faro", motif: "notes" },
  arcade: { hue: 262, name: "violeta arcade", motif: "stars" },
};

export function sceneDef(scene: SceneId): SceneDef {
  return SCENES[scene] ?? SCENES.home;
}

export function isRegionScene(scene: SceneId): boolean {
  return scene === "bosque" || scene === "ciudad" || scene === "fortaleza" ||
    scene === "biblioteca" || scene === "puerto" || scene === "torre";
}

function effectiveDark(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.documentElement;
  return el.classList.contains("dark");
}

/**
 * Aplica el tema de escena al documento: rota el matiz del primario
 * (botones, enlaces, anillos, gráficas) y deja constancia en
 * data-scene para los adornos CSS. En modo lectura nocturna no se
 * toca el color: la noche tiene su propia paleta curada.
 */
export function applySceneTheme(scene: SceneId, hueOverride?: number) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  const def = SCENES[scene] ?? SCENES.home;
  const hue = hueOverride ?? def.hue;
  el.dataset.scene = scene;
  el.style.setProperty("--scene-hue", String(hue));

  // Modo lectura nocturna: paleta cálida propia, no intervenir.
  if (el.classList.contains("night")) return;

  const dark = effectiveDark();
  // Base: claro L .51 C .11 · oscuro L .76 C .14 (contraste idéntico
  // al verde original, solo cambia el matiz).
  const primary = dark ? `oklch(0.76 0.14 ${hue})` : `oklch(0.51 0.11 ${hue})`;
  const primaryFg = dark ? `oklch(0.2 0.045 ${hue})` : `oklch(0.985 0.01 ${hue})`;
  const muted = dark ? `oklch(0.27 0.026 ${hue})` : `oklch(0.94 0.016 ${hue})`;

  el.style.setProperty("--primary", primary);
  el.style.setProperty("--primary-foreground", primaryFg);
  el.style.setProperty("--ring", primary);
  el.style.setProperty("--sidebar-primary", primary);
  el.style.setProperty("--sidebar-primary-foreground", primaryFg);
  el.style.setProperty("--sidebar-ring", primary);
  el.style.setProperty("--chart-1", primary);
  el.style.setProperty("--muted", muted);
}

/** Escena de la región más avanzada desbloqueada (para el Inicio). */
export function activeRegionScene(level: number): SceneId {
  const table: { level: number; scene: SceneId }[] = [
    { level: 1, scene: "bosque" },
    { level: 2, scene: "ciudad" },
    { level: 3, scene: "fortaleza" },
    { level: 4, scene: "biblioteca" },
    { level: 5, scene: "puerto" },
    { level: 6, scene: "torre" },
  ];
  let scene: SceneId = "bosque";
  for (const row of table) if (level >= row.level) scene = row.scene;
  return scene;
}

/**
 * Escena y matiz para una pantalla cualquiera del juego.
 * El Inicio y los Resultados se tiñen con la región activa del
 * jugador; el resto, con su personalidad fija.
 */
export function themeForScreen(
  screenName: string,
  level: number,
  regionId?: string,
): { scene: SceneId; hue?: number } {
  const regions: Record<string, SceneId> = {
    bosque: "bosque",
    ciudad: "ciudad",
    fortaleza: "fortaleza",
    biblioteca: "biblioteca",
    puerto: "puerto",
    torre: "torre",
  };
  switch (screenName) {
    case "game":
    case "results": {
      const scene = regions[regionId ?? ""] ?? activeRegionScene(level);
      return { scene };
    }
    case "home":
      return { scene: "home", hue: SCENES[activeRegionScene(level)].hue };
    case "welcome":
      return { scene: "welcome" };
    case "onboarding":
      return { scene: "onboarding" };
    case "placement":
      return { scene: "placement" };
    case "map":
      return { scene: "map" };
    case "missions":
      return { scene: "missions" };
    case "collection":
      return { scene: "collection" };
    case "errors":
      return { scene: "errors" };
    case "stats":
      return { scene: "stats" };
    case "profile":
      return { scene: "profile" };
    case "library":
      return { scene: "library" };
    case "settings":
      return { scene: "settings" };
    case "music":
      return { scene: "music" };
    case "arcade":
      return { scene: "arcade" };
    default:
      return { scene: "home", hue: SCENES[activeRegionScene(level)].hue };
  }
}
