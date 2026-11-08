"use client";

/**
 * Minijuegos de lógica y tablero · Salón de Juegos.
 * Luces del Muelle, Torres de la Fortaleza, Sudoku del Cronista,
 * Caza de Minas, Puzle Deslizable, Tres en Raya Vivo y Conecta Cuatro.
 */

import { useEffect, useState } from "react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArcadePanel, shuffle, useCountdown, type ArcadeGameProps } from "./shared";
import { Bomb, Flag, RotateCcw } from "lucide-react";

/* ============================ Luces del Muelle ============================ */

const LSIZE = 5;

function solvableLights(): boolean[] {
  // genera jugando hacia atrás desde el tablero resuelto
  const g: boolean[] = new Array(LSIZE * LSIZE).fill(false);
  const toggle = (i: number) => {
    const r = Math.floor(i / LSIZE), c = i % LSIZE;
    g[i] = !g[i];
    if (r > 0) g[i - LSIZE] = !g[i - LSIZE];
    if (r < LSIZE - 1) g[i + LSIZE] = !g[i + LSIZE];
    if (c > 0) g[i - 1] = !g[i - 1];
    if (c < LSIZE - 1) g[i + 1] = !g[i + 1];
  };
  const moves = 5 + Math.floor(Math.random() * 6);
  for (let m = 0; m < moves; m++) toggle(Math.floor(Math.random() * LSIZE * LSIZE));
  return g;
}

export function LightsOutGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [grid, setGrid] = useState<boolean[]>(solvableLights);
  const [taps, setTaps] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const on = grid.filter(Boolean).length;

  const tap = (i: number) => {
    const next = grid.slice();
    const r = Math.floor(i / LSIZE), c = i % LSIZE;
    const flip = (j: number) => (next[j] = !next[j]);
    flip(i);
    if (r > 0) flip(i - LSIZE);
    if (r < LSIZE - 1) flip(i + LSIZE);
    if (c > 0) flip(i - 1);
    if (c < LSIZE - 1) flip(i + 1);
    setGrid(next);
    setTaps((t) => t + 1);
    sfx.toggle();
    if (next.every((v) => !v)) {
      const gained = Math.max(20, 90 - taps * 3 + level * 10);
      setScore((s) => s + gained);
      sfx.sessionWin();
      setTimeout(() => {
        if (level >= 3) {
          onFinish(score + gained, { subtitle: "¡Tres muelles a oscuras! Farolero mayor." });
        } else {
          setLevel((l) => l + 1);
          setTaps(0);
          setGrid(solvableLights());
        }
      }, 600);
    }
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} accentVar="--region-ciudad">
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Muelle {level} de 3 · {on} farolas encendidas · {taps} toques
        </p>
        <div className="grid aspect-square w-full max-w-[min(100%,22rem)] grid-cols-5 gap-2">
          {grid.map((lit, i) => (
            <button
              key={i}
              onClick={() => tap(i)}
              aria-label={`Farola ${i + 1}, ${lit ? "encendida" : "apagada"}`}
              className={cn(
                "tap-target rounded-xl border-2 transition-all active:scale-90",
                lit
                  ? "gloss border-[var(--xp)] bg-[color-mix(in_oklch,var(--xp)_75%,#000_15%)] shadow-[0_0_14px_color-mix(in_oklch,var(--xp)_55%,transparent)]"
                  : "border-border bg-muted/60",
              )}
            >
              <span className={cn("block h-3 w-3 rounded-full transition", lit ? "bg-white/90" : "bg-foreground/15")} aria-hidden />
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">Cada toque cambia la farola y sus cuatro vecinas.</p>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Torres de Hanoi ============================ */

const HANOJ_N = 5;

export function HanoiGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [towers, setTowers] = useState<number[][]>([[5, 4, 3, 2, 1], [], []]);
  const [picked, setPicked] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const time = useCountdown(300, true);
  const perfect = Math.pow(2, HANOJ_N) - 1;

  const done = towers[2].length === HANOJ_N;
  useEffect(() => {
    if (done) {
      sfx.sessionWin();
      const score = Math.max(30, Math.round(160 - (moves - perfect) * 6 + Math.max(0, 300 - time) / 4));
      onFinish(score, { subtitle: `${moves} movimientos (perfecto: ${perfect}).` });
    }
  }, [done]);  

  const tapTower = (t: number) => {
    if (done) return;
    if (picked === null) {
      if (towers[t].length === 0) return;
      setPicked(t);
      sfx.tap();
    } else if (picked === t) {
      setPicked(null);
    } else {
      const disk = towers[picked][towers[picked].length - 1];
      const top = towers[t][towers[t].length - 1];
      if (top !== undefined && top < disk) {
        sfx.wrong(true);
        return;
      }
      const next = towers.map((x) => x.slice());
      next[picked].pop();
      next[t].push(disk);
      setTowers(next);
      setMoves((m) => m + 1);
      setPicked(null);
      sfx.place();
    }
  };

  return (
    <ArcadePanel def={def} onExit={onExit} accentVar="--region-fortaleza">
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {moves} movimientos · perfecto: {perfect} · {Math.ceil(time)}s
        </p>
        <div className="grid w-full max-w-md grid-cols-3 gap-3">
          {towers.map((tower, ti) => (
            <button
              key={ti}
              onClick={() => tapTower(ti)}
              aria-label={`Columna ${ti + 1}, ${tower.length} discos`}
              className={cn(
                "relative flex h-56 flex-col-reverse items-center justify-start gap-1 rounded-2xl border-2 border-b-8 pb-2 pt-2 transition",
                picked === ti ? "border-primary bg-primary/10" : "border-border bg-muted/40 hover:border-primary/40",
              )}
            >
              {tower.map((d) => (
                <span
                  key={d}
                  className="gloss block h-6 rounded-full transition-all"
                  style={{
                    width: `${d * 16}%`,
                    background: `linear-gradient(180deg, color-mix(in oklch, var(--region-fortaleza) ${40 + d * 12}%, white 20%), var(--region-fortaleza))`,
                  }}
                  aria-hidden
                />
              ))}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {picked === null ? "Toca una columna para coger su disco superior." : "Ahora toca la columna de destino."}
        </p>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Sudoku 4×4 ============================ */

const S4_LEVELS = [
  { name: "Aprendiz", holes: 4 },
  { name: "Cronista", holes: 6 },
  { name: "Maestro", holes: 8 },
] as const;

function genSudoku4(holes: number): { puzzle: number[]; solution: number[] } {
  const base = [1, 2, 3, 4];
  // genera con desplazamientos válidos de plantillas
  const rows: number[][] = [];
  const r1 = shuffle(base);
  const r2 = [r1[2], r1[3], r1[0], r1[1]];
  const r3 = [r1[1] > 0 ? r1[1] : 1, r1[0], r1[3], r1[2]].map((v, i) => v);
  // fila 3/4: rota cajas 2x2
  const r3b = [r1[3], r1[2], r1[1], r1[0]];
  const r4 = [r3b[2], r3b[3], r3b[0], r3b[1]];
  rows.push(r1, r2, r3b, r4);
  // corrige fila 3 para que las cajas 2x2 también cuadren
  const swap = rows[2][0] === rows[0][2] || rows[2][1] === rows[0][3];
  if (swap) {
    const t = rows[2];
    rows[2] = [t[2], t[3], t[0], t[1]];
  }
  // verificación y arreglo directo por permutación de columnas válida
  const grid = rows.flat();
  // valida; si falla, reintenta con otra semilla (recursión limitada)
  const ok = (g: number[]) => {
    for (let r = 0; r < 4; r++) {
      if (new Set(g.slice(r * 4, r * 4 + 4)).size !== 4) return false;
    }
    for (let c = 0; c < 4; c++) {
      const col = [g[c], g[c + 4], g[c + 8], g[c + 12]];
      if (new Set(col).size !== 4) return false;
    }
    for (let b = 0; b < 4; b++) {
      const br = Math.floor(b / 2) * 2, bc = (b % 2) * 2;
      const box = [g[br * 4 + bc], g[br * 4 + bc + 1], g[(br + 1) * 4 + bc], g[(br + 1) * 4 + bc + 1]];
      if (new Set(box).size !== 4) return false;
    }
    return true;
  };
  if (!ok(grid)) {
    // plantilla garantizada válida como respaldo
    const fixed = [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1];
    const puzzleSol = fixed.slice();
    const idx = shuffle(Array.from({ length: 16 }, (_, i) => i)).slice(0, holes);
    const puzzle = puzzleSol.map((v, i) => (idx.includes(i) ? 0 : v));
    return { puzzle, solution: puzzleSol };
  }
  const idx = shuffle(Array.from({ length: 16 }, (_, i) => i)).slice(0, holes);
  const puzzle = grid.map((v, i) => (idx.includes(i) ? 0 : v));
  return { puzzle, solution: grid };
}

export function SudokuGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [levelIdx, setLevelIdx] = useState<number | null>(null);
  const [{ puzzle, solution }, setGame] = useState(() => genSudoku4(S4_LEVELS[0].holes));
  const [cells, setCells] = useState<number[]>(puzzle);
  const [picked, setPicked] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const start = (i: number) => {
    setLevelIdx(i);
    const g = genSudoku4(S4_LEVELS[i].holes);
    setGame(g);
    setCells(g.puzzle);
    setPicked(null);
    setMistakes(0);
    setStreak(0);
    sfx.go();
  };

  const complete = cells.every((v, i) => v === solution[i]);

  const set = (v: number) => {
    if (picked === null || puzzle[picked] !== 0) return;
    const next = cells.slice();
    next[picked] = v;
    setCells(next);
    if (v === solution[picked]) {
      sfx.correct(1);
      setStreak((s) => s + 1);
      // Victoria comprobada desde el propio evento (sin efecto sincrónico).
      if (levelIdx !== null && next.every((val, i) => val === solution[i])) {
        sfx.sessionWin();
        const gained = 60 + S4_LEVELS[levelIdx].holes * 10 - mistakes * 8;
        setScore((s) => s + Math.max(15, gained));
        const nextLevel = levelIdx + 1;
        setTimeout(() => {
          if (nextLevel >= S4_LEVELS.length) {
            onFinish(score + Math.max(15, gained), { subtitle: "Los tres sudokus del cronista, resueltos." });
          } else {
            start(nextLevel);
          }
        }, 700);
      }
    } else {
      sfx.wrong(true);
      setMistakes((m) => m + 1);
      setStreak(0);
    }
    setPicked(null);
  };

  const box = (i: number) => Math.floor(Math.floor(i / 4) / 2) * 2 + Math.floor((i % 4) / 2);

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} accentVar="--region-biblioteca">
      <div className="flex h-full flex-col items-center justify-center gap-3">
        {levelIdx === null ? (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-xs text-center text-xs text-muted-foreground">Filas, columnas y cajas 2×2 con 1-2-3-4 sin repetir.</p>
            {S4_LEVELS.map((l, i) => (
              <Button key={l.name} variant="outline" className="w-48" onClick={() => start(i)}>
                {l.name} · {l.holes} huecos
              </Button>
            ))}
          </div>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {S4_LEVELS[levelIdx].name} · fallos {mistakes} · racha {streak}
            </p>
            <div className="grid aspect-square w-full max-w-[min(100%,20rem)] grid-cols-4 gap-1 rounded-xl border-4 border-primary/40 p-1">
              {cells.map((v, i) => {
                const fixedCell = puzzle[i] !== 0;
                const bad = v !== 0 && v !== solution[i];
                return (
                  <button
                    key={i}
                    onClick={() => { if (!fixedCell) { setPicked(i); sfx.tap(); } }}
                    aria-label={`Casilla ${i + 1}, ${v || "vacía"}`}
                    className={cn(
                      "tap-target flex items-center justify-center rounded-md text-xl font-black transition",
                      (i % 4 === 0 || i % 4 === 3) && "border-r-2",
                      box(i) % 2 === 1 && "bg-muted/40",
                      fixedCell ? "text-foreground/90" : "text-primary",
                      bad && "text-[--region-torre]",
                      picked === i && "ring-2 ring-primary",
                    )}
                  >
                    {v || ""}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <Button key={n} size="sm" variant="outline" className="numeric h-10 w-10 font-black" onClick={() => set(n)}>
                  {n}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={() => picked !== null && setCells((c) => { const n = c.slice(); n[picked] = 0; return n; })}>
                Borrar
              </Button>
            </div>
          </>
        )}
      </div>
    </ArcadePanel>
  );
}

/* ============================ Caza de Minas ============================ */

const M_SIZE = 6;
const M_MINES = 6;

interface MineCell { mine: boolean; open: boolean; flag: boolean; near: number }

function genMines(): MineCell[] {
  const cells: MineCell[] = Array.from({ length: M_SIZE * M_SIZE }, () => ({ mine: false, open: false, flag: false, near: 0 }));
  const spots = shuffle(Array.from({ length: M_SIZE * M_SIZE }, (_, i) => i)).slice(0, M_MINES);
  for (const s of spots) cells[s].mine = true;
  const neighbors = (i: number) => {
    const r = Math.floor(i / M_SIZE), c = i % M_SIZE;
    const out: number[] = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < M_SIZE && nc >= 0 && nc < M_SIZE) out.push(nr * M_SIZE + nc);
    }
    return out;
  };
  cells.forEach((c, i) => (c.near = neighbors(i).filter((j) => cells[j].mine).length));
  return cells;
}

export function MinesweeperGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [cells, setCells] = useState<MineCell[]>(genMines);
  const [dead, setDead] = useState(false);
  const [flags, setFlags] = useState(0);
  const [t0] = useState(() => Date.now());

  const neighbors = (i: number) => {
    const r = Math.floor(i / M_SIZE), c = i % M_SIZE;
    const out: number[] = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < M_SIZE && nc >= 0 && nc < M_SIZE) out.push(nr * M_SIZE + nc);
    }
    return out;
  };

  const open = (i: number) => {
    if (dead || cells[i].flag || cells[i].open) return;
    const next = cells.map((c) => ({ ...c }));
    if (next[i].mine) {
      next.forEach((c) => c.mine && (c.open = true));
      setCells(next);
      setDead(true);
      sfx.sessionLose();
      setTimeout(() => onFinish(0, { subtitle: "¡Bum! El mar se tragó el barco. Sin puntos esta vez." }), 900);
      return;
    }
    // apertura en cascada
    const stack = [i];
    while (stack.length) {
      const j = stack.pop()!;
      if (next[j].open || next[j].flag) continue;
      next[j].open = true;
      if (next[j].near === 0) neighbors(j).forEach((k) => !next[k].open && stack.push(k));
    }
    setCells(next);
    sfx.place();
    const won = next.every((c) => c.open || c.mine);
    if (won) {
      sfx.sessionWin();
      const secs = (Date.now() - t0) / 1000;
      const score = Math.max(30, Math.round(160 - secs * 1.5 + (M_MINES - flags) * 5));
      setTimeout(() => onFinish(score, { subtitle: `Puerto limpio en ${Math.round(secs)} segundos.` }), 700);
    }
  };

  const toggleFlag = (i: number) => {
    if (dead || cells[i].open) return;
    const next = cells.map((c) => ({ ...c }));
    next[i].flag = !next[i].flag;
    setFlags(next.filter((c) => c.flag).length);
    setCells(next);
    sfx.toggle();
  };

  const NEAR_COLOR = ["", "text-[--region-bosque]", "text-[--region-ciudad]", "text-[--region-torre]", "text-primary", "text-[--region-fortaleza]", "text-[--region-observatorio]", "", ""];

  return (
    <ArcadePanel def={def} onExit={onExit} accentVar="--region-puerto">
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Bomb className="h-3.5 w-3.5" aria-hidden /> {M_MINES} minas · <Flag className="h-3.5 w-3.5" aria-hidden /> {M_MINES - flags} restantes
        </p>
        <div className="grid aspect-square w-full max-w-[min(100%,20rem)] grid-cols-6 gap-1">
          {cells.map((c, i) => (
            <button
              key={i}
              onClick={() => open(i)}
              onContextMenu={(e) => { e.preventDefault(); toggleFlag(i); }}
              aria-label={`Casilla ${i + 1}${c.open ? `, ${c.near} minas cerca` : ""}`}
              className={cn(
                "tap-target flex items-center justify-center rounded-md border text-sm font-black transition active:scale-90",
                c.open
                  ? c.mine
                    ? "bg-[--region-torre] text-white"
                    : "border-transparent bg-muted/50"
                  : "gloss border-border bg-card hover:border-primary/50",
                !c.open && c.flag && "border-primary",
              )}
            >
              {c.flag && !c.open ? (
                <Flag className="h-4 w-4 text-primary" aria-hidden />
              ) : c.open && c.mine ? (
                <Bomb className="h-4 w-4" aria-hidden />
              ) : c.open && c.near > 0 ? (
                <span className={cn("numeric", NEAR_COLOR[c.near])}>{c.near}</span>
              ) : null}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">Toca para abrir · mantén pulsado (o clic derecho) para marcar mina.</p>
        <Button size="sm" variant="outline" onClick={() => { setCells(genMines()); setDead(false); setFlags(0); }}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Nuevo puerto
        </Button>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Puzle Deslizable ============================ */

const MOTTO = "NAVEGAR";

export function SlidingPuzzleGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [tiles, setTiles] = useState<number[]>(() => {
    let t = [...Array(8).keys()].map((i) => i + 1).concat(0);
    // mezcla con jugadas válidas (siempre resoluble)
    let blank = 8;
    for (let m = 0; m < 60; m++) {
      const r = Math.floor(blank / 3), c = blank % 3;
      const opts: number[] = [];
      if (r > 0) opts.push(blank - 3);
      if (r < 2) opts.push(blank + 3);
      if (c > 0) opts.push(blank - 1);
      if (c < 2) opts.push(blank + 1);
      const pick = opts[Math.floor(Math.random() * opts.length)];
      [t[blank], t[pick]] = [t[pick], t[blank]];
      blank = pick;
    }
    return t;
  });
  const [moves, setMoves] = useState(0);

  const won = tiles.slice(0, 8).every((v, i) => v === i + 1) && tiles[8] === 0;
  useEffect(() => {
    if (won && moves > 0) {
      sfx.sessionWin();
      const score = Math.max(25, Math.round(150 - moves * 1.5));
      onFinish(score, { subtitle: `«${MOTTO}» ordenado en ${moves} movimientos.` });
    }
  }, [won]);  

  const slide = (i: number) => {
    const blank = tiles.indexOf(0);
    const r1 = Math.floor(i / 3), c1 = i % 3;
    const r2 = Math.floor(blank / 3), c2 = blank % 3;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    const next = tiles.slice();
    [next[i], next[blank]] = [next[blank], next[i]];
    setTiles(next);
    setMoves((m) => m + 1);
    sfx.slide();
  };

  return (
    <ArcadePanel def={def} onExit={onExit} accentVar="--region-forja">
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Ordena «{MOTTO}» · {moves} movimientos
        </p>
        <div className="grid aspect-square w-full max-w-[min(100%,20rem)] grid-cols-3 gap-2">
          {tiles.map((v, i) => (
            <button
              key={i}
              onClick={() => slide(i)}
              disabled={v === 0}
              aria-label={v === 0 ? "hueco" : `letra ${MOTTO[v - 1]}`}
              className={cn(
                "tap-target flex items-center justify-center rounded-2xl border-2 text-3xl font-black transition-all",
                v === 0
                  ? "border-dashed border-transparent"
                  : "gloss border-border bg-card hover:border-primary/50 active:scale-95",
              )}
            >
              {v !== 0 && <span style={{ color: `color-mix(in oklch, var(--region-forja) ${60 + v * 5}%, var(--foreground))` }}>{MOTTO[v - 1]}</span>}
            </button>
          ))}
        </div>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Tres en Raya Vivo ============================ */

type TT = "X" | "O" | null;

function tttWinner(b: TT[]): TT | "draw" | null {
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a, c, d] of L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return b.every(Boolean) ? "draw" : null;
}

function tttBest(b: TT[], me: "X" | "O"): number {
  // minimax perfecto
  const foe = me === "X" ? "O" : "X";
  const score = (board: TT[], turn: "X" | "O", depth: number): number => {
    const w = tttWinner(board);
    if (w === me) return 10 - depth;
    if (w === foe) return depth - 10;
    if (w === "draw") return 0;
    const options: { i: number; s: number }[] = [];
    board.forEach((c, i) => {
      if (c) return;
      const nb = board.slice();
      nb[i] = turn;
      options.push({ i, s: score(nb, turn === "X" ? "O" : "X", depth + 1) });
    });
    return turn === me ? Math.max(...options.map((o) => o.s)) : Math.min(...options.map((o) => o.s));
  };
  let bestI = -1;
  let bestS = -Infinity;
  b.forEach((c, i) => {
    if (c) return;
    const nb = b.slice();
    nb[i] = me;
    const s = score(nb, foe, 1);
    if (s > bestS) { bestS = s; bestI = i; }
  });
  return bestI;
}

export function TicTacToeGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [board, setBoard] = useState<TT[]>(Array(9).fill(null));
  const [score, setScore] = useState(0);
  const [draws, setDraws] = useState(0);
  const [thinking, setThinking] = useState(false);

  const winner = tttWinner(board);

  useEffect(() => {
    if (!winner) return;
    const t = setTimeout(() => {
      if (winner === "X") {
        sfx.sessionWin();
        setScore((s) => s + 60);
        setBoard(Array(9).fill(null));
      } else if (winner === "draw") {
        sfx.sessionEnd();
        setDraws((d) => d + 1);
        setScore((s) => s + 15);
        setBoard(Array(9).fill(null));
      } else {
        sfx.sessionLose();
        onFinish(Math.max(10, score), { subtitle: `El rival despistó hasta al farero: ${draws} tablas antes de la derrota.` });
      }
    }, 800);
    return () => clearTimeout(t);
  }, [winner]);  

  const play = (i: number) => {
    if (board[i] || winner || thinking) return;
    const nb = board.slice();
    nb[i] = "X";
    setBoard(nb);
    sfx.place();
    const w1 = tttWinner(nb);
    if (!w1) {
      setThinking(true);
      setTimeout(() => {
        const j = tttBest(nb, "O");
        if (j >= 0) {
          const n2 = nb.slice();
          n2[j] = "O";
          setBoard(n2);
          sfx.place();
        }
        setThinking(false);
      }, 420);
    }
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} accentVar="--region-ciudad">
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {thinking ? "El rival piensa…" : winner === "draw" ? "¡Tablas!" : winner === "X" ? "¡Línea!" : "Tu turno (X)"}
        </p>
        <div className="grid aspect-square w-full max-w-[min(100%,18rem)] grid-cols-3 gap-2">
          {board.map((c, i) => (
            <button
              key={i}
              onClick={() => play(i)}
              aria-label={`Casilla ${i + 1}${c ? `, ${c}` : ""}`}
              className={cn(
                "tap-target flex items-center justify-center rounded-2xl border-2 text-5xl font-black transition active:scale-90",
                c ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/50",
                c === "X" ? "text-primary" : "text-[--region-torre]",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Victorias +60 · tablas +15 · una derrota cierra la partida.
        </p>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Conecta Cuatro ============================ */

type C4 = 0 | 1 | 2; // 0 vacío, 1 jugador, 2 IA
const C4_W = 7, C4_H = 6;

function c4Winner(g: C4[]): { who: 1 | 2; line: number[] } | null {
  const at = (r: number, c: number) => g[r * C4_W + c];
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < C4_H; r++) for (let c = 0; c < C4_W; c++) {
    const v = at(r, c);
    if (!v) continue;
    for (const [dr, dc] of dirs) {
      const line = [r * C4_W + c];
      let rr = r + dr, cc = c + dc;
      while (rr >= 0 && rr < C4_H && cc >= 0 && cc < C4_W && at(rr, cc) === v) {
        line.push(rr * C4_W + cc);
        rr += dr; cc += dc;
      }
      if (line.length >= 4) return { who: v as 1 | 2, line };
    }
  }
  return null;
}

function c4Drop(g: C4[], col: number, who: 1 | 2): { grid: C4[]; row: number } | null {
  for (let r = C4_H - 1; r >= 0; r--) {
    if (g[r * C4_W + col] === 0) {
      const n = g.slice();
      n[r * C4_W + col] = who;
      return { grid: n, row: r };
    }
  }
  return null;
}

function c4AiMove(g: C4[]): number {
  // 1) ganar ya 2) bloquear 3) centro primero
  const cols = shuffle([3, 2, 4, 1, 5, 0, 6]).sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b));
  for (const c of cols) {
    const m = c4Drop(g, c, 2);
    if (m && c4Winner(m.grid)?.who === 2) return c;
  }
  for (const c of cols) {
    const m = c4Drop(g, c, 1);
    if (m && c4Winner(m.grid)?.who === 1) return c;
  }
  for (const c of cols) if (c4Drop(g, c, 2)) return c;
  return -1;
}

export function Connect4Game({ def, onFinish, onExit }: ArcadeGameProps) {
  const [grid, setGrid] = useState<C4[]>(Array(C4_W * C4_H).fill(0));
  const [thinking, setThinking] = useState(false);
  const [score, setScore] = useState(0);
  const [wins, setWins] = useState(0);

  const win = c4Winner(grid);
  const full = grid.every((v) => v !== 0);

  useEffect(() => {
    if (!win && !full) return;
    const t = setTimeout(() => {
      if (win?.who === 1) {
        sfx.sessionWin();
        setScore((s) => s + 90);
        setWins((w) => w + 1);
        setGrid(Array(C4_W * C4_H).fill(0));
      } else if (win?.who === 2) {
        sfx.sessionLose();
        onFinish(Math.max(15, score), { subtitle: `${wins} victorias antes de que el rival alineara cuatro.` });
      } else {
        sfx.sessionEnd();
        setScore((s) => s + 20);
        setGrid(Array(C4_W * C4_H).fill(0));
      }
    }, 900);
    return () => clearTimeout(t);
  }, [win, full]);  

  const drop = (col: number) => {
    if (thinking || win || full) return;
    const m = c4Drop(grid, col, 1);
    if (!m) return;
    sfx.place();
    const w1 = c4Winner(m.grid);
    setGrid(m.grid);
    if (!w1) {
      setThinking(true);
      setTimeout(() => {
        const col2 = c4AiMove(m.grid);
        if (col2 >= 0) {
          const m2 = c4Drop(m.grid, col2, 2);
          if (m2) { setGrid(m2.grid); sfx.place(); }
        }
        setThinking(false);
      }, 480);
    }
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} accentVar="--region-ciudad">
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {thinking ? "El rival elige columna…" : win?.who === 1 ? "¡CUATRO!" : win?.who === 2 ? "El rival alineó…" : "Suelta una ficha dorada"}
        </p>
        <div
          className="grid w-full max-w-[min(100%,24rem)] grid-cols-7 gap-1 rounded-2xl border-4 p-1.5"
          style={{ borderColor: "color-mix(in oklch, var(--region-ciudad) 50%, var(--card))", background: "color-mix(in oklch, var(--region-ciudad) 18%, var(--card))" }}
        >
          {Array.from({ length: C4_W * C4_H }, (_, i) => {
            const col = i % C4_W;
            const v = grid[i];
            const inWin = win?.line.includes(i);
            return (
              <button
                key={i}
                onClick={() => drop(col)}
                aria-label={`Columna ${col + 1}, fila ${Math.floor(i / C4_W) + 1}`}
                className="tap-target flex aspect-square items-center justify-center rounded-full border transition active:scale-90"
                style={{
                  background: v === 1
                    ? "linear-gradient(180deg, color-mix(in oklch, var(--xp) 82%, white 18%), var(--xp))"
                    : v === 2
                      ? "linear-gradient(180deg, color-mix(in oklch, var(--region-torre) 82%, white 12%), var(--region-torre))"
                      : "color-mix(in oklch, var(--background) 92%, #000 8%)",
                  borderColor: inWin ? "var(--xp)" : "transparent",
                  borderWidth: inWin ? 3 : 0,
                }}
              />
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">Victoria +90 · tablas +20 · derrota termina la partida.</p>
      </div>
    </ArcadePanel>
  );
}
