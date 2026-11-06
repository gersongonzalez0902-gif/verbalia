"use client";

/**
 * Pantalla de partida · Orquesta una sesión de principio a fin:
 * construye los ítems con el motor, alterna los componentes de cada
 * minijuego, gestiona feedback, combo y XP en vivo, y al terminar
 * aplica el progreso y navega a los resultados.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouterParams } from "@/screens/helpers";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import {
  buildMissionSession,
  buildTrainingSession,
  buildReviewSession,
  buildPlacementSession,
} from "@/engine/session";
import { GAMES } from "@/data/games";
import { REGION_BY_ID } from "@/data/regions";
import type {
  AnswerRecord,
  Exercise,
  SessionSpec,
  SrsWord,
} from "@/types";
import { GameHud, FeedbackOverlay, ExitConfirmDialog, type FeedbackPayload } from "@/components/game/game-shell";
import { LexicoMascot, type LexicoMood } from "@/components/game/lexico";
import { useMusicStore } from "@/services/music-station";
import { useSoundEffects } from "@/components/game/game-shell";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlashcardsSrs } from "@/games/flashcards-srs";
import { TriviaSprint } from "@/games/trivia-sprint";
import { SyntaxPuzzle } from "@/games/syntax-puzzle";
import { ClozeTest } from "@/games/cloze-test";
import { ErrorHunt } from "@/games/error-hunt";
import { TildeCourt } from "@/games/tilde-court";
import { ParagraphBuilder } from "@/games/paragraph-builder";
import { DictadoFaro } from "@/games/dictado-faro";
import { EcosPuerto } from "@/games/matices";
import { LecturaInmersiva } from "@/games/lectura-inmersiva";
import { SprintVocab } from "@/games/sprint-vocab";
import { BatallaSinonimos } from "@/games/sinonimos-batalla";
import { HistoriasRamificadas } from "@/games/historias-ramificadas";
import { SabiduriaPopular } from "@/games/refranes-sabiduria";
import { RetoMinuto } from "@/games/minuto-reto";
import { VfGame, IntrusoGame } from "@/games/formats/vf-intruso";
import { SorteaGame } from "@/games/formats/sortea-game";
import { EscribeGame } from "@/games/formats/escribe-game";
import { OyeGame } from "@/games/formats/oye-game";
import { MemoriaGame } from "@/games/formats/memoria-game";
import { ConectaGame } from "@/games/formats/conecta-game";
import { itemXp } from "@/engine/scoring";
import { levelFromXp } from "@/engine/xp";
import { dateKey } from "@/engine/missions";

export function GameScreen() {
  const params = useRouterParams();
  const navigate = useUiStore((s) => s.navigate);
  const gameStore = useGameStore();
  const { profile, core, srs, settings } = gameStore;
  const sounds = useSoundEffects();

  const [spec, setSpec] = useState<SessionSpec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [combo, setCombo] = useState(0);
  const [liveXp, setLiveXp] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackPayload | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const stationInGames = useGameStore((s) => s.settings.stationInGames);
  const [lexicoMood, setLexicoMood] = useState<LexicoMood>("idle");
  const [lexicoNudge, setLexicoNudge] = useState<string | null>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongStreak = useRef(0);

  const flashMood = (mood: LexicoMood, quip: string | null) => {
    setLexicoMood(mood);
    setLexicoNudge(quip);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    moodTimer.current = setTimeout(() => {
      setLexicoMood("idle");
      setLexicoNudge(null);
    }, quip ? 2600 : 1700);
  };
  const startedAt = useRef(Date.now());
  const itemStart = useRef(Date.now());

  /* La estación del jugador se pausa al entrar a jugar si así lo pide el ajuste. */
  useEffect(() => {
    if (!stationInGames) {
      const station = useMusicStore.getState();
      if (station.playing) station.toggle();
    }
  }, [stationInGames]);

  /* ---------------- Construcción de la sesión ---------------- */
  useEffect(() => {
    if (!core) return;
    try {
      const ctx = {
        skills: core.skills,
        seenExercises: core.seenExercises,
        srs,
        now: Date.now(),
        newCardsPerDay: settings.newCardsPerDay,
      };
      let built: SessionSpec;
      if (params.mode === "placement") {
        built = buildPlacementSession();
      } else if (params.mode === "mission" && params.regionId) {
        built = buildMissionSession(params.regionId, ctx);
      } else if (params.mode === "review") {
        built = buildReviewSession(ctx, core.errors.map((e) => e.exerciseId));
      } else {
        built = buildTrainingSession(params.gameId, ctx);
      }
      if (built.items.length === 0) {
        setError("No hay material disponible para esta sesión todavía.");
        return;
      }
      setSpec(built);
      setIndex(0);
      setAnswers([]);
      setCombo(0);
      setLiveXp(0);
      setFeedback(null);
      setLexicoMood("idle");
      setLexicoNudge(null);
      startedAt.current = Date.now();
      itemStart.current = Date.now();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado al preparar la sesión.");
    }
  }, [params.gameId, params.mode, params.regionId]);

  const item = spec?.items[index];

  /* ---------------- Registro de respuesta ---------------- */
  const handleAnswer = useCallback(
    (payload: { correct: boolean | null; grade?: AnswerRecord["grade"]; userAnswer: string; correctAnswer: string }) => {
      if (!spec || !item) return;
      const timeMs = Date.now() - itemStart.current;

      const answer: AnswerRecord =
        item.kind === "srs"
          ? {
              itemId: item.word.id,
              kind: "srs",
              gameId: "srs",
              skill: "vocabulario",
              difficulty: item.word.difficulty,
              correct: null,
              grade: payload.grade,
              userAnswer: payload.userAnswer,
              correctAnswer: payload.correctAnswer,
              timeMs,
              wasSeenRecently: false,
            }
          : {
              itemId: item.exercise.id,
              kind: "exercise",
              gameId: item.exercise.type,
              skill: item.exercise.skill,
              difficulty: item.exercise.difficulty,
              correct: payload.correct,
              userAnswer: payload.userAnswer,
              correctAnswer: payload.correctAnswer,
              exercise: item.exercise as Exercise,
              timeMs,
              wasSeenRecently: Boolean(
                core.seenExercises[item.exercise.id] &&
                Date.now() - core.seenExercises[item.exercise.id] < 3 * 86_400_000,
              ),
            };

      setAnswers((prev) => [...prev, answer]);

      // Combo y sonidos
      const isCombo = answer.correct === true || (answer.correct === null && answer.grade && answer.grade !== "again");
      const nextCombo = isCombo ? combo + 1 : 0;
      setCombo(nextCombo);
      if (isCombo) {
        sounds.correct();
        if (nextCombo >= 3) sounds.combo(nextCombo);
      } else {
        sounds.wrong();
      }

      // Léxico reacciona en vivo: celebra los combos y consuela las rachas malas.
      if (answer.correct === false) {
        wrongStreak.current += 1;
        const quip =
          wrongStreak.current >= 3
            ? "Respira: los errores también enseñan. Vamos a por la siguiente."
            : answer.gameId === "memoria-bosque"
              ? null
              : null;
        flashMood("oops", quip);
      } else {
        wrongStreak.current = 0;
        if (nextCombo >= 3) {
          const quips: Record<number, string> = {
            3: "¡Ese es el rumbo!",
            5: "¡Viento en popa, navegante!",
            8: "¡Imparable! El faro entero te mira.",
            12: "¡Nivel leyenda del Archipiélago!",
          };
          flashMood("cheer", quips[nextCombo] ?? null);
        }
      }

      // XP en vivo (estimación con el motor real de puntuación)
      const xpPreview = itemXp({
        difficulty: answer.difficulty,
        correct: answer.correct,
        grade: answer.grade,
        timeMs,
        combo: nextCombo,
        seenRecently: answer.wasSeenRecently,
        xpToday: core.stats.xpByDay[dateKey(new Date())] ?? 0,
        timed: answer.gameId === "trivia" || answer.gameId === "sprint",
      });
      setLiveXp((x) => x + xpPreview.xp);

      // Retroalimentación pedagógica
      const explanation =
        item.kind === "exercise" ? item.exercise.explanation : "El jardín programará la próxima revisión según tu respuesta.";
      setFeedback({
        kind: answer.correct === false ? "incorrect" : "correct",
        title: answer.correct === false ? "Respuesta incorrecta" : "",
        correctAnswer: answer.correct === false ? answer.correctAnswer : undefined,
        explanation,
      });
    },
    [spec, item, combo, core, sounds],
  );

  /* ---------------- Final de sesión ---------------- */
  const finishSession = useCallback(() => {
    if (!spec) return;
    const durationMs = Date.now() - startedAt.current;
    if (spec.mode === "placement") {
      // La evaluación fija las habilidades de partida (además del XP fijo).
      const placementAnswers = answers
        .filter((a) => a.kind === "exercise")
        .map((a) => ({ skill: a.skill, difficulty: a.difficulty, correct: a.correct === true }));
      gameStore.finishPlacement(placementAnswers);
    }
    gameStore.completeSession(spec, answers, durationMs);
    sounds.levelUp();
    navigate({ name: "results" });
  }, [spec, answers, gameStore, sounds, navigate]);

  const handleContinue = useCallback(() => {
    setFeedback(null);
    itemStart.current = Date.now();
    if (!spec) return;
    if (index + 1 < spec.items.length) {
      setIndex((i) => i + 1);
    } else {
      finishSession();
    }
  }, [spec, index, finishSession]);

  /* ---------------- Render ---------------- */

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" aria-hidden />
        <div>
          <h1 className="font-display text-xl font-bold">No se pudo preparar la sesión</h1>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={() => navigate({ name: "home" })} className="font-bold">
          Volver al inicio
        </Button>
      </div>
    );
  }

  if (!spec || !item) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <p className="text-sm font-semibold text-muted-foreground">Preparando tu sesión…</p>
      </div>
    );
  }

  const total = spec.items.length;
  const gameTitle =
    spec.mode === "mission" && spec.regionId
      ? REGION_BY_ID[spec.regionId].name
      : spec.mode === "placement"
        ? "Evaluación inicial"
        : GAMES[params.gameId]?.name ?? "Sesión";

  const gameNode = (() => {
    if (item.kind === "srs") {
      return <FlashcardsSrs item={item.word as SrsWord} onAnswer={handleAnswer} disabled={feedback !== null} />;
    }
    const ex = item.exercise as Exercise;
    switch (ex.type) {
      case "trivia":
        return <TriviaSprint item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "puzzle":
        return <SyntaxPuzzle item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "cloze":
        return <ClozeTest item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "errores":
        return <ErrorHunt item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "tildes":
        return <TildeCourt item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "parrafos":
        return <ParagraphBuilder item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "dictado":
        return <DictadoFaro item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "matices":
        return <EcosPuerto item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "lectura":
        return <LecturaInmersiva item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "sprint":
        return <SprintVocab item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "sinonimos":
        return <BatallaSinonimos item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "historias":
        return <HistoriasRamificadas item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "refranes":
        return <SabiduriaPopular item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "minuto":
        return <RetoMinuto item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      /* ---- Etapa 3 · motores de formatos nuevos ---- */
      case "memoria-bosque":
      case "memoria-fortaleza":
      case "memoria-biblioteca":
      case "memoria-puerto":
      case "memoria-torre":
      case "memoria-observatorio":
        return <MemoriaGame item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "intruso-bosque":
      case "intruso-ciudad":
      case "intruso-biblioteca":
      case "intruso-observatorio":
        return <IntrusoGame item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "sortea-ciudad":
      case "sortea-fortaleza":
      case "sortea-biblioteca":
      case "sortea-puerto":
      case "sortea-torre":
      case "sortea-observatorio":
        return <SorteaGame item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "vf-bosque":
      case "vf-ciudad":
      case "vf-fortaleza":
      case "vf-biblioteca":
      case "vf-puerto":
      case "vf-torre":
      case "vf-observatorio":
        return <VfGame item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "escribe-bosque":
      case "escribe-ciudad":
      case "escribe-fortaleza":
      case "escribe-torre":
        return <EscribeGame item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "oye-bosque":
      case "oye-fortaleza":
      case "oye-puerto":
        return <OyeGame item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      case "conecta-ciudad":
      case "conecta-biblioteca":
      case "conecta-puerto":
      case "conecta-torre":
      case "conecta-observatorio":
        return <ConectaGame item={ex} onAnswer={handleAnswer} disabled={feedback !== null} />;
      default:
        return null;
    }
  })();

  return (
    <div className="flex min-h-dvh flex-col">
      <GameHud
        title={gameTitle}
        current={index}
        total={total}
        combo={combo}
        sessionXp={liveXp}
        onExit={() => setExitOpen(true)}
        mood={lexicoMood}
      />

      {/* Susurro de Léxico: nunca bloquea, se desvanece solo. */}
      {lexicoNudge && (
        <div className="pointer-events-none fixed left-0 right-0 top-16 z-40 flex justify-center px-4" aria-hidden>
          <p className="anim-slide-up max-w-sm rounded-full border border-primary/25 bg-card/90 px-4 py-1.5 text-center text-xs font-bold text-foreground shadow-md backdrop-blur">
            {lexicoNudge}
          </p>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-6" aria-live="polite">
        <div key={`${index}-${item.kind === "srs" ? item.word.id : item.exercise.id}`} className="anim-slide-up">
          {gameNode}
        </div>
      </main>

      <FeedbackOverlay
        feedback={feedback}
        onContinue={handleContinue}
        isLast={index + 1 >= total}
      />

      <ExitConfirmDialog
        open={exitOpen}
        answered={answers.length}
        total={total}
        onCancel={() => setExitOpen(false)}
        onConfirm={() => {
          setExitOpen(false);
          if (answers.length > 0 && spec && spec.mode !== "placement") {
            const durationMs = Date.now() - startedAt.current;
            gameStore.completeSession(spec, answers, durationMs);
          }
          navigate(spec.mode === "placement" ? { name: "home" } : { name: "home" });
        }}
      />
    </div>
  );
}

/** Nivel de jugador actual (para mostrar en HUD de resultados). */
export function useCurrentLevel(): number {
  const xp = useGameStore((s) => s.core.xp);
  return useMemo(() => levelFromXp(xp), [xp]);
}
