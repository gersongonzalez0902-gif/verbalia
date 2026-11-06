/**
 * Verificación perft del motor de ajedrez + smoke test de damas.
 * Perft cuenta todas las posiciones legales a una profundidad dada:
 * los valores correctos desde la posición inicial son canónicos.
 */
import { legalMoves, applyMove, parseFen, START_FEN, gameStatus } from "@/engine/chess";
import { initialBoard, legalDraughtsMoves, draughtsStatus } from "@/engine/checkers";

function perft(state: ReturnType<typeof parseFen>, depth: number): number {
  if (depth === 0) return 1;
  const moves = legalMoves(state);
  if (depth === 1) return moves.length;
  let nodes = 0;
  for (const m of moves) nodes += perft(applyMove(state, m), depth - 1);
  return nodes;
}

const start = parseFen(START_FEN);
console.log("Perft 1:", perft(start, 1), "(esperado 20)");
console.log("Perft 2:", perft(start, 2), "(esperado 400)");
console.log("Perft 3:", perft(start, 3), "(esperado 8902)");

// Posición Kiwipete (canónica): dama en f3, peón negro en h3
const kiwi = parseFen("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
console.log("Kiwipete perft 1:", perft(kiwi, 1), "(esperado 48)");
console.log("Kiwipete perft 2:", perft(kiwi, 2), "(esperado 2039)");

// Posición con al paso: pos3 estándar
const ep = parseFen("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1");
console.log("Pos3 perft 1:", perft(ep, 1), "(esperado 14)");
console.log("Pos3 perft 2:", perft(ep, 2), "(esperado 191)");
console.log("Pos3 perft 3:", perft(ep, 3), "(esperado 2812)");

// Mate en 1: torre a la octava
const mate1 = parseFen("6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1");
const st1 = gameStatus(applyMove(mate1, { from: 0, to: 56, piece: "R" }));
console.log("Mate en 1 (Ra8#):", JSON.stringify(st1), '(esperado mate, result "b" gana... blancas dan mate)');

// Ahogado
const stale = parseFen("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
console.log("Ahogado:", JSON.stringify(gameStatus(stale)), '(esperado stalemate/tablas)');


// Damas: 7 jugadas iniciales de las negras... (las negras mueven primero en damas)
const b = initialBoard();
const dmoves = legalDraughtsMoves(b, "b");
console.log("Damas: jugadas iniciales de negras:", dmoves.length, "(esperado 7)");
console.log("Damas status inicial:", JSON.stringify(draughtsStatus(b, "w")));
