# Verificación total del banco de frases
import re, glob
from collections import Counter
files = ["src/data/frases-a.ts","src/data/frases-b.ts","src/data/frases-c.ts","src/data/frases-d.ts","src/data/frases-e.ts","src/data/frases-f.ts","src/data/frases-g.ts"]
pat = re.compile(r'\{ text: "((?:[^"\\]|\\.)*)", author: "((?:[^"\\]|\\.)*)", tag: "([a-z]+)" \}')
rows = []
for f in files:
    rows += pat.findall(open(f, encoding="utf-8").read())
texts = [r[0] for r in rows]
print("TOTAL FRASES:", len(rows), "| unique:", len(set(texts)))
print("TAGS:", dict(Counter(t for _,_,t in rows)))
