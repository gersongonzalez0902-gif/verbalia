"use client";

/**
 * Vitality · Capa de dinamismo para escritorio (puntero fino).
 *
 * Da a la versión de PC la misma vida que la móvil:
 * - Aura suave que persigue al cursor (lerp con requestAnimationFrame).
 * - Tilt 3D y halo que sigue al ratón en tarjetas (variables --tilt-* / --mx --my).
 * - Barra de progreso de lectura + parallax del fondo al hacer scroll (--scroll-fx).
 * - Secciones que entran en cascada al aparecer por el borde inferior (reveal).
 * - Tic sonoro sutil al recorrer la barra lateral.
 *
 * Todo se desactiva con `prefers-reduced-motion` o el ajuste del jugador,
 * y no hace nada en táctil (la media query hover/pointer lo excluye).
 */

import { useEffect, useRef, useState } from "react";
import { useUiStore } from "@/store/ui-store";
import { sfx } from "@/services/audio";

const FINE_QUERY = "(hover: hover) and (pointer: fine)";

function motionOk(): boolean {
  if (typeof window === "undefined") return false;
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !document.documentElement.classList.contains("reduce-motion")
  );
}

export function Vitality() {
  const screenName = useUiStore((s) => s.screen.name);
  const glowRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  /** ¿Estamos en una partida? (las secciones de juego nunca se ocultan) */
  const gameRef = useRef(false);
  useEffect(() => {
    gameRef.current = screenName === "game";
  }, [screenName]);

  /* ---------- Activación reactiva: puntero fino + movimiento permitido ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia(FINE_QUERY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(fine.matches && motionOk());
    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    const classWatch = new MutationObserver(sync);
    classWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      classWatch.disconnect();
    };
  }, []);

  /* ---------- Motor: aura + tilt + halo + scroll + reveal + sonido ---------- */
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const root = document.documentElement;
    const cleanups: (() => void)[] = [];

    /* ===== 1 · Aura del cursor (interpolación suave) ===== */
    const glow = glowRef.current;
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let tx = gx;
    let ty = gy;
    let glowRaf = 0;
    let glowOn = false;
    const glowLoop = () => {
      gx += (tx - gx) * 0.14;
      gy += (ty - gy) * 0.14;
      if (glow) glow.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
      if (Math.abs(tx - gx) + Math.abs(ty - gy) > 0.4) {
        glowRaf = requestAnimationFrame(glowLoop);
      } else {
        glowRaf = 0;
      }
    };

    /* ===== 2 · Tilt 3D y halo de tarjeta (delegado, coalescido por frame) ===== */
    let tiltEl: HTMLElement | null = null;
    let fxRaf = 0;
    let pending: MouseEvent | null = null;
    const resetTilt = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    };
    const applyPointerFx = () => {
      fxRaf = 0;
      const e = pending;
      pending = null;
      if (!e) return;
      const target = e.target as HTMLElement | null;

      // Halo que sigue al cursor dentro de las tarjetas aurora.
      const card = target?.closest?.(
        ".card-aurora:not(.btn-shine):not(.btn-3d):not(.bar-shimmer):not(.no-vita)",
      ) as HTMLElement | null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      // Tilt 3D de los botones-tarjeta (±7°, con muelle en CSS).
      const el = target?.closest?.(".tap-3d:not(.no-vita), .tilt-hover:not(.no-vita)") as HTMLElement | null;
      if (el !== tiltEl) {
        resetTilt(tiltEl);
        tiltEl = el;
      }
      if (el) {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / Math.max(r.width, 1) - 0.5;
        const py = (e.clientY - r.top) / Math.max(r.height, 1) - 0.5;
        const max = 7;
        el.style.setProperty("--tilt-y", `${(px * max).toFixed(2)}deg`);
        el.style.setProperty("--tilt-x", `${(-py * max).toFixed(2)}deg`);
      }
    };
    const onPointerMove = (e: MouseEvent) => {
      // Aura
      tx = e.clientX;
      ty = e.clientY;
      if (!glowOn && glow) {
        glowOn = true;
        gx = tx;
        gy = ty;
        glow.style.opacity = "1";
      }
      if (!glowRaf) glowRaf = requestAnimationFrame(glowLoop);
      // Tarjetas
      pending = e;
      if (!fxRaf) fxRaf = requestAnimationFrame(applyPointerFx);
    };
    const onDocLeave = () => {
      glowOn = false;
      if (glow) glow.style.opacity = "0";
      resetTilt(tiltEl);
      tiltEl = null;
    };
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onDocLeave);
    cleanups.push(() => {
      window.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseleave", onDocLeave);
      if (glowRaf) cancelAnimationFrame(glowRaf);
      if (fxRaf) cancelAnimationFrame(fxRaf);
    });

    /* ===== 3 · Scroll: progreso de lectura + parallax del fondo ===== */
    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const y = window.scrollY;
        const max = Math.max(1, root.scrollHeight - window.innerHeight);
        root.style.setProperty("--progress", (Math.min(1, y / max)).toFixed(4));
        root.style.setProperty("--scroll-fx", String(Math.min(y, 6000)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    });

    /* ===== 4 · Reveal: secciones que desfilan al aparecer ===== */
    const io = new IntersectionObserver(
      (entries) => {
        let i = 0;
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (!entry.isIntersecting) continue;
          io.unobserve(el);
          // Cascada: las que entran juntas se turnan.
          el.style.setProperty("--reveal-delay", `${Math.min(i++, 5) * 80}ms`);
          el.classList.add("reveal-in");
        }
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.05 },
    );

    const isVisible = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };

    const scan = () => {
      if (gameRef.current) return; // En partida: nada de teatro.
      document
        .querySelectorAll<HTMLElement>("section:not([data-vita]):not(.no-vita)")
        .forEach((el) => {
          el.dataset.vita = "1";
          // Las que ya están a la vista entran con la transición de pantalla;
          // las que están bajo el pliegue esperan su momento al hacer scroll.
          if (isVisible(el)) return;
          el.classList.add("reveal");
          io.observe(el);
        });
    };
    scan();

    // Las pantallas se remontan al navegar: vigilar secciones nuevas.
    let moTimer: ReturnType<typeof setTimeout> | null = null;
    const bodyWatch = new MutationObserver(() => {
      if (moTimer) clearTimeout(moTimer);
      moTimer = setTimeout(scan, 140);
    });
    bodyWatch.observe(document.body, { childList: true, subtree: true });

    // Red de seguridad: si algo visible quedó oculto, se revela a los 4 s.
    const safety = setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.reveal-in)").forEach((el) => {
        if (isVisible(el)) el.classList.add("reveal-in");
      });
    }, 4000);

    cleanups.push(() => {
      io.disconnect();
      bodyWatch.disconnect();
      if (moTimer) clearTimeout(moTimer);
      clearTimeout(safety);
      // Si la capa se apaga a mitad de vuelo, que nada quede escondido.
      document.querySelectorAll<HTMLElement>(".reveal:not(.reveal-in)").forEach((el) => {
        el.classList.add("reveal-in");
      });
    });

    /* ===== 5 · Tic sutil al recorrer la barra lateral ===== */
    let lastTick = 0;
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const navBtn = target?.closest?.("aside button");
      if (!navBtn) return;
      const now = performance.now();
      if (now - lastTick < 170) return;
      lastTick = now;
      sfx.tap();
    };
    document.addEventListener("mouseover", onOver, { passive: true });
    cleanups.push(() => document.removeEventListener("mouseover", onOver));

    return () => {
      for (const fn of cleanups) fn();
      root.style.removeProperty("--progress");
      root.style.removeProperty("--scroll-fx");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={glowRef} className="vitality-cursor" aria-hidden />
      <div className="vitality-progress" aria-hidden />
    </>
  );
}
