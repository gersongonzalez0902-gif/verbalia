/**
 * Generador de pack-meta.json · VERBALIA
 * Ejecutar con: bun run scripts/gen-pack-meta.ts
 *
 * Calcula, para cada GRUPO de contenido perezoso (bancos mega8 y packs
 * "pk-*"), cuántos ejercicios aporta a cada juego y cómo se reparten
 * por dificultad (1-5). El JSON resultante alimenta a pool-loader.ts:
 *   - totales veraces antes de cargar (totalPoolOf)
 *   - fichas de distribución honestas en la Biblioteca
 *
 * También verifica que ningún id de ejercicio se repita entre packs
 * estáticos y perezosos (el merge en caliente los saltaría, pero mejor
 * detectarlo aquí).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { ALL_EXERCISES } from "../src/data/content";
import type { Exercise } from "../src/types";

/* ---------------- Grupos mega8 (import directo: aquí sí conviene) ---------------- */
const M8_GROUP_GAMES: Record<string, string[]> = {
  core: ["trivia", "sprint", "cloze", "dictado", "puzzle", "definiciones", "escribe-bosque", "escribe-ciudad", "escribe-fortaleza", "escribe-torre", "oye-bosque", "oye-fortaleza", "oye-puerto", "abecedario", "acentos", "silabas", "oye-acento", "cifras", "oyenumero"],
  grammar: ["concordancia", "serestar", "porpara", "subjuntivo", "tiempos", "pronombres", "relativos", "estilo", "pasiva", "genero", "puntuacion", "entonacion", "mayusculas"],
  lexicon: ["bv", "gj", "hach", "lly", "csz", "homofonos", "colocaciones", "analogias", "grados", "polisemia", "familias", "derivadas", "regiones", "falsosamigos"],
  reading: ["idea", "tono", "inferencia", "proposito", "vocabctx", "titulo", "resumen", "secuencia", "lectura", "parrafos"],
  forja: ["metaforas", "registro", "conectores", "ironia", "titulos", "matices"],
  formats: ["memoria-bosque", "memoria-fortaleza", "memoria-biblioteca", "memoria-torre", "memoria-observatorio", "memoria-puerto", "intruso-bosque", "intruso-ciudad", "intruso-biblioteca", "intruso-observatorio", "sortea-ciudad", "sortea-fortaleza", "sortea-biblioteca", "sortea-puerto", "sortea-torre", "sortea-observatorio", "vf-bosque", "vf-ciudad", "vf-fortaleza", "vf-biblioteca", "vf-puerto", "vf-torre", "vf-observatorio", "conecta-ciudad", "conecta-biblioteca", "conecta-puerto", "conecta-torre", "conecta-observatorio"],
  torre: ["refranes", "historias", "minuto", "iniciadores", "cierre", "descripciones", "sinonimos"],
};

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

/* ---------------- Packs perezosos (antiguos estáticos grandes) ---------------- */

const PACK_GROUPS: Record<string, () => Promise<Record<string, Exercise[]>>> = {
  "pk-trivia": async () => ({ trivia: (await import("../src/data/gen/trivia-x")).TRIVIA_PACK_X }),
  "pk-cloze": async () => ({ cloze: (await import("../src/data/gen/cloze-x")).CLOZE_PACK_X }),
  "pk-dictado": async () => {
    const [base, x] = await Promise.all([
      import("../src/data/dictado"),
      import("../src/data/gen/dictado-x"),
    ]);
    return { dictado: [...base.DICTADO_PACK, ...x.DICTADO_PACK_X] };
  },
  "pk-errores": async () => {
    const [x, y] = await Promise.all([
      import("../src/data/gen/errors-hunt-x"),
      import("../src/data/gen/errors-hunt-y"),
    ]);
    return { errores: [...x.ERRORS_PACK_X, ...y.ERRORS_PACK_Y] };
  },
  "pk-tildes": async () => ({ tildes: (await import("../src/data/gen/tildes-x")).TILDES_PACK_X }),
  "pk-matices": async () => {
    const [base, x] = await Promise.all([
      import("../src/data/matices"),
      import("../src/data/gen/matices-x"),
    ]);
    return { matices: [...base.MATICES_PACK, ...x.MATICES_PACK_X] };
  },
  "pk-lectura": async () => {
    const [base, x] = await Promise.all([
      import("../src/data/lectura"),
      import("../src/data/gen/lectura-x"),
    ]);
    return { lectura: [...base.LECTURA_PACK, ...x.LECTURA_PACK_X] };
  },
  "pk-minuto": async () => {
    const [base, x] = await Promise.all([
      import("../src/data/minuto"),
      import("../src/data/gen/minuto-x"),
    ]);
    return { minuto: [...base.MINUTO_PACK, ...x.MINUTO_PACK_X] };
  },
  "pk-sinonimos": async () => {
    const [base, x] = await Promise.all([
      import("../src/data/sinonimos"),
      import("../src/data/gen/sinonimos-x"),
    ]);
    return { sinonimos: [...base.SINONIMOS_PACK, ...x.SINONIMOS_PACK_X] };
  },
  "pk-refranes": async () => ({ refranes: (await import("../src/data/refranes")).REFRANES_PACK }),
  "pk-historias": async () => {
    const [a, b, c, x] = await Promise.all([
      import("../src/data/historias"),
      import("../src/data/historias-b"),
      import("../src/data/historias-c"),
      import("../src/data/gen/historias-x"),
    ]);
    return {
      historias: [
        ...a.HISTORIAS_PACK,
        ...b.HISTORIAS_B,
        ...c.HISTORIAS_C,
        ...x.HISTORIAS_PACK_X,
      ],
    };
  },
  "pk-conecta": async () => ({
    "conecta-bosque": (await import("../src/data/gen/conecta-bosque-x")).CONECTA_BOSQUE_X,
  }),

  /* ---- Etapa 2 completa: los 9 formatos restantes ---- */
  etapa2b: async () => {
    const [rasca, tinder, tipeo, labpunt, jeroglificos, mitos, fonetica, voz, eco] =
      await Promise.all([
        import("../src/data/formats/rasca"),
        import("../src/data/formats/tinder"),
        import("../src/data/formats/tipeo"),
        import("../src/data/formats/labpunt"),
        import("../src/data/formats/jeroglificos"),
        import("../src/data/formats/mitos"),
        import("../src/data/formats/fonetica"),
        import("../src/data/formats/voz"),
        import("../src/data/formats/eco"),
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
};

/* ---------------- Recuento ---------------- */
type Meta = Record<string, Record<string, { total: number; byDifficulty: Record<string, number> }>>;

function tally(list: Exercise[]): { total: number; byDifficulty: Record<string, number> } {
  const byDifficulty: Record<string, number> = {};
  for (const e of list) {
    byDifficulty[String(e.difficulty)] = (byDifficulty[String(e.difficulty)] ?? 0) + 1;
  }
  return { total: list.length, byDifficulty };
}

async function main() {
  const meta: Meta = {};
  const seenIds = new Set<string>(ALL_EXERCISES.map((e) => e.id));
  let collisions = 0;

  const ingest = (group: string, packs: Record<string, Exercise[]>) => {
    const entry: Record<string, { total: number; byDifficulty: Record<string, number> }> = {};
    for (const [gid, list] of Object.entries(packs)) {
      entry[gid] = tally(list);
      for (const e of list) {
        if (seenIds.has(e.id)) {
          collisions++;
          console.log(`❌ id repetido entre packs: ${e.id} (${group} · ${gid})`);
        }
        seenIds.add(e.id);
      }
    }
    meta[group] = entry;
  };

  for (const [group, games] of Object.entries(M8_GROUP_GAMES)) {
    const modName = group === "core" ? "core" : group;
    const mod = (await import(`../src/data/gen/mega8/${modName}`)) as Record<string, unknown>;
    ingest(group, m8Pick(games)(mod));
  }

  for (const [group, loader] of Object.entries(PACK_GROUPS)) {
    ingest(group, await loader());
  }

  mkdirSync("src/data/gen", { recursive: true });
  writeFileSync("src/data/gen/pack-meta.json", JSON.stringify(meta, null, 2) + "\n");

  const games = new Set<string>();
  for (const g of Object.values(meta)) Object.keys(g).forEach((gid) => games.add(gid));
  console.log(`✓ pack-meta.json generado: ${Object.keys(meta).length} grupos, ${games.size} juegos.`);
  if (collisions === 0) console.log("✓ Sin ids de ejercicio repetidos entre estáticos y perezosos.");
  process.exit(collisions === 0 ? 0 : 1);
}

void main();
