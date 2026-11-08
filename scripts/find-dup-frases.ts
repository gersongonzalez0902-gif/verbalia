/** Encuentra frases duplicadas (mismo texto) entre los bancos a-e. */
import { FRASES_A } from "../src/data/frases-a";
import { FRASES_B } from "../src/data/frases-b";
import { FRASES_C } from "../src/data/frases-c";
import { FRASES_D } from "../src/data/frases-d";
import { FRASES_E } from "../src/data/frases-e";

const banks: [string, typeof FRASES_A][] = [
  ["a", FRASES_A], ["b", FRASES_B], ["c", FRASES_C], ["d", FRASES_D], ["e", FRASES_E],
];

const seen = new Map<string, { bank: string; id: string }>();
for (const [bank, list] of banks) {
  for (const f of list) {
    const key = f.text.trim().toLowerCase();
    const prev = seen.get(key);
    if (prev) {
      console.log(`DUP  ${prev.bank}:${prev.id}  <->  ${bank}:${f.id}`);
      console.log(`     "${f.text}"`);
    } else {
      seen.set(key, { bank, id: f.id });
    }
  }
}
const total = banks.reduce((n, [, l]) => n + l.length, 0);
console.log(`\ntotal=${total} unique=${seen.size} dups=${total - seen.size}`);
