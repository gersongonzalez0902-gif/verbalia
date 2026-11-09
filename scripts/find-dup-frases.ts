/** Encuentra frases duplicadas (mismo texto) entre todos los bancos. */
import { FRASES_A } from "../src/data/frases-a";
import { FRASES_B } from "../src/data/frases-b";
import { FRASES_C } from "../src/data/frases-c";
import { FRASES_D } from "../src/data/frases-d";
import { FRASES_E } from "../src/data/frases-e";
import { FRASES_F } from "../src/data/frases-f";

const banks: [string, typeof FRASES_A][] = [
  ["a", FRASES_A], ["b", FRASES_B], ["c", FRASES_C], ["d", FRASES_D], ["e", FRASES_E], ["f", FRASES_F],
];

const seen = new Set<string>();
let dups = 0;
for (const [bank, list] of banks) {
  for (const f of list) {
    const key = f.text.trim().toLowerCase();
    if (seen.has(key)) {
      dups++;
      console.log(`DUP  ${bank}  "${f.text}"`);
    } else {
      seen.add(key);
    }
  }
}
const total = banks.reduce((n, [, l]) => n + l.length, 0);
console.log(`Total frases: ${total} · duplicadas: ${dups}`);
process.exit(dups === 0 ? 0 : 1);
