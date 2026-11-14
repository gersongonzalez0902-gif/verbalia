"use client";

/**
 * Carrusel horizontal · VERBALIA
 * ----------------------------------------------------------------
 * Sección deslizable con scroll-snap (funciona con rueda, arrastre
 * y táctil) y flechas de navegación con relieve que solo aparecen
 * en escritorio (puntero fino) para mantener el móvil intacto.
 * Los bordes se desvanecen al llegar a los extremos.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "@/services/audio";

export function Carousel({
  ariaLabel,
  className,
  children,
}: {
  ariaLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 6,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 6,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, [updateEdges]);

  /** Vigila que los hijos montados tarde (pantallas dinámicas) midan. */
  useEffect(() => {
    const t = window.setTimeout(updateEdges, 250);
    return () => window.clearTimeout(t);
  }, [updateEdges]);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    sfx.slide();
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.78), behavior: "smooth" });
  };

  return (
    <div className={cn("group/caro relative", className)}>
      <div
        ref={trackRef}
        role="group"
        aria-label={ariaLabel}
        className="scroll-soft flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Fundido de extremos: avisa que hay más contenido */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent transition-opacity duration-300",
          edges.start ? "opacity-0" : "opacity-90",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent transition-opacity duration-300",
          edges.end ? "opacity-0" : "opacity-90",
        )}
      />

      {/* Flechas (solo escritorio): aparecen al acercar el cursor */}
      <button
        onClick={() => nudge(-1)}
        disabled={edges.start}
        aria-label="Deslizar hacia la izquierda"
        className={cn(
          "tap-target absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-card text-foreground shadow-md transition-all duration-200 lg:flex",
          "hover:-translate-x-0.5 hover:border-primary/50 hover:shadow-lg active:scale-95",
          edges.start
            ? "pointer-events-none opacity-0"
            : "opacity-0 group-hover/caro:opacity-100 focus-visible:opacity-100",
        )}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        onClick={() => nudge(1)}
        disabled={edges.end}
        aria-label="Deslizar hacia la derecha"
        className={cn(
          "tap-target absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-card text-foreground shadow-md transition-all duration-200 lg:flex",
          "hover:translate-x-0.5 hover:border-primary/50 hover:shadow-lg active:scale-95",
          edges.end
            ? "pointer-events-none opacity-0"
            : "opacity-0 group-hover/caro:opacity-100 focus-visible:opacity-100",
        )}
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
