import { variantPacks } from "../src/data/gen/variants";
import { readFileSync, writeFileSync } from "fs";

const path = "src/data/gen/pack-meta.json";
const meta = JSON.parse(readFileSync(path, "utf8"));
const packs = variantPacks();
const section: Record<string, { total: number; byDifficulty: Record<string, number> }> = {};
for (const [game, list] of Object.entries(packs)) {
  const byDifficulty: Record<string, number> = {};
  for (const ex of list) byDifficulty[String(ex.difficulty)] = (byDifficulty[String(ex.difficulty)] ?? 0) + 1;
  section[game] = { total: list.length, byDifficulty };
}
meta["variantes"] = section;
writeFileSync(path, JSON.stringify(meta, null, 2) + "\n");
console.log("variantes añadidas al meta:", Object.entries(section).map(([k, v]) => `${k}:${v.total}`).join(" "));
