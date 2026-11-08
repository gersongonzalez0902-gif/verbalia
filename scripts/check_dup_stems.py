import re, os
from collections import defaultdict
base = "src/data/gen/mega8"
total_dups = 0
for f in sorted(os.listdir(base)):
    if not f.endswith(".ts"): continue
    src = open(os.path.join(base, f), encoding="utf-8").read()
    # split by game blocks: export const M8_X: Exercise[] = [ ... ]
    blocks = re.findall(r'export const (M8_[A-Z_0-9]+): Exercise\[\] = \[(.*?)\n\];', src, re.S)
    for name, body in blocks:
        stems = re.findall(r'stem: "((?:[^"\\]|\\.)*)"', body)
        ids = re.findall(r'id: "([^"]+)"', body)
        us = len(set(stems)); ui = len(set(ids))
        dup_s = len(stems) - us; dup_i = len(ids) - ui
        if dup_s or dup_i:
            print(f"{f} · {name}: {len(stems)} stems ({us} uniq, {dup_s} dup) · {len(ids)} ids ({ui} uniq, {dup_i} dup)")
            total_dups += dup_s + dup_i
print("TOTAL DUPLICATES:", total_dups)
