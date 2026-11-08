import re, os, glob
# Check all hand-written packs in src/data (excluding mega8 & words)
files = glob.glob("src/data/*.ts") + glob.glob("src/data/gen/*.ts") + glob.glob("src/data/formats/*.ts")
files = [f for f in files if "words-srs" not in f]
grand = 0
for f in sorted(files):
    src = open(f, encoding="utf-8").read()
    # find stems/quotes/sentences/word fields within objects
    stems = re.findall(r'(?:stem|sentence|quote|word|frase|texto|title): "((?:[^"\\]|\\.)*)"', src)
    if len(stems) < 20: continue
    u = len(set(stems))
    if len(stems) != u:
        # only report if significant
        d = len(stems) - u
        if d > 2:
            print(f"{f}: {len(stems)} fields, {u} unique -> {d} dup")
            grand += d
print("TOTAL:", grand)
