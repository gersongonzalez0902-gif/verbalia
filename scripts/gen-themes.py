#!/usr/bin/env python3
"""
Generador de temas CSS de VERBALIA (Etapa 3).
Produce el bloque de variables para :root (aurora claro), .dark (aurora oscuro)
y 5 paletas alternativas (coral, miel, lavanda, oceano, magenta) en claro y oscuro.
Fórmulas oklch coherentes para contraste AA y estética unificada.
"""

# (nombre, H primario, H fondo claro, H fondo oscuro)
THEMES = [
    ("aurora", 275, 85, 275),   # índigo sobre papel cálido / noche índigo profunda
    ("coral", 30, 45, 30),
    ("miel", 75, 80, 70),
    ("lavanda", 305, 300, 300),
    ("oceano", 235, 225, 240),
    ("magenta", 340, 355, 345),
]

REGIONS_LIGHT = {
    "bosque": "oklch(0.52 0.13 150)",
    "ciudad": "oklch(0.6 0.125 72)",
    "fortaleza": "oklch(0.5 0.06 65)",
    "biblioteca": "oklch(0.5 0.15 322)",
    "puerto": "oklch(0.52 0.09 200)",
    "torre": "oklch(0.56 0.15 22)",
    "observatorio": "oklch(0.5 0.15 290)",
}
REGIONS_DARK = {
    "bosque": "oklch(0.72 0.15 152)",
    "ciudad": "oklch(0.78 0.13 80)",
    "fortaleza": "oklch(0.7 0.055 70)",
    "biblioteca": "oklch(0.68 0.15 324)",
    "puerto": "oklch(0.7 0.1 198)",
    "torre": "oklch(0.7 0.15 20)",
    "observatorio": "oklch(0.68 0.14 290)",
}


def light_block(sel: str, h: int, hbg: int) -> str:
    return f"""
{sel} {{
  /* Modo claro · paleta {sel.split('"')[1] if '"' in sel else 'aurora'} */
  --background: oklch(0.972 0.014 {hbg});
  --foreground: oklch(0.27 0.04 {h});
  --card: oklch(0.99 0.007 {hbg});
  --card-foreground: oklch(0.27 0.04 {h});
  --popover: oklch(0.99 0.007 {hbg});
  --popover-foreground: oklch(0.27 0.04 {h});

  --primary: oklch(0.5 0.16 {h});
  --primary-foreground: oklch(0.985 0.008 {hbg});
  --secondary: oklch(0.935 0.026 {h});
  --secondary-foreground: oklch(0.34 0.05 {h});
  --muted: oklch(0.945 0.015 {hbg});
  --muted-foreground: oklch(0.48 0.038 {h});
  --accent: oklch(0.82 0.135 85);
  --accent-foreground: oklch(0.3 0.06 85);

  --destructive: oklch(0.577 0.18 30);
  --destructive-foreground: oklch(0.99 0.005 90);
  --success: oklch(0.55 0.12 168);
  --success-foreground: oklch(0.985 0.008 {hbg});

  --border: oklch(0.885 0.022 {h});
  --input: oklch(0.885 0.022 {h});
  --ring: oklch(0.5 0.16 {h});

  --chart-1: oklch(0.5 0.16 {h});
  --chart-2: oklch(0.75 0.14 80);
  --chart-3: oklch(0.6 0.1 195);
  --chart-4: oklch(0.55 0.15 322);
  --chart-5: oklch(0.6 0.15 20);

  --sidebar: oklch(0.955 0.018 {h});
  --sidebar-foreground: oklch(0.27 0.04 {h});
  --sidebar-primary: oklch(0.5 0.16 {h});
  --sidebar-primary-foreground: oklch(0.985 0.008 {hbg});
  --sidebar-accent: oklch(0.9 0.032 {h});
  --sidebar-accent-foreground: oklch(0.34 0.05 {h});
  --sidebar-border: oklch(0.885 0.022 {h});
  --sidebar-ring: oklch(0.5 0.16 {h});

  --xp: oklch(0.73 0.15 82);
  --xp-foreground: oklch(0.25 0.05 80);
{chr(10).join(f"  --region-{k}: {v};" for k, v in REGIONS_LIGHT.items())}

  --surface-glass: oklch(1 0 0 / 62%);
}}
"""


def dark_block(sel: str, h: int, hbg: int) -> str:
    return f"""
{sel} {{
  /* Modo noche · {sel.split('"')[1] if '"' in sel else 'aurora'}: superficies profundas con brillo */
  --background: oklch(0.185 0.028 {hbg});
  --foreground: oklch(0.93 0.014 {hbg});
  --card: oklch(0.23 0.034 {hbg});
  --card-foreground: oklch(0.93 0.014 {hbg});
  --popover: oklch(0.245 0.034 {hbg});
  --popover-foreground: oklch(0.93 0.014 {hbg});

  --primary: oklch(0.75 0.14 {h});
  --primary-foreground: oklch(0.19 0.045 {hbg});
  --secondary: oklch(0.29 0.038 {h});
  --secondary-foreground: oklch(0.91 0.012 {hbg});
  --muted: oklch(0.275 0.032 {hbg});
  --muted-foreground: oklch(0.72 0.028 {h});
  --accent: oklch(0.8 0.14 85);
  --accent-foreground: oklch(0.24 0.05 80);

  --destructive: oklch(0.67 0.17 28);
  --destructive-foreground: oklch(0.16 0.02 30);
  --success: oklch(0.74 0.13 168);
  --success-foreground: oklch(0.18 0.04 160);

  --border: oklch(1 0 0 / 13%);
  --input: oklch(1 0 0 / 18%);
  --ring: oklch(0.75 0.14 {h});

  --chart-1: oklch(0.75 0.14 {h});
  --chart-2: oklch(0.8 0.14 85);
  --chart-3: oklch(0.7 0.1 195);
  --chart-4: oklch(0.66 0.15 322);
  --chart-5: oklch(0.7 0.14 20);

  --sidebar: oklch(0.215 0.03 {hbg});
  --sidebar-foreground: oklch(0.93 0.014 {hbg});
  --sidebar-primary: oklch(0.75 0.14 {h});
  --sidebar-primary-foreground: oklch(0.19 0.045 {hbg});
  --sidebar-accent: oklch(0.285 0.036 {h});
  --sidebar-accent-foreground: oklch(0.91 0.012 {hbg});
  --sidebar-border: oklch(1 0 0 / 13%);
  --sidebar-ring: oklch(0.75 0.14 {h});

  --xp: oklch(0.8 0.15 84);
  --xp-foreground: oklch(0.24 0.05 80);
{chr(10).join(f"  --region-{k}: {v};" for k, v in REGIONS_DARK.items())}

  --surface-glass: oklch(0.21 0.034 {hbg} / 72%);
}}
"""


out = []
out.append("/* ============================ Temas de color ============================ */")
out.append("/* La paleta «aurora» (índigo sobre papel cálido) es el tema base.\n   El resto de paletas se activan con [data-theme] y combinan con .dark. */")
out.append(light_block(":root", 275, 85))
out.append(dark_block(".dark", 275, 275))
for name, h, hbg_l, hbg_d in THEMES[1:]:
    out.append(light_block(f'[data-theme="{name}"]', h, hbg_l))
    out.append(dark_block(f'[data-theme="{name}"].dark', h, hbg_d))

print("\n".join(out))
