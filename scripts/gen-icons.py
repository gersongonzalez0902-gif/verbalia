"""VERBALIA · Genera el set de iconos PWA desde el logo oficial (upload)."""
from PIL import Image, ImageDraw, ImageFilter

SRC = "upload/pasted_image_1793925724838.png"
BEAN = (191, 211, 184, 255)  # verde haba del logo oficial

orig = Image.open(SRC).convert("RGBA")

# 1) Máscara: esquinas blancas -> transparentes (logo cuadrado redondeado)
def rounded_alpha(im):
    w, h = im.size
    alpha = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(alpha)
    # radio ~22.5% (rx 118/512)
    r = int(w * 0.2305)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)
    out = im.copy()
    # recorta el blanco exterior usando la máscara + deteccción de blanco
    px = im.load()
    white = Image.new("L", (w, h), 0)
    wp = white.load()
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r0, g0, b0, _ = px[x, y]
            if r0 > 248 and g0 > 248 and b0 > 248:
                wp[x, y] = 255
    # dilata el blanco detectado para cubrir antialias
    white = white.filter(ImageFilter.MaxFilter(5))
    out.putalpha(Image.composite(Image.new("L", (w, h), 0), alpha, white))
    return out

logo = rounded_alpha(orig)

def save(im, path, size):
    im.resize((size, size), Image.LANCZOS).save(path)
    print("ok", path)

# iconos "any": logo redondeado con transparencia
save(logo, "public/icons/icon-192.png", 192)
save(logo, "public/icons/icon-512.png", 512)

# maskable: cuadrado completo verde haba + libro en zona segura (62%)
mask = Image.new("RGBA", (1024, 1024), BEAN)
book = logo.resize((int(1024 * 0.62),) * 2, Image.LANCZOS)
mask.alpha_composite(book, ((1024 - book.width) // 2, (1024 - book.height) // 2))
save(mask, "public/icons/icon-maskable-512.png", 512)

# apple touch: 180x180, fondo completo (iOS recorta esquinas)
apple = Image.new("RGBA", (1024, 1024), BEAN)
b2 = logo.resize((int(1024 * 0.80),) * 2, Image.LANCZOS)
apple.alpha_composite(b2, ((1024 - b2.width) // 2, (1024 - b2.height) // 2))
save(apple, "public/icons/apple-touch-icon.png", 180)

# favicon pequeño para el navegador (32px, transparencia)
save(logo, "public/icons/icon-32.png", 32)
