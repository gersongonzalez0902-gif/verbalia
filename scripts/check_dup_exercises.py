import re, json, os
# Check mega8 pools for duplicate prompts (by question text) per game
sizes = json.load(open("src/data/gen/mega8/sizes.json"))
base = "src/data/gen/mega8"
for f in os.listdir(base):
    if not f.endswith(".ts"): continue
    src = open(os.path.join(base, f), encoding="utf-8").read()
    # count prompts: prompt: "..." or prompt: `...`
    prompts = re.findall(r'prompt: "((?:[^"\\]|\\.)*)"', src)
    if not prompts: continue
    uniq = set(prompts)
    if len(prompts) != len(uniq):
        print(f"{f}: {len(prompts)} prompts, {len(uniq)} unique -> {len(prompts)-len(uniq)} DUPES")
    else:
        print(f"{f}: {len(prompts)} prompts, all unique")
