"use client";

/**
 * Componentes visuales compartidos v3: anillo de progreso con halo,
 * barra de XP en surco con destello, insignia de nivel tipo gema,
 * racha con brasa viva, confeti y estados vacíos amigables.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { countAt, shouldAnimate } from "@/lib/animation";
import { Flame, Shield, Star } from "lucide-react";

/* ------------------------- Número animado (Área 14) -------------------------
 * Los contadores suben en vez de saltar: el XP y la tinta cuentan su
 * historia. Con movimiento reducido, el valor aparece de golpe (y listo). */
export function AnimatedNumber({
  value,
  duration = 600,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!shouldAnimate(reduce, value - shown)) {
      setShown(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const v = countAt(from, value, now - start, duration);
      setShown(v);
      if (v !== value) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={cn("numeric", className)}>{shown}</span>;
}

/* ------------------------- Anillo de progreso ------------------------- */

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  color = "var(--primary)",
  track = "color-mix(in oklch, var(--foreground) 12%, transparent)",
  children,
  label,
}: {
  /** 0 a 1 */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(clamped), 80);
    return () => clearTimeout(t);
  }, [clamped]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      {/* Halo suave detrás del anillo */}
      <span
        aria-hidden
        className="absolute inset-2 rounded-full blur-xl"
        style={{ background: `color-mix(in oklch, ${color} 24%, transparent)` }}
      />
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - animated)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

/* ------------------------- Barra de XP ------------------------- */

export function XpBar({ into, needed, className }: { into: number; needed: number; className?: string }) {
  const pct = needed > 0 ? Math.min(100, Math.round((into / needed) * 100)) : 100;
  return (
    <div
      className="groove h-3 w-full overflow-hidden rounded-full"
      role="progressbar"
      aria-valuenow={pct}
      aria-label="Progreso de nivel"
    >
      <div
        className="relative h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(180deg, color-mix(in oklch, var(--xp) 78%, white 20%), var(--xp) 55%, color-mix(in oklch, var(--xp) 82%, #000 16%))",
          boxShadow: "inset 0 1px 0 oklch(1 0 0 / 40%), 0 1px 3px color-mix(in oklch, var(--xp) 45%, transparent)",
        }}
      >
        {/* Destello viajero: la tinta líquida del nivel */}
        <span className="xp-shimmer absolute inset-0 rounded-full" aria-hidden />
      </div>
    </div>
  );
}

/* ------------------------- Insignia de nivel ------------------------- */

export function LevelBadge({ level, size = "md" }: { level: number; size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "h-9 w-9 text-sm", md: "h-12 w-12 text-lg", lg: "h-16 w-16 text-2xl" }[size];
  return (
    <div
      className={cn(
        "gloss relative flex shrink-0 items-center justify-center rounded-2xl font-bold text-primary-foreground",
        dims,
      )}
      style={{
        background:
          "linear-gradient(155deg, color-mix(in oklch, var(--primary) 76%, white 18%), var(--primary) 58%, color-mix(in oklch, var(--primary) 84%, #000 14%))",
        boxShadow:
          "0 3px 0 0 color-mix(in oklch, var(--primary) 52%, #000 30%), inset 0 1px 0 oklch(1 0 0 / 32%), 0 6px 14px -8px color-mix(in oklch, var(--primary) 55%, transparent)",
      }}
      aria-label={`Nivel ${level}`}
    >
      <span className="numeric drop-shadow-sm">{level}</span>
      <Star className="anim-twinkle absolute -right-1.5 -top-1.5 h-4.5 w-4.5 fill-[var(--xp)] text-[var(--xp)] drop-shadow" />
    </div>
  );
}

/* ------------------------- Racha y escudos ------------------------- */

export function StreakBadge({ current, shields }: { current: number; shields: number }) {
  const hot = current > 0;
  return (
    <div
      className={cn(
        "gloss flex items-center gap-1.5 rounded-full px-3 py-1.5",
        hot ? "text-foreground" : "bg-secondary text-foreground",
      )}
      style={
        hot
          ? {
              background:
                "linear-gradient(150deg, oklch(0.96 0.05 75), oklch(0.9 0.07 62) 70%)",
              boxShadow:
                "0 2px 0 0 oklch(0.72 0.1 55), inset 0 1px 0 oklch(1 0 0 / 45%)",
            }
          : undefined
      }
      title="Racha de días jugando"
    >
      <Flame
        className={cn("h-4 w-4", hot ? "anim-flame text-orange-600" : "text-muted-foreground")}
        aria-hidden
      />
      <span className="numeric text-sm font-bold" aria-label={`Racha de ${current} días`}>
        {current}
      </span>
      {shields > 0 && (
        <span className="flex items-center gap-0.5" title={`${shields} escudo(s) de racha`}>
          <Shield className="h-3.5 w-3.5 text-primary" aria-hidden />
          <span className="numeric text-xs font-bold text-primary">{shields}</span>
        </span>
      )}
    </div>
  );
}

/* ------------------------- Confeti de celebración ------------------------- */

const CONFETTI_COLORS = ["var(--xp)", "var(--region-bosque)", "var(--region-torre)", "var(--region-ciudad)", "var(--region-biblioteca)"];

export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const seeds = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1.2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        scale: 0.7 + Math.random() * 0.7,
      })),
    [pieces],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {seeds.map((s, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${s.left}%`,
            background: s.color,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            transform: `scale(${s.scale})`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------- Estado vacío ------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-aurora flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card/70 px-6 py-10 text-center">
      <div className="chip-icon anim-bob flex h-14 w-14 items-center justify-center rounded-2xl [&>svg]:h-7 [&>svg]:w-7">
        {icon}
      </div>
      <div>
        <p className="font-display text-base font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

/* ------------------------- Chip de estado de colección ------------------------- */

export function StatusChip({ status }: { status: "nueva" | "aprendiendo" | "aprendida" | "dominada" }) {
  const styles: Record<string, string> = {
    nueva: "bg-muted text-muted-foreground",
    aprendiendo: "bg-secondary text-secondary-foreground",
    aprendida: "bg-primary/15 text-primary",
    dominada: "bg-[var(--xp)]/25 text-[var(--xp)]",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", styles[status])}>
      {status}
    </span>
  );
}
