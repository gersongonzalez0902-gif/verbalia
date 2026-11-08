/**
 * Cargador de bancos Mega-8 · 58 000 ejercicios bajo demanda.
 *
 * Los paquetes generados (src/data/gen/mega8/*.ts) son demasiado grandes
 * para el paquete inicial: se cargan con import() dinámico solo cuando
 * el jugador entra en ese minijuego, y se funden en las cachés de
 * content.ts (EXERCISES_BY_GAME / EXERCISES_BY_ID) al vuelo.
 */

import type { Exercise } from "@/types";
import { EXERCISES_BY_GAME, EXERCISES_BY_ID } from "./content";

/* ---------- Tamaños estáticos (para contadores sin cargar el banco) ---------- */
/* OJO: se importan desde sizes.json (artefacto pequeño generado junto a los
 * bancos) y NUNCA con import estático de ./gen/mega8/*.ts: hacerlo metería
 * los módulos de varios MB en el grafo inicial y el navegador los bajaría
 * en el primer arranque. Los bancos solo se tocan con import() dinámico. */
import m8SizesJson from "./gen/mega8/sizes.json";

const M8_SIZES: Record<string, number> = m8SizesJson;

/** ¿A qué grupo pertenece cada juego? */
const GROUP_GAME_MAP: Record<string, string[]> = {
  core: ["trivia", "sprint", "cloze", "dictado", "puzzle", "definiciones", "escribe-bosque", "escribe-ciudad", "escribe-fortaleza", "escribe-torre", "oye-bosque", "oye-fortaleza", "oye-puerto", "abecedario", "acentos", "silabas", "oye-acento", "cifras", "oyenumero"],
  grammar: ["concordancia", "serestar", "porpara", "subjuntivo", "tiempos", "pronombres", "relativos", "estilo", "pasiva", "genero", "puntuacion", "entonacion", "mayusculas"],
  lexicon: ["bv", "gj", "hach", "lly", "csz", "homofonos", "colocaciones", "analogias", "grados", "polisemia", "familias", "derivadas", "regiones", "falsosamigos"],
  reading: ["idea", "tono", "inferencia", "proposito", "vocabctx", "titulo", "resumen", "secuencia", "lectura", "parrafos"],
  forja: ["metaforas", "registro", "conectores", "ironia", "titulos", "matices"],
  formats: ["memoria-bosque", "memoria-fortaleza", "memoria-biblioteca", "memoria-torre", "memoria-observatorio", "memoria-puerto", "intruso-bosque", "intruso-ciudad", "intruso-biblioteca", "intruso-observatorio", "sortea-ciudad", "sortea-fortaleza", "sortea-biblioteca", "sortea-puerto", "sortea-torre", "sortea-observatorio", "vf-bosque", "vf-ciudad", "vf-fortaleza", "vf-biblioteca", "vf-puerto", "vf-torre", "vf-observatorio", "conecta-ciudad", "conecta-biblioteca", "conecta-puerto", "conecta-torre", "conecta-observatorio"],
  torre: ["refranes", "historias", "minuto", "iniciadores", "cierre", "descripciones", "sinonimos"],
};

/** Grupos ya cargados (evita re-importar). */
const loadedGroups = new Set<string>();
const pending = new Map<string, Promise<void>>();

const groupLoaders: Record<string, () => Promise<Record<string, Exercise[]>>> = {
  core: () => import("./gen/mega8/core").then(loadGroup(GROUP_GAME_MAP.core)),
  grammar: () => import("./gen/mega8/grammar").then(loadGroup(GROUP_GAME_MAP.grammar)),
  lexicon: () => import("./gen/mega8/lexicon").then(loadGroup(GROUP_GAME_MAP.lexicon)),
  reading: () => import("./gen/mega8/reading").then(loadGroup(GROUP_GAME_MAP.reading)),
  forja: () => import("./gen/mega8/forja").then(loadGroup(GROUP_GAME_MAP.forja)),
  formats: () => import("./gen/mega8/formats").then(loadGroup(GROUP_GAME_MAP.formats)),
  torre: () => import("./gen/mega8/torre").then(loadGroup(GROUP_GAME_MAP.torre)),
};

function loadGroup(gameIds: string[]) {
  return (mod: Record<string, unknown>): Record<string, Exercise[]> => {
    const out: Record<string, Exercise[]> = {};
    for (const gid of gameIds) {
      const key = `M8_${gid.replace(/-/g, "_").toUpperCase()}`;
      const list = mod[key] as Exercise[] | undefined;
      if (Array.isArray(list)) out[gid] = list;
    }
    return out;
  };
}

/**
 * Garantiza que el banco Mega-8 del juego (y su grupo) esté cargado y
 * fundido en las cachés de contenido. Idempotente y concurrente-seguro.
 */
export async function ensureGamePool(gameId: string): Promise<void> {
  for (const [group, games] of Object.entries(GROUP_GAME_MAP)) {
    if (!games.includes(gameId)) continue;
    if (loadedGroups.has(group)) return;
    let p = pending.get(group);
    if (!p) {
      const load = (async () => {
        const loader = groupLoaders[group];
        const packs = await loader();
        for (const [gid, list] of Object.entries(packs)) {
          const existing = EXERCISES_BY_GAME[gid] ?? [];
          EXERCISES_BY_GAME[gid] = [...existing, ...list];
          for (const ex of list) {
            if (!EXERCISES_BY_ID[ex.id]) EXERCISES_BY_ID[ex.id] = ex;
          }
        }
        loadedGroups.add(group);
        pending.delete(group);
      })();
      // Si la descarga falla (p. ej. sin conexión), se retira la promesa
      // rechazada para que un intento posterior pueda volver a intentarla
      // en vez de quedar atascado hasta recargar la página.
      p = load.catch((err) => {
        pending.delete(group);
        throw err;
      });
      pending.set(group, p);
    }
    await p;
  }
}

/** Carga todos los grupos usados por una misión de región. */
export async function ensureRegionPools(regionGameIds: string[]): Promise<void> {
  await Promise.all(regionGameIds.map((g) => ensureGamePool(g)));
}

/** Total de ejercicios disponibles de un juego (núcleo + mega-8).
 *  Si el grupo ya está cargado, la caché ya lo incluye. */
export function totalPoolOf(gameId: string): number {
  const inMemory = (EXERCISES_BY_GAME[gameId] ?? []).length;
  if (M8_SIZES[gameId] === undefined) return inMemory;
  const groupLoaded = Object.entries(GROUP_GAME_MAP).some(
    ([group, games]) => games.includes(gameId) && loadedGroups.has(group),
  );
  return groupLoaded ? inMemory : inMemory + (M8_SIZES[gameId] ?? 0);
}
