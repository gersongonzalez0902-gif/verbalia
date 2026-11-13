# -*- coding: utf-8 -*-
"""Informe de progreso Ola D - VERBALIA (cuerpo, ruta Report).
Paleta: Template 07 Crystal Blue (cuerpo azul claro, portada oscura aparte).
"""
import os, sys, hashlib

PDF_SKILL_DIR = "/home/z/my-project/skills/pdf"
_scripts = os.path.join(PDF_SKILL_DIR, "scripts")
if _scripts not in sys.path:
    sys.path.insert(0, _scripts)

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, CondPageBreak,
                                KeepTogether, HRFlowable)
from reportlab.platypus.tableofcontents import TableOfContents

# ---------------------------------------------------------------- fuentes
FONT_DIR = "/usr/share/fonts"
pdfmetrics.registerFont(TTFont("NotoSerifSC", f"{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("NotoSerifSC-Bold", f"{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Noto Sans SC", f"{FONT_DIR}/truetype/chinese/NotoSansSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Noto Sans SC Bold", f"{FONT_DIR}/truetype/chinese/NotoSansSC-Bold.ttf"))
pdfmetrics.registerFont(TTFont("SarasaMonoSC", f"{FONT_DIR}/truetype/chinese/SarasaMonoSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif", f"{FONT_DIR}/truetype/freefont/FreeSerif.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Bold", f"{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Italic", f"{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-BoldItalic", f"{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf"))
pdfmetrics.registerFont(TTFont("DejaVuSans", f"{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf"))
registerFontFamily("NotoSerifSC", normal="NotoSerifSC", bold="NotoSerifSC-Bold")
registerFontFamily("Noto Sans SC", normal="Noto Sans SC", bold="Noto Sans SC Bold")
registerFontFamily("FreeSerif", normal="FreeSerif", bold="FreeSerif-Bold",
                   italic="FreeSerif-Italic", boldItalic="FreeSerif-BoldItalic")
registerFontFamily("DejaVuSans", normal="DejaVuSans", bold="DejaVuSans")

from pdf import install_font_fallback
install_font_fallback()

# ------------------------------------------------- paleta (Template 07)
PAGE_BG      = colors.HexColor("#f5f8fc")   # XL
SECTION_BG   = colors.HexColor("#edf2f9")   # XL
CARD_BG      = colors.HexColor("#e4ecf5")   # L
TABLE_STRIPE = colors.HexColor("#eef3fa")   # L
HEADER_FILL  = colors.HexColor("#1a4a7a")   # M
BORDER       = colors.HexColor("#c0d0e2")   # S
ACCENT       = colors.HexColor("#2d7ab3")   # XS
TEXT_PRIMARY = colors.HexColor("#142840")
TEXT_MUTED   = colors.HexColor("#5a7a96")

# ---------------------------------------------------------------- medidas
PAGE_W, PAGE_H = A4
MARGIN = 2.0 * cm
AVAIL_W = PAGE_W - 2 * MARGIN
AVAIL_H = PAGE_H - 2 * MARGIN
H1_ORPHAN = AVAIL_H * 0.25

DOC_TITLE = "VERBALIA · Informe de progreso Ola D"
OUT = "/home/z/my-project/scripts/out/informe_olad_body.pdf"
os.makedirs(os.path.dirname(OUT), exist_ok=True)

# ---------------------------------------------------------------- estilos
S = {}
S["body"] = ParagraphStyle("Body", fontName="FreeSerif", fontSize=10.5, leading=17,
                           alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY,
                           spaceBefore=0, spaceAfter=8)
S["bullet"] = ParagraphStyle("Bullet", parent=S["body"], alignment=TA_LEFT,
                             leftIndent=14, bulletIndent=2, spaceAfter=5,
                             bulletFontName="FreeSerif")
S["h1"] = ParagraphStyle("H1", fontName="FreeSerif", fontSize=22, leading=27,
                         textColor=HEADER_FILL, spaceBefore=0, spaceAfter=4)
S["h2"] = ParagraphStyle("H2", fontName="FreeSerif", fontSize=15, leading=20,
                         textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=6)
S["h3"] = ParagraphStyle("H3", fontName="FreeSerif", fontSize=11.5, leading=16,
                         textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=5)
S["cell"] = ParagraphStyle("Cell", fontName="FreeSerif", fontSize=9, leading=12.5,
                           alignment=TA_LEFT, textColor=TEXT_PRIMARY)
S["cellc"] = ParagraphStyle("CellC", parent=S["cell"], alignment=TA_CENTER)
S["th"] = ParagraphStyle("TH", fontName="FreeSerif", fontSize=9.5, leading=12.5,
                         alignment=TA_CENTER, textColor=colors.white)
S["caption"] = ParagraphStyle("Caption", fontName="FreeSerif", fontSize=8.5, leading=12,
                              alignment=TA_CENTER, textColor=TEXT_MUTED,
                              spaceBefore=3, spaceAfter=6)
S["stat"] = ParagraphStyle("Stat", fontName="FreeSerif", fontSize=16, leading=19,
                           alignment=TA_CENTER, textColor=ACCENT)
S["statlabel"] = ParagraphStyle("StatLabel", fontName="FreeSerif", fontSize=8, leading=10.5,
                                alignment=TA_CENTER, textColor=TEXT_MUTED)
S["toc0"] = ParagraphStyle("TOC0", fontName="FreeSerif", fontSize=12, leading=20,
                           leftIndent=6, textColor=TEXT_PRIMARY, bulletFontName="FreeSerif")
S["toc1"] = ParagraphStyle("TOC1", fontName="FreeSerif", fontSize=10.5, leading=16,
                           leftIndent=26, textColor=TEXT_MUTED, bulletFontName="FreeSerif")
S["tocTitle"] = ParagraphStyle("TOCTitle", fontName="FreeSerif", fontSize=22, leading=27,
                               textColor=HEADER_FILL, spaceAfter=14)

# ---------------------------------------------------------------- helpers
def P(text, style="body"):
    return Paragraph(text, S[style])

def add_heading(text, style, level=0):
    key = "h_" + hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), S[style])
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def h1_block(text, first_flowable=None):
    """Capítulo: CondPageBreak + título + regla acento (+ primer contenido)."""
    head = add_heading(text, "h1", level=0)
    rule = HRFlowable(width="100%", color=ACCENT, thickness=1.2,
                      spaceBefore=2, spaceAfter=10)
    group = [head, rule] + ([first_flowable] if first_flowable else [])
    return [CondPageBreak(H1_ORPHAN), KeepTogether(group)]

def h2_block(text, first_flowable=None):
    head = add_heading(text, "h2", level=1)
    group = [head] + ([first_flowable] if first_flowable else [])
    return [KeepTogether(group)]

def make_table(headers, rows, ratios, aligns=None, font=9):
    """Tabla con celdas Paragraph, anchos proporcionales y zebra."""
    n = len(headers)
    aligns = aligns or ["l"] * n
    widths = [r * AVAIL_W * 0.985 for r in ratios]
    assert abs(sum(ratios) - 1.0) < 0.01, "ratios deben sumar 1"
    data = [[Paragraph("<b>%s</b>" % h, S["th"]) for h in headers]]
    for row in rows:
        line = []
        for i, cell in enumerate(row):
            st = "cellc" if aligns[i] == "c" else "cell"
            line.append(Paragraph(str(cell), ParagraphStyle(
                "c%s%s" % (st, font), parent=S[st], fontSize=font, leading=font + 3.5)))
        data.append(line)
    t = Table(data, colWidths=widths, hAlign="CENTER", repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_FILL),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    for r in range(1, len(data)):
        if r % 2 == 1:
            style.append(("BACKGROUND", (0, r), (-1, r), colors.white))
        else:
            style.append(("BACKGROUND", (0, r), (-1, r), TABLE_STRIPE))
    t.setStyle(TableStyle(style))
    return t

def table_block(title_flowables, table, caption=None):
    out = [Spacer(1, 10)] + list(title_flowables) + [table]
    if caption:
        out += [Spacer(1, 4), P(caption, "caption")]
    out += [Spacer(1, 8)]
    return out

def callout_row(stats):
    """Fila de indicadores clave (Data-to-Ink)."""
    n = len(stats)
    w = (AVAIL_W * 0.985) / n
    cells = [[Paragraph("<b>%s</b>" % big, S["stat"]),
              Paragraph(lab, S["statlabel"])] for big, lab in stats]
    t = Table([cells], colWidths=[w] * n, hAlign="CENTER")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
        ("BOX", (0, 0), (-1, -1), 1, ACCENT),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return [Spacer(1, 6), t, Spacer(1, 10)]

def bullet(text):
    return Paragraph(text, S["bullet"], bulletText="•")

# ---------------------------------------------------------------- doc
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, "bookmark_name"):
            level = getattr(flowable, "bookmark_level", 0)
            text = getattr(flowable, "bookmark_text", "")
            key = getattr(flowable, "bookmark_key", "")
            # La página mostrada resta el índice (portada va aparte; TOC = i)
            self.notify("TOCEntry", (level, text, max(self.page - 1, 1), key))

def on_page(canvas, doc):
    canvas.saveState()
    # fondo de página (XL tier)
    canvas.setFillColor(PAGE_BG)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    # cabecera
    canvas.setFont("FreeSerif", 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(MARGIN, PAGE_H - MARGIN + 16, DOC_TITLE)
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.5)
    canvas.line(MARGIN, PAGE_H - MARGIN + 8, PAGE_W - MARGIN, PAGE_H - MARGIN + 8)
    # pie
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, MARGIN - 14, PAGE_W - MARGIN, MARGIN - 14)
    canvas.setFont("FreeSerif", 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(MARGIN, MARGIN - 26, "Proyecto VERBALIA · Ola D · PROMPT D informe a-g")
    page_label = "i" if doc.page == 1 else str(doc.page - 1)
    canvas.drawRightString(PAGE_W - MARGIN, MARGIN - 26, page_label)
    canvas.restoreState()

doc = TocDocTemplate(OUT, pagesize=A4,
                     leftMargin=MARGIN, rightMargin=MARGIN,
                     topMargin=MARGIN, bottomMargin=MARGIN,
                     title=DOC_TITLE, author="Z.ai", creator="Z.ai",
                     subject="Informe de progreso de la Ola D (PROMPT D) del juego VERBALIA")

story = []

# ================================================================ ÍNDICE
toc = TableOfContents()
toc.levelStyles = [S["toc0"], S["toc1"]]
story.append(Paragraph("<b>Índice</b>", S["tocTitle"]))
story.append(HRFlowable(width="100%", color=ACCENT, thickness=1.2, spaceBefore=0, spaceAfter=12))
story.append(toc)
story.append(PageBreak())

# ============================================================ 1. RESUMEN
lead = P("Este documento recoge el estado real de la <b>Ola D</b> de VERBALIA (PROMPT D: "
         "20 áreas por 5 mejoras, 100 ítems) al cierre del 13 de noviembre de 2026. La ola avanza "
         "en orden estricto y con un commit verificado por área: hoy tienen commit oficial las "
         "<b>Áreas 1 (front end), 2 (seguridad del backend) y 3 (audio real)</b>, y quedaron "
         "iniciadas -sin commit de área- dos piezas de lógica que el snapshot cbdd164 capturó al "
         "cerrar la sesión: la copia de seguridad JSON (ítem 4.1) y la memoria de origen de "
         "navegación (ítem 12.1).")
story += h1_block("1. Resumen ejecutivo", lead)

story += callout_row([
    ("3 / 20", "áreas con commit verificado"),
    ("344 / 344", "pruebas en verde (antes: 328)"),
    ("8,09 MB", "audio real servido (tope: 12 MB)"),
    ("45 + 15", "efectos SFX y loops de música"),
])

story.append(P(
    "Las tres áreas entregadas se verificaron con la batería completa antes de cada commit "
    "(regla de oro 5): las 344 pruebas pasan, el linter queda a cero errores y el build de "
    "producción compila. El Área 3 cumple el P0-2 al completo: ningún sonido del juego se "
    "sintetiza ya por código como solución principal; todos son archivos reales con licencia "
    "libre (CC0 salvo siete pistas CC-BY con crédito obligatorio documentado), con variantes "
    "anti-repetición, doble formato ogg + mp3 y un sintetizador que solo queda como respaldo de "
    "emergencia para que el juego nunca se quede mudo."))
story.append(P(
    "El motor offline no se ha tocado: el diff acumulado desde la Ola 1.1 no contiene ningún "
    "archivo del motor, del RNG determinista ni del SRS, y las 344 pruebas incluyen la suite "
    "completa del juego sin red. La sincronización automática de la Ola 1.1 (syncOnLogin, "
    "debounce y mergePayload) sigue intacta. Conforme a la regla de oro 7, nada se ha descartado "
    "en silencio: los 85 ítems aún abiertos se listan en el capítulo 7 con su razón y el orden "
    "previsto, y los dos remanentes del Área 1 se documentan en el capítulo 3."))

p0_intro = P("Estado de los seis P0 del PROMPT D, que no se pueden recortar:")
story.append(p0_intro)
story += table_block(
    [],
    make_table(
        ["P0", "Alcance", "Estado", "Dónde queda"],
        [
            ["P0-1", "Volver desde Cuenta aterriza en la portada, no en Ajustes", "Pendiente", "Área 4.2 (siguiente en la cola)"],
            ["P0-2", "Todo el audio pasa a archivos reales sin copyright", "<b>Entregado</b>", "Área 3 completa (commit 838f8b2)"],
            ["P0-3", "Opción de borrar los datos de este aparato al cerrar sesión", "Pendiente", "Área 16.1"],
            ["P0-4", "Paridad de escritorio: rejillas anchas, hover real, atajos", "Pendiente", "Área 11 completa"],
            ["P0-5", "Fondo con capas y profundidad, nada plano", "Pendiente", "Área 13 completa"],
            ["P0-6", "Exportar/importar JSON solo visible sin sesión", "Lógica lista; falta la UI", "Ítem 4.1 (lógica en HEAD)"],
        ],
        [0.09, 0.46, 0.20, 0.25], aligns=["c", "l", "l", "l"]),
    caption="Tabla 1. Estado de los seis P0 al cierre del informe.")

# ============================================================ 2. COMMITS (a)
lead2 = P("La ola trabaja en orden y con un commit por área (regla de oro 5); antes de cada "
          "commit se ejecutan las pruebas, el linter y el build. La tabla siguiente lista los "
          "commits de la Ola D en orden de llegada, con su alcance medido sobre el historial.")
story += h1_block("2. Commits por área (a)", lead2)

story += table_block(
    [],
    make_table(
        ["Hash", "Hora", "Área", "Entregable", "Alcance"],
        [
            ["ae09089", "04:01", "1", "Escala tipográfica unificada (type-*), foco visible global, "
             "esqueletos con forma real y barrido, papel oscuro", "23 archivos · +176/−62"],
            ["ea71ed3", "04:12", "2", "Esquemas zod compartidos con límites honestos, ACAO inválido "
             "retirado, cambio de contraseña cierra sesiones, 16 pruebas de seguridad", "10 archivos · +301/−77"],
            ["838f8b2", "05:10", "3", "Audio real: 45 SFX con variantes (ogg + mp3), CREDITS.md "
             "verificado, 15 loops por región con fundido, reloj de archivos, SW v2.4.0", "≈120 archivos (105 binarios)"],
            ["cbdd164", "05:13", "extra", "Snapshot automático de cierre de sesión: lógica de export/import "
             "JSON (4.1) y lastScreen (12.1), sin UI todavía", "3 archivos · +55/−2"],
        ],
        [0.11, 0.07, 0.08, 0.52, 0.22], aligns=["c", "c", "c", "l", "l"], font=8.5),
    caption="Tabla 2. Commits de la Ola D (fecha: 13 de noviembre de 2026).")

story.append(P(
    "El cuarto punto no es un commit de área: cbdd164 es el snapshot que el entorno capturó al "
    "cortarse la sesión de trabajo, cuando el Área 4 acababa de empezar. Su contenido es código "
    "real y funcional (la lógica de copia de seguridad y el estado de origen de navegación), "
    "pero sin la interfaz que lo hace visible, así que se reporta como <b>iniciado y sin "
    "cerrar</b>, nunca como entregado. El árbol de trabajo quedó limpio en ese HEAD."))
story.append(P(
    "Acumulado desde la Ola 1.1 (commit 34317ae, base de la ola): 284 archivos cambiados con "
    "+1.410/−856 líneas de código, más los 193 binarios de audio. Ese diff es también la prueba "
    "de la regla de oro 1: entre esos archivos no hay ninguno del motor de juego, del RNG "
    "determinista ni del SRS (se detallan en el capítulo 8)."))

# ============================================================ 3. ÍTEMS (b)
lead3 = P("Estado ítem a ítem de las áreas con commit, con la evidencia exacta en el código. "
          "Los ítems abiertos dentro de un área ya empezada se marcan como tales: no se "
          "presentan como entregados ni se omiten (regla de oro 7).")
story += h1_block("3. Ítems entregados uno a uno (b)", lead3)

story += h2_block("3.1 Área 1 · Front end (commit ae09089)")
story += table_block(
    [],
    make_table(
        ["Ítem", "Qué cambió", "Estado"],
        [
            ["Escala tipográfica unificada", "Siete clases type-* (display, h1, h2, h3, body, label, "
             "metric) en globals.css, aplicadas en 23 archivos de pantallas; respeta el ajuste de "
             "tamaño del texto porque escala el html completo", "<b>Entregado</b>"],
            ["Esqueletos con forma real", "Clase skeleton-shimmer con barrido de 1,7 s (keyframes "
             "skeleton-sweep); adoptados por la carga diferida (Lazy) y la pantalla Cuenta", "<b>Entregado</b>"],
            ["Foco visible por teclado", ":focus-visible global con anillo de 2 px (antes el anillo "
             "solo aparecía con ratón); cubre portátiles táctiles y tablets", "<b>Entregado</b> (extra)"],
            ["Papel oscuro", "En modo oscuro la textura del papel pasa a pizarra fina (radial-gradient "
             "al 8 % con color-mix)", "<b>Entregado</b> (parte del tema dual)"],
            ["Profundidad de tarjetas y botones", "Sin cambios en este commit", "Abierto"],
            ["Iconos y espaciado consistentes", "Sin cambios en este commit", "Abierto"],
        ],
        [0.24, 0.58, 0.18], aligns=["l", "l", "c"], font=8.5),
    caption="Tabla 3. Área 1: cuatro frentes entregados y dos abiertos.")

story += h2_block("3.2 Área 2 · Seguridad del backend (commit ea71ed3)")
story += table_block(
    [],
    make_table(
        ["Ítem", "Qué cambió", "Estado"],
        [
            ["Esquemas zod compartidos", "Nuevo src/server/schemas.ts (+82 líneas): email normalizado "
             "antes de validar, payload de progreso acotado; login, register, import y progreso "
             "refactorizados al esquema común; 400 validation_error con detalle", "<b>Entregado</b>"],
            ["Sobre JSON con tope honesto", "MAX_JSON_BODY_BYTES de 1,6 MB verificado antes de parsear "
             "(http.ts); las fotos viajan dentro del payload acotado por esquema", "<b>Entregado</b>"],
            ["Cabeceras saneadas", "Retirada la cabecera Access-Control-Allow-Origin con valor "
             "inválido «same-origin»: la API emite ACAO y queda cerrada a otros orígenes; se "
             "conservan CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, "
             "Permissions-Policy y HSTS", "<b>Entregado</b>"],
            ["Sesiones reforzadas", "El cambio de contraseña invalida las demás sesiones activas "
             "(tokens.ts y route de cambio)", "<b>Entregado</b>"],
            ["Rate limit honesto", "429 real con cabecera de restante; cubierto por pruebas", "<b>Entregado</b>"],
            ["Tests de seguridad", "Nuevo tests/security.test.ts: 16 pruebas (CSRF y Content-Type con "
             "la guardia exportada testeable sin Next, esquemas, TTL de tokens, cookie de sesión, 429)", "<b>Entregado</b>"],
        ],
        [0.24, 0.58, 0.18], aligns=["l", "l", "c"], font=8.5),
    caption="Tabla 4. Área 2: los cinco frentes del índice de seguridad, completos.")

story += h2_block("3.3 Área 3 · SFX y música con archivos reales (commit 838f8b2)")
story += table_block(
    [],
    make_table(
        ["Ítem", "Qué cambió", "Estado"],
        [
            ["Banco de SFX real (P0-2)", "45 efectos con 2-3 variantes que se alternan al azar (nunca "
             "suena igual dos veces seguidas): 89 muestras .ogg + 89 respaldos .mp3 (178 archivos, "
             "1,59 MB) en public/sfx", "<b>Entregado</b>"],
            ["Créditos verificados", "public/sfx/CREDITS.md (124 líneas) con fuente, autor y licencia "
             "de cada paquete y de cada loop; verificado página por página en kenney.nl y OpenGameArt", "<b>Entregado</b>"],
            ["Música por región", "15 loops reales (uno por escena) con fundido cruzado al cambiar de "
             "región (use-scene.ts); el motor de música generativa se retiró (audio.ts reescrito a v3)", "<b>Entregado</b>"],
            ["Gran Reloj de archivos", "Capa de tic-tac con archivos reales; setTension() la acelera y "
             "le sube tono y volumen hasta el clímax de los últimos segundos", "<b>Entregado</b>"],
            ["Carga diferida y prueba", "Precarga en segundo plano tras el primer gesto; botón «Probar "
             "sonidos» en Ajustes; SW v2.4.0 precachea el banco completo; sintetizador solo como "
             "respaldo de emergencia", "<b>Entregado</b>"],
        ],
        [0.24, 0.58, 0.18], aligns=["l", "l", "c"], font=8.5),
    caption="Tabla 5. Área 3: los cinco ítems del P0-2, completos.")

story += h2_block("3.4 Iniciados sin commit de área (snapshot cbdd164)")
story += table_block(
    [],
    make_table(
        ["Ítem", "Qué hay ya en HEAD", "Qué falta"],
        [
            ["4.1 · Copia JSON (P0-6)", "storage.export() y storage.parseImport() (validan esqueleto "
             "core/profile y versión del esquema); game-store.exportJson() e importJson(), que "
             "restaura vía adoptSyncedState, el mismo camino del sync", "La UI: botones de exportar "
             "e importar en Ajustes/Cuenta, visibles solo sin sesión activa"],
            ["12.1 · Origen de navegación", "ui-store.lastScreen: navigate() y syncFromHash() "
             "recuerdan la pantalla de la que se sale", "Usarlo en la flecha «Volver» por pantalla "
             "(p. ej. Cuenta debe regresar a la portada cuando se entró desde ella, P0-1)"],
        ],
        [0.20, 0.46, 0.34], aligns=["l", "l", "l"], font=8.5),
    caption="Tabla 6. Lógica ya commiteada que aún no es visible en la interfaz.")

# ============================================================ 4. AUDIO (c)
lead4 = P("Inventario completo del banco de audio servido desde public/sfx/ y public/music/, "
          "tal y como queda documentado en public/sfx/CREDITS.md. Todo es archivo real con "
          "licencia libre: CC0 preferente y CC-BY solo cuando la pista lo exige, con crédito "
          "obligatorio listado al final. Nada se genera por código como solución principal.")
story += h1_block("4. Inventario de audio (c)", lead4)

story += h2_block("4.1 Efectos (public/sfx/)")
story += table_block(
    [],
    make_table(
        ["Paquete", "Autor", "Licencia", "Efectos que aporta"],
        [
            ["Interface Sounds", "Kenney Vleugels (kenney.nl)", "CC0",
             "tap, click, toggle, pop, correct, wrong, error, slide, snap, open, close, back, "
             "navigate, tinta, buy, combo, confetti, chime, buoy, sessionEnd, go, countdown, "
             "tick/tock/clockTick, typeWord, typeKey"],
            ["Casino Audio", "Kenney Vleugels (kenney.nl)", "CC0",
             "page, flip, deal, place, coins, coin, buy (2.ª variante), stamp"],
            ["Level up, power up, Coin get (13 sounds)", "wobbleboxx (OpenGameArt)", "CC0",
             "whoosh, coin, claim, unlock, levelUp, achievement, gift, stepUp, streak, sparkle, "
             "confetti, sessionLose"],
            ["Children's March Theme (sting)", "Cleyton Kauffman (OpenGameArt)", "CC0",
             "sessionWin (primeros 3,5 s del tema con fundido de salida)"],
        ],
        [0.24, 0.22, 0.10, 0.44], aligns=["l", "l", "c", "l"], font=8.5),
    caption="Tabla 7. Fuentes del banco de SFX: 45 efectos, 89 muestras .ogg con respaldo .mp3.")

story += h2_block("4.2 Música ambiente por región (public/music/)")
music_rows = [
    ["bosque · Bosque del Vocabulario", "I think I'd stay (jungle chill)", "Emmntt", "CC0", "612"],
    ["ciudad · Ciudad de la Gramática", "One Horse Town", "tcarisland", "CC-BY 4.0", "687"],
    ["fortaleza · Fortaleza de la Ortografía", "The Bard's Tale (loop)", "RandomMind", "CC0", "421"],
    ["biblioteca · Biblioteca Infinita", "Magician Village (in-game loop)", "beardalaxy", "CC0", "128"],
    ["puerto · Puerto de las Voces", "Port Town (in-game loop)", "beardalaxy", "CC0", "215"],
    ["torre · Torre de la Expresión", "Harmony in the Mists (loop)", "Tsorthan Grove", "CC-BY 4.0", "640"],
    ["observatorio · Observatorio de la Palabra", "HEAVEN", "GloryToTheMachine", "CC-BY 4.0", "425"],
    ["forja · Forja del Escritor", "Crystal Caverns (geode)", "Tsorthan Grove", "CC-BY 4.0", "133"],
    ["arcade · Salón de Juegos", "Chiptune Medieval: Minstrel Dance (loop)", "RandomMind", "CC0", "348"],
    ["welcome · Portada", "MEADOW", "GloryToTheMachine", "CC-BY 4.0", "233"],
    ["map · Mapa", "Exploration Theme", "Cleyton Kauffman", "CC0", "521"],
    ["missions · Misiones", "A Busy Day at the Market (loop)", "ViRiX", "CC-BY 3.0", "573"],
    ["results · Resultados", "Children's March Theme", "Cleyton Kauffman", "CC0", "471"],
    ["errors · Cuaderno de errores", "Mysterious Calm", "bart", "CC-BY 3.0", "792"],
    ["stats · Estadísticas", "Contemplation", "Pro Sensory", "CC0", "458"],
]
story += table_block(
    [],
    make_table(
        ["Escena / región", "Tema original", "Autor", "Licencia", "Peso (KB)"],
        music_rows,
        [0.29, 0.26, 0.21, 0.13, 0.11], aligns=["l", "l", "l", "c", "c"], font=8.5),
    caption="Tabla 8. Los 15 loops verificados página por página en OpenGameArt (total: 6,50 MB).")

story.append(P(
    "Las pantallas sin loop propio reutilizan el de una escena cercana (Ajustes usa puerto, "
    "Colección usa biblioteca, Perfil usa map), así que no hay archivos extra ni huecos "
    "musicales. Los créditos CC-BY obligatorios quedan listados en CREDITS.md para los cinco "
    "autores que lo exigen: GloryToTheMachine (HEAVEN, MEADOW), Tsorthan Grove (Harmony in the "
    "Mists, Crystal Caverns) y tcarisland (One Horse Town) bajo CC-BY 4.0; ViRiX (A Busy Day at "
    "the Market) y bart (Mysterious Calm) bajo CC-BY 3.0. El resto del banco es CC0: el crédito "
    "se incluye por gratitud, no por obligación."))

story += h2_block("4.3 Presupuesto de peso")
story += callout_row([
    ("1,59 MB", "SFX (178 archivos, ogg + mp3)"),
    ("6,50 MB", "música (15 loops .ogg)"),
    ("8,09 MB", "total servido"),
    ("12 MB", "tope autoimpuesto: holgura del 33 %"),
])
story.append(P(
    "El SFX más pesado ocupa 53 KB (tope por efecto: 100 KB) y el loop más pesado es el de "
    "Cuaderno de errores, con 792 KB (tope por loop: 1,5 MB). Ambos límites se cumplen con "
    "margen. La construcción es reproducible: el guion scripts/build-audio.sh genera el banco "
    "y scripts/make-sw-audio-list.py produce la lista de precarga del service worker. Nota de "
    "medición: los pesos son bytes reales en disco; el du del directorio redondea por bloques "
    "y por eso CREDITS.md habla de «≈ 8,6 MB», la misma cifra que ve el sistema de archivos."))

# ============================================================ 5. ESCRITORIO (d)
lead5 = P("El P0-4 pide que el PC quede claramente por encima del móvil en dinamismo, "
          "animaciones y comodidad. Esa paridad integral vive en el <b>Área 11</b>, que todavía "
          "no ha entrado en la cola de trabajo: por honestidad, este capítulo no puede dar una "
          "comparativa completa antes/después de escritorio. Lo que sí puede documentar es lo "
          "que el Área 1 ya mejoró en ambas plataformas, escritorio incluido.")
story += h1_block("5. Comparativa de escritorio (d)", lead5)

story += table_block(
    [],
    make_table(
        ["Aspecto", "Antes", "Ahora (commit ae09089)"],
        [
            ["Tipografía", "Tamaños sueltos decididos pantalla a pantalla, con saltos de jerarquía",
             "Escala de 7 pasos (type-display a type-metric) en las 23 pantallas revisadas; las "
             "métricas usan números tabulares, estables al contar"],
            ["Foco", "El anillo de foco solo se mostraba al navegar con ratón",
             ":focus-visible global: también con teclado, en cualquier dispositivo (mismo anillo "
             "de 2 px, offset 2 px)"],
            ["Carga", "Huecos en blanco mientras la pantalla diferida montaba",
             "Esqueletos con la forma real del contenido y barrido de brillo de 1,7 s"],
            ["Tema oscuro", "Papel plano, igual de plano que el claro",
             "Pizarra fina con textura al 8 %: el modo oscuro gana profundidad propia"],
        ],
        [0.16, 0.34, 0.50], aligns=["l", "l", "l"], font=8.5),
    caption="Tabla 9. Antes/después ya aplicado por el Área 1 (afecta igual a escritorio y móvil).")

story.append(P(
    "Lo que llega con el Área 11 para completar el P0-4 es lo que de verdad separa una sesión "
    "de escritorio: rejillas anchas en pantallas grandes (lg+ con contenedor controlado), "
    "estados hover reales en tarjetas y fichas, atajos de teclado para las acciones frecuentes "
    "y la revisión de cada flujo con teclado solo. La medición objetiva de esa paridad -"
    "Lighthouse en móvil (objetivo > 90) y escritorio (> 85)- pertenece al Área 17 y hoy "
    "no es ejecutable en este entorno de trabajo, porque el sandbox no tiene Chromium ni "
    "lighthouse instalados; se medirá en el despliegue o en local con Chrome, y el resultado "
    "entrará en el informe final de la ola."))

# ============================================================ 6. VERIFICACIONES (e)
lead6 = P("Cada commit de área se verificó antes de quedar registrado (regla de oro 5). Al "
          "cierre de este informe se repitió la batería completa sobre el HEAD actual "
          "(cbdd164) para confirmar que el snapshot no dejó nada roto.")
story += h1_block("6. Verificaciones técnicas (e)", lead6)

story += table_block(
    [],
    make_table(
        ["Comprobación", "Resultado en HEAD (cbdd164)"],
        [
            ["Pruebas (bun test)", "<b>344 de 344 en verde</b>: 5 archivos, 18.569 expect() en 3,87 s. "
             "Antes de la Ola D eran 328; las 16 nuevas son las de seguridad del Área 2"],
            ["Linter", "0 errores; solo notas del generador al maquetar 6 archivos de datos que "
             "superan los 500 KB (aviso de rendimiento del parser, no de calidad)"],
            ["Build de producción", "Verde: compilado en 25,7 s. En el sandbox se necesitó ampliar el "
             "heap de Node a 4,6 GB (el entorno arranca con 2 GB y la fase de TypeScript se queda "
             "sin memoria); los commits de área se verificaron con el flujo estándar y el build "
             "final de Vercel no usa ese flag"],
            ["Lighthouse", "No medible en este entorno (sin Chromium ni lighthouse). La medición "
             "móvil > 90 / escritorio > 85 queda para el Área 17, en despliegue o local"],
            ["Estado del árbol", "Limpio: HEAD = cbdd164, sin cambios sin commitear"],
        ],
        [0.24, 0.76], aligns=["l", "l"], font=8.5),
    caption="Tabla 10. Batería de verificación completa sobre el HEAD actual.")

story.append(P(
    "Detalle útil para reproducción local: bun test recorre 5 archivos de pruebas (la suite del "
    "juego y la nueva suite de seguridad); el build es el de Vercel (prisma generate dentro del "
    "build) y el artefacto standalone arranca con el script de reanimación del repositorio."))

# ============================================================ 7. PENDIENTES (f)
lead7 = P("Quedan abiertos <b>85 de los 100 ítems</b> de la ola, más los dos frentes que el "
          "Área 1 dejó a medias y la UI del 4.1. La razón no es técnica sino de método: la "
          "regla de oro 5 obliga a trabajar las áreas en orden y a cerrar cada una con commit "
          "verificado, así que ninguna área posterior se toca hasta cerrar la anterior. La cola "
          "queda así:")
story += h1_block("7. Pendientes y razones (f)", lead7)

story += table_block(
    [],
    make_table(
        ["Área", "Foco principal", "Estado"],
        [
            ["1 · Front end", "Estética general unificada", "Iniciada: 4 frentes dentro; quedan profundidad de tarjetas/botones e iconos/espaciado"],
            ["2 · Seguridad backend", "Zod, cabeceras, sesiones, tests", "<b>Completada (5/5)</b>"],
            ["3 · Audio real", "SFX y música con archivos (P0-2)", "<b>Completada (5/5)</b>"],
            ["4 · Cuenta", "Copia JSON (4.1), retorno desde Cuenta (4.2), textos, error en línea, Google «Pronto»", "Iniciada: lógica del 4.1 en HEAD; UI y 4.2-4.5 pendientes"],
            ["5 · Perfil", "Pantalla de perfil", "Pendiente"],
            ["6 · Entrenamientos", "Pantalla de entrenamientos", "Pendiente"],
            ["7 · Juegos", "Pantallas de juego", "Pendiente"],
            ["8 · Logros", "Catálogo y evaluación real (hay checks falsos tipo check: () => false)", "Pendiente"],
            ["9 · Medallas y bóveda", "Colecionables", "Pendiente"],
            ["10 · Léxico", "Biblioteca léxica", "Pendiente"],
            ["11 · Paridad PC", "Rejillas anchas, hover real, atajos, contenedor controlado (P0-4)", "Pendiente"],
            ["12 · Flujo de navegación", "Origen de «Volver», transiciones, confirmaciones, breadcrumbs", "Iniciada: lastScreen en HEAD; falta la lógica por pantalla"],
            ["13 · Fondo con profundidad", "Parallax, texturas, cruce de ambientes (P0-5)", "Pendiente"],
            ["14 · Microinteracciones", "Háptica, pulsado, contadores animados", "Pendiente"],
            ["15 · Ajustes", "Controles y página «Acerca de»", "Pendiente"],
            ["16 · Datos locales", "Borrado al cerrar sesión (P0-3) y ficha «Tus datos en este aparato»", "Pendiente"],
            ["17 · Rendimiento", "Medición Lighthouse y presupuestos", "Pendiente (medición no disponible en sandbox)"],
            ["18 · Accesibilidad", "Contraste AA, teclado completo, aria-labels", "Pendiente"],
            ["19 · Onboarding", "Primeros pasos", "Pendiente"],
            ["20 · PWA", "Manifest, metas iOS, instalación, SW", "Pendiente"],
        ],
        [0.20, 0.55, 0.25], aligns=["l", "l", "l"], font=8),
    caption="Tabla 11. Estado de las 20 áreas al cierre de este informe.")

story.append(P(
    "Orden inmediato: cerrar el <b>Área 4</b> completa -la UI de exportar/importar visible solo "
    "sin sesión (4.1), el retorno desde Cuenta hacia la portada cuando se entró desde ella "
    "(4.2, P0-1), los textos de la pantalla (4.3), el estado de error en línea (4.4) y el botón "
    "de Google con estado «Pronto» (4.5)-, committarla con la batería en verde y seguir con las "
    "Áreas 5 a 10. Después la paridad de escritorio (11) y la profundidad del fondo (13), los "
    "dos P0 grandes, y el resto en orden hasta el 20."))
story.append(P(
    "Dos remanentes quedan expresamente apuntados dentro del Área 1 (profundidad de tarjetas y "
    "botones; consistencia de iconos y espaciado): se cerrarán durante el barrido de pulido de "
    "las pantallas en las Áreas 5 a 10, cuando cada pantalla se toque de nuevo, para no "
    "reabrir un commit ya verificado. Ningún ítem se ha descartado ni sustituido; lo que el "
    "entorno no permite hoy (medir Lighthouse) se reporta como pendiente con su razón."))

# ============================================================ 8. OFFLINE (g)
lead8 = P("La regla de oro 1 exige que el juego offline siga siendo 100 % completo tras cada "
          "cambio. La verificación se hizo sobre el diff acumulado de la ola (34317ae..HEAD) y "
          "sobre la batería de pruebas.")
story += h1_block("8. Equivalencia offline (g)", lead8)

story.append(P(
    "<b>Motor intacto.</b> En ese diff no hay ningún archivo del motor de juego, del RNG "
    "determinista ni del SRS. Los únicos archivos de components/game tocados son los dos "
    "shells de interfaz (app-shell y game-shell), con cuatro líneas de clases para adoptar la "
    "escala tipográfica. Las 344 pruebas en verde incluyen la suite completa del juego sin red: "
    "misiones, candados, frases, formatos y progreso."))
story.append(P(
    "<b>Audio sin red.</b> El audio.ts v3 conserva la API pública de siempre (sfx.tap, sfx.chime, "
    "sfx.back y compañía, música por escena, reloj y los tres buses con sus volúmenes). La "
    "precarga de los efectos frecuentes ocurre tras el primer gesto del jugador y el service "
    "worker v2.4.0 precachea el banco completo (8,09 MB), de modo que tras la primera visita el "
    "sonido íntegro está disponible sin conexión. Si un archivo no llega -primera visita sin "
    "red, navegador caprichoso-, el sintetizador de emergencia toma el turno: el juego nunca "
    "se queda mudo y, cuando el archivo existe, suena el archivo real."))
story.append(P(
    "<b>Sincronización intacta.</b> El flujo de la Ola 1.1 (syncOnLogin al iniciar sesión, "
    "subida con debounce y mergePayload por secciones) no ha cambiado; la nueva importJson "
    "reutiliza adoptSyncedState, que es exactamente el camino por el que el servidor ya "
    "escribe estado sincronizado, así que importar una copia local y adoptar el estado del "
    "servidor comparten código y pruebas."))
story.append(P(
    "<b>Respaldo sin cuenta.</b> La copia de seguridad JSON del ítem 4.1 es, por diseño de la "
    "Ola 1.2, la herramienta de respaldo del jugador sin sesión: exportar produce un JSON "
    "legible con versión y fecha, e importar valida el esqueleto (core y profile presentes, "
    "versión conocida) antes de restaurar. La lógica ya está en HEAD; los botones que la "
    "exponen, visibles solo sin sesión, son la primera pieza del Área 4 que sigue en la cola."))

story.append(Spacer(1, 14))
story.append(HRFlowable(width="100%", color=ACCENT, thickness=1.2, spaceBefore=0, spaceAfter=8))
story.append(P(
    "Conclusión de la ola al 13 de noviembre de 2026: la base está verificada y los tres P0 "
    "alcanzables sin interfaz ya viven en el repositorio (audio real completo, seguridad del "
    "backend completa y la lógica de la copia de seguridad). La siguiente parada es el Área 4, "
    "que convierte en visible lo que hoy ya funciona y cierra el P0-1 y el P0-6.", "body"))

doc.multiBuild(story)
print("OK body ->", OUT)
