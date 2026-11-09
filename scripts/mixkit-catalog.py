#!/usr/bin/env python3
"""Explora catálogos de Mixkit (SFX y música) y lista id→título."""
import re, sys, urllib.request

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}
CATS = sys.argv[1:] or [
    "https://mixkit.co/free-sound-effects/game/",
    "https://mixkit.co/free-sound-effects/notification/",
    "https://mixkit.co/free-sound-effects/cartoon/",
    "https://mixkit.co/free-sound-effects/bell/",
    "https://mixkit.co/free-sound-effects/click/",
    "https://mixkit.co/free-sound-effects/glitch/",
]

def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "ignore")

for cat in CATS:
    try:
        html = fetch(cat)
    except Exception as e:
        print(f"## {cat} — ERROR {e}")
        continue
    print(f"## {cat}")
    seen = set()
    for m in re.finditer(r'sfx/(\d+)/\d+-preview\.mp3', html):
        sid = m.group(1)
        if sid in seen:
            continue
        chunk = html[m.end():m.end() + 1200]
        t = re.search(r'item-grid-card__title">\s*([^<]+)<', chunk)
        d = re.search(r'meta-time" data-test-id="duration">\s*([0-9:]+)', chunk)
        if t:
            seen.add(sid)
            print(f"  {sid}  [{d.group(1) if d else '?'}]  {t.group(1).strip()}")
