"use client";

/**
 * Carcasa de la aplicación v3.
 * - Móvil: muelle flotante de cristal (dock) con píldora activa.
 * - Escritorio: barra lateral con relieve y acentos de escena.
 * El HUD superior muestra nivel, XP, racha y ajustes en pantallas clave.
 */

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { levelProgress } from "@/engine/xp";
import { LevelBadge, StreakBadge, XpBar } from "@/components/game/widgets";
import { AmbientBackdrop } from "@/components/game/ambient";
import { OrnamentLayer } from "@/components/game/ornaments";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { effectiveBackTo, originChipLabel } from "@/lib/navigation";
import { sceneForScreen } from "@/hooks/use-scene";
import { REGIONS } from "@/data/regions";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import {
  BookMarked,
  ChartColumn,
  Dumbbell,
  Gamepad2,
  Home,
  Keyboard,
  Library,
  ListChecks,
  ListMusic,
  Map as MapIcon,
  NotebookPen,
  Quote,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
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

/** Destinos extra disponibles en móvil a través del botón «Más» del muelle. */
const MORE_NAV: { screen: Screen; label: string; hint: string; icon: React.ElementType }[] = [
  { screen: { name: "arcade" }, label: "Salón de Juegos", hint: "21 retos de mente", icon: Gamepad2 },
  { screen: { name: "writing" }, label: "Taller de Escritura", hint: "Mecanografía y tipeo", icon: Keyboard },
  { screen: { name: "stats" }, label: "Estadísticas", hint: "Gráficas, récords y evolución", icon: ChartColumn },
  { screen: { name: "frases" }, label: "Bitácora de frases", hint: "Todas las frases del viaje", icon: Quote },
  { screen: { name: "shop" }, label: "El Bazar del Copista", hint: "Gasta tu tinta en estilo", icon: ShoppingBag },
  { screen: { name: "errors" }, label: "Cuaderno de errores", hint: "Repasa lo fallado", icon: NotebookPen },
  { screen: { name: "music" }, label: "Estación de música", hint: "Tus canciones, tu viaje", icon: ListMusic },
  { screen: { name: "library" }, label: "Biblioteca", hint: "Contenidos y hoja de ruta", icon: Library },
  { screen: { name: "settings" }, label: "Ajustes", hint: "Tema, sonido y datos", icon: Settings },
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
    section: "Entrenar",
    items: [
      { screen: { name: "training" }, label: "Entrenamientos", icon: Dumbbell },
      { screen: { name: "arcade" }, label: "Salón de Juegos", icon: Gamepad2 },
      { screen: { name: "writing" }, label: "Taller de Escritura", icon: Keyboard },
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
      { screen: { name: "frases" }, label: "Bitácora de frases", icon: Quote },
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
        <img src="/icons/icon-192.png" alt="" width={26} height={26} className="rounded-md" />
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

/** Identidades de región que tiñen el fondo (Área 13.3). */
const REGION_SCENES = new Set<string>(REGIONS.map((r) => r.id));

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
  const [moreOpen, setMoreOpen] = useState(false);
  const { level, into, needed } = levelProgress(core.xp);

  /** ¿Está abierta ahora una pantalla del menú «Más»? (píldora activa) */
  const moreActive = MORE_NAV.some((m) => m.screen.name === screen.name);

  /* Área 13.3 · cruce de ambientes: el fondo se tiñe con la región activa
   * (la escena visual actual si es una región del Archipiélago). */
  const scene = sceneForScreen(screen, level).scene;
  const accentVar = REGION_SCENES.has(scene) ? `--region-${scene}` : undefined;

  return (
    <div className="relative flex min-h-dvh flex-col bg-background lg:flex-row">
      {/* Área 11.3 · ayuda de atajos de teclado, disponible en toda la app */}
      <ShortcutsHelp />
      {/* ===== Ambientación: mareas, polvo de letras, ornamentos y color ===== */}
      {showChrome && <AmbientBackdrop accentVar={accentVar} />}
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
            Tus datos se guardan en este dispositivo; con cuenta, también en tu barco.
          </p>
        </aside>
      )}

      {/* ===== Contenido ===== */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
      {children}
      </div>

      {/* ===== Muelle flotante (móvil) ===== */}
      {showChrome && (
        <>
        <nav
          aria-label="Navegación principal"
          className="safe-bottom dock sticky bottom-3 z-40 mx-3 mb-3 lg:hidden"
        >
          <ul className="grid grid-cols-6 items-center px-1.5 py-1.5">
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
                      "dock-item tap-target flex w-full flex-col items-center gap-0.5 rounded-2xl px-0.5 py-1.5 text-[10px] font-bold",
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200",
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
            <li>
              <button
                onClick={() => { sfx.pop(); setMoreOpen(true); }}
                aria-label="Más secciones: estadísticas, juegos, bazar, ajustes…"
                aria-current={moreActive ? "page" : undefined}
                className={cn(
                  "dock-item tap-target flex w-full flex-col items-center gap-0.5 rounded-2xl px-0.5 py-1.5 text-[10px] font-bold",
                  moreActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200",
                    moreActive && "dock-pill",
                  )}
                  aria-hidden
                >
                  <Sparkles className={cn("h-5 w-5", moreActive && "scale-110 drop-shadow-sm")} />
                </span>
                <span className={cn(moreActive && "tracking-wide")}>Más</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Hoja «Más»: estadísticas, juegos, bazar y demás rincones del Archipiélago */}
        <Sheet open={moreOpen} onOpenChange={(v) => { if (v) sfx.open(); else sfx.close(); setMoreOpen(v); }}>
          <SheetContent
            side="bottom"
            className="safe-bottom max-h-[78dvh] overflow-y-auto rounded-t-3xl px-4 pb-8 pt-4 sm:mx-auto sm:max-w-md"
          >
            <SheetHeader className="p-0 text-left">
              <SheetTitle className="type-h2">Más rincones del Archipiélago</SheetTitle>
              <SheetDescription>Toda la aventura cabe en tu bolsillo.</SheetDescription>
            </SheetHeader>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {MORE_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      sfx.navigate();
                      setMoreOpen(false);
                      navigate(item.screen);
                    }}
                    className="tap-3d card-aurora flex items-center gap-3 rounded-2xl border bg-card p-3.5 text-left"
                  >
                    <span className="chip-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{item.label}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{item.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
        </>
      )}
    </div>
  );
}

/** Cabecera héroe común de pantallas secundarias (móvil y escritorio).
 *  P0-1 · Ola E · 2: el botón «Volver» aterriza de donde el jugador vino
 *  (lastScreen en ui-store, Ola D 12.1) siempre que la pantalla actual lo
 *  permita; sin origen recordado (carga directa por URL) o cuando reentrar
 *  sería raro, manda al respaldo clásico de la pantalla (backTo).
 *  Portada → «Entrar con cuenta» → Cuenta → atrás = PORTADA. */
export function ScreenHeader({
  title,
  subtitle,
  backTo = { name: "home" } as Screen,
  right,
  useLastScreen = true,
}: {
  title: string;
  subtitle?: string;
  backTo?: Screen;
  right?: React.ReactNode;
  /** false solo cuando «Volver» al origen sería raro (flujos fijos). */
  useLastScreen?: boolean;
}) {
  const navigate = useUiStore((s) => s.navigate);
  const lastScreen = useUiStore((s) => s.lastScreen);
  const current = useUiStore((s) => s.screen);
  // Nunca reentra en una partida con la flecha: reiniciaría la sesión
  // (el juego se entra por decisión del jugador, no por un «Volver»).
  const destination = useLastScreen
    ? effectiveBackTo(lastScreen, backTo, current)
    : backTo;
  const chip = useLastScreen
    ? originChipLabel(lastScreen, backTo, current, screenAriaLabel)
    : null;
  return (
    <header className="hero-band safe-top sticky top-0 z-30 overflow-hidden border-b bg-[var(--surface-glass)] backdrop-blur-lg">
      <span className="hero-sheen" aria-hidden />
      <div className="relative mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        <button
          onClick={() => {
            sfx.back();
            navigate(destination);
          }}
          aria-label={`Volver a ${screenAriaLabel(destination)}`}
          className="tap-3d tap-target -ml-2 flex items-center gap-1 rounded-2xl border bg-card px-3 py-2 text-sm font-bold text-foreground"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="hidden sm:inline">Volver</span>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate type-h1">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          {chip && <p className="truncate text-[11px] font-semibold text-primary/80">{chip}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

/** Nombre humano de un destino de «Volver» para el aria-label (a11y). */
function screenAriaLabel(screen: Screen): string {
  const names: Record<string, string> = {
    home: "Inicio",
    map: "el Mapa",
    missions: "Misiones",
    collection: "Colección",
    profile: "Perfil",
    stats: "Estadísticas",
    errors: "Cuaderno de errores",
    settings: "Ajustes",
    account: "Cuenta",
    music: "Estación de música",
    shop: "el Bazar",
    library: "Biblioteca",
    arcade: "Salón de Juegos",
    frases: "Bitácora de frases",
    training: "Entrenamientos",
    writing: "Taller de Escritura",
    legal: "Privacidad",
    results: "Resultados",
    welcome: "la Portada",
  };
  return names[screen.name] ?? "la pantalla anterior";
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

/** Área 11.3 · Atajos de teclado y su cheat-sheet («?» la abre).
 *  PC primero: los atajos existen de verdad (buscar, salir de partida,
 *  continuar el feedback) y este diálogo dice cuáles son. */
const SHORTCUTS: { keys: string; what: string }[] = [
  { keys: "/", what: "Buscar en Entrenamientos o en la Colección" },
  { keys: "Esc", what: "Abandonar la partida (con confirmación)" },
  { keys: "Enter / Espacio", what: "Continuar tras la explicación de un ítem" },
  { keys: "Tab", what: "Moverse por botones, chips y formularios" },
  { keys: "?", what: "Esta ayuda" },
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-4.5 w-4.5 text-primary" aria-hidden /> Atajos de teclado
          </DialogTitle>
          <DialogDescription>
            Para navegar sin soltar el teclado. Nada de esto es obligatorio: con el dedo también se llega a todas partes.
          </DialogDescription>
        </DialogHeader>
        <ul className="mt-1 space-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2">
              <kbd className="numeric rounded-lg border bg-muted px-2 py-0.5 text-xs font-black">{s.keys}</kbd>
              <span className="min-w-0 flex-1 text-right text-xs text-muted-foreground">{s.what}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
