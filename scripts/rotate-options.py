#!/usr/bin/env python3
"""Rota las opciones de los packs nuevos (sprint, matices) para que
la posición de la respuesta correcta no sea siempre la primera.
Rotación determinista: el desplazamiento depende del id del ejercicio."""
import re, sys

def rotate(path, prefix):
    src = open(path).read()
    out = []
    pos = 0
    changed = 0
    pattern = re.compile(
        r'(\{ id: "(' + prefix + r'-\d+)"[^}]*?options: )(\[[^\]]+\])(,\s*\n\s*answerIndex: )(\d+)(,)',
        re.S,
    )
    def repl(m):
        nonlocal changed
        head, ex_id, opts_str, mid, ans_idx, tail = m.groups()
        opts = re.findall(r'"([^"]*)"', opts_str)
        ans = int(ans_idx)
        correct = opts[ans]
        shift = (sum(ord(c) for c in ex_id)) % len(opts)
        new_opts = opts[-shift:] + opts[:-shift] if shift else opts
        new_ans = new_opts.index(correct)
        changed += 1
        return f"{head}[{', '.join(chr(34)+o+chr(34) for o in new_opts)}]{mid}{new_ans},"
    new_src = pattern.sub(repl, src)
    open(path, "w").write(new_src)
    print(f"{path}: {changed} ejercicios rotados")

rotate("src/data/sprint.ts", "sp")
rotate("src/data/matices.ts", "ma")
