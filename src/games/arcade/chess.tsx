"use client";

/**
 * Ajedrez del Faro · Partida contra el motor local + revisión completa.
 * - Cuatro niveles de motor (profundidad 1-4 del negamax).
 * - Jugada a jugada con anotación española, jaques y mates visibles.
 * - Al terminar: precisión por bando, análisis jugada a jugada y tablero
 *   reproducible con la evaluación del motor en cada posición.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyMove,
  bestMove,
  gameStatus,
  inCheck,
  kingSquare,
  legalMoves,
  moveToSan,
  parseFen,
  reviewGame,
  sqName,
  START_FEN,
  toFen,
  type ChessMove,
  type ChessState,
  type Color,
  type MoveGrade,
  type ReviewStep,
} from "@/engine/chess";
import { useGameStore } from "@/store/game-store";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArcadePanel, type ArcadeGameProps, type FinishInfo } from "./shared";
import {
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gauge,
  Lightbulb,
  RotateCcw,
} from "lucide-react";

const GLYPH: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

const LEVELS = [
  { id: 1, name: "Aprendiz", depth: 1, elo: 800, desc: "El farolero novato: mira una jugada." },
  { id: 2, name: "Cronista", depth: 2, elo: 1200, desc: "Calcula dos jugadas: no regala nada." },
  { id: 3, name: "Farero", depth: 3, elo: 1600, desc: "Tres jugadas de visión: pide cuentas." },
  { id: 4, name: "Capitán", depth: 4, elo: 2000, desc: "Cuatro jugadas: el faro en plena potencia." },
] as const;

const GRADE_STYLE: Record<MoveGrade, { label: string; cls: string }> = {
  brillante: { label: "★", cls: "bg-[var(--xp)] text-black" },
  optima: { label: "✓", cls: "bg-[--region-bosque] text-white" },
  buena: { label: "·", cls: "bg-[--region-ciudad] text-white" },
  dudosa: { label: "?", cls: "bg-[--region-torre] text-white" },
  error: { label: "??", cls: "bg-[--region-fortaleza] text-white" },
  desastre: { label: "‼", cls: "bg-destructive text-white" },
};

type Phase = "setup" | "playing" | "over" | "review";

export function ChessGame({ def, best, onFinish, onExit }: ArcadeGameProps) {
  const core = useGameStore((s) => s.core);
  const recordChessResult = useGameStore((s) => s.recordChessResult);

  const [phase, setPhase] = useState<Phase>("setup");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>(LEVELS[1]);
  const [playAs, setPlayAs] = useState<Color>("w");
  const [state, setState] = useState<ChessState>(() => parseFen(START_FEN));
  const [history, setHistory] = useState<{ san: string; move: ChessMove }[]>([]);
  const [repKeys, setRepKeys] = useState<string[]>([toFen(parseFen(START_FEN)).split(" ").slice(0, 4).join(" ")]);
  const [selected, setSelected] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<ChessMove | null>(null);
  const [thinking, setThinking] = useState(false);
  const [finishInfo, setFinishInfo] = useState<FinishInfo | null>(null);
  const [result, setResult] = useState<{ result: "w" | "b" | "d"; reason: string } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const myTurn = state.turn === playAs && phase === "playing";
  const moves = useMemo(() => (phase === "playing" ? legalMoves(state) : []), [state, phase]);

  const targets = useMemo(
    () => (selected === null ? [] : moves.filter((m) => m.from === selected).map((m) => m.to)),
    [selected, moves],
  );

  /* ---------- flujo de partida ---------- */

  const startGame = (lvl: typeof level, side: Color) => {
    setLevel(lvl);
    setPlayAs(side);
    const fresh = parseFen(START_FEN);
    setState(fresh);
    setHistory([]);
    setRepKeys([toFen(fresh).split(" ").slice(0, 4).join(" ")]);
    setSelected(null);
    setLastMove(null);
    setResult(null);
    setFinishInfo(null);
    setPhase("playing");
    sfx.go();
    if (side === "b") void engineTurn(fresh, lvl);
  };

  const finishGame = useCallback(
    (res: { result: "w" | "b" | "d"; reason: string }, finalState: ChessState, moveCount: number) => {
      const myResult = res.result === "d" ? "d" : res.result === playAs ? "w" : "l";
      recordChessResult(myResult, level.elo);
      const base = myResult === "w" ? 260 : myResult === "d" ? 120 : 50;
      const depthBonus = (level.id - 1) * 25;
      const score = base + depthBonus + Math.min(40, moveCount);
      const reasonEs: Record<string, string> = {
        mate: "jaque mate",
        stalemate: "ahogado",
        material: "material insuficiente",
        fifty: "regla de 50 jugadas",
        repetition: "triple repetición",
      };
      setResult({ ...res, reason: reasonEs[res.reason] ?? res.reason });
      const subtitle =
        myResult === "w"
          ? `¡Victoria contra el ${level.name} (${level.elo} ELO aprox.) por ${reasonEs[res.reason] ?? res.reason}!`
          : myResult === "d"
            ? `Tablas por ${reasonEs[res.reason] ?? res.reason}. El faro se apaga en paz.`
            : `Derrota por ${reasonEs[res.reason] ?? res.reason}. El motor calculó mejor… esta vez.`;
      setFinishInfo({ score, xp: 0, tinta: 0, isRecord: score > best, best, subtitle });
      setPhase("over");
      onFinish(score, { subtitle });
    },
    [best, level, onFinish, playAs, recordChessResult],
  );

  const pushMove = useCallback(
    (s: ChessState, m: ChessMove, all: ChessMove[], prevKeys: string[]) => {
      const san = moveToSan(s, m, all);
      const next = applyMove(s, m);
      const keys = [...prevKeys, toFen(next).split(" ").slice(0, 4).join(" ")];
      setState(next);
      setHistory((h) => [...h, { san, move: m }]);
      setRepKeys(keys);
      setLastMove(m);
      setSelected(null);
      const st = gameStatus(next, keys);
      if (st.over) {
        finishGame({ result: st.result, reason: st.reason }, next, history.length + 1);
      }
      return { next, keys };
    },
    [finishGame, history.length],
  );

  const engineTurn = useCallback(
    async (s: ChessState, lvl: typeof level) => {
      setThinking(true);
      await new Promise((r) => setTimeout(r, 260)); // respira y da sensación de "pensar"
      const engine = bestMove(s, lvl.depth);
      setThinking(false);
      if (!engine.move) return;
      const all = legalMoves(s);
      if (engine.score > 800 && s.turn !== playAs) sfx.whoosh();
      pushMove(s, engine.move, all, repKeys);
    },
    [playAs, pushMove, repKeys],
  );

  const onSquareClick = (sq: number) => {
    if (!myTurn || thinking) return;
    const piece = state.board[sq];
    if (selected !== null && targets.includes(sq)) {
      const m = moves.find((x) => x.from === selected && x.to === sq)!;
      sfx.place();
      const { next, keys } = pushMove(state, m, moves, repKeys);
      const st = gameStatus(next, keys);
      if (!st.over) void engineTurn(next, level);
    } else if (piece && (piece === piece.toUpperCase()) === (playAs === "w")) {
      setSelected(sq);
      sfx.tap();
    } else {
      setSelected(null);
    }
  };

  // Iconos de jaque: el rey del turno en peligro.
  const checkedKing = inCheck(state, state.turn) ? kingSquare(state, state.turn) : -1;

  /* ---------- revisión ---------- */

  const [review, setReview] = useState<{ steps: ReviewStep[]; accuracy: { w: number; b: number } } | null>(null);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewPct, setReviewPct] = useState(0);

  const runReview = async () => {
    setReviewPct(0);
    setReview(null);
    setPhase("review");
    const out = await reviewGame(history.map((h) => h.move), {
      depth: 2,
      onProgress: (d, t) => setReviewPct(Math.round((d / t) * 100)),
    });
    setReview(out);
    setReviewIdx(0);
    sfx.achievement();
  };

  // Posición reproducida en la revisión.
  const reviewBoard = useMemo(() => {
    if (!review) return null;
    let s = parseFen(START_FEN);
    for (let i = 0; i < reviewIdx; i++) s = applyMove(s, review.steps[i].move);
    return s.board;
  }, [review, reviewIdx]);

  /* ---------- render ---------- */

  const board = phase === "review" ? reviewBoard : state.board;
  const flip = playAs === "b";
  const order = useMemo(() => {
    const idx = Array.from({ length: 64 }, (_, i) => i);
    return flip ? idx.slice().reverse() : idx;
  }, [flip]);

  return (
    <ArcadePanel def={def} onExit={onExit} accentVar="--region-fortaleza">
      {phase === "setup" && (
        <div className="flex h-full flex-col gap-4 overflow-y-auto scroll-soft">
          <div className="text-center">
            <Crown className="anim-bob mx-auto h-10 w-10 text-primary" aria-hidden />
            <h3 className="font-display mt-1 text-lg font-bold">Elige rival y bando</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Motor 100% local: piensa dentro de tu dispositivo, sin internet.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => { sfx.tap(); setLevel(lvl); }}
                aria-pressed={level.id === lvl.id}
                className={cn(
                  "tap-3d rounded-2xl border p-3 text-left transition",
                  level.id === lvl.id ? "gloss border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40",
                )}
              >
                <p className="flex items-center gap-1.5 text-sm font-bold">
                  <Gauge className="h-4 w-4" aria-hidden /> {lvl.name}
                </p>
                <p className="numeric text-[10px] font-bold text-muted-foreground">~{lvl.elo} ELO</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{lvl.desc}</p>
              </button>
            ))}
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tu bando</p>
            <div className="grid grid-cols-2 gap-2">
              <BigSide white onClick={() => startGame(level, "w")} label="Blancas" glyph="♔" />
              <BigSide onClick={() => startGame(level, "b")} label="Negras" glyph="♚" />
            </div>
          </div>

          <div className="mt-1 rounded-2xl bg-secondary p-3 text-center text-[11px] leading-relaxed text-secondary-foreground">
            Tu ELO de ajedrez: <span className="numeric font-black">{core.arcade.chessElo ?? 1200}</span> ·
            Victorias <span className="numeric font-black">{core.arcade.chessRecord.w}</span> ·
            Tablas <span className="numeric font-black">{core.arcade.chessRecord.d}</span> ·
            Derrotas <span className="numeric font-black">{core.arcade.chessRecord.l}</span>
          </div>
        </div>
      )}

      {(phase === "playing" || phase === "over") && (
        <div className="flex h-full flex-col gap-3">
          {/* HUD de la partida */}
          <div className="flex items-center justify-between gap-2 text-xs font-bold">
            <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1", state.turn === "w" ? "bg-secondary text-secondary-foreground" : "bg-card border")}>
              <span aria-hidden>{playAs === "w" ? "👑 Tú" : "🤖 Motor"}</span> ♔ vs ♚ {playAs === "b" ? "Tú" : "Motor"}
            </span>
            <span className="numeric text-muted-foreground">{history.length} jugadas · {level.name}</span>
          </div>

          {/* Tablero */}
          <div
            ref={boardRef}
            className={cn(
              "relative mx-auto grid aspect-square w-full max-w-[min(100%,26rem)] grid-cols-8 overflow-hidden rounded-2xl border-4 shadow-inner",
            )}
            style={{ borderColor: "color-mix(in oklch, var(--region-fortaleza) 45%, var(--card))" }}
            role="grid"
            aria-label="Tablero de ajedrez"
          >
            {order.map((sq) => {
              const dark = (Math.floor(sq / 8) + (sq % 8)) % 2 === 1;
              const piece = board?.[sq] ?? "";
              const isSel = selected === sq;
              const isTarget = targets.includes(sq);
              const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
              const isCheck = checkedKing === sq;
              return (
                <button
                  key={sq}
                  onClick={() => onSquareClick(sq)}
                  disabled={!myTurn || thinking}
                  aria-label={`${sqName(sq)}${piece ? ` ${piece}` : ""}${isTarget ? ", jugada disponible" : ""}`}
                  className={cn(
                    "relative flex items-center justify-center transition-colors",
                    dark ? "bg-[color-mix(in_oklch,var(--region-fortaleza)_26%,var(--card))]" : "bg-[color-mix(in_oklch,var(--region-ciudad)_18%,var(--card))]",
                    isLast && "ring-2 ring-inset ring-[var(--xp)]/70",
                    isSel && "ring-[3px] ring-inset ring-primary",
                    isCheck && "anim-glow",
                    myTurn && "cursor-pointer",
                  )}
                >
                  {piece && (
                    <span
                      className={cn(
                        "select-none text-[min(7.5vw,2rem)] leading-none drop-shadow-sm transition-transform",
                        piece === piece.toUpperCase() ? "text-white" : "text-[color-mix(in_oklch,var(--foreground)_88%,#000_12%)]",
                        selected === sq && "scale-110",
                      )}
                      style={piece === piece.toUpperCase()
                        ? { WebkitTextStroke: "1px color-mix(in oklch, var(--foreground) 55%, transparent)" }
                        : undefined}
                      aria-hidden
                    >
                      {GLYPH[piece]}
                    </span>
                  )}
                  {isTarget && !piece && (
                    <span className="absolute h-3 w-3 rounded-full bg-primary/60" aria-hidden />
                  )}
                  {isTarget && piece && (
                    <span className="absolute inset-0.5 rounded-lg border-[3px] border-primary/70" aria-hidden />
                  )}
                  {isCheck && <span className="absolute inset-0 bg-[--region-torre]/25" aria-hidden />}
                </button>
              );
            })}
            {thinking && (
              <span className="anim-pulse-ring absolute inset-0 z-10 flex items-center justify-center bg-card/40 backdrop-blur-[1px]">
                <span className="rounded-full bg-card px-3 py-1.5 text-[11px] font-black shadow">
                  El motor piensa…
                </span>
              </span>
            )}
          </div>

          {/* Historial SAN */}
          <div className="scroll-soft max-h-16 overflow-y-auto rounded-2xl border bg-background/60 p-2">
            {history.length === 0 ? (
              <p className="text-center text-[11px] text-muted-foreground">
                {myTurn ? "Mueves tú: toca una pieza y luego su destino." : "El faro abre la partida…"}
              </p>
            ) : (
              <p className="numeric flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] leading-relaxed">
                {history.map((h, i) => (
                  <span key={i} className={cn(i % 2 === 0 && "text-primary")}>
                    {i % 2 === 0 ? `${i / 2 + 1}.` : ""} {h.san}
                  </span>
                ))}
              </p>
            )}
          </div>

          {/* Fin de partida */}
          {phase === "over" && finishInfo && (
            <div className="anim-slide-up space-y-2.5 rounded-2xl border border-primary/40 bg-card p-3 text-center">
              <p className="font-display text-base font-bold">
                {result?.result === "d" ? "🤝 Tablas" : (result?.result === "w") === (playAs === "w") ? "🏆 ¡Has ganado!" : "🌊 El faro gana"}
              </p>
              <p className="text-xs text-muted-foreground">{finishInfo.subtitle}</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button size="sm" className="flex-1 font-bold" onClick={() => { sfx.go(); void runReview(); }}>
                  <BookOpenCheck className="mr-1.5 h-4 w-4" aria-hidden /> Revisar la partida
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => startGame(level, playAs)}>
                  <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden /> Revancha
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== Revisión de partida ===== */}
      {phase === "review" && review && (
        <ReviewView
          steps={review.steps}
          accuracy={review.accuracy}
          idx={reviewIdx}
          setIdx={setReviewIdx}
          board={reviewBoard}
          onExit={() => setPhase("over")}
        />
      )}
      {phase === "review" && !review && (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <Lightbulb className="anim-glow h-10 w-10 text-[var(--xp)]" aria-hidden />
          <p className="font-display text-lg font-bold">Revisando la partida…</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            El motor repite cada posición y compara tu jugada con la mejor línea. Todo aquí, en tu dispositivo.
          </p>
          <div className="groove h-3 w-56 overflow-hidden rounded-full">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${reviewPct}%` }} />
          </div>
          <p className="numeric text-xs font-bold text-muted-foreground">{reviewPct}%</p>
        </div>
      )}
    </ArcadePanel>
  );
}

function BigSide({ white, onClick, label, glyph }: { white?: boolean; onClick: () => void; label: string; glyph: string }) {
  return (
    <button
      onClick={() => { sfx.tap(); onClick(); }}
      className="tap-3d flex flex-col items-center gap-1 rounded-2xl border-2 border-border bg-card p-4 transition hover:border-primary active:scale-95"
    >
      <span className="text-4xl" aria-hidden>{glyph}</span>
      <span className="text-sm font-bold">{label}</span>
      <span className="text-[10px] text-muted-foreground">{white ? "mueves primero" : "el motor abre"}</span>
    </button>
  );
}

/* ============================ vista de revisión ============================ */

function ReviewView({
  steps,
  accuracy,
  idx,
  setIdx,
  board,
  onExit,
}: {
  steps: ReviewStep[];
  accuracy: { w: number; b: number };
  idx: number;
  setIdx: (i: number) => void;
  board: string[] | null;
  onExit: () => void;
}) {
  const step = steps[Math.min(idx, steps.length - 1)];
  const evalCp = step.evalAfter; // perspectiva del que acaba de mover
  const evalPct = Math.max(4, Math.min(96, 50 + step.evalAfter / 40));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIdx(Math.min(steps.length - 1, idx + 1));
      if (e.key === "ArrowLeft") setIdx(Math.max(0, idx - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, setIdx, steps.length]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-display flex items-center gap-1.5 text-base font-bold">
          <BookOpenCheck className="h-5 w-5 text-primary" aria-hidden /> Revisión del faro
        </p>
        <Button size="sm" variant="ghost" onClick={onExit}>
          <ChevronRight className="h-4 w-4" aria-hidden /> Salir
        </Button>
      </div>

      {/* Precisión */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border bg-card p-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Precisión blancas</p>
          <p className="numeric font-display text-xl font-black text-primary">{accuracy.w}%</p>
        </div>
        <div className="rounded-2xl border bg-card p-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Precisión negras</p>
          <p className="numeric font-display text-xl font-black">{accuracy.b}%</p>
        </div>
      </div>

      {/* Tablero en la jugada actual */}
      <div className="mx-auto grid aspect-square w-full max-w-[min(100%,22rem)] grid-cols-8 overflow-hidden rounded-2xl border-4" style={{ borderColor: "color-mix(in oklch, var(--region-fortaleza) 45%, var(--card))" }}>
        {Array.from({ length: 64 }, (_, sq) => {
          const dark = (Math.floor(sq / 8) + (sq % 8)) % 2 === 1;
          const piece = board?.[sq] ?? "";
          const isLast = step && (step.move.to === sq);
          return (
            <div
              key={sq}
              className={cn(
                "flex items-center justify-center",
                dark ? "bg-[color-mix(in_oklch,var(--region-fortaleza)_26%,var(--card))]" : "bg-[color-mix(in_oklch,var(--region-ciudad)_18%,var(--card))]",
                isLast && "ring-2 ring-inset ring-[var(--xp)]/80",
              )}
            >
              {piece && (
                <span
                  className={cn("select-none text-[min(5.5vw,1.6rem)] leading-none", piece === piece.toUpperCase() ? "text-white" : "text-[color-mix(in_oklch,var(--foreground)_88%,#000_12%)]")}
                  style={piece === piece.toUpperCase() ? { WebkitTextStroke: "1px color-mix(in oklch, var(--foreground) 55%, transparent)" } : undefined}
                  aria-hidden
                >
                  {GLYPH[piece]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Comentario de la jugada */}
      {step && (
        <div className="rounded-2xl border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold">
              <span className="numeric text-muted-foreground">{Math.floor(idx / 2) + 1}.</span>{" "}
              {step.san} {idx % 2 === 0 ? "♔" : "♚"}
            </p>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-black", GRADE_STYLE[step.grade].cls)}>
              {GRADE_STYLE[step.grade].label} {step.grade}
            </span>
          </div>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">{step.comment}</p>
          {/* barra de evaluación */}
          <div className="mt-2">
            <div className="groove relative h-2.5 overflow-hidden rounded-full">
              <div className="h-full bg-card" style={{ width: `${evalPct}%` }} />
              <div className="absolute inset-0 rounded-full border" />
            </div>
            <p className="numeric mt-1 text-[10px] font-bold text-muted-foreground">
              Evaluación: {evalCp > 0 ? "+" : ""}{(evalCp / 100).toFixed(2)} peones
            </p>
          </div>
        </div>
      )}

      {/* Controles de reproducción */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={idx === 0} onClick={() => { sfx.tap(); setIdx(Math.max(0, idx - 1)); }} aria-label="Jugada anterior">
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Button>
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          aria-label="Ir a la jugada"
          className="groove h-2 flex-1 cursor-pointer appearance-none rounded-full accent-[var(--primary)]"
        />
        <Button size="sm" variant="outline" disabled={idx >= steps.length - 1} onClick={() => { sfx.tap(); setIdx(Math.min(steps.length - 1, idx + 1)); }} aria-label="Jugada siguiente">
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {/* Tira de jugadas con notas */}
      <div className="scroll-soft max-h-24 overflow-y-auto rounded-2xl border bg-background/60 p-2">
        <div className="flex flex-wrap gap-1">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => { sfx.tap(); setIdx(i); }}
              aria-label={`Ir a la jugada ${s.san}`}
              className={cn(
                "numeric rounded-lg px-1.5 py-0.5 text-[11px] font-bold transition",
                i === idx ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <span className={cn("mr-0.5 inline-block h-2 w-2 rounded-full align-middle", GRADE_STYLE[s.grade].cls)} aria-hidden />
              {s.san}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
