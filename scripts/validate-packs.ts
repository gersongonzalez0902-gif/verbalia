import { ALL_EXERCISES, EXERCISES_BY_GAME } from "/home/z/my-project/src/data/content";
import { SRS_WORDS } from "/home/z/my-project/src/data/words-srs";

// 1) duplicate ids
const ids = new Set<string>();
let dup = 0;
for (const e of ALL_EXERCISES) {
  if (ids.has(e.id)) { console.log("DUP ID:", e.id, e.type); dup++; }
  ids.add(e.id);
}
console.log("total exercises:", ALL_EXERCISES.length, "| dup:", dup, "| words:", SRS_WORDS.length);

// 2) per new pack: counts + structural checks
const checks: [string, (e: any) => string | null][] = [
  ["intruso", (e) => {
    if (e.options.length !== 4) return "options != 4";
    if (e.answerIndex < 0 || e.answerIndex > 3) return "bad answerIndex";
    if (e.options.some((o: string) => !o)) return "empty option";
    return null;
  }],
  ["sortea", (e) => {
    if (e.buckets.length < 2) return "buckets < 2";
    if (e.answerIndex >= e.buckets.length) return "answerIndex >= buckets";
    if (!e.statement) return "no statement";
    return null;
  }],
  ["vf", (e) => (typeof e.answer === "boolean" ? null : "no answer bool")],
  ["escribe", (e) => (!e.word || !e.clue ? "missing word/clue" : null)],
  ["oye", (e) => {
    if (e.wrongs.length < 2) return "wrongs < 2";
    if (e.wrongs.includes(e.word)) return "correct among wrongs";
    return null;
  }],
  ["conecta", (e) => {
    if (e.pairs.length < 4) return "pairs < 4";
    const rights = e.pairs.map((p: any) => p.right);
    if (new Set(rights).size !== rights.length) return "duplicate right";
    const lefts = e.pairs.map((p: any) => p.left);
    if (new Set(lefts).size !== lefts.length) return "duplicate left";
    return null;
  }],
  ["memoria", (e) => {
    if (e.pairs.length < 4) return "pairs < 4";
    const flat = [...e.pairs.map((p: any) => p.left), ...e.pairs.map((p: any) => p.right)];
    if (new Set(flat).size !== flat.length) return "duplicate card";
    return null;
  }],
];

for (const [prefix, fn] of checks) {
  const games = Object.keys(EXERCISES_BY_GAME).filter((g) => g.includes(prefix));
  for (const g of games) {
    const list = EXERCISES_BY_GAME[g];
    let bad = 0;
    for (const e of list) { const err = fn(e); if (err) { console.log(`${g}: ${err} in ${e.id}`); bad++; } }
    console.log(`${g}: ${list.length} items${bad ? ` ⚠️ ${bad} bad` : " ✓"}`);
  }
}
