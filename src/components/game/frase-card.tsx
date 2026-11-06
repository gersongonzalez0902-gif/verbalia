"use client";

/**
 * Tarjeta «Frase del día» · rota en cada navegación (navCount del
 * enrutador) para que el viaje siempre encuentre una frase nueva.
 * Presentada como una nota pegada en la bitácora.
 */

import { useMemo } from "react";
import { useUiStore } from "@/store/ui-store";
import { frasePara } from "@/data/frases";
import { cn } from "@/lib/utils";

export function FraseCard({ className, compact = false }: { className?: string; compact?: boolean }) {
  const navCount = useUiStore((s) => s.navCount);
  const frase = useMemo(() => frasePara(navCount * 7 + 3), [navCount]);

  return (
    <figure
      className={cn(
        "card-aurora relative overflow-hidden rounded-3xl border bg-card p-4 pr-5",
        compact && "p-3",
        className,
      )}
      aria-label="Frase del día"
    >
      {/* Cinta washi de la nota */}
      <span
        aria-hidden
        className="absolute left-1/2 top-0 h-2.5 w-20 -translate-x-1/2 rounded-b-md"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklch, var(--accent) 80%, transparent), color-mix(in oklch, var(--accent) 55%, transparent))",
          opacity: 0.85,
        }}
      />
      <blockquote className={cn("pt-2 text-center", compact ? "text-xs" : "text-sm")}>
        <p className={cn("font-display italic leading-relaxed", compact ? "text-[13px]" : "text-base")}>
          «{frase.text}»
        </p>
        <figcaption className="mt-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          — {frase.author}
        </figcaption>
      </blockquote>
    </figure>
  );
}
