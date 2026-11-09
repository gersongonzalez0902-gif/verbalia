"use client";

/**
 * Tarjeta «Frase del día» · rota en cada navegación (navCount del
 * enrutador) y con el botón «Otra frase» (fraseSpin), para que el
 * viaje siempre encuentre una frase nueva a demanda del jugador.
 * Presentada como una nota pegada en la bitácora.
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
        <p key={`${navCount}-${fraseSpin}`} className={cn("anim-slide-up font-display italic leading-relaxed", compact ? "text-[13px]" : "text-base")}>
          «{frase.text}»
        </p>
        <figcaption className="mt-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          — {frase.author}
        </figcaption>
      </blockquote>
      <button
        onClick={() => { sfx.flip(); rotateFrase(); }}
        aria-label="Cambiar la frase"
        title="Otra frase"
        className="tap-target absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/70 transition hover:bg-muted hover:text-primary active:scale-90"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
      </button>
    </figure>
  );
}
