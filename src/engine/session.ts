import type {
  AnswerRecord,
  Difficulty,
  Exercise,
  GameId,
  RegionId,
  SrsCard,
  SrsWord,
  SessionItem,
  SessionSpec,
  SkillId,
} from "@/types";
import { EXERCISES_BY_GAME, EXERCISES_BY_ID, PLACEMENT_ITEMS, SRS_WORDS_FULL } from "@/data/content";
import { REGION_BY_ID, REGIONS } from "@/data/regions";
import { createRng, shuffle } from "./rng";
import { targetDifficulty } from "./xp";
import { isLearned, isMastered } from "./srs";

/**
 * Constructor de sesiones.
 * - Misión de región: mezcla 2 tipos de actividad (evita la monotonía).
 * - Entrenamiento: un solo minijuego, dificultad adaptada.
 * - Repaso: reutiliza los ejercicios fallados.
 * - Evaluación: lista fija.
 * La selección de dificultad sigue la regla 55/25/20 (en nivel / refuerzo / reto).
 */

export interface BuildContext {
  skills: Record<SkillId, number>;
  seenExercises: Record<string, number>;
  srs: Record<string, SrsCard>;
  /** Palabras que el jugador ya conoce (para no repetir tarjetas nuevas). */
  now: number;
  newCardsPerDay: number;
}

const RECENT_WINDOW = 3 * 86_400_000;

function seenRecently(ctx: BuildContext, id: string): boolean {
  const ts = ctx.seenExercises[id];
  return Boolean(ts && ctx.now - ts < RECENT_WINDOW);
}

function pickWeightedByDifficulty(
  pool: Exercise[],
  skill: SkillId,
  ctx: BuildContext,
  rng: () => number,
): Exercise | null {
  if (pool.length === 0) return null;
  const target = targetDifficulty(ctx.skills[skill]);

  // Partición por dificultad relativa al objetivo.
  const atLevel = pool.filter((e) => e.difficulty === target);
  const below = pool.filter((e) => e.difficulty === target - 1);
  const above = pool.filter((e) => e.difficulty === target + 1);

  const fresh = (list: Exercise[]) => list.filter((e) => !seenRecently(ctx, e.id));
  const stale = (list: Exercise[]) => list.filter((e) => seenRecently(ctx, e.id));

  const bucket = (() => {
    const roll = rng();
    if (roll < 0.55 && fresh(atLevel).length) return fresh(atLevel);
    if (roll < 0.8 && fresh(below).length) return fresh(below);
    if (fresh(above).length) return fresh(above);
    if (fresh(atLevel).length) return fresh(atLevel);
    if (fresh(below).length) return fresh(below);
    // Sin material fresco: relaja la ventana (decaerá el XP, no lo bloquea).
    return [...pool].sort((a, b) => {
      const da = Math.abs(a.difficulty - target);
      const db = Math.abs(b.difficulty - target);
      if (da !== db) return da - db;
      return (ctx.seenExercises[b.id] ?? 0) - (ctx.seenExercises[a.id] ?? 0);
    });
  })();

  return bucket[Math.floor(rng() * bucket.length)] ?? null;
}

function selectExercises(
  gameId: GameId,
  skill: SkillId,
  count: number,
  ctx: BuildContext,
  rng: () => number,
): Exercise[] {
  const pool = EXERCISES_BY_GAME[gameId] ?? [];
  const chosen: Exercise[] = [];
  const usedIds = new Set<string>();
  for (let i = 0; i < count; i++) {
    const remaining = pool.filter((e) => !usedIds.has(e.id));
    const e = pickWeightedByDifficulty(remaining, skill, ctx, rng);
    if (!e) break;
    chosen.push(e);
    usedIds.add(e.id);
  }
  return chosen;
}

/* --------------------------- Tarjetas SRS --------------------------- */

export function dueCards(ctx: Pick<BuildContext, "srs" | "now">): SrsCard[] {
  return Object.values(ctx.srs)
    .filter((c) => c.dueAt <= ctx.now)
    .sort((a, b) => a.dueAt - b.dueAt);
}

function srsCardsForSession(
  ctx: BuildContext,
  count: number,
  opts: { focusWordId?: string } = {},
): SrsWord[] {
  const out: SrsWord[] = [];
  const byId = new Map(SRS_WORDS_FULL.map((w) => [w.id, w]));
  const pushIfMissing = (w: SrsWord) => {
    if (!out.some((x) => x.id === w.id)) out.push(w);
  };
  // 1) Vencidas primero (las más atrasadas antes).
  const due = dueCards(ctx).map((c) => c.wordId);
  for (const id of due) {
    if (out.length >= count) break;
    const w = byId.get(id);
    if (w) out.push(w);
  }
  // 2) Tarjetas nuevas hasta el cupo diario.
  const introducedToday = Object.values(ctx.srs).filter(
    (c) => c.introducedAt >= startOfDay(ctx.now),
  ).length;
  let newQuota = Math.max(0, ctx.newCardsPerDay - introducedToday);
  const newWords = SRS_WORDS_FULL.filter((w) => !ctx.srs[w.id]);
  for (const w of newWords) {
    if (out.length >= count || newQuota <= 0) break;
    out.push(w);
    newQuota -= 1;
  }
  // 3) Palabra prioritaria (p. ej., la Palabra del Día): entra siempre.
  if (opts.focusWordId) {
    const w = byId.get(opts.focusWordId);
    if (w && out.length >= count) out.pop();
    if (w) pushIfMissing(w);
  }
  // 4) Repaso adelantado: si aún no hay material suficiente, traemos las
  //    tarjetas cuyo repaso vence antes (nunca más «sesión vacía»).
  if (out.length < Math.min(count, 5)) {
    const upcoming = Object.values(ctx.srs)
      .filter((c) => c.dueAt > ctx.now)
      .sort((a, b) => a.dueAt - b.dueAt);
    for (const c of upcoming) {
      if (out.length >= count) break;
      const w = byId.get(c.wordId);
      if (w) pushIfMissing(w);
    }
  }
  // 5) Último recurso: palabras nuevas más allá del cupo (jardín vacío).
  for (const w of newWords) {
    if (out.length >= count) break;
    pushIfMissing(w);
  }
  return out;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/* --------------------------- Sesiones --------------------------- */

const MISSION_SIZE = 12;
const TRAINING_SIZE = 10;

/** Tamaños por juego en entrenamiento (ítems largos = sesiones más cortas). */
const TRAINING_SIZES: Partial<Record<GameId, number>> = {
  dictado: 8,
  matices: 8,
  lectura: 4,
  sprint: 10,
  sinonimos: 10,
  historias: 2,
  refranes: 10,
  minuto: 1,
  // Etapa 3: los tableros largos llevan sesiones más cortas.
  "memoria-bosque": 4,
  "memoria-fortaleza": 4,
  "memoria-biblioteca": 4,
  "memoria-torre": 4,
  "memoria-observatorio": 4,
  "conecta-ciudad": 6,
  "conecta-biblioteca": 5,
  "conecta-puerto": 6,
  "conecta-torre": 6,
  "conecta-observatorio": 6,
  "escribe-ciudad": 8,
  // ---- Etapa 4 · Forja ----
  metaforas: 8,
  registro: 8,
  conectores: 8,
  ironia: 8,
  titulos: 8,
  // ---- Mega-7 · sesiones más cortas en juegos de redacción ----
  titulo: 8,
  resumen: 8,
  inferencia: 8,
  vocabctx: 8,
  derivadas: 8,
  definiciones: 8,
  familias: 8,
  mayusculas: 8,
};

export function buildMissionSession(
  regionId: RegionId,
  ctx: BuildContext,
  seed?: string,
): SessionSpec {
  const region = REGION_BY_ID[regionId];
  const rng = createRng(seed ?? `mission-${regionId}-${Math.floor(ctx.now / 60000)}`);
  const items: SessionItem[] = [];
  const games = region.games.filter((g) => g !== "srs");

  if (regionId === "bosque") {
    // El Bosque abre con tarjetas SRS y mezcla sus tres mecánicas.
    const cards = srsCardsForSession(ctx, 5);
    for (const w of cards) items.push({ kind: "srs", word: w });
    items.push(...selectExercises("trivia", region.skill, 3, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("sprint", region.skill, 2, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("sinonimos", region.skill, 2, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    // Si no había tarjetas suficientes, rellena con trivia (u otros del bosque).
    while (items.length < Math.min(MISSION_SIZE, 8)) {
      const filler: GameId[] = ["trivia", "sprint", "sinonimos"];
      const g = filler[items.length % filler.length];
      const e = selectExercises(g, region.skill, 1, ctx, rng)[0];
      if (!e) break;
      items.push({ kind: "exercise", exercise: e });
    }
  } else if (regionId === "puerto") {
    // Puerto: dictados y ecos, a partes iguales.
    items.push(...selectExercises("dictado", region.skill, 6, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("matices", region.skill, 6, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
  } else if (regionId === "torre") {
    // Torre: ítems largos; una sesión honesta de 3-5 minutos.
    items.push(...selectExercises("historias", region.skill, 2, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("refranes", region.skill, 4, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("minuto", region.skill, 1, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
  } else if (regionId === "biblioteca") {
    // Biblioteca: párrafos y cloze, rematado con una lectura inmersiva.
    items.push(...selectExercises("parrafos", region.skill, 4, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("cloze", region.skill, 4, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("lectura", region.skill, 2, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
  } else if (regionId === "observatorio") {
    // Observatorio: los cinco formatos de cultura lingüística, mezclados.
    items.push(...selectExercises("vf-observatorio", region.skill, 3, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("conecta-observatorio", region.skill, 2, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("sortea-observatorio", region.skill, 3, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("memoria-observatorio", region.skill, 2, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
    items.push(...selectExercises("intruso-observatorio", region.skill, 2, ctx, rng).map((e) => ({ kind: "exercise", exercise: e }) as SessionItem));
  } else if (regionId === "forja") {
    // Forja del Escritor (Etapa 4): los cinco formatos de estilo y retórica.
    const forjaGames: GameId[] = ["metaforas", "registro", "conectores", "ironia", "titulos"];
    const per = Math.ceil(MISSION_SIZE / forjaGames.length); // ~3 por formato
    const buckets = forjaGames.map((g) => selectExercises(g, region.skill, per, ctx, rng));
    const maxLen = Math.max(...buckets.map((b) => b.length));
    for (let i = 0; i < maxLen; i++) {
      for (const b of buckets) {
        const e = b[i];
        if (e) items.push({ kind: "exercise", exercise: e });
      }
    }
  } else {
    // Resto de regiones: mezcla alternada de sus dos juegos.
    const per = Math.ceil(MISSION_SIZE / games.length);
    const buckets = games.map((g) =>
      selectExercises(g, region.skill, per, ctx, rng),
    );
    const maxLen = Math.max(...buckets.map((b) => b.length));
    for (let i = 0; i < maxLen; i++) {
      for (let b = 0; b < buckets.length; b++) {
        const e = buckets[b][i];
        if (e) items.push({ kind: "exercise", exercise: e });
      }
    }
  }

  return {
    label: `Misión · ${region.name}`,
    mode: "mission",
    regionId,
    items,
  };
}

export function buildTrainingSession(
  gameId: GameId,
  ctx: BuildContext,
  seed?: string,
  focusWordId?: string,
): SessionSpec {
  const rng = createRng(seed ?? `training-${gameId}-${Math.floor(ctx.now / 60000)}`);
  let items: SessionItem[] = [];

  if (gameId === "srs") {
    const words = srsCardsForSession(ctx, Math.max(TRAINING_SIZE, ctx.newCardsPerDay + 4), {
      focusWordId,
    });
    items = words.map((w) => ({ kind: "srs", word: w }));
  } else {
    const skill = inferSkill(gameId);
    const count = TRAINING_SIZES[gameId] ?? TRAINING_SIZE;
    const exercises = selectExercises(gameId, skill, count, ctx, rng);
    items = exercises.map((e) => ({ kind: "exercise", exercise: e }));
    // Sin material fresco para este formato: recae en un pack amplio para
    // que el entrenamiento nunca esté vacío (mejora de la sesión recomendada).
    if (items.length === 0) {
      const fallbacks: GameId[] = ["trivia", "cloze", "vf-bosque", "sortea-ciudad"];
      for (const fb of fallbacks) {
        if (fb === gameId) continue;
        const alt = selectExercises(fb, inferSkill(fb), count, ctx, rng);
        items = alt.map((e) => ({ kind: "exercise", exercise: e }));
        if (items.length > 0) break;
      }
    }
  }

  return {
    label: `Entrenamiento · ${gameId}`,
    mode: "training",
    gameId,
    items,
  };
}

function inferSkill(gameId: GameId): SkillId {
  switch (gameId) {
    case "srs":
    case "trivia":
    case "sprint":
    case "sinonimos":
      return "vocabulario";
    case "puzzle":
    case "cloze":
      return "gramatica";
    case "errores":
    case "tildes":
      return "ortografia";
    case "parrafos":
    case "lectura":
      return "lectura";
    case "dictado":
    case "matices":
      return "audicion";
    case "historias":
    case "refranes":
    case "minuto":
      return "expresion";
    // ---- Etapa 3 ----
    case "memoria-bosque":
    case "intruso-bosque":
    case "escribe-bosque":
    case "vf-bosque":
    case "oye-bosque":
      return "vocabulario";
    case "sortea-ciudad":
    case "vf-ciudad":
    case "conecta-ciudad":
    case "intruso-ciudad":
    case "escribe-ciudad":
      return "gramatica";
    case "sortea-fortaleza":
    case "vf-fortaleza":
    case "escribe-fortaleza":
    case "oye-fortaleza":
    case "memoria-fortaleza":
      return "ortografia";
    case "conecta-biblioteca":
    case "vf-biblioteca":
    case "intruso-biblioteca":
    case "memoria-biblioteca":
    case "sortea-biblioteca":
      return "lectura";
    case "oye-puerto":
    case "memoria-puerto":
    case "vf-puerto":
    case "conecta-puerto":
    case "sortea-puerto":
      return "audicion";
    case "vf-torre":
    case "conecta-torre":
    case "sortea-torre":
    case "escribe-torre":
    case "memoria-torre":
      return "expresion";
    case "vf-observatorio":
    case "conecta-observatorio":
    case "sortea-observatorio":
    case "memoria-observatorio":
    case "intruso-observatorio":
      return "cultura";
    // ---- Etapa 4 · Forja del Escritor ----
    case "metaforas":
    case "registro":
      return "expresion";
    case "conectores":
      return "gramatica";
    case "ironia":
      return "lectura";
    case "titulos":
      return "ortografia";
    // ---- Mega-7 · Bosque ----
    case "acentos":
    case "silabas":
    case "analogias":
    case "colocaciones":
    case "grados":
    case "polisemia":
    case "derivadas":
    case "familias":
    case "abecedario":
    case "definiciones":
      return "vocabulario";
    // ---- Mega-7 · Ciudad ----
    case "concordancia":
    case "serestar":
    case "porpara":
    case "subjuntivo":
    case "tiempos":
    case "pronombres":
    case "relativos":
    case "estilo":
    case "pasiva":
    case "genero":
      return "gramatica";
    // ---- Mega-7 · Fortaleza ----
    case "bv":
    case "gj":
    case "hach":
    case "lly":
    case "csz":
    case "homofonos":
    case "puntuacion":
    case "mayusculas":
    case "cifras":
      return "ortografia";
    // ---- Mega-7 · Biblioteca ----
    case "titulo":
    case "idea":
    case "resumen":
    case "tono":
    case "inferencia":
    case "secuencia":
    case "proposito":
    case "vocabctx":
      return "lectura";
    // ---- Mega-7 · Puerto ----
    case "entonacion":
    case "oye-acento":
    case "oyenumero":
      return "audicion";
    // ---- Mega-7 · Torre ----
    case "iniciadores":
    case "cierre":
    case "descripciones":
      return "expresion";
    // ---- Mega-7 · Observatorio ----
    case "regiones":
    case "falsosamigos":
      return "cultura";
  }
}

export function buildReviewSession(ctx: BuildContext, errorIds: string[], seed?: string): SessionSpec {
  const rng = createRng(seed ?? `review-${Math.floor(ctx.now / 60000)}`);
  const items: SessionItem[] = [];
  for (const id of errorIds.slice(0, 10)) {
    const e = EXERCISES_BY_ID[id];
    if (e) items.push({ kind: "exercise", exercise: e });
  }
  return { label: "Repaso de errores", mode: "review", items };
}

export function buildPlacementSession(): SessionSpec {
  return {
    label: "Evaluación inicial",
    mode: "placement",
    items: PLACEMENT_ITEMS.map((p) => ({
      kind: "exercise",
      exercise: EXERCISES_BY_ID[p.exerciseId],
    })),
  };
}

/** Sesión recomendada del dashboard: prioriza tarjetas vencidas o la región más floja. */
export function buildRecommendedSession(ctx: BuildContext): SessionSpec {
  const due = dueCards(ctx);
  const active: RegionId[] = REGIONS.filter((r) => r.games.length > 0).map((r) => r.id);
  if (due.length >= 5) {
    return buildMissionSession("bosque", ctx);
  }
  // Región con menor nivel de habilidad (más necesitado de entrenamiento).
  const weakest = active.reduce((a, b) => (ctx.skills[REGION_BY_ID[a].skill] <= ctx.skills[REGION_BY_ID[b].skill] ? a : b));
  return buildMissionSession(weakest, ctx);
}

/** Destino de navegación para el botón «Sesión recomendada» del inicio. */
export function buildRecommendedDestination(
  ctx: BuildContext,
  dueCount: number,
): { gameId: GameId; mode: "training" | "mission"; regionId?: RegionId } {
  if (dueCount >= 3) return { gameId: "srs", mode: "training" };
  // Región más floja (misión completa de 3-5 min con mecánicas variadas).
  const active = REGIONS.filter((r) => r.games.length > 0);
  const weakest = active.reduce((a, b) =>
    ctx.skills[REGION_BY_ID[a.id].skill] <= ctx.skills[REGION_BY_ID[b.id].skill] ? a : b,
  );
  return { gameId: "trivia", mode: "mission", regionId: weakest.id };
}

/** Resumen de la colección para el contexto de logros. */
export function collectionStats(srs: Record<string, SrsCard>): { learned: number; mastered: number; total: number } {
  const cards = Object.values(srs);
  return {
    learned: cards.filter(isLearned).length,
    mastered: cards.filter(isMastered).length,
    total: SRS_WORDS_FULL.length,
  };
}
