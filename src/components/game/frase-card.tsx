"use client";

/**
 * Tarjeta «Frase del día» · Protagonista del inicio, no colofón.
 * ----------------------------------------------------------------
 * - Rotación: en cada navegación (navCount) y con el botón «Otra
 *   frase» (fraseSpin), para que siempre haya una frase nueva a
 *   demanda del jugador.
 * - Presentación: nota de la bitácora con sello de lacre — borde
 *   auroral, comillas ornamentales y autor destacado. Se coloca en
 *   la mitad superior del dashboard para que se vea sin hacer scroll.
 */

import { useMemo } from "react";
import { useUiStore } from "@/store/ui-store";
import { frasePara } from "@/data/frases";
import { sfx } from "@/services/audio";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function FraseCard({ className, compact = false }: { className?: string; compact?: boolean }) {
  const navCount = useUiStore((s) => s.navCount);
  const fraseSpin = useUiStore((s) => s.fraseSpin);
  const rotateFrase = useUiStore((s) => s.rotateFrase);
  const frase = useMemo(() => frasePara(navCount * 7 + 3 + fraseSpin * 11), [navCount, fraseSpin]);

  return (
    <figure
      className={cn(
        "card-aurora relative overflow-hidden rounded-3xl border bg-card",
        compact ? "p-3.5" : "p-5 pt-4",
        className,
      )}
      aria-label="Frase del día"
      style={{
        borderColor: "color-mix(in oklch, var(--accent) 45%, var(--border))",
        background:
          "linear-gradient(160deg, color-mix(in oklch, var(--accent) 9%, var(--card)) 0%, var(--card) 55%)",
      }}
    >
      {/* Cinta washi de la nota */}
      <span
        aria-hidden
        className="absolute left-1/2 top-0 h-2.5 w-24 -translate-x-1/2 rounded-b-md"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklch, var(--accent) 85%, transparent), color-mix(in oklch, var(--accent) 55%, transparent))",
          opacity: 0.9,
        }}
      />

      {/* Encabezado: etiqueta + botón «Otra frase» */}
      <figcaption className="flex items-center justify-between gap-2 pl-1 pr-0.5">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          Frase del día
        </span>
        <button
          onClick={() => { sfx.flip(); rotateFrase(); }}
          aria-label="Cambiar la frase"
          title="Otra frase"
          className="tap-3d flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold text-muted-foreground transition hover:border-primary/50 hover:text-primary active:scale-95"
        >
          <RefreshCw className="h-3 w-3" aria-hidden />
          Otra frase
        </button>
      </figcaption>

      <blockquote className={cn("mt-1.5 text-center", compact && "mt-1")}>
        <p
          key={`${navCount}-${fraseSpin}`}
          className={cn(
            "anim-slide-up font-display italic leading-relaxed text-foreground",
            compact ? "text-[13px]" : "text-lg sm:text-xl",
          )}
        >
          <span aria-hidden className="mr-0.5 align-top text-lg not-italic" style={{ color: "var(--accent)" }}>«</span>
          {frase.text}
          <span aria-hidden className="ml-0.5 align-top text-lg not-italic" style={{ color: "var(--accent)" }}>»</span>
        </p>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
          — {frase.author}
        </p>
      </blockquote>
    </figure>
  );
}
