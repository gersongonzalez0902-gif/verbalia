"use client";

/**
 * Componentes visuales compartidos: anillo de progreso, barra de XP,
 * insignia de nivel, racha con escudos y confeti de celebración.
 */

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Flame, Shield, Star } from "lucide-react";

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
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)} role="progressbar" aria-valuenow={pct} aria-label="Progreso de nivel">
      <div
        className="h-full rounded-full bg-[var(--xp)] transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ------------------------- Insignia de nivel ------------------------- */

export function LevelBadge({ level, size = "md" }: { level: number; size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "h-9 w-9 text-sm", md: "h-12 w-12 text-lg", lg: "h-16 w-16 text-2xl" }[size];
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground shadow-sm",
        dims,
      )}
      aria-label={`Nivel ${level}`}
    >
      <span className="numeric">{level}</span>
      <Star className="absolute -right-1 -top-1 h-4 w-4 fill-[var(--xp)] text-[var(--xp)]" />
    </div>
  );
}

/* ------------------------- Racha y escudos ------------------------- */

export function StreakBadge({ current, shields }: { current: number; shields: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5" title="Racha de días jugando">
      <Flame
        className={cn("h-4 w-4", current > 0 ? "anim-flame text-orange-500" : "text-muted-foreground")}
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground [&>svg]:h-7 [&>svg]:w-7">
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
