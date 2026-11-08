/** Verifica los totales de todos los juegos (piso: 500 ejercicios). */
import { EXERCISES_BY_GAME, ALL_EXERCISES } from "../src/data/content";
import { totalPoolOf } from "../src/data/pool-loader";

const games = Object.keys(EXERCISES_BY_GAME);
const rows = games.map((g) => ({ game: g, total: totalPoolOf(g) }));
const total = rows.reduce((n, r) => n + r.total, 0);
const below = rows.filter((r) => r.total < 500).sort((a, b) => a.total - b.total);
console.log(`ALL_EXERCISES (estáticos): ${ALL_EXERCISES.length}`);
console.log(`Juegos estáticos: ${games.length}`);
console.log(`Total con mega8: ${total}`);
console.log(`\nJuegos por debajo de 500: ${below.length}`);
for (const r of below.slice(0, 15)) console.log(`  ${r.game}: ${r.total}`);
if (!below.length) console.log("  ✓ ninguno: todos los minijuegos tienen ≥500 ejercicios");
