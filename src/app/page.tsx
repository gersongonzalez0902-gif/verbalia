"use client";

/**
 * VERBALIA · Raíz de la aplicación (SPA de una sola ruta).
 * Hidrata el estado desde IndexedDB, sincroniza el enrutador con el
 * hash y monta la pantalla activa dentro de la carcasa.
 *
 * Rendimiento: las pantallas secundarias (salón, escritura, música,
 * biblioteca, bazar, bitácora, estadísticas…) se cargan bajo demanda
 * con next/dynamic, de modo que el paquete inicial se queda ligero.
 */

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useGameStore } from "@/store/game-store";
import { useUiStore, initRouter } from "@/store/ui-store";
import { AppShell } from "@/components/game/app-shell";
import { WelcomeScreen } from "@/screens/welcome";
import { OnboardingScreen } from "@/screens/onboarding";
import { PlacementScreen } from "@/screens/placement";
import { HomeScreen } from "@/screens/home";
import { MapScreen } from "@/screens/map";
import { GameScreen } from "@/screens/game-screen";
import { ResultsScreen } from "@/screens/results";
import { ProfileScreen } from "@/screens/profile";
import { PwaRegistration } from "@/components/game/pwa";
import { Vitality } from "@/components/game/vitality";
import { useSceneSystem } from "@/hooks/use-scene";
import { Loader2 } from "lucide-react";
import { LexicoMascot } from "@/components/game/lexico";

/* ---------- Pantallas bajo demanda (code-splitting) ---------- */
const Lazy = (load: () => Promise<{ default: React.ComponentType }>) =>
  dynamic(load, {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3" role="status" aria-live="polite">
        <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden />
        <p className="text-sm font-semibold text-muted-foreground">Preparando el rincón…</p>
      </div>
    ),
  });

const StatsScreen = Lazy(() => import("@/screens/stats").then((m) => ({ default: m.StatsScreen })));
const CollectionScreen = Lazy(() => import("@/screens/collection").then((m) => ({ default: m.CollectionScreen })));
const ErrorReviewScreen = Lazy(() => import("@/screens/error-review").then((m) => ({ default: m.ErrorReviewScreen })));
const MissionsScreen = Lazy(() => import("@/screens/missions").then((m) => ({ default: m.MissionsScreen })));
const SettingsScreen = Lazy(() => import("@/screens/settings").then((m) => ({ default: m.SettingsScreen })));
const AccountScreen = Lazy(() => import("@/screens/account").then((m) => ({ default: m.AccountScreen })));
const LibraryScreen = Lazy(() => import("@/screens/library").then((m) => ({ default: m.LibraryScreen })));
const MusicStationScreen = Lazy(() => import("@/screens/music-station").then((m) => ({ default: m.MusicStationScreen })));
const ShopScreen = Lazy(() => import("@/screens/shop").then((m) => ({ default: m.ShopScreen })));
const ArcadeScreen = Lazy(() => import("@/screens/arcade").then((m) => ({ default: m.ArcadeScreen })));
const FrasesScreen = Lazy(() => import("@/screens/frases").then((m) => ({ default: m.FrasesScreen })));
const TrainingScreen = Lazy(() => import("@/screens/training").then((m) => ({ default: m.TrainingScreen })));
const WritingScreen = Lazy(() => import("@/screens/writing").then((m) => ({ default: m.WritingScreen })));
const LegalScreen = Lazy(() => import("@/screens/legal").then((m) => ({ default: m.LegalScreen })));

export default function Page() {
  const hydrated = useGameStore((s) => s.hydrated);
  const hasProfile = useGameStore((s) => s.hasProfile);
  const hydrate = useGameStore((s) => s.hydrate);
  const screen = useUiStore((s) => s.screen);

  useEffect(() => {
    void hydrate();
    initRouter();
  }, [hydrate]);

  // Escena sensorial: paleta + banda sonora de la pantalla activa.
  useSceneSystem();

  // Mientras carga el estado local: pantalla de carga con Léxico.
  if (!hydrated) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4" role="status" aria-live="polite">
        <LexicoMascot size={96} />
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Desplegando el mapa del Archipiélago…
        </div>
      </div>
    );
  }

  // La partida corre a pantalla completa (sin navegación que distraiga).
  const isGameplay = screen.name === "game";

  // Primer uso: bienvenida → onboarding → evaluación.
  if (!hasProfile) {
    return (
      <>
        <PwaRegistration />
        <Vitality />
        {screen.name === "onboarding" ? (
          <OnboardingScreen />
        ) : screen.name === "placement" ? (
          <PlacementScreen />
        ) : screen.name === "game" ? (
          <GameScreen />
        ) : (
          <WelcomeScreen />
        )}
      </>
    );
  }

  const screenNode = (() => {
    switch (screen.name) {
      case "welcome":
        return <WelcomeScreen />;
      case "onboarding":
        return <OnboardingScreen />;
      case "placement":
        return <PlacementScreen />;
      case "game":
        return <GameScreen />;
      case "results":
        return <ResultsScreen />;
      case "map":
        return <MapScreen />;
      case "profile":
        return <ProfileScreen />;
      case "stats":
        return <StatsScreen />;
      case "collection":
        return <CollectionScreen />;
      case "errors":
        return <ErrorReviewScreen />;
      case "missions":
        return <MissionsScreen />;
      case "settings":
        return <SettingsScreen />;
      case "account":
        return <AccountScreen />;
      case "music":
        return <MusicStationScreen />;
      case "shop":
        return <ShopScreen />;
      case "arcade":
        return <ArcadeScreen />;
      case "library":
        return <LibraryScreen />;
      case "frases":
        return <FrasesScreen />;
      case "training":
        return <TrainingScreen />;
      case "writing":
        return <WritingScreen />;
      case "legal":
        return <LegalScreen />;
      case "home":
      default:
        return <HomeScreen />;
    }
  })();

  return (
    <AppShell showChrome={!isGameplay}>
      <PwaRegistration />
      {/* Capa viva de escritorio: aura del cursor, tilt 3D, reveal al scroll. */}
      <Vitality />
      {/* Transición suave al cambiar de pantalla: el mapa cobra vida. */}
      <div key={screen.name} className={isGameplay ? undefined : "anim-screen flex min-h-0 flex-1 flex-col"}>
        {screenNode}
      </div>
    </AppShell>
  );
}
