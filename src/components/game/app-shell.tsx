"use client";

/**
 * Carcasa de la aplicación.
 * - Móvil: navegación inferior accesible con el pulgar (5 destinos).
 * - Escritorio: barra lateral con acceso completo a todas las pantallas.
 * El HUD superior muestra nivel, XP, racha y ajustes en pantallas clave.
 */

import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { levelProgress } from "@/engine/xp";
import { LevelBadge, StreakBadge, XpBar } from "@/components/game/widgets";
import { cn } from "@/lib/utils";
import {
  BookMarked,
  ChartColumn,
  Compass,
  Home,
  Library,
  ListChecks,
  Map as MapIcon,
  NotebookPen,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import type { Screen } from "@/types";

const MOBILE_NAV: { screen: Screen; label: string; icon: React.ElementType }[] = [
  { screen: { name: "home" }, label: "Inicio", icon: Home },
  { screen: { name: "map" }, label: "Mapa", icon: MapIcon },
  { screen: { name: "missions" }, label: "Misiones", icon: ListChecks },
  { screen: { name: "collection" }, label: "Colección", icon: BookMarked },
  { screen: { name: "profile" }, label: "Perfil", icon: User },
];

const SIDEBAR_NAV: { section: string; items: { screen: Screen; label: string; icon: React.ElementType }[] }[] = [
  {
    section: "Aventura",
    items: [
      { screen: { name: "home" }, label: "Inicio", icon: Home },
      { screen: { name: "map" }, label: "Mapa del Archipiélago", icon: MapIcon },
      { screen: { name: "missions" }, label: "Misiones y logros", icon: ListChecks },
      { screen: { name: "collection" }, label: "Colección de palabras", icon: BookMarked },
    ],
  },
  {
    section: "Progreso",
    items: [
      { screen: { name: "stats" }, label: "Estadísticas", icon: ChartColumn },
      { screen: { name: "errors" }, label: "Cuaderno de errores", icon: NotebookPen },
      { screen: { name: "profile" }, label: "Perfil", icon: User },
    ],
  },
  {
    section: "Más",
    items: [
      { screen: { name: "library" }, label: "Biblioteca y hoja de ruta", icon: Library },
      { screen: { name: "settings" }, label: "Ajustes", icon: Settings },
    ],
  },
];

function isActive(current: Screen, target: Screen): boolean {
  return current.name === target.name;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/icon.svg" alt="" width={34} height={34} className="rounded-lg" />
      <div className={cn("leading-tight", compact && "hidden lg:block")}>
        <p className="font-display text-lg font-bold tracking-tight">VERBALIA</p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          La aventura del lenguaje
        </p>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  showChrome = true,
}: {
  children: React.ReactNode;
  /** Las pantallas de juego ocultan la navegación para no distraer. */
  showChrome?: boolean;
}) {
  const screen = useUiStore((s) => s.screen);
  const navigate = useUiStore((s) => s.navigate);
  const core = useGameStore((s) => s.core);
  const { level, into, needed } = levelProgress(core.xp);

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row">
      {/* ===== Barra lateral (escritorio) ===== */}
      {showChrome && (
        <aside className="sticky top-0 z-40 hidden h-dvh w-64 shrink-0 flex-col border-r bg-[var(--sidebar)] px-4 py-5 lg:flex">
          <button
            className="mb-5 flex w-full items-center rounded-xl px-2 py-1 text-left transition hover:bg-sidebar-accent"
            onClick={() => navigate({ name: "home" })}
          >
            <Logo />
          </button>

          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
            <LevelBadge level={level} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-bold">Nivel {level}</span>
                <span className="numeric text-[11px] text-muted-foreground">
                  {into}/{needed}
                </span>
              </div>
              <XpBar into={into} needed={needed} className="mt-1.5 h-2" />
            </div>
          </div>

          <nav aria-label="Navegación principal" className="scroll-soft flex-1 space-y-4 overflow-y-auto">
            {SIDEBAR_NAV.map((group) => (
              <div key={group.section}>
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {group.section}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(screen, item.screen);
                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => navigate(item.screen)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                            active
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                              : "text-sidebar-foreground/85 hover:bg-sidebar-accent",
                          )}
                        >
                          <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <p className="mt-3 flex items-center gap-1.5 px-3 text-[11px] leading-snug text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Tus datos se guardan solo en este dispositivo.
          </p>
        </aside>
      )}

      {/* ===== Contenido ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
      {children}
      </div>

      {/* ===== Navegación inferior (móvil) ===== */}
      {showChrome && (
        <nav
          aria-label="Navegación principal"
          className="safe-bottom sticky bottom-0 z-40 border-t bg-[var(--surface-glass)] backdrop-blur-lg lg:hidden"
        >
          <ul className="grid grid-cols-5">
            {MOBILE_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(screen, item.screen);
              return (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.screen)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "tap-target flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-bold transition",
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", active && "scale-110 transition-transform")} aria-hidden />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

/** Cabecera común de pantallas secundarias (móvil). */
export function ScreenHeader({
  title,
  subtitle,
  backTo = { name: "home" } as Screen,
  right,
}: {
  title: string;
  subtitle?: string;
  backTo?: Screen;
  right?: React.ReactNode;
}) {
  const navigate = useUiStore((s) => s.navigate);
  return (
    <header className="safe-top sticky top-0 z-30 border-b bg-[var(--surface-glass)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        <button
          onClick={() => navigate(backTo)}
          aria-label="Volver"
          className="tap-target -ml-2 flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

/** Mini HUD de nivel y racha para la cabecera del dashboard móvil. */
export function MobileHud() {
  const core = useGameStore((s) => s.core);
  const { level, into, needed } = levelProgress(core.xp);
  return (
    <div className="flex items-center gap-2.5">
      <StreakBadge current={core.streak.current} shields={core.streak.shields} />
      <LevelBadge level={level} size="sm" />
      <span className="numeric sr-only">{`${into} de ${needed} XP`}</span>
    </div>
  );
}
