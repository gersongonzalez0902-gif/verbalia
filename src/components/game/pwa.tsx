"use client";

/**
 * Registro del Service Worker (PWA).
 * Estrategia conservadora: la red manda; la caché solo sirve de
 * respaldo sin conexión. Nunca intercepta /api ni métodos no GET.
 * Avisa con un aviso discreto cuando hay una nueva versión lista.
 */

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useToast } from "@/hooks/use-toast";
import { WifiOff } from "lucide-react";

export function PwaRegistration() {
  const offlineMode = useGameStore((s) => s.settings.offlineMode);
  const { toast } = useToast();
  const [offline, setOffline] = useState(false);

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
                description: "Ya está descargada. Recarga para estrenarla.",
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

  if (!offline) return null;

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
