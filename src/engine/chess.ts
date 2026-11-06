/**
 * Motor de ajedrez local · VERBALIA
 * ----------------------------------------------------------------
 * Un motor completo que corre entero en el dispositivo: generación de
 * jugadas legales (enroque, al paso, promoción), detección de jaque,
 * mate, tablas y ahogado, y una IA tipo negamax con poda alfa-beta,
 * ordenación de jugadas y tablas de posición. Nada sale del aparato.
 *
 * Diseñado para jugar partidas y para la «revisión de partida»: cada
 * jugada se puede comparar con la mejor del motor y clasificarse.
 * La evaluación está en centipeones desde el punto de vista de las
 * blancas (positivo = ventaja blanca).
 */

/* ============================== tipos ============================== */

export type Color = "w" | "b";
/** Pieza: letra mayúscula = blanca, minúscula = negra. "" = vacío. */
export type Piece = "" | "P" | "N" | "B" | "R" | "Q" | "K" | "p" | "n" | "b" | "r" | "q" | "k";

export interface ChessMove {
  from: number; // 0..63 (a1 = 0, h8 = 63)
  to: number;
  /** Pieza movida (para render rápido). */
  piece: Piece;
  /** Pieza capturada ("" si no hay). */
  captured?: Piece;
  /** Promoción a esta pieza ("Q"/"q"…). */
  promo?: Piece;
  /** Enroque: true si la jugada es enroque. */
  castle?: boolean;
  /** Captura al paso. */
  enPassant?: boolean;
  /** Anotación en dos columnas ("Cf3", "O-O"…), se rellena al aplicarse. */
  san?: string;
}

export interface ChessState {
  /** 64 casillas, índice 0 = a1 … 63 = h8. */
  board: Piece[];
  turn: Color;
  /** Derechos de enroque: K = blancas rey, Q = blancas dama, k/q negras. */
  castling: string;
  /** Casilla de destino al paso (-1 si no procede). */
  ep: number;
  halfmove: number;
  fullmove: number;
}

export type GameStatus =
  | { over: false }
  | { over: true; result: "w" | "b" | "d"; reason: "mate" | "stalemate" | "material" | "fifty" | "repetition" };

/* ============================ utilidades ============================ */

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const fileOf = (sq: number) => sq % 8;
export const rankOf = (sq: number) => Math.floor(sq / 8);
export const sqName = (sq: number) => `${"abcdefgh"[fileOf(sq)]}${rankOf(sq) + 1}`;
export const nameToSq = (n: string) => "abcdefgh".indexOf(n[0]) + (Number(n[1]) - 1) * 8;

export function isWhite(p: Piece): boolean {
  return p !== "" && p === p.toUpperCase();
}
export function colorOf(p: Piece): Color | null {
  if (p === "") return null;
  return isWhite(p) ? "w" : "b";
}

/** FEN → estado. */
export function parseFen(fen: string): ChessState {
  const [pos, turn, castling, ep, half, full] = fen.trim().split(/\s+/);
  const board: Piece[] = new Array(64).fill("");
  let sq = 56; // FEN empieza en a8
  for (const ch of pos) {
    if (ch === "/") sq -= 16;
    else if (/\d/.test(ch)) sq += Number(ch);
    else board[sq++] = ch as Piece;
  }
  return {
    board,
    turn: (turn as Color) ?? "w",
    castling: castling === "-" ? "" : (castling ?? "KQkq"),
    ep: ep && ep !== "-" ? nameToSq(ep) : -1,
    halfmove: Number(half ?? 0),
    fullmove: Number(full ?? 1),
  };
}

/** Estado → FEN (sin contador de repetición). */
export function toFen(s: ChessState): string {
  let pos = "";
  for (let r = 7; r >= 0; r--) {
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const p = s.board[r * 8 + f];
      if (p === "") empty++;
      else {
        if (empty) pos += empty, empty = 0;
        pos += p;
      }
    }
    if (empty) pos += empty;
    if (r > 0) pos += "/";
  }
  return `${pos} ${s.turn} ${s.castling || "-"} ${s.ep >= 0 ? sqName(s.ep) : "-"} ${s.halfmove} ${s.fullmove}`;
}

/* ========================= generación de jugadas ========================= */

/** Direcciones de deslizamiento (deltas fila*8+col). */
const N_DIRS = [17, 15, 10, 6, -6, -10, -15, -17]; // caballo (con wrap check)
const B_DIRS = [9, 7, -7, -9];
const R_DIRS = [8, -8, 1, -1];
const K_DIRS = [...B_DIRS, ...R_DIRS];

const okStep = (from: number, to: number, delta: number) =>
  to >= 0 && to < 64 && Math.abs(fileOf(from) - fileOf(to)) <= Math.abs(delta % 8 === 0 ? 0 : Math.min(Math.abs(delta), 2));

/** Un paso de deslizamiento válido según la dirección (evita el salto de borde). */
function slideStepOk(prev: number, to: number, d: number): boolean {
  if (to < 0 || to >= 64) return false;
  const df = fileOf(to) - fileOf(prev);
  const dr = rankOf(to) - rankOf(prev);
  if (d === 1 || d === -1) return Math.abs(df) === 1 && dr === 0;
  if (d === 8 || d === -8) return df === 0 && Math.abs(dr) === 1;
  return Math.abs(df) === 1 && Math.abs(dr) === 1;
}

/** ¿La casilla está atacada por el color dado? */
export function isAttacked(s: ChessState, sq: number, by: Color): boolean {
  const board = s.board;
  // peones: el peón blanco ataca hacia arriba → está en sq-7 o sq-9
  const pawnDirs = by === "w" ? [-7, -9] : [7, 9];
  for (const d of pawnDirs) {
    const t = sq + d;
    if (t >= 0 && t < 64 && Math.abs(fileOf(sq) - fileOf(t)) === 1) {
      const p = board[t];
      if (p && colorOf(p) === by && p.toLowerCase() === "p") return true;
    }
  }
  // caballo
  for (const d of N_DIRS) {
    const t = sq + d;
    if (t < 0 || t >= 64) continue;
    const df = Math.abs(fileOf(sq) - fileOf(t));
    const dr = Math.abs(rankOf(sq) - rankOf(t));
    if (df + dr !== 3 || df === 0 || dr === 0) continue;
    const p = board[t];
    if (p && colorOf(p) === by && p.toLowerCase() === "n") return true;
  }
  // deslizantes
  for (const pair of [
    [B_DIRS, ["b", "q"]],
    [R_DIRS, ["r", "q"]],
  ] as [number[], string[]][]) {
    const [dirs, kinds] = pair;
    for (const d of dirs) {
      let t = sq + d;
      let prev = sq;
      while (slideStepOk(prev, t, d)) {
        const p = board[t];
        if (p) {
          if (colorOf(p) === by && kinds.includes(p.toLowerCase())) return true;
          break;
        }
        prev = t;
        t += d;
      }
    }
  }
  // rey
  for (const d of K_DIRS) {
    const t = sq + d;
    if (t < 0 || t >= 64) continue;
    const df = Math.abs(fileOf(sq) - fileOf(t));
    const dr = Math.abs(rankOf(sq) - rankOf(t));
    if (df > 1 || dr > 1 || (df === 0 && dr === 0)) continue;
    const p = board[t];
    if (p && colorOf(p) === by && p.toLowerCase() === "k") return true;
  }
  return false;
}

export function kingSquare(s: ChessState, color: Color): number {
  const k = color === "w" ? "K" : "k";
  return s.board.indexOf(k);
}

/** ¿El rey del color está en jaque? */
export function inCheck(s: ChessState, color: Color): boolean {
  const k = kingSquare(s, color);
  return k >= 0 && isAttacked(s, k, color === "w" ? "b" : "w");
}

function pushPawnLike(s: ChessState, from: number, to: number, moves: ChessMove[]) {
  const p = s.board[from];
  const lastRank = isWhite(p) ? 7 : 0;
  if (rankOf(to) === lastRank) {
    for (const promo of (isWhite(p) ? ["Q", "R", "B", "N"] : ["q", "r", "b", "n"]) as Piece[]) {
      moves.push({ from, to, piece: p, captured: s.board[to] || undefined, promo });
    }
  } else {
    moves.push({ from, to, piece: p, captured: s.board[to] || undefined });
  }
}

/** Jugadas pseudo-legales (sin verificar que dejen al rey en jaque). */
export function pseudoMoves(s: ChessState): ChessMove[] {
  const moves: ChessMove[] = [];
  const me = s.turn;
  const board = s.board;

  for (let from = 0; from < 64; from++) {
    const p = board[from];
    if (!p || colorOf(p) !== me) continue;
    const kind = p.toLowerCase();

    if (kind === "p") {
      const dir = isWhite(p) ? 8 : -8;
      const startRank = isWhite(p) ? 1 : 6;
      // avances
      const one = from + dir;
      if (one >= 0 && one < 64 && !board[one]) {
        pushPawnLike(s, from, one, moves);
        const two = from + dir * 2;
        if (rankOf(from) === startRank && !board[two]) moves.push({ from, to: two, piece: p });
      }
      // capturas (incluida al paso)
      for (const dd of [dir - 1, dir + 1]) {
        const to = from + dd;
        if (to < 0 || to >= 64 || Math.abs(fileOf(from) - fileOf(to)) !== 1) continue;
        const target = board[to];
        if (target && colorOf(target) !== me) {
          pushPawnLike(s, from, to, moves);
        } else if (!target && to === s.ep) {
          moves.push({ from, to, piece: p, captured: (isWhite(p) ? "p" : "P") as Piece, enPassant: true });
        }
      }
      continue;
    }

    if (kind === "n" || kind === "k") {
      const dirs = kind === "n" ? N_DIRS : K_DIRS;
      for (const d of dirs) {
        const to = from + d;
        if (to < 0 || to >= 64) continue;
        const df = Math.abs(fileOf(from) - fileOf(to));
        const dr = Math.abs(rankOf(from) - rankOf(to));
        if (kind === "n" ? df + dr !== 3 || df === 0 || dr === 0 : !(df <= 1 && dr <= 1)) continue;
        const target = board[to];
        if (target && colorOf(target) === me) continue;
        moves.push({ from, to, piece: p, captured: target || undefined });
      }
      // enroque (solo rey): e1 = 4, e8 = 60 (a1 = 0, h8 = 63)
      if (kind === "k") {
        const home = isWhite(p) ? 4 : 60;
        if (from === home && !inCheck(s, me)) {
          const kingSide = isWhite(p) ? "K" : "k";
          const queenSide = isWhite(p) ? "Q" : "q";
          if (s.castling.includes(kingSide) && !board[home + 1] && !board[home + 2] &&
            board[home + 3] === (isWhite(p) ? "R" : "r") &&
            !isAttacked(s, home + 1, me === "w" ? "b" : "w") &&
            !isAttacked(s, home + 2, me === "w" ? "b" : "w")) {
            moves.push({ from, to: home + 2, piece: p, castle: true });
          }
          if (s.castling.includes(queenSide) && !board[home - 1] && !board[home - 2] && !board[home - 3] &&
            board[home - 4] === (isWhite(p) ? "R" : "r") &&
            !isAttacked(s, home - 1, me === "w" ? "b" : "w") &&
            !isAttacked(s, home - 2, me === "w" ? "b" : "w")) {
            moves.push({ from, to: home - 2, piece: p, castle: true });
          }
        }
      }
      continue;
    }

    // deslizantes
    const dirs = kind === "b" ? B_DIRS : kind === "r" ? R_DIRS : K_DIRS; // reina = ambas
    for (const d of dirs) {
      let prev = from;
      let to = from + d;
      while (slideStepOk(prev, to, d)) {
        const target = board[to];
        if (target && colorOf(target) === me) break;
        moves.push({ from, to, piece: p, captured: target || undefined });
        if (target) break;
        prev = to;
        to += d;
      }
    }
  }
  return moves;
}

/** Aplica la jugada (sin validar) y devuelve el nuevo estado. */
export function applyMove(s: ChessState, m: ChessMove): ChessState {
  const board = s.board.slice();
  const me = s.turn;
  board[m.from] = "";
  if (m.enPassant) {
    // el peón capturado está detrás del destino
    board[m.to + (me === "w" ? -8 : 8)] = "";
  }
  board[m.to] = m.promo ?? m.piece;
  if (m.castle) {
    const home = me === "w" ? 4 : 60;
    if (m.to > home) {
      board[home + 1] = board[home + 3];
      board[home + 3] = "";
    } else {
      board[home - 1] = board[home - 4];
      board[home - 4] = "";
    }
  }
  // derechos de enroque: torres blancas h1=7 y a1=0; negras h8=63 y a8=56
  let castling = s.castling;
  const dropRight = (c: string) => (castling = castling.replace(c, ""));
  if (m.piece === "K") dropRight("K"), dropRight("Q");
  if (m.piece === "k") dropRight("k"), dropRight("q");
  if (m.from === 7 || m.to === 7) dropRight("K");
  if (m.from === 0 || m.to === 0) dropRight("Q");
  if (m.from === 63 || m.to === 63) dropRight("k");
  if (m.from === 56 || m.to === 56) dropRight("q");

  const nextEp =
    m.piece.toLowerCase() === "p" && Math.abs(rankOf(m.to) - rankOf(m.from)) === 2
      ? (m.from + m.to) / 2
      : -1;

  return {
    board,
    turn: me === "w" ? "b" : "w",
    castling,
    ep: nextEp,
    halfmove: m.piece.toLowerCase() === "p" || m.captured ? 0 : s.halfmove + 1,
    fullmove: me === "b" ? s.fullmove + 1 : s.fullmove,
  };
}

/** Jugadas 100% legales (el rey propio no puede quedar en jaque). */
export function legalMoves(s: ChessState): ChessMove[] {
  const me = s.turn;
  return pseudoMoves(s).filter((m) => !inCheck(applyMove(s, m), me));
}

/** Estado de la partida: mate, ahogado, tablas… `repKeys` = historial FEN. */
export function gameStatus(s: ChessState, repKeys: string[] = []): GameStatus {
  if (legalMoves(s).length === 0) {
    if (inCheck(s, s.turn)) return { over: true, result: s.turn === "w" ? "b" : "w", reason: "mate" };
    return { over: true, result: "d", reason: "stalemate" };
  }
  if (s.halfmove >= 100) return { over: true, result: "d", reason: "fifty" };
  // material insuficiente (reyes solos + alfil/caballo sin peones)
  const pieces = s.board.filter((p) => p && p.toLowerCase() !== "k");
  if (pieces.length === 0 || (pieces.length === 1 && ["n", "b"].includes(pieces[0].toLowerCase()))) {
    return { over: true, result: "d", reason: "material" };
  }
  const key = `${toFen(s).split(" ").slice(0, 4).join(" ")}`;
  if (repKeys.filter((k) => k === key).length >= 3) return { over: true, result: "d", reason: "repetition" };
  return { over: false };
}

/* ============================ notación SAN ============================ */

const PIECE_ES: Record<string, string> = { k: "R", q: "D", r: "T", b: "A", n: "C", p: "" };

/** Anota una jugada en español (estilo SAN: Cf3, Txe5, O-O, e8=D#). */
export function moveToSan(s: ChessState, m: ChessMove, all: ChessMove[]): string {
  if (m.castle) {
    const rookSide = fileOf(m.to) > fileOf(m.from) ? "O-O" : "O-O-O";
    return withSuffix(s, m, rookSide);
  }
  const kind = m.piece.toLowerCase();
  const capture = m.captured ? "x" : "";
  let core: string;
  if (kind === "p") {
    core = capture ? `${"abcdefgh"[fileOf(m.from)]}${capture}${sqName(m.to)}` : sqName(m.to);
    if (m.promo) core += `=${PIECE_ES[m.promo.toLowerCase()]}`;
  } else {
    // desambiguación: si otra pieza igual puede ir a la misma casilla
    const sameKind = all.filter((o) => o.piece === m.piece && o.to === m.to && o.from !== m.from);
    let disamb = "";
    if (sameKind.length > 0) {
      const sameFile = sameKind.some((o) => fileOf(o.from) === fileOf(m.from));
      const sameRank = sameKind.some((o) => rankOf(o.from) === rankOf(m.from));
      if (!sameFile) disamb = "abcdefgh"[fileOf(m.from)];
      else if (!sameRank) disamb = String(rankOf(m.from) + 1);
      else disamb = sqName(m.from);
    }
    core = `${PIECE_ES[kind]}${disamb}${capture}${sqName(m.to)}`;
  }
  return withSuffix(s, m, core);
}

function withSuffix(s: ChessState, m: ChessMove, core: string): string {
  const next = applyMove(s, m);
  if (inCheck(next, next.turn)) {
    return legalMoves(next).length === 0 ? `${core}#` : `${core}+`;
  }
  return core;
}

/* ============================ evaluación ============================ */

const VAL: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

/** Tablas de posición (perspectiva blanca, índice 0 = a1). */
const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
      0,  0,  0,  0,  0,  0,  0,  0,
      5, 10, 10, 10, 10, 10, 10,  5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
     -5,  0,  0,  0,  0,  0,  0, -5,
      0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
  // rey en final (menos filas de peones): se anima a acercarse al centro
  kEnd: [
    -50,-40,-30,-20,-20,-30,-40,-50,
    -30,-20,-10,  0,  0,-10,-20,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-30,  0,  0,  0,  0,-30,-30,
    -50,-30,-30,-30,-30,-30,-30,-50,
  ],
};

/** Evaluación estática en centipeones (positivo = blancas mejor). */
export function evaluate(s: ChessState): number {
  let score = 0;
  let material = 0;
  const pieces: { p: Piece; sq: number }[] = [];
  for (let sq = 0; sq < 64; sq++) {
    const p = s.board[sq];
    if (!p) continue;
    pieces.push({ p, sq });
    if (p.toLowerCase() !== "k") material += VAL[p.toLowerCase()];
  }
  const endgame = material < 1800;
  for (const { p, sq } of pieces) {
    const kind = p.toLowerCase();
    const white = isWhite(p);
    // espejo para negras: fila invertida
    const idx = white ? sq : (7 - rankOf(sq)) * 8 + fileOf(sq);
    const table = kind === "k" && endgame ? PST.kEnd : PST[kind];
    const v = VAL[kind] + table[idx];
    score += white ? v : -v;
  }
  // pequeño bono por turno
  score += s.turn === "w" ? 12 : -12;
  return score;
}

/* ============================== la IA ============================== */

export interface EngineResult {
  move: ChessMove | null;
  /** Evaluación de la mejor línea en centipeones (perspectiva blancas). */
  score: number;
  /** Nodos explorados (para presumir en la UI). */
  nodes: number;
}

function orderMoves(moves: ChessMove[]): ChessMove[] {
  return moves
    .map((m) => ({
      m,
      s:
        (m.captured ? 10 * VAL[m.captured.toLowerCase()] - VAL[m.piece.toLowerCase()] : 0) +
        (m.promo ? VAL[m.promo.toLowerCase()] : 0) +
        (m.castle ? 60 : 0),
    }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.m);
}

let nodeCount = 0;

function negamax(s: ChessState, depth: number, alpha: number, beta: number): number {
  nodeCount++;
  const moves = legalMoves(s);
  if (moves.length === 0) {
    // mate o ahogado, desde el punto de vista del que mueve
    return inCheck(s, s.turn) ? -100000 - depth * 10 : 0;
  }
  if (depth === 0) {
    const e = evaluate(s);
    return s.turn === "w" ? e : -e;
  }
  let best = -Infinity;
  for (const m of orderMoves(moves)) {
    const score = -negamax(applyMove(s, m), depth - 1, -beta, -alpha);
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break; // poda
  }
  return best;
}

/**
 * Elige la mejor jugada para el turno actual.
 * `depth` 1-4 (aprendiz=1, cronista=2, farero=3, capitán=4).
 */
export function bestMove(s: ChessState, depth = 3): EngineResult {
  nodeCount = 0;
  const moves = orderMoves(legalMoves(s));
  if (moves.length === 0) return { move: null, score: 0, nodes: 0 };
  let best: ChessMove = moves[0];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  for (const m of moves) {
    const score = -negamax(applyMove(s, m), depth - 1, -Infinity, -alpha);
    // desafinación leve para no repetir siempre la misma partida
    const jitter = (Math.random() - 0.5) * 8;
    const finalScore = score + jitter;
    if (finalScore > bestScore) {
      bestScore = finalScore;
      best = m;
    }
    if (finalScore > alpha) alpha = finalScore;
  }
  const evalWhite = s.turn === "w" ? bestScore : -bestScore;
  return { move: best, score: evalWhite, nodes: nodeCount };
}

/** Evaluación de una posición concreta para la revisión (rápida). */
export function quickEval(s: ChessState, depth = 2): number {
  const e = negamax(s, depth, -Infinity, Infinity);
  return s.turn === "w" ? e : -e;
}

/* ==================== revisión de partida ==================== */

export type MoveGrade = "brillante" | "optima" | "buena" | "dudosa" | "error" | "desastre";

export interface ReviewStep {
  move: ChessMove;
  san: string;
  /** Evaluación antes de la jugada (perspectiva de quien mueve). */
  evalBefore: number;
  /** Evaluación tras la mejor jugada posible. */
  evalBest: number;
  /** Evaluación tras la jugada realizada. */
  evalAfter: number;
  grade: MoveGrade;
  comment: string;
}

const GRADE_ES: Record<MoveGrade, string> = {
  brillante: "¡Jugada brillante!",
  optima: "La mejor jugada del motor.",
  buena: "Jugada sólida.",
  dudosa: "Imprecisión: había algo mejor.",
  error: "Error: la ventaja cambia de bando.",
  desastre: "Desastre: se escapó la partida.",
};

/** Clasifica la pérdida de centipeones de una jugada. */
function gradeFor(loss: number, isCaptureRecapture: boolean): { grade: MoveGrade; comment: string } {
  if (loss <= 15) return { grade: "optima", comment: GRADE_ES.optima };
  if (loss <= 60) return { grade: "buena", comment: GRADE_ES.buena };
  if (loss <= 150) return { grade: "dudosa", comment: GRADE_ES.dudosa };
  if (loss <= 320) return { grade: "error", comment: GRADE_ES.error };
  return { grade: "desastre", comment: GRADE_ES.desastre };
}

export interface ReviewOptions {
  /** Profundidad del motor al revisar (por defecto 2, rápido). */
  depth?: number;
  onProgress?: (done: number, total: number) => void;
}

/**
 * Revisa una partida completa jugada a jugada: compara cada jugada
 * humana con la mejor línea del motor y produce anotaciones.
 * Se ejecuta por trozos (async) para no congelar la interfaz.
 */
export async function reviewGame(
  moves: ChessMove[],
  options: ReviewOptions = {},
): Promise<{ steps: ReviewStep[]; accuracy: { w: number; b: number } }> {
  const depth = options.depth ?? 2;
  const steps: ReviewStep[] = [];
  let s = parseFen(START_FEN);
  let sumW = 0;
  let nW = 0;
  let sumB = 0;
  let nB = 0;

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    const all = legalMoves(s);
    const played = all.find((o) => o.from === m.from && o.to === m.to && (o.promo ?? "") === (m.promo ?? ""));
    const engine = bestMove(s, depth);
    const san = played ? moveToSan(s, played, all) : `${m.piece}${sqName(m.from)}${sqName(m.to)}`;

    // perspectiva de quien mueve: más alto = mejor para él
    const evalBefore = engine.score; // mejor para el que mueve (perspectiva blanca cruda)
    const moverIsWhite = s.turn === "w";
    const beforeForMover = moverIsWhite ? evalBefore : -evalBefore;

    const afterState = applyMove(s, played ?? m);
    const replyEngine = bestMove(afterState, depth);
    const afterForMover = -(replyEngine.score === 0 && !replyEngine.move
      ? (evaluate(afterState) * (moverIsWhite ? 1 : -1))
      : (moverIsWhite ? replyEngine.score : -replyEngine.score));

    const loss = Math.max(0, beforeForMover - afterForMover);
    const { grade, comment } = played ? gradeFor(loss, Boolean(played.captured)) : { grade: "dudosa" as MoveGrade, comment: "Jugada no encontrada." };
    steps.push({ move: played ?? m, san, evalBefore: beforeForMover, evalBest: beforeForMover, evalAfter: afterForMover, grade, comment });

    const acc = Math.max(0, 100 - loss / 6);
    if (moverIsWhite) { sumW += acc; nW++; } else { sumB += acc; nB++; }

    s = afterState;
    if (options.onProgress && i % 4 === 0) {
      options.onProgress(i + 1, moves.length);
      await new Promise((r) => setTimeout(r, 0)); // respira para pintar la UI
    }
  }

  return {
    steps,
    accuracy: {
      w: nW ? Math.round(sumW / nW) : 100,
      b: nB ? Math.round(sumB / nB) : 100,
    },
  };
}
