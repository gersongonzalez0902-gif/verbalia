"use client";

/**
 * Registro del Service Worker (PWA) + capa de sincronización online.
 *
 * - Estrategia conservadora: la red manda; la caché solo sirve de
 *   respaldo sin conexión. Nunca intercepta /api ni métodos no GET.
 * - Avisa con un aviso discreto cuando hay una nueva versión lista.
 * - Ola 1: al montar, arranca el motor de sincronización (initSync), que
 *   desde la Ola 1.1 une bitácora y barco en silencio al abrir sesión
 *   (syncOnLogin); al recuperar la red, la cola offline se descarga
 *   (drain) y un indicador discreto muestra "Sincronizando…" mientras sube.
 */

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useOnlineStore } from "@/store/online-store";
import { useToast } from "@/hooks/use-toast";
import { initSync } from "@/services/sync";
import { WifiOff, RefreshCw } from "lucide-react";
import { ToastAction } from "@/components/ui/toast";

/** Área 20.1 · instalación propia: el navegador ofrece su evento y la
 *  app un botón honesto («Instalar Verbalia»), visible solo mientras la
 *  instalación nativa está disponible y no estás ya instalado. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches,
  );

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async (): Promise<"accepted" | "dismissed" | "no"> => {
    if (!event) return "no";
    await event.prompt();
    const choice = await event.userChoice;
    setEvent(null);
    return choice.outcome;
  };

  return { canInstall: !!event && !installed, installed, install };
}

export function PwaRegistration() {
  const offlineMode = useGameStore((s) => s.settings.offlineMode);
  const syncing = useOnlineStore((s) => s.syncing);
  const { toast } = useToast();
  const [offline, setOffline] = useState(false);

  // Capa online: sesión, listeners de red/foco, timer de sync y cola.
  useEffect(() => {
    initSync();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Estado de conexión visible (no invasivo).
    const updateOnline = () => setOffline(!navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!offlineMode) return;
    if (process.env.NODE_ENV !== "production") return; // en dev: nunca caches obsoletas
    if (!("serviceWorker" in navigator)) return;

    const secure =
      window.location.protocol === "https:" ||
      ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (!secure) return;

    let registration: ServiceWorkerRegistration | null = null;
    let onControllerChange: (() => void) | null = null;

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // Nueva versión instalada en segundo plano → aviso con acción.
        registration.addEventListener("updatefound", () => {
          const installing = registration?.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              onControllerChange = () => window.location.reload();
              navigator.serviceWorker.addEventListener("controllerchange", onControllerChange, { once: true });
              toast({
                title: "Nueva versión de VerbalIA",
                description: "Ya está descargada y lista.",
                action: (
                  <ToastAction altText="Recargar ahora" onClick={() => window.location.reload()}>
                    Recargar ahora
                  </ToastAction>
                ),
              });
            }
          });
        });
      } catch {
        // Sin SW la app funciona igualmente (solo sin soporte offline).
      }
    };

    void register();
    return () => {
      if (onControllerChange) {
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      }
    };
  }, [offlineMode]);

  if (offline) {
    return (
      <div
        role="status"
        aria-label="Sin conexión: modo sin conexión activo"
        className="fixed bottom-20 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background shadow-lg lg:bottom-4"
      >
        <WifiOff className="h-3.5 w-3.5" aria-hidden />
        Sin conexión · modo sin conexión activo
      </div>
    );
  }

  if (syncing) {
    return (
      <div
        role="status"
        aria-label="Sincronizando tu progreso con tu cuenta"
        className="fixed bottom-20 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground/90 px-4 py-2 text-xs font-bold text-background shadow-lg lg:bottom-4"
      >
        <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Sincronizando tu bitácora…
      </div>
    );
  }

  return null;
}
