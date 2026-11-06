/**
 * Damas españolas · VERBALIA
 * ----------------------------------------------------------------
 * Tablero 8×8, 12 fichas por bando. Reglas del juego clásico:
 * - Las peonas mueven en diagonal hacia delante.
 * - La captura es obligatoria (hacia delante y hacia detrás).
 * - Las capturas se encadenan: si tras comer se puede seguir comiendo, se sigue.
 * - La dama (coronada) vuela: se mueve y captura a cualquier distancia.
 * - Gana quien captura todas las fichas rivales o lo deja sin movimientos.
 * La IA usa minimax con poda alfa-beta a 3 jugadas de profundidad.
 */

export type Cell = 0 | 1 | 2 | 3 | 4;
// 0 vacío · 1 peón blanco · 2 dama blanca · 3 peón negro · 4 dama negra
export type Board = Cell[];

export interface DraughtsMove {
  /** Casillas recorridas: origen, intermedias…, destino. */
  path: number[];
  /** Casillas de las fichas capturadas. */
  captured: number[];
  /** La ficha corona al final del camino. */
  crowns: boolean;
}

export type Player = "w" | "b";

export const isWhitePiece = (c: Cell) => c === 1 || c === 2;
export const isDama = (c: Cell) => c === 2 || c === 4;
export const ownerOf = (c: Cell): Player | null =>
  c === 0 ? null : isWhitePiece(c) ? "w" : "b";

export const DIAGS = [-9, -7, 7, 9];

const fileOf = (sq: number) => (sq % 8 + 8) % 8;

/** ¿Las dos casillas son vecinas diagonales? */
const isDiagStep = (from: number, to: number): boolean => {
  const df = Math.abs(fileOf(from) - fileOf(to));
  const dr = Math.abs(Math.floor(from / 8) - Math.floor(to / 8));
  return df === dr && dr > 0;
};

const stepTo = (sq: number, d: number, n: number): number => {
  let cur = sq;
  for (let i = 0; i < n; i++) {
    const prev = cur;
    cur += d;
    if (cur < 0 || cur > 63) return -1;
    if (!isDiagStep(prev, cur)) return -1;
  }
  return cur;
};

/** Posición inicial: peones en las casillas oscuras de sus tres filas. */
export function initialBoard(): Board {
  const b: Board = new Array(64).fill(0);
  for (let sq = 0; sq < 64; sq++) {
    const dark = (Math.floor(sq / 8) + fileOf(sq)) % 2 === 1;
    if (!dark) continue;
    if (sq < 24) b[sq] = 3; // negras arriba
    else if (sq >= 40) b[sq] = 1; // blancas abajo
  }
  return b;
}

/**
 * Todas las capturas posibles de una ficha (busca cadenas completas).
 * Devuelve movimientos con la cadena entera (captura múltiple obligatoria).
 */
function capturesFrom(board: Board, sq: number): DraughtsMove[] {
  const piece = board[sq];
  if (piece === 0) return [];
  const white = isWhitePiece(piece);
  const dama = isDama(piece);
  const results: DraughtsMove[] = [];

  const walk = (b: Board, from: number, path: number[], captured: number[]) => {
    let extended = false;
    for (const d of DIAGS) {
      // distancia al enemigo: peón salta 1, dama vuela N
      const maxHop = dama ? 6 : 1;
      for (let n = 1; n <= maxHop; n++) {
        const enemy = stepTo(from, d, n);
        if (enemy < 0) break;
        if (b[enemy] === 0) continue; // sigue buscando enemigo más lejos
        if (ownerOf(b[enemy]) === (white ? "b" : "w")) {
          // casilla de aterrizaje (las siguientes vacías si es dama)
          const maxLand = dama ? 6 : 1;
          for (let m = 1; m <= maxLand; m++) {
            const land = stepTo(enemy, d, m);
            if (land < 0) break;
            if (b[land] !== 0) break;
            // simula la captura y sigue la cadena
            const nb = b.slice();
            nb[enemy] = 0;
            nb[from] = 0;
            nb[land] = piece;
            const newPath = [...path, land];
            const newCaptured = [...captured, enemy];
            extended = true;
            walk(nb, land, newPath, newCaptured);
            if (!dama) break; // el peón solo aterriza justo detrás
          }
        }
        break; // hay una ficha en el camino: no se salta sin capturar
      }
    }
    if (!extended && captured.length > 0) {
      // fin de cadena: ¿corona?
      const last = path[path.length - 1];
      const crowns = !dama && (white ? last >= 56 : last <= 7);
      results.push({ path, captured, crowns });
    }
  };

  walk(board, sq, [sq], []);
  return results;
}

/** Movimientos simples (sin captura) de una ficha. */
function slidesFrom(board: Board, sq: number): DraughtsMove[] {
  const piece = board[sq];
  if (piece === 0) return [];
  const white = isWhitePiece(piece);
  const dama = isDama(piece);
  const dirs = dama ? DIAGS : white ? [-9, -7] : [7, 9];
  const results: DraughtsMove[] = [];
  for (const d of dirs) {
    const max = dama ? 7 : 1;
    for (let n = 1; n <= max; n++) {
      const to = stepTo(sq, d, n);
      if (to < 0 || board[to] !== 0) break;
      const crowns = !dama && (white ? to >= 56 : to <= 7);
      results.push({ path: [sq, to], captured: [], crowns });
    }
  }
  return results;
}

/** Jugadas legales del jugador: si hay capturas, SOLO capturas (obligatorias). */
export function legalDraughtsMoves(board: Board, player: Player): DraughtsMove[] {
  const caps: DraughtsMove[] = [];
  const slides: DraughtsMove[] = [];
  for (let sq = 0; sq < 64; sq++) {
    if (ownerOf(board[sq]) !== player) continue;
    caps.push(...capturesFrom(board, sq));
  }
  if (caps.length > 0) {
    // ley de cantidad: en damas españolas no es obligatorio el máximo,
    // pero toda captura disponible obliga a capturar.
    return caps;
  }
  for (let sq = 0; sq < 64; sq++) {
    if (ownerOf(board[sq]) !== player) continue;
    slides.push(...slidesFrom(board, sq));
  }
  return slides;
}

/** Aplica un movimiento y devuelve el nuevo tablero. */
export function applyDraughtsMove(board: Board, m: DraughtsMove): Board {
  const b = board.slice();
  const piece = b[m.path[0]];
  b[m.path[0]] = 0;
  for (const c of m.captured) b[c] = 0;
  const last = m.path[m.path.length - 1];
  b[last] = m.crowns ? (isWhitePiece(piece) ? 2 : 4) : piece;
  return b;
}

export type DraughtsStatus =
  | { over: false }
  | { over: true; winner: Player | null; reason: "sin-fichas" | "bloqueado" };

export function draughtsStatus(board: Board, turn: Player): DraughtsStatus {
  let w = 0;
  let b = 0;
  for (const c of board) {
    if (c === 1 || c === 2) w++;
    else if (c === 3 || c === 4) b++;
  }
  if (w === 0) return { over: true, winner: "b", reason: "sin-fichas" };
  if (b === 0) return { over: true, winner: "w", reason: "sin-fichas" };
  if (legalDraughtsMoves(board, turn).length === 0) {
    return { over: true, winner: turn === "w" ? "b" : "w", reason: "bloqueado" };
  }
  return { over: false };
}

/* ============================== IA ============================== */

/** Evaluación: material (dama vale doble) + avance + centro. */
function evalBoard(board: Board): number {
  let score = 0;
  for (let sq = 0; sq < 64; sq++) {
    const c = board[sq];
    if (c === 0) continue;
    const white = isWhitePiece(c);
    const base = c === 2 ? 260 : c === 4 ? 260 : 100;
    const rank = Math.floor(sq / 8);
    const advance = white ? 7 - rank : rank; // más lejos del inicio, mejor
    const center = 3 - Math.min(Math.abs(fileOf(sq) - 3.5), Math.abs(rank - 3.5));
    const v = base + advance * 6 + center * 4;
    score += white ? v : -v;
  }
  return score;
}

function orderD(moves: DraughtsMove[]): DraughtsMove[] {
  return moves.slice().sort((a, b) => b.captured.length - a.captured.length);
}

function minimaxD(board: Board, turn: Player, depth: number, alpha: number, beta: number): number {
  const status = draughtsStatus(board, turn);
  if (status.over) {
    if (status.winner === null) return 0;
    const big = 100000 + depth * 100;
    return status.winner === "w" ? big : -big;
  }
  if (depth === 0) return evalBoard(board);
  const moves = orderD(legalDraughtsMoves(board, turn));
  const maximizing = turn === "w";
  let best = maximizing ? -Infinity : Infinity;
  for (const m of moves) {
    const score = minimaxD(applyDraughtsMove(board, m), turn === "w" ? "b" : "w", depth - 1, alpha, beta);
    if (maximizing) {
      if (score > best) best = score;
      if (best > alpha) alpha = best;
    } else {
      if (score < best) best = score;
      if (best < beta) beta = best;
    }
    if (alpha >= beta) break;
  }
  return best;
}

/** Mejor jugada para el turno dado (blancas = jugador humano). */
export function bestDraughtsMove(board: Board, turn: Player, depth = 3): DraughtsMove | null {
  const moves = orderD(legalDraughtsMoves(board, turn));
  if (moves.length === 0) return null;
  const maximizing = turn === "w";
  let best = moves[0];
  let bestScore = maximizing ? -Infinity : Infinity;
  let alpha = -Infinity;
  let beta = Infinity;
  for (const m of moves) {
    const score = minimaxD(applyDraughtsMove(board, m), turn === "w" ? "b" : "w", depth - 1, alpha, beta);
    const jitter = (Math.random() - 0.5) * 6;
    if (maximizing ? score + jitter > bestScore : score - jitter < bestScore) {
      bestScore = maximizing ? score + jitter : score - jitter;
      best = m;
    }
    if (maximizing && bestScore > alpha) alpha = bestScore;
    if (!maximizing && bestScore < beta) beta = bestScore;
  }
  return best;
}

/** Notación simple para el historial: «c3×e5×g7» o «d2-e3». */
export function draughtsName(m: DraughtsMove): string {
  const n = (sq: number) => `${"abcdefgh"[fileOf(sq)]}${Math.floor(sq / 8) + 1}`;
  const sep = m.captured.length > 0 ? "×" : "-";
  return m.path.map(n).join(sep);
}
