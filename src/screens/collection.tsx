"use client";

/**
 * Colección de palabras · Todas las palabras del jardín con su estado
 * SRS, próxima revisión y buscador/filtros. Las tarjetas se pintan por
 * bloques (carga incremental) para no fundir el rendimiento con
 * más de mil palabras de golpe.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { EmptyState, StatusChip, ProgressRing } from "@/components/game/widgets";
import { SRS_WORDS_FULL } from "@/data/content";
import { cardStatus } from "@/engine/srs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookMarked, Search, Sprout } from "lucide-react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import type { Cefr } from "@/types";

type Filter = "todas" | "nueva" | "aprendiendo" | "aprendida" | "dominada";

const FILTERS: Filter[] = ["todas", "nueva", "aprendiendo", "aprendida", "dominada"];
const CEFR_LEVELS: ("todas" | Cefr)[] = ["todas", "A1", "A2", "B1", "B2", "C1", "C2"];
/** Palabras pintadas por bloque (carga incremental suave). */
const CHUNK = 36;

export function CollectionScreen() {
  const srs = useGameStore((s) => s.srs);
  const navigate = useUiStore((s) => s.navigate);
  const [filter, setFilter] = useState<Filter>("todas");
  const [cefr, setCefr] = useState<(typeof CEFR_LEVELS)[number]>("todas");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(CHUNK);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const counts = { nueva: 0, aprendiendo: 0, aprendida: 0, dominada: 0 };
    for (const w of SRS_WORDS_FULL) counts[cardStatus(srs[w.id])]++;
    return counts;
  }, [srs]);

  const words = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SRS_WORDS_FULL.filter((w) => {
      const status = cardStatus(srs[w.id]);
      if (filter !== "todas" && status !== filter) return false;
      if (cefr !== "todas" && w.cefr !== cefr) return false;
      if (q && !w.word.toLowerCase().includes(q) && !w.definition.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => a.difficulty - b.difficulty || a.word.localeCompare(b.word, "es"));
  }, [srs, filter, cefr, query]);

  // Al cambiar búsqueda o filtros, la ventana visible se reinicia.
  useEffect(() => setVisible(CHUNK), [filter, cefr, query]);

  // Bloques infinitos: al acercarse al final se pinta el siguiente bloque.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible((v) => Math.min(v + CHUNK, words.length));
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [words.length]);

  const learned = stats.aprendida + stats.dominada;

  return (
    <div>
      <ScreenHeader title="Colección de palabras" subtitle={`${learned} de ${SRS_WORDS_FULL.length} aprendidas`} backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-28">
        {/* Progreso global */}
        <section className="card-aurora relative mt-4 flex items-center gap-4 overflow-hidden rounded-3xl border bg-card p-4">
          <span aria-hidden className="anim-float absolute -right-2 -top-3 text-5xl opacity-25 select-none">🌿</span>
          <span aria-hidden className="anim-float absolute -bottom-3 right-14 text-3xl opacity-20 select-none" style={{ animationDelay: "-2.5s" }}>🌱</span>
          <ProgressRing value={learned / SRS_WORDS_FULL.length} size={84} stroke={9}>
            <span className="numeric type-h2">{Math.round((learned / SRS_WORDS_FULL.length) * 100)}%</span>
          </ProgressRing>
          <div className="relative text-sm">
            <p className="font-bold">Tu jardín de vocabulario</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {stats.dominada} dominadas · {stats.aprendida} aprendidas · {stats.aprendiendo} en riego · {stats.nueva} por descubrir
            </p>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: "srs", mode: "training" }); }}
            >
              <Sprout className="mr-1.5 h-4 w-4" aria-hidden />
              Regar el jardín
            </Button>
          </div>
        </section>

        {/* Búsqueda y filtros */}
        <div className="mt-4 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar palabra o significado…"
              aria-label="Buscar en la colección"
              className="h-11 rounded-2xl pl-9"
            />
          </div>
          <div className="scroll-soft flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por estado">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { sfx.tap(); setFilter(f); }}
                aria-pressed={filter === f}
                className={cn(
                  "tap-target shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold capitalize transition active:translate-y-0.5",
                  filter === f
                    ? "gloss border-primary bg-primary text-primary-foreground shadow-[0_3px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_30%)]"
                    : "tap-3d border-border bg-card text-muted-foreground",
                )}
              >
                {f} {f !== "todas" && `(${stats[f as keyof typeof stats]})`}
              </button>
            ))}
          </div>
          {/* Filtro MCER (Etapa 4) */}
          <div className="scroll-soft flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por nivel MCER">
            {CEFR_LEVELS.map((c) => (
              <button
                key={c}
                onClick={() => { sfx.tap(); setCefr(c); }}
                aria-pressed={cefr === c}
                className={cn(
                  "tap-target shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase transition active:translate-y-0.5",
                  cefr === c
                    ? "gloss border-primary bg-primary text-primary-foreground shadow-[0_3px_0_0_color-mix(in_oklch,var(--primary)_52%,#000_30%)]"
                    : "tap-3d border-border bg-card text-muted-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tarjetas de palabras (carga incremental) */}
        {words.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<BookMarked />}
              title="Nada por aquí"
              description="Ninguna palabra coincide con la búsqueda. Prueba con otro término o filtro."
            />
          </div>
        ) : (
          <>
            <ul className="stagger mt-4 grid gap-2.5 sm:grid-cols-2" aria-label="Palabras de la colección">
              {words.slice(0, visible).map((w) => {
              const card = srs[w.id];
              const status = cardStatus(card);
              const nextReview = card
                ? card.dueAt <= Date.now()
                  ? "lista para repasar"
                  : `próxima revisión: ${formatDue(card.dueAt)}`
                : "sin descubrir";
              return (
                <li key={w.id} className="card-aurora rounded-2xl border bg-card p-4 transition hover:border-primary/40">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="type-h2 leading-tight">{w.word}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {w.pos} · {w.cefr}
                      </p>
                    </div>
                    <StatusChip status={status} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.definition}</p>
                  <details className="group mt-1.5" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) sfx.page(); }}>
                    <summary className="cursor-pointer text-xs font-bold text-primary">Ver ejemplo</summary>
                    <p className="mt-1 rounded-xl bg-secondary px-3 py-2 text-xs italic leading-relaxed text-secondary-foreground">
                      «{w.example}»
                    </p>
                  </details>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {nextReview}
                    {card && ` · vista ${card.reps + card.lapses} veces`}
                  </p>
                </li>
              );
            })}
            </ul>
            {visible < words.length ? (
              <div ref={sentinelRef} className="py-6 text-center">
                <Button size="sm" variant="ghost" onClick={() => setVisible((v) => Math.min(v + CHUNK, words.length))}>
                  Cargar más palabras ({words.length - visible} restantes)
                </Button>
              </div>
            ) : (
              words.length > CHUNK && (
                <p className="py-5 text-center text-[11px] text-muted-foreground">
                  Fin del jardín · {words.length} palabras en esta vista
                </p>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

function formatDue(ts: number): string {
  const days = Math.ceil((ts - Date.now()) / 86_400_000);
  if (days <= 0) return "hoy";
  if (days === 1) return "mañana";
  if (days < 7) return `en ${days} días`;
  return `en ${Math.ceil(days / 7)} semanas`;
}
