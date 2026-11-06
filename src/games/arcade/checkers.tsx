"use client";

/**
 * Damas del Puerto · Clásico español contra la IA local.
 * Captura obligatoria, cadenas de captura y damas voladoras.
 * La IA calcula tres jugadas por delante (minimax con poda).
 */

import { useCallback, useMemo, useState } from "react";
import {
  applyDraughtsMove,
  bestDraughtsMove,
  draughtsName,
  draughtsStatus,
  initialBoard,
  isWhitePiece,
  legalDraughtsMoves,
  type Board,
  type DraughtsMove,
  type Player,
} from "@/engine/checkers";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArcadePanel, type ArcadeGameProps } from "./shared";
import { Crown, RotateCcw, Swords } from "lucide-react";

const DEPTHS = [
  { id: 1, name: "Grumete", depth: 1, desc: "Aprende contigo: solo ve un salto." },
  { id: 2, name: "Contramaestre", depth: 2, desc: "Dos jugadas de visión." },
  { id: 3, name: "Capitana", depth: 3, desc: "Tres jugadas: castiga los descuidos." },
] as const;

export function CheckersGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [phase, setPhase] = useState<"setup" | "playing" | "over">("setup");
  const [depth, setDepth] = useState<(typeof DEPTHS)[number]>(DEPTHS[1]);
  const [board, setBoard] = useState<Board>(() => initialBoard());
  const [turn, setTurn] = useState<Player>("w");
  const [history, setHistory] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<DraughtsMove | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [outcome, setOutcome] = useState<{ winner: Player | null; reason: string } | null>(null);

  const moves = useMemo(
    () => (phase === "playing" ? legalDraughtsMoves(board, turn) : []),
    [board, turn, phase],
  );
  // ¿Alguna captura disponible? (para avisar de obligatoriedad)
  const captureForced = moves.length > 0 && moves[0].captured.length > 0;

  const movesFrom = useCallback(
    (sq: number) => moves.filter((m) => m.path[0] === sq),
    [moves],
  );
  const targets = useMemo(
    () => (selected === null ? [] : movesFrom(selected).map((m) => m.path[m.path.length - 1])),
    [selected, movesFrom],
  );

  const start = (d: typeof depth) => {
    setDepth(d);
    setBoard(initialBoard());
    setTurn("w");
    setHistory([]);
    setSelected(null);
    setLastMove(null);
    setOutcome(null);
    setHint(null);
    setPhase("playing");
    sfx.go();
  };

  const finish = (winner: Player | null, reason: string, moveCount: number) => {
    const score = winner === "w" ? 220 + depth.id * 30 + Math.min(30, moveCount)
      : winner === null ? 110
      : 45 + Math.min(20, moveCount);
    setOutcome({ winner, reason });
    setPhase("over");
    onFinish(score, {
      subtitle:
        winner === "w"
          ? `¡Victoria! El rival se quedó sin jugadas (${reason}).`
          : winner === null
            ? "Tablas: nadie cede el muelle."
            : `El rival gana por ${reason}. ¡Revancha!`,
    });
  };

  const engineTurn = useCallback(
    async (b: Board) => {
      setThinking(true);
      await new Promise((r) => setTimeout(r, 300));
      const m = bestDraughtsMove(b, "b", depth.depth);
      setThinking(false);
      if (!m) return;
      const nb = applyDraughtsMove(b, m);
      sfx.place();
      setBoard(nb);
      setTurn("w");
      setLastMove(m);
      setHistory((h) => [...h, draughtsName(m)]);
      const st = draughtsStatus(nb, "w");
      if (st.over) finish(st.winner, st.reason === "bloqueado" ? "bloqueo" : "captura total", history.length + 1);
    },
    [depth.depth, history.length],
  );

  const onSquare = (sq: number) => {
    if (phase !== "playing" || turn !== "w" || thinking) return;
    const cell = board[sq];
    if (selected !== null && targets.includes(sq)) {
      const m = movesFrom(selected).find((x) => x.path[x.path.length - 1] === sq)!;
      const nb = applyDraughtsMove(board, m);
      sfx.place();
      setBoard(nb);
      setTurn("b");
      setSelected(null);
      setLastMove(m);
      setHistory((h) => [...h, draughtsName(m)]);
      const st = draughtsStatus(nb, "b");
      if (st.over) {
        finish(st.winner, st.reason === "bloqueado" ? "bloqueo" : "captura total", history.length + 1);
      } else {
        void engineTurn(nb);
      }
    } else if (cell !== 0 && isWhitePiece(cell)) {
      const has = movesFrom(sq).length > 0;
      setSelected(has ? sq : null);
      if (!has && moves.length > 0) {
        setHint(captureForced ? "La captura es obligatoria: elige una ficha que pueda comer." : "Esa ficha no tiene movimiento.");
        sfx.wrong(true);
      } else {
        setHint(null);
        sfx.tap();
      }
    } else {
      setSelected(null);
    }
  };

  const dark = (sq: number) => (Math.floor(sq / 8) + (sq % 8)) % 2 === 1;

  return (
    <ArcadePanel def={def} onExit={onExit} accentVar="--region-puerto">
      {phase === "setup" && (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <Swords className="anim-bob h-10 w-10 text-primary" aria-hidden />
          <div>
            <h3 className="font-display text-lg font-bold">Damas del Puerto</h3>
            <p className="mt-0.5 max-w-xs text-xs leading-snug text-muted-foreground">
              Reglas españolas: captura obligatoria, cadenas de captura y damas voladoras. Tú llevas las claras.
            </p>
          </div>
          <div className="grid w-full max-w-xs gap-2">
            {DEPTHS.map((d) => (
              <button
                key={d.id}
                onClick={() => { sfx.tap(); start(d); }}
                className="tap-3d rounded-2xl border bg-card p-3 text-left transition hover:border-primary/50"
              >
                <p className="text-sm font-bold">{d.name}</p>
                <p className="text-[11px] text-muted-foreground">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase !== "setup" && (
        <div className="flex h-full flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className={cn("rounded-full px-2.5 py-1", turn === "w" ? "bg-primary/15 text-primary" : "bg-card border")}>
              {turn === "w" ? "Mueves tú" : "El rival piensa…"}
            </span>
            <span className="numeric text-muted-foreground">{history.length} jugadas · {depth.name}</span>
          </div>

          <div className="relative mx-auto grid aspect-square w-full max-w-[min(100%,26rem)] grid-cols-8 overflow-hidden rounded-2xl border-4" style={{ borderColor: "color-mix(in oklch, var(--region-puerto) 45%, var(--card))" }}>
            {Array.from({ length: 64 }, (_, sq) => {
              const cell = board[sq];
              const isTarget = targets.includes(sq);
              const isSel = selected === sq;
              const inLast = lastMove?.path.includes(sq);
              const capHere = selected !== null && isTarget && movesFrom(selected).find((x) => x.path[x.path.length - 1] === sq)?.captured.length;
              return (
                <button
                  key={sq}
                  onClick={() => onSquare(sq)}
                  disabled={turn !== "w" || thinking}
                  aria-label={`casilla ${sq + 1}${cell ? (isWhitePiece(cell) ? ", tu ficha" : ", ficha rival") : ""}`}
                  className={cn(
                    "relative flex items-center justify-center",
                    dark(sq)
                      ? "bg-[color-mix(in_oklch,var(--region-puerto)_30%,var(--card))]"
                      : "bg-[color-mix(in_oklch,var(--region-ciudad)_14%,var(--card))]",
                    isSel && "ring-[3px] ring-inset ring-primary",
                    inLast && !isSel && "ring-2 ring-inset ring-[var(--xp)]/60",
                    cell !== 0 && "cursor-pointer",
                  )}
                >
                  {cell !== 0 && (
                    <span
                      className={cn(
                        "flex h-4/5 w-4/5 items-center justify-center rounded-full border-2 shadow-md transition-transform active:scale-90",
                        isWhitePiece(cell)
                          ? "border-[color-mix(in_oklch,white_50%,transparent)] bg-[color-mix(in_oklch,white_82%,var(--region-ciudad)_10%)]"
                          : "border-black/40 bg-[color-mix(in_oklch,var(--foreground)_78%,#000_22%)]",
                        cell === 2 || cell === 4 ? "anim-twinkle" : "",
                      )}
                    >
                      {(cell === 2 || cell === 4) && (
                        <Crown className={cn("h-1/2 w-1/2", isWhitePiece(cell) ? "text-[--region-torre]" : "text-[var(--xp)]")} aria-hidden />
                      )}
                    </span>
                  )}
                  {isTarget && (
                    <span
                      className={cn(
                        "absolute h-3 w-3 rounded-full",
                        capHere ? "bg-[--region-torre]" : "bg-primary/70",
                      )}
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
            {thinking && (
              <span className="anim-pulse-ring absolute inset-0 z-10 flex items-center justify-center bg-card/40 backdrop-blur-[1px]">
                <span className="rounded-full bg-card px-3 py-1.5 text-[11px] font-black shadow">Calculando…</span>
              </span>
            )}
          </div>

          <p className="min-h-5 text-center text-[11px] font-semibold text-muted-foreground" aria-live="polite">
            {phase === "over"
              ? outcome?.winner === "w" ? "🏆 ¡Has ganado!" : outcome?.winner === null ? "🤝 Tablas" : "🌊 Derrota: el muelle es suyo."
              : hint ?? (captureForced ? "Captura obligatoria: ¡come!" : "Toca una ficha clara y luego su destino.")}
          </p>

          {phase === "over" && (
            <Button className="font-bold" onClick={() => start(depth)}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden /> Revancha
            </Button>
          )}

          <div className="scroll-soft max-h-14 overflow-y-auto rounded-2xl border bg-background/60 p-2">
            {history.length === 0 ? (
              <p className="text-center text-[11px] text-muted-foreground">El historial de la partida aparecerá aquí.</p>
            ) : (
              <p className="numeric flex flex-wrap gap-x-2 text-[11px]">
                {history.map((h, i) => (
                  <span key={i} className={cn(i % 2 === 0 ? "text-primary font-bold" : "text-muted-foreground")}>{h}</span>
                ))}
              </p>
            )}
          </div>
        </div>
      )}
    </ArcadePanel>
  );
}
