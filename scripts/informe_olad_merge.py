# -*- coding: utf-8 -*-
"""Fusiona portada (Playwright) + cuerpo (ReportLab) en un único PDF A4."""
from pypdf import PdfReader, PdfWriter

A4_W, A4_H = 595.28, 841.89

COVER = "/home/z/my-project/scripts/out/informe_olad_cover.pdf"
BODY = "/home/z/my-project/scripts/out/informe_olad_body.pdf"
OUT = "/home/z/my-project/download/VERBALIA_Informe_Ola_D.pdf"


def normalize_page_to_a4(page):
    box = page.mediabox
    w, h = float(box.width), float(box.height)
    if abs(w - A4_W) > 0.4 or abs(h - A4_H) > 0.4:
        page.scale_to(A4_W, A4_H)
    return page


writer = PdfWriter()
writer.add_page(normalize_page_to_a4(PdfReader(COVER).pages[0]))
for page in PdfReader(BODY).pages:
    writer.add_page(normalize_page_to_a4(page))
writer.add_metadata({
    "/Title": "VERBALIA - Informe de progreso Ola D",
    "/Author": "Z.ai",
    "/Creator": "Z.ai",
    "/Subject": "Informe de progreso a-g de la Ola D (PROMPT D) del juego VERBALIA",
})
with open(OUT, "wb") as f:
    writer.write(f)
print("OK merge ->", OUT, "paginas:", len(writer.pages))
