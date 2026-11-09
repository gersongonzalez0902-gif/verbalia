"use client";

/**
 * Rejillas de palabras · Salón de Juegos (Etapa 3 traída a casa).
 * ----------------------------------------------------------------
 * 1) SOPA DE LETRAS: se toca la casilla inicial y la final de una
 *    palabra escondida (horizontal, vertical o diagonal). El número
 *    de palabras y el tamaño de la rejilla crecen con el nivel del
 *    jugador (adaptativa).
 * 2) CRUCIGRAMA DEL COPISTA: cruces pequeñas construidas al vuelo
 *    desde un banco de pistas; la dificultad (número de palabras y
 *    longitud) se adapta al nivel. Botón «Pista» revela una letra.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArcadePanel, FlashMsg, useCountdown, type ArcadeGameProps } from "./shared";
import { useGameStore } from "@/store/game-store";
import { levelProgress } from "@/engine/xp";
import { Sparkles, Eraser } from "lucide-react";

/* ========================= utilidades comunes ========================= */

const rnd = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));

function usePlayerLevel(): number {
  const xp = useGameStore((s) => s.core.xp);
  return levelProgress(xp).level;
}

/* ============================ SOPA DE LETRAS ============================ */

const SOPA_TEMAS: { tema: string; palabras: string[] }[] = [
  { tema: "El mar", palabras: ["ANCLA", "MAREA", "FARO", "VELA", "CORAL", "OLA", "BOYA", "CANGREJO"] },
  { tema: "El bosque", palabras: ["ROBLE", "MUSGO", "HOJA", "RAIZ", "PINO", "CIERVO", "SETA", "TRONCO"] },
  { tema: "La ciudad", palabras: ["PLAZA", "CALLE", "AUTOBUS", "MUSEO", "TIENDA", "PARQUE", "PUENTE", "CINE"] },
  { tema: "Comida", palabras: ["PAN", "MANZANA", "ARROZ", "QUESO", "MIEL", "SOPA", "TORTILLA", "ACEITE"] },
  { tema: "Animales", palabras: ["ZORRO", "BALLENA", "TORTUGA", "AGUILA", "CONEJO", "LOBO", "GATO", "CABALLO"] },
  { tema: "El cielo", palabras: ["NUBE", "ESTRELLA", "LLUVIA", "VIENTO", "SOL", "NIEBLA", "ARCOIRIS", "LUNA"] },
];

const DIRS: [number, number][] = [[1, 0], [0, 1], [1, 1], [-1, 1]];

function buildSopa(size: number, words: string[]): { grid: string[][]; placed: { w: string; cells: number[] }[] } {
  const grid: string[][] = Array.from({ length: size }, () => Array<string>(size).fill(""));
  const placed: { w: string; cells: number[] }[] = [];
  for (const w of words) {
    let done = false;
    for (let attempt = 0; attempt < 160 && !done; attempt++) {
      const [dx, dy] = DIRS[rnd(0, DIRS.length - 1)];
      const x0 = rnd(0, size - 1), y0 = rnd(0, size - 1);
      const xEnd = x0 + dx * (w.length - 1), yEnd = y0 + dy * (w.length - 1);
      if (xEnd < 0 || xEnd >= size || yEnd < 0 || yEnd >= size) continue;
      const cells: number[] = [];
      let ok = true;
      for (let i = 0; i < w.length; i++) {
        const x = x0 + dx * i, y = y0 + dy * i;
        const c = grid[y][x];
        if (c && c !== w[i]) { ok = false; break; }
        cells.push(y * size + x);
      }
      if (!ok) continue;
      for (let i = 0; i < w.length; i++) grid[Math.floor(cells[i] / size)][cells[i] % size] = w[i];
      placed.push({ w, cells });
      done = true;
    }
  }
  const ABC = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!grid[y][x]) grid[y][x] = ABC[rnd(0, ABC.length - 1)];
  return { grid, placed };
}

export function SopaLetrasGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const level = usePlayerLevel();
  const [seed] = useState(() => SOPA_TEMAS[rnd(0, SOPA_TEMAS.length - 1)]);
  const size = level >= 8 ? 12 : level >= 4 ? 10 : 8;
  const target = Math.min(level >= 8 ? 6 : level >= 4 ? 5 : 4, seed.palabras.length);
  const puzzle = useMemo(() => buildSopa(size, [...seed.palabras].sort(() => Math.random() - 0.5).slice(0, target)), [seed, size, target]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [pick, setPick] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ m: string; ok: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const time = useCountdown(120, found.size < puzzle.placed.length, () => onFinish(score));
  const finishedRef = useRef(false);

  const cellClick = (idx: number) => {
    if (pick === null) { setPick(idx); sfx.tap(); return; }
    const start = pick, end = idx;
    setPick(null);
    if (start === end) return;
    const x1 = start % size, y1 = Math.floor(start / size), x2 = end % size, y2 = Math.floor(end / size);
    const dx = Math.sign(x2 - x1), dy = Math.sign(y2 - y1);
    const len = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) + 1;
    // debe ser recta (misma fila, columna o diagonal)
    if (x2 - x1 !== 0 && y2 - y1 !== 0 && Math.abs(x2 - x1) !== Math.abs(y2 - y1)) { sfx.error(); return; }
    const cells: number[] = [];
    for (let i = 0; i < len; i++) cells.push((y1 + dy * i) * size + (x1 + dx * i));
    const word = cells.map((c) => puzzle.grid[Math.floor(c / size)][c % size]).join("");
    const rev = word.split("").reverse().join("");
    const hit = puzzle.placed.find((p) => !found.has(p.w) && (p.w === word || p.w === rev));
    if (hit) {
      const next = new Set(found); next.add(hit.w);
      setFound(next);
      const gained = 25 + hit.w.length * 2;
      setScore((s) => s + gained);
      sfx.correct();
      setFlash({ m: `✓ ${hit.w} +${gained}`, ok: true });
      if (next.size === puzzle.placed.length) { sfx.sessionWin(); setTimeout(() => { if (!finishedRef.current) { finishedRef.current = true; onFinish(score + gained); } }, 900); }
    } else {
      sfx.wrong(true);
      setFlash({ m: "No está en la lista", ok: false });
    }
    setTimeout(() => setFlash(null), 900);
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} timeLeft={time} timeMax={120} accentVar="--region-bosque">
      <div className="flex h-full flex-col items-center gap-3">
        <FlashMsg msg={flash?.m ?? null} tone={flash?.ok ? "ok" : "ko"} />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tema: {seed.tema} · toca primera y última letra</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {puzzle.placed.map((p) => (
            <span key={p.w} className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", found.has(p.w) ? "bg-primary text-primary-foreground line-through" : "bg-secondary text-secondary-foreground")}>{p.w}</span>
          ))}
        </div>
        <div className="grid touch-none select-none gap-0.5 rounded-2xl border-2 border-border bg-card p-1.5" style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }} role="grid" aria-label="Sopa de letras">
          {puzzle.grid.flatMap((row, y) =>
            row.map((letter, x) => {
              const idx = y * size + x;
              const isPick = pick === idx;
              const inFound = found.size > 0 && puzzle.placed.some((p) => found.has(p.w) && p.cells.includes(idx));
              return (
                <button
                  key={idx}
                  onClick={() => cellClick(idx)}
                  className={cn(
                    "numeric flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-black sm:h-7 sm:w-7 sm:text-xs",
                    inFound ? "bg-primary text-primary-foreground" : isPick ? "bg-amber-400 text-black" : "bg-secondary/60 text-foreground hover:bg-secondary",
                  )}
                  aria-label={`Fila ${y + 1}, columna ${x + 1}: ${letter}`}
                >
                  {letter}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </ArcadePanel>
  );
}

/* ============================ CRUCIGRAMA ============================ */

interface CrossClue { word: string; clue: string }

const CRUCIGRAMA_CLUES: CrossClue[] = [
  { word: "FARO", clue: "Torre que guía a los barcos con su luz" },
  { word: "LIBRO", clue: "Tiene páginas y palabras" },
  { word: "PLAYA", clue: "Arena junto al mar" },
  { word: "NUBE", clue: "Vapor del agua que flota en el cielo" },
  { word: "TINTA", clue: "Líquido con el que escribe el copista" },
  { word: "ISLA", clue: "Tierra rodeada de agua por todas partes" },
  { word: "MUNDO", clue: "El planeta entero" },
  { word: "CIELO", clue: "Lo azul que está sobre nosotros" },
  { word: "PAPEL", clue: "Hoja donde se escribe" },
  { word: "BUHO", clue: "Ave sabia y nocturna, como Léxico" },
  { word: "RATON", clue: "Roedor pequeño… o el amigo del ordenador" },
  { word: "VIENTO", clue: "Aire que se mueve" },
  { word: "NEVERA", clue: "Guarda la comida fría" },
  { word: "MUSEO", clue: "Casa del arte y la historia" },
  { word: "SEMAFORO", clue: "Regula el paso con luces" },
  { word: "MONEDA", clue: "Dinero metálico" },
  { word: "RELOJ", clue: "Marca las horas" },
  { word: "PIANO", clue: "Instrumento de teclas blancas y negras" },
  { word: "TREN", clue: "Viaja sobre raíles" },
  { word: "PINO", clue: "Árbol de piñas" },
  { word: "SOL", clue: "Estrella que nos da calor" },
  { word: "MAR", clue: "Gran extensión de agua salada" },
  { word: "LIBERTAD", clue: "Poder hacer lo que se quiere" },
  { word: "PALABRA", clue: "Unidad de significado del idioma" },
  { word: "ORILLA", clue: "Borde del mar o del río" },
  { word: "NORTE", clue: "Punto cardinal del polo frío" },
];

interface Placed { word: string; clue: string; row: number; col: number; dir: "h" | "v" }

function buildCrossword(clues: CrossClue[]): Placed[] | null {
  const BOARD = 14;
  const occ: Record<string, string> = {};
  const placed: Placed[] = [];
  const set = (r: number, c: number, ch: string) => { occ[`${r}:${c}`] = ch; };
  const get = (r: number, c: number) => occ[`${r}:${c}`];

  const tryPlace = (word: string): boolean => {
    const candidates: { row: number; col: number; dir: "h" | "v" }[] = [];
    if (placed.length === 0) {
      candidates.push({ row: 6, col: 4, dir: "h" });
    } else {
      for (const p of placed) {
        const w = p.word;
        for (let i = 0; i < w.length; i++) {
          for (let j = 0; j < word.length; j++) {
            if (w[i] !== word[j]) continue;
            if (p.dir === "h") candidates.push({ row: p.row - j, col: p.col + i, dir: "v" });
            else candidates.push({ row: p.row + i, col: p.col - j, dir: "h" });
          }
        }
      }
    }
    // Barajar candidatos para variedad
    candidates.sort(() => Math.random() - 0.5);
    for (const cand of candidates) {
      const { row, col, dir } = cand;
      const dr = dir === "v" ? 1 : 0, dc = dir === "h" ? 1 : 0;
      if (row < 0 || col < 0 || row + dr * (word.length - 1) >= BOARD || col + dc * (word.length - 1) >= BOARD) continue;
      // casilla anterior y posterior deben estar vacías
      if (get(row - dr, col - dc) || get(row + dr * word.length, col + dc * word.length)) continue;
      let crosses = 0, ok = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i, c = col + dc * i;
        const ch = get(r, c);
        if (ch) { if (ch !== word[i]) { ok = false; break; } crosses++; }
        else {
          // vecinos perpendiculares vacíos (evita palabras pegadas)
          const pr = dir === "h" ? 1 : 0, pc = dir === "h" ? 0 : 1;
          if (get(r - pr, c - pc) || get(r + pr, c + pc)) { ok = false; break; }
        }
      }
      if (!ok) continue;
      // La palabra semilla no cruza con nadie: solo las siguientes deben cruzar.
      if (crosses === 0 && placed.length > 0) continue;
      for (let i = 0; i < word.length; i++) set(row + dr * i, col + dc * i, word[i]);
      placed.push({ word, clue: "", row, col, dir });
      return true;
    }
    return false;
  };

  const pool = [...clues].sort(() => Math.random() - 0.5);
  for (const { word, clue } of pool) {
    if (placed.length >= clues.length) break;
    if (placed.some((p) => p.word === word)) continue;
    const before = placed.length;
    if (tryPlace(word)) placed[placed.length - 1].clue = clue;
    if (placed.length === before) continue;
  }
  return placed.length >= Math.min(4, clues.length) ? placed : null;
}

export function CrucigramaGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const level = usePlayerLevel();
  const targetWords = level >= 10 ? 7 : level >= 5 ? 6 : 5;
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<{ m: string; ok: boolean } | null>(null);
  const puzzle = useMemo(() => {
    const pool = CRUCIGRAMA_CLUES.filter((c) => c.clue && c.word.length >= 3);
    for (let attempt = 0; attempt < 40; attempt++) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, targetWords + 4);
      const built = buildCrossword(shuffled);
      if (built && built.length >= targetWords - 1) return built;
    }
    return buildCrossword(pool.slice(0, targetWords + 4)) ?? [];
  }, [targetWords]);

  // Bounding box del tablero
  const { rows, cols, offsetR, offsetC } = useMemo(() => {
    if (puzzle.length === 0) return { rows: 1, cols: 1, offsetR: 0, offsetC: 0 };
    const rs = puzzle.flatMap((p) => (p.dir === "v" ? [p.row, p.row + p.word.length - 1] : [p.row]));
    const cs = puzzle.flatMap((p) => (p.dir === "h" ? [p.col, p.col + p.word.length - 1] : [p.col]));
    const minR = Math.min(...rs), maxR = Math.max(...rs), minC = Math.min(...cs), maxC = Math.max(...cs);
    return { rows: maxR - minR + 1, cols: maxC - minC + 1, offsetR: minR, offsetC: minC };
  }, [puzzle]);

  const cellMap = useMemo(() => {
    const m = new Map<string, { ch?: string; words: { pi: number; i: number; dir: "h" | "v" }[] }>();
    puzzle.forEach((p, pi) => {
      for (let i = 0; i < p.word.length; i++) {
        const key = `${(p.dir === "v" ? p.row + i : p.row) - offsetR}:${(p.dir === "h" ? p.col + i : p.col) - offsetC}`;
        const entry = m.get(key) ?? { words: [] };
        entry.words.push({ pi, i, dir: p.dir });
        m.set(key, entry);
      }
    });
    return m;
  }, [puzzle, offsetR, offsetC]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const solvedRef = useRef(false);

  const check = useCallback(() => {
    let correctWords = 0;
    for (const p of puzzle) {
      let all = true;
      for (let i = 0; i < p.word.length; i++) {
        const key = `${(p.dir === "v" ? p.row + i : p.row) - offsetR}:${(p.dir === "h" ? p.col + i : p.col) - offsetC}`;
        if ((answers[key] ?? "").toUpperCase() !== p.word[i]) { all = false; break; }
      }
      if (all) correctWords++;
    }
    if (correctWords === puzzle.length && puzzle.length > 0) {
      sfx.sessionWin();
      const bonus = 30 * puzzle.length;
      setScore((s) => { const ns = s + bonus; return ns; });
      setFlash({ m: `¡Crucigrama completo! +${bonus}`, ok: true });
      setTimeout(() => { if (!solvedRef.current) { solvedRef.current = true; onFinish(30 * puzzle.length); } }, 900);
    } else {
      sfx.wrong(true);
      setFlash({ m: `${correctWords} de ${puzzle.length} palabras correctas`, ok: false });
      setTimeout(() => setFlash(null), 1200);
    }
  }, [answers, puzzle, offsetR, offsetC, onFinish]);

  const revealLetter = () => {
    // Busca la primera casilla vacía o incorrecta de alguna palabra
    for (const p of puzzle) {
      for (let i = 0; i < p.word.length; i++) {
        const key = `${(p.dir === "v" ? p.row + i : p.row) - offsetR}:${(p.dir === "h" ? p.col + i : p.col) - offsetC}`;
        if ((answers[key] ?? "").toUpperCase() !== p.word[i]) {
          const next = { ...answers, [key]: p.word[i] };
          setAnswers(next);
          setScore((s) => Math.max(0, s - 5));
          sfx.sparkle();
          setFlash({ m: `Letra revelada (−5)`, ok: true });
          setTimeout(() => setFlash(null), 800);
          return;
        }
      }
    }
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} accentVar="--region-biblioteca">
      <div className="flex h-full flex-col items-center gap-3 overflow-y-auto scroll-soft">
        <FlashMsg msg={flash?.m ?? null} tone={flash?.ok ? "ok" : "ko"} />
        <div className="grid gap-0.5 rounded-2xl border-2 border-border bg-card p-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }} role="grid" aria-label="Crucigrama">
          {Array.from({ length: rows * cols }, (_, idx) => {
            const r = Math.floor(idx / cols), c = idx % cols;
            const cell = cellMap.get(`${r}:${c}`);
            if (!cell) return <div key={idx} className="h-7 w-7 rounded-md" />;
            const key = `${r}:${c}`;
            const startsWord = cell.words.some(({ pi, i }) => i === 0);
            const n = startsWord ? cell.words.map(({ pi }) => pi + 1).join(",") : "";
            return (
              <input
                key={idx}
                value={answers[key] ?? ""}
                maxLength={1}
                onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value.toUpperCase().slice(-1) }))}
                onKeyDown={(e) => { if (e.key === "Enter") check(); }}
                aria-label={`Casilla fila ${r + 1}, columna ${c + 1}${n ? `, palabra ${n}` : ""}`}
                className={cn(
                  "numeric h-7 w-7 rounded-md border border-border bg-background text-center text-xs font-black uppercase outline-none focus:border-primary sm:h-8 sm:w-8",
                )}
              />
            );
          })}
        </div>
        <div className="w-full max-w-md space-y-1.5">
          {puzzle.map((p, pi) => (
            <p key={pi} className="text-xs text-muted-foreground"><span className="numeric font-black text-foreground">{pi + 1}</span> ({p.dir === "h" ? "→" : "↓"}): {p.clue}</p>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={revealLetter} className="font-bold"><Sparkles className="mr-1.5 h-4 w-4" aria-hidden />Pista (−5)</Button>
          <Button size="sm" onClick={check} className="font-bold"><Eraser className="mr-1.5 h-4 w-4" aria-hidden />Comprobar</Button>
        </div>
      </div>
    </ArcadePanel>
  );
}
