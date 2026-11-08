import re, glob
files = ["src/data/words-srs.ts", "src/data/words-srs-b.ts", "src/data/gen/words-srs-c1.ts", "src/data/gen/words-srs-d1.ts", "src/data/gen/words-srs-e1.ts", "src/data/gen/words-srs-x.ts"]
seen_words = {}
seen_ids = {}
dups = 0
for f in files:
    src = open(f, encoding="utf-8").read()
    for m in re.finditer(r'\{ id: "([^"]+)", word: "([^"]+)"', src):
        wid, w = m.group(1), m.group(2).lower()
        if w in seen_words:
            print(f"DUP WORD: {w} -> {wid} ({f}) vs {seen_words[w]}")
            dups += 1
        seen_words[w] = f"{wid} ({f})"
        if wid in seen_ids:
            print(f"DUP ID: {wid} in {f}")
            dups += 1
        seen_ids[wid] = f
print(f"\nTotal unique words: {len(seen_words)}, unique ids: {len(seen_ids)}, dups: {dups}")
