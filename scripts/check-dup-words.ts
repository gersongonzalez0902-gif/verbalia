import { SRS_WORDS_FULL } from "@/data/content";
const words = SRS_WORDS_FULL.map((w) => w.word.toLowerCase());
const dups = words.filter((w, i) => words.indexOf(w) !== i);
const ids = SRS_WORDS_FULL.map((w) => w.id);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log("Total:", SRS_WORDS_FULL.length);
console.log("Palabras duplicadas:", [...new Set(dups)].join(", ") || "ninguna");
console.log("Ids duplicados:", [...new Set(dupIds)].join(", ") || "ninguno");
