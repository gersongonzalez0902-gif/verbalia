"use client";

/**
 * Bitácora de Frases · Todas las frases del viaje, navegables.
 * La frase del día encabeza la colección (marcada con cinta washi),
 * con filtros por tema, buscador y carga incremental para no pintar
 * las 300+ notas de golpe.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { EmptyState } from "@/components/game/widgets";
import { FRASES, fraseDelDia, type FraseDelDia } from "@/data/frases";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";

const TAG_LABELS: Record<string, string> = {
  lectura: "Lectura",
  escritura: "Escritura",
  palabras: "Palabras",
  idiomas: "Idiomas",
  aprendizaje: "Aprendizaje",
  archipielago: "Archipiélago",
  cultura: "Cultura",
  estilo: "Estilo",
};

const CHUNK = 24;

export function FrasesScreen() {
  const navigate = useUiStore((s) => s.navigate);
  const navCount = useUiStore((s) => s.navCount);
  const [tag, setTag] = useState<string>("todas");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(CHUNK);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const daily = useMemo(() => fraseDelDia(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FRASES.filter((f) => {
      if (tag !== "todas" && f.tag !== tag) return false;
      if (q && !f.text.toLowerCase().includes(q) && !f.author.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tag, query]);

  // Al cambiar el filtro se reinicia la ventana visible. Ajuste durante el
  // render (patrón oficial) en vez de efecto: sin repintado en cascada.
  const [listKey, setListKey] = useState(`${tag}|${query}`);
  const key = `${tag}|${query}`;
  if (listKey !== key) {
    setListKey(key);
    setVisible(CHUNK);
  }

  // Carga incremental: un centinela al final dispara el siguiente bloque.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible((v) => Math.min(v + CHUNK, filtered.length));
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  const shown = filtered.slice(0, visible);
  const tags = useMemo(() => ["todas", ...Object.keys(TAG_LABELS)], []);

  return (
    <div>
      <ScreenHeader
        title="Bitácora de Frases"
        subtitle={`${FRASES.length} frases de escritores y del Archipiélago`}
        backTo={{ name: "home" }}
      />

      <main className="mx-auto w-full max-w-2xl px-4 pb-28">
        {/* Frase del día */}
        <section className="card-aurora relative mt-4 overflow-hidden rounded-3xl border border-primary/40 bg-card p-5 pt-7 text-center" aria-label="Frase del día">
          <span
            aria-hidden
            className="absolute left-1/2 top-0 h-3 w-24 -translate-x-1/2 rounded-b-md"
            style={{
              background: "linear-gradient(180deg, color-mix(in oklch, var(--accent) 80%, transparent), color-mix(in oklch, var(--accent) 55%, transparent))",
            }}
          />
          <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Frase del día
          </p>
          <blockquote className="mt-2.5">
            <p className="font-display text-lg italic leading-relaxed">«{daily.text}»</p>
            <figcaption className="mt-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              — {daily.author}
            </figcaption>
          </blockquote>
        </section>

        {/* Buscador + filtros */}
        <div className="mt-4 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar frase o autor…"
              aria-label="Buscar en la bitácora"
              className="h-11 rounded-2xl pl-9"
            />
          </div>
          <div className="scroll-soft flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por tema">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => { sfx.tap(); setTag(t); }}
                aria-pressed={tag === t}
                className={cn(
                  "tap-target shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition active:translate-y-0.5",
                  tag === t
                    ? "gloss border-primary bg-primary text-primary-foreground shadow-[0_3px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_30%)]"
                    : "tap-3d border-border bg-card text-muted-foreground",
                )}
              >
                {t === "todas" ? "Todas" : (TAG_LABELS[t] ?? t)}
              </button>
            ))}
          </div>
        </div>

        {/* Colección de notas */}
        {shown.length === 0 ? (
          <div className="mt-6">
            <EmptyState icon={<Search />} title="Ninguna frase coincide" description="Prueba con otro término o elige otro tema." />
          </div>
        ) : (
          <ul className="stagger mt-4 grid gap-2.5" aria-label="Frases de la bitácora">
            {shown.map((f, i) => (
              <li key={`${f.text.slice(0, 24)}-${i}`}>
                <FraseNote frase={f} isDaily={f.text === daily.text} />
              </li>
            ))}
          </ul>
        )}

        {visible < filtered.length && (
          <div ref={sentinelRef} className="py-6 text-center">
            <Button size="sm" variant="ghost" onClick={() => setVisible((v) => Math.min(v + CHUNK, filtered.length))}>
              Cargar más frases ({filtered.length - visible} restantes)
            </Button>
          </div>
        )}
        {visible >= filtered.length && filtered.length > CHUNK && (
          <p className="py-5 text-center text-[11px] text-muted-foreground">
            Has llegado al fondo de la bitácora · {filtered.length} frases
          </p>
        )}

        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
          Las citas reales son de autores de dominio público o referencias verificables;
          los aforismos del Archipiélago son de autoría original de VerbalIA.
        </p>
      </main>
    </div>
  );
}

/** Nota individual: cita con su autor y tema. */
function FraseNote({ frase, isDaily }: { frase: FraseDelDia; isDaily: boolean }) {
  return (
    <figure
      className={cn(
        "card-aurora relative rounded-2xl border bg-card p-4 transition hover:border-primary/40",
        isDaily && "border-primary/50",
      )}
    >
      <blockquote className="text-sm leading-relaxed">
        <p className="font-display text-[15px] italic leading-relaxed">«{frase.text}»</p>
        <figcaption className="mt-1.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            — {frase.author}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-secondary-foreground">
            {TAG_LABELS[frase.tag] ?? frase.tag}
          </span>
        </figcaption>
      </blockquote>
    </figure>
  );
}
