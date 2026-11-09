/**
 * Cargador de bancos y packs perezosos · VERBALIA
 *
 * El contenido pesado (bancos Mega-8 de decenas de MB y los packs
 * ampliados "pk-*": historias, sinónimos, dictados…) es demasiado
 * grande para el paquete inicial: se cargan con import() dinámico
 * solo cuando el jugador entra en ese minijuego, y se funden en las
 * cachés de content.ts (EXERCISES_BY_GAME / EXERCISES_BY_ID) al vuelo.
 *
 * Un juego puede alimentarse de VARIOS grupos (p. ej. «trivia» tiene
 * el banco mega8 «core» y el pack «pk-trivia»); ensureGamePool carga
 * todos los suyos. Los totales veraces antes de cargar salen de
 * gen/pack-meta.json (regenerable con scripts/gen-pack-meta.ts).
 */

import type { Exercise } from "@/types";
import { EXERCISES_BY_GAME, EXERCISES_BY_ID } from "./content";
import packMetaJson from "./gen/pack-meta.json";

type GameTally = { total: number; byDifficulty: Record<string, number> };
type Meta = Record<string, Record<string, GameTally>>;
const PACK_META = packMetaJson as unknown as Meta;

/* ---------------- Definición de grupos perezosos ---------------- */

interface GroupDef {
  /** Juegos a los que alimenta. */
  games: string[];
  /** Import dinámico: devuelve { gameId: lista de ejercicios }. */
  load: () => Promise<Record<string, Exercise[]>>;
}

function m8Pick(gameIds: string[]) {
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

const GROUPS: Record<string, GroupDef> = {
  /* ---- Bancos Mega-8 (58 000 ejercicios bajo demanda) ---- */
  core: {
    games: ["trivia", "sprint", "cloze", "dictado", "puzzle", "definiciones", "escribe-bosque", "escribe-ciudad", "escribe-fortaleza", "escribe-torre", "oye-bosque", "oye-fortaleza", "oye-puerto", "abecedario", "acentos", "silabas", "oye-acento", "cifras", "oyenumero"],
    load: () => import("./gen/mega8/core").then(m8Pick(["trivia", "sprint", "cloze", "dictado", "puzzle", "definiciones", "escribe-bosque", "escribe-ciudad", "escribe-fortaleza", "escribe-torre", "oye-bosque", "oye-fortaleza", "oye-puerto", "abecedario", "acentos", "silabas", "oye-acento", "cifras", "oyenumero"])),
  },
  grammar: {
    games: ["concordancia", "serestar", "porpara", "subjuntivo", "tiempos", "pronombres", "relativos", "estilo", "pasiva", "genero", "puntuacion", "entonacion", "mayusculas"],
    load: () => import("./gen/mega8/grammar").then(m8Pick(["concordancia", "serestar", "porpara", "subjuntivo", "tiempos", "pronombres", "relativos", "estilo", "pasiva", "genero", "puntuacion", "entonacion", "mayusculas"])),
  },
  lexicon: {
    games: ["bv", "gj", "hach", "lly", "csz", "homofonos", "colocaciones", "analogias", "grados", "polisemia", "familias", "derivadas", "regiones", "falsosamigos"],
    load: () => import("./gen/mega8/lexicon").then(m8Pick(["bv", "gj", "hach", "lly", "csz", "homofonos", "colocaciones", "analogias", "grados", "polisemia", "familias", "derivadas", "regiones", "falsosamigos"])),
  },
  reading: {
    games: ["idea", "tono", "inferencia", "proposito", "vocabctx", "titulo", "resumen", "secuencia", "lectura", "parrafos"],
    load: () => import("./gen/mega8/reading").then(m8Pick(["idea", "tono", "inferencia", "proposito", "vocabctx", "titulo", "resumen", "secuencia", "lectura", "parrafos"])),
  },
  forja: {
    games: ["metaforas", "registro", "conectores", "ironia", "titulos", "matices"],
    load: () => import("./gen/mega8/forja").then(m8Pick(["metaforas", "registro", "conectores", "ironia", "titulos", "matices"])),
  },
  formats: {
    games: ["memoria-bosque", "memoria-fortaleza", "memoria-biblioteca", "memoria-torre", "memoria-observatorio", "memoria-puerto", "intruso-bosque", "intruso-ciudad", "intruso-biblioteca", "intruso-observatorio", "sortea-ciudad", "sortea-fortaleza", "sortea-biblioteca", "sortea-puerto", "sortea-torre", "sortea-observatorio", "vf-bosque", "vf-ciudad", "vf-fortaleza", "vf-biblioteca", "vf-puerto", "vf-torre", "vf-observatorio", "conecta-ciudad", "conecta-biblioteca", "conecta-puerto", "conecta-torre", "conecta-observatorio"],
    load: () => import("./gen/mega8/formats").then(m8Pick(["memoria-bosque", "memoria-fortaleza", "memoria-biblioteca", "memoria-torre", "memoria-observatorio", "memoria-puerto", "intruso-bosque", "intruso-ciudad", "intruso-biblioteca", "intruso-observatorio", "sortea-ciudad", "sortea-fortaleza", "sortea-biblioteca", "sortea-puerto", "sortea-torre", "sortea-observatorio", "vf-bosque", "vf-ciudad", "vf-fortaleza", "vf-biblioteca", "vf-puerto", "vf-torre", "vf-observatorio", "conecta-ciudad", "conecta-biblioteca", "conecta-puerto", "conecta-torre", "conecta-observatorio"])),
  },
  torre: {
    games: ["refranes", "historias", "minuto", "iniciadores", "cierre", "descripciones", "sinonimos"],
    load: () => import("./gen/mega8/torre").then(m8Pick(["refranes", "historias", "minuto", "iniciadores", "cierre", "descripciones", "sinonimos"])),
  },

  /* ---- Packs ampliados (antes estáticos: ~2,3 MB fuera del paquete inicial) ---- */
  "pk-trivia": {
    games: ["trivia"],
    load: async () => ({ trivia: (await import("./gen/trivia-x")).TRIVIA_PACK_X }),
  },
  "pk-cloze": {
    games: ["cloze"],
    load: async () => ({ cloze: (await import("./gen/cloze-x")).CLOZE_PACK_X }),
  },
  "pk-dictado": {
    games: ["dictado"],
    load: async () => {
      const [base, x] = await Promise.all([import("./dictado"), import("./gen/dictado-x")]);
      return { dictado: [...base.DICTADO_PACK, ...x.DICTADO_PACK_X] };
    },
  },
  "pk-errores": {
    games: ["errores"],
    load: async () => {
      const [x, y] = await Promise.all([import("./gen/errors-hunt-x"), import("./gen/errors-hunt-y")]);
      return { errores: [...x.ERRORS_PACK_X, ...y.ERRORS_PACK_Y] };
    },
  },
  "pk-tildes": {
    games: ["tildes"],
    load: async () => ({ tildes: (await import("./gen/tildes-x")).TILDES_PACK_X }),
  },
  "pk-matices": {
    games: ["matices"],
    load: async () => {
      const [base, x] = await Promise.all([import("./matices"), import("./gen/matices-x")]);
      return { matices: [...base.MATICES_PACK, ...x.MATICES_PACK_X] };
    },
  },
  "pk-lectura": {
    games: ["lectura"],
    load: async () => {
      const [base, x] = await Promise.all([import("./lectura"), import("./gen/lectura-x")]);
      return { lectura: [...base.LECTURA_PACK, ...x.LECTURA_PACK_X] };
    },
  },
  "pk-minuto": {
    games: ["minuto"],
    load: async () => {
      const [base, x] = await Promise.all([import("./minuto"), import("./gen/minuto-x")]);
      return { minuto: [...base.MINUTO_PACK, ...x.MINUTO_PACK_X] };
    },
  },
  "pk-sinonimos": {
    games: ["sinonimos"],
    load: async () => {
      const [base, x] = await Promise.all([import("./sinonimos"), import("./gen/sinonimos-x")]);
      return { sinonimos: [...base.SINONIMOS_PACK, ...x.SINONIMOS_PACK_X] };
    },
  },
  "pk-refranes": {
    games: ["refranes"],
    load: async () => ({ refranes: (await import("./refranes")).REFRANES_PACK }),
  },
  "pk-historias": {
    games: ["historias"],
    load: async () => {
      const [a, b, c, x] = await Promise.all([
        import("./historias"),
        import("./historias-b"),
        import("./historias-c"),
        import("./gen/historias-x"),
      ]);
      return {
        historias: [...a.HISTORIAS_PACK, ...b.HISTORIAS_B, ...c.HISTORIAS_C, ...x.HISTORIAS_PACK_X],
      };
    },
  },
  "pk-conecta": {
    games: ["conecta-bosque"],
    load: async () => ({ "conecta-bosque": (await import("./gen/conecta-bosque-x")).CONECTA_BOSQUE_X }),
  },

  /* ---- Etapa 2 completa: los 9 formatos restantes (rasca, tinder,
   * tipeo, labpunt, jeroglíficos, mitos, fonética, voz, eco) ---- */
  etapa2b: {
    games: ["rasca", "tinder", "tipeo", "labpunt", "jeroglificos", "mitos", "fonetica", "voz", "eco"],
    load: async () => {
      const [rasca, tinder, tipeo, labpunt, jeroglificos, mitos, fonetica, voz, eco] =
        await Promise.all([
          import("./formats/rasca"),
          import("./formats/tinder"),
          import("./formats/tipeo"),
          import("./formats/labpunt"),
          import("./formats/jeroglificos"),
          import("./formats/mitos"),
          import("./formats/fonetica"),
          import("./formats/voz"),
          import("./formats/eco"),
        ]);
      return {
        rasca: rasca.RASCA_PACK,
        tinder: tinder.TINDER_PACK,
        tipeo: tipeo.TIPEO_PACK,
        labpunt: labpunt.LABPUNT_PACK,
        jeroglificos: jeroglificos.JEROGLIFICOS_PACK,
        mitos: mitos.MITOS_PACK,
        fonetica: fonetica.FONETICA_PACK,
        voz: voz.VOZ_PACK,
        eco: eco.ECO_PACK,
      };
    },
  },

  /* ---- Variantes mecánicas (≥500 por entrenamiento) · Mega-6 ----
   * Derivación sólida desde bancos existentes (frases de plantilla,
   * jardín SRS, pack de sinónimos, refranes). Ver gen/variants.ts. */
  variantes: {
    games: ["tipeo", "eco", "voz", "fonetica", "tinder", "errores"],
    load: async () => {
      const v = await import("./gen/variants");
      return v.variantPacks() as Record<string, Exercise[]>;
    },
  },
};

/** Índice inverso: juego → grupos que lo alimentan. */
const GAME_GROUPS: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const [group, def] of Object.entries(GROUPS)) {
    for (const gid of def.games) (map[gid] ||= []).push(group);
  }
  return map;
})();

/* ---------------- Carga (idempotente y concurrente-segura) ---------------- */

const loadedGroups = new Set<string>();
const pending = new Map<string, Promise<void>>();

async function loadGroup(group: string): Promise<void> {
  if (loadedGroups.has(group)) return;
  let p = pending.get(group);
  if (!p) {
    const run = (async () => {
      const packs = await GROUPS[group].load();
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
    p = run.catch((err) => {
      pending.delete(group);
      throw err;
    });
    pending.set(group, p);
  }
  await p;
}

/**
 * Garantiza que todos los grupos perezosos de un juego estén cargados y
 * fundidos en las cachés de contenido. Idempotente y concurrente-seguro.
 */
export async function ensureGamePool(gameId: string): Promise<void> {
  const groups = GAME_GROUPS[gameId];
  if (!groups) return;
  await Promise.all(groups.map(loadGroup));
}

/** Carga todos los grupos usados por una misión de región. */
export async function ensureRegionPools(regionGameIds: string[]): Promise<void> {
  await Promise.all(regionGameIds.map((g) => ensureGamePool(g)));
}

/** Total de ejercicios disponibles de un juego (estático + perezoso,
 *  cargado o no). */
export function totalPoolOf(gameId: string): number {
  let total = (EXERCISES_BY_GAME[gameId] ?? []).length;
  for (const group of GAME_GROUPS[gameId] ?? []) {
    if (loadedGroups.has(group)) continue;
    total += PACK_META[group]?.[gameId]?.total ?? 0;
  }
  return total;
}

/**
 * Distribución por dificultad de los grupos aún sin cargar (para que
 * la Biblioteca muestre cifras honestas antes de la primera partida).
 */
export function pendingDifficultyOf(gameId: string): Record<number, number> {
  const out: Record<number, number> = {};
  for (const group of GAME_GROUPS[gameId] ?? []) {
    if (loadedGroups.has(group)) continue;
    const tally = PACK_META[group]?.[gameId];
    if (!tally) continue;
    for (const [d, n] of Object.entries(tally.byDifficulty)) {
      out[Number(d)] = (out[Number(d)] ?? 0) + n;
    }
  }
  return out;
}
