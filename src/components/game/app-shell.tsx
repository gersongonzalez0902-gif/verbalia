"use client";

/**
 * Carcasa de la aplicación v3.
 * - Móvil: muelle flotante de cristal (dock) con píldora activa.
 * - Escritorio: barra lateral con relieve y acentos de escena.
 * El HUD superior muestra nivel, XP, racha y ajustes en pantallas clave.
 */

import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { levelProgress } from "@/engine/xp";
import { LevelBadge, StreakBadge, XpBar } from "@/components/game/widgets";
import { AmbientBackdrop } from "@/components/game/ambient";
import { OrnamentLayer } from "@/components/game/ornaments";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import {
  BookMarked,
  ChartColumn,
  Home,
  Library,
  ListChecks,
  ListMusic,
  Map as MapIcon,
  NotebookPen,
  Settings,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";
import type { Screen } from "@/types";

const MOBILE_NAV: { screen: Screen; label: string; icon: React.ElementType }[] = [
  { screen: { name: "home" }, label: "Inicio", icon: Home },
  { screen: { name: "map" }, label: "Mapa", icon: MapIcon },
  { screen: { name: "missions" }, label: "Misiones", icon: ListChecks },
  { screen: { name: "collection" }, label: "Palabras", icon: BookMarked },
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
      { screen: { name: "shop" }, label: "El Bazar del Copista", icon: ShoppingBag },
    ],
  },
  {
    section: "Más",
    items: [
      { screen: { name: "music" }, label: "Estación de música", icon: ListMusic },
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
      <span className="chip-icon anim-bob flex h-9 w-9 items-center justify-center rounded-xl">
        <img src="/icon.svg" alt="" width={26} height={26} className="rounded-md" />
      </span>
      <div className={cn("leading-tight", compact && "hidden lg:block")}>
        <p className="font-display title-sheen text-lg font-bold tracking-tight">VERBALIA</p>
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
    <div className="relative flex min-h-dvh flex-col bg-background lg:flex-row">
      {/* ===== Ambientación: mareas, polvo de letras, ornamentos y color ===== */}
      {showChrome && <AmbientBackdrop />}
      {showChrome && <OrnamentLayer />}

      {/* ===== Barra lateral (escritorio) ===== */}
      {showChrome && (
        <aside className="sticky top-0 z-40 hidden h-dvh w-64 shrink-0 flex-col border-r bg-[var(--sidebar)] px-4 py-5 lg:flex">
          <button
            className="row-soft mb-5 flex w-full items-center rounded-xl px-2 py-1 text-left hover:bg-sidebar-accent"
            onClick={() => {
              sfx.navigate();
              navigate({ name: "home" });
            }}
          >
            <Logo />
          </button>

          <div className="card-aurora mb-4 flex items-center gap-3 rounded-2xl bg-card p-3">
            <LevelBadge level={level} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-bold">Nivel {level}</span>
                <span className="numeric text-[11px] text-muted-foreground">
                  {into}/{needed}
                </span>
              </div>
              <XpBar into={into} needed={needed} className="mt-1.5 h-2.5" />
            </div>
          </div>

          <nav aria-label="Navegación principal" className="scroll-soft flex-1 space-y-4 overflow-y-auto">
            {SIDEBAR_NAV.map((group) => (
              <div key={group.section}>
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {group.section}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(screen, item.screen);
                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => {
                            sfx.navigate();
                            navigate(item.screen);
                          }}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "row-soft flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
                            active
                              ? "gloss bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_3px_0_0_color-mix(in_oklch,var(--sidebar-primary)_55%,#000_28%)]"
                              : "text-sidebar-foreground/85 hover:bg-sidebar-accent active:scale-[0.98]",
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
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
      {children}
      </div>

      {/* ===== Muelle flotante (móvil) ===== */}
      {showChrome && (
        <nav
          aria-label="Navegación principal"
          className="safe-bottom dock sticky bottom-3 z-40 mx-3 mb-3 lg:hidden"
        >
          <ul className="grid grid-cols-5 items-center px-1.5 py-1.5">
            {MOBILE_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(screen, item.screen);
              return (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      sfx.navigate();
                      navigate(item.screen);
                    }}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "dock-item tap-target flex w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-bold",
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200",
                        active && "dock-pill",
                      )}
                      aria-hidden
                    >
                      <Icon className={cn("h-5 w-5", active && "scale-110 drop-shadow-sm")} />
                    </span>
                    <span className={cn(active && "tracking-wide")}>{item.label}</span>
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

/** Cabecera héroe común de pantallas secundarias (móvil y escritorio). */
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
    <header className="hero-band safe-top sticky top-0 z-30 overflow-hidden border-b bg-[var(--surface-glass)] backdrop-blur-lg">
      <span className="hero-sheen" aria-hidden />
      <div className="relative mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        <button
          onClick={() => {
            sfx.back();
            navigate(backTo);
          }}
          aria-label="Volver"
          className="tap-3d tap-target -ml-2 flex items-center gap-1 rounded-2xl border bg-card px-3 py-2 text-sm font-bold text-foreground"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="hidden sm:inline">Volver</span>
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
