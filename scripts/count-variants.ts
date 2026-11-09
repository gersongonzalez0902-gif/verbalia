import { variantPacks } from "../src/data/gen/variants";
const packs = variantPacks();
for (const [k, v] of Object.entries(packs)) console.log(k.padEnd(10), v.length);
