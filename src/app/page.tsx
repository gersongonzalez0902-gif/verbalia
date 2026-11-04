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
import { PwaRegistration } from "@/components/game/pwa";
import { Loader2 } from "lucide-react";
import { TintaOwl } from "@/components/game/tinta";

export default function Page() {
  const hydrated = useGameStore((s) => s.hydrated);
  const hasProfile = useGameStore((s) => s.hasProfile);
  const hydrate = useGameStore((s) => s.hydrate);
  const screen = useUiStore((s) => s.screen);

  useEffect(() => {
    void hydrate();
    initRouter();
  }, [hydrate]);

  // Mientras carga el estado local: pantalla de carga con Tinta.
  if (!hydrated) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4" role="status" aria-live="polite">
        <TintaOwl size={96} />
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
      {screenNode}
    </AppShell>
  );
}
