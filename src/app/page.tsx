"use client";

/**
 * VERBALIA · Raíz de la aplicación (SPA de una sola ruta).
 * Hidrata el estado desde IndexedDB, sincroniza el enrutador con el
 * hash y monta la pantalla activa dentro de la carcasa.
 */

import { useEffect } from "react";
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
import { StatsScreen } from "@/screens/stats";
import { CollectionScreen } from "@/screens/collection";
import { ErrorReviewScreen } from "@/screens/error-review";
import { MissionsScreen } from "@/screens/missions";
import { SettingsScreen } from "@/screens/settings";
import { LibraryScreen } from "@/screens/library";
import { MusicStationScreen } from "@/screens/music-station";
import { ShopScreen } from "@/screens/shop";
import { ArcadeScreen } from "@/screens/arcade";
import { PwaRegistration } from "@/components/game/pwa";
import { useSceneSystem } from "@/hooks/use-scene";
import { Loader2 } from "lucide-react";
import { LexicoMascot } from "@/components/game/lexico";

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
      case "music":
        return <MusicStationScreen />;
      case "shop":
        return <ShopScreen />;
      case "arcade":
        return <ArcadeScreen />;
      case "library":
        return <LibraryScreen />;
      case "home":
      default:
        return <HomeScreen />;
    }
  })();

  return (
    <AppShell showChrome={!isGameplay}>
      <PwaRegistration />
      {/* Transición suave al cambiar de pantalla: el mapa cobra vida. */}
      <div key={screen.name} className={isGameplay ? undefined : "anim-screen flex min-h-0 flex-1 flex-col"}>
        {screenNode}
      </div>
    </AppShell>
  );
}
