"use client";

/**
 * Portada de entrada · Primera impresión y puerta al juego.
 *
 * Ola 1.1: dos caminos claros y honestos:
 * - "Entrar sin cuenta" (principal): el juego de siempre, 100 % local.
 * - "Entrar con cuenta" (secundario): la bitácora viaja entre dispositivos;
 *   la sincronización es automática al iniciar sesión, sin botones.
 */

import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui-store";
import { sfx } from "@/services/audio";
import { Anchor, CloudCheck, WifiOff } from "lucide-react";
import { LexicoMascot } from "@/components/game/lexico";

export function WelcomeScreen() {
  const navigate = useUiStore((s) => s.navigate);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Letras flotantes de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {["A", "B", "Ñ", "V", "R", "L", "Z", "¿", "!", "E", "K", "T", "M", "Ó"].map((ch, i) => (
          <span
            key={i}
            className="anim-float font-display absolute font-bold text-primary/[0.07]"
            style={{
              left: `${(i * 37) % 92}%`,
              top: `${(i * 53) % 88}%`,
              fontSize: `${2.5 + ((i * 7) % 4)}rem`,
              animationDelay: `${i * 0.45}s`,
              animationDuration: `${5 + (i % 3)}s`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      <div className="anim-pop relative z-10 flex flex-col items-center gap-6">
        {/* Emblema */}
        <div className="relative">
          <img src="/icons/icon-192.png" alt="Emblema de VerbalIA" className="h-24 w-24 rounded-3xl shadow-lg" />
          <span className="anim-float absolute -right-3 -top-2 text-2xl" aria-hidden>
            ✨
          </span>
        </div>

        <div>
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
            VERBAL<span className="text-primary">IA</span>
          </h1>
          <p className="font-display mt-2 text-lg font-semibold text-muted-foreground">
            La aventura del lenguaje
          </p>
        </div>

        <p className="max-w-md leading-relaxed text-muted-foreground">
          Explora el <strong className="text-foreground">Archipiélago de las Palabras</strong>: ocho regiones
          llenas de minijuegos para entrenar vocabulario, gramática, ortografía y lectura en sesiones de 3 a 5 minutos.
        </p>

        <div className="w-full max-w-sm">
          <LexicoMascot size={110} mood="happy" className="mx-auto" />
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2.5">
          <Button
            size="xl"
            className="text-lg"
            onClick={() => { sfx.chime(); navigate({ name: "onboarding" }); }}
          >
            <Anchor className="mr-2 h-5 w-5" aria-hidden />
            Entrar sin cuenta
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => { sfx.tap(); navigate({ name: "account" }); }}
          >
            <CloudCheck className="mr-2 h-4 w-4" aria-hidden />
            Entrar con cuenta
          </Button>
        </div>

        <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <CloudCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
            Puedes jugar sin cuenta. Si creas una, tu bitácora te acompaña en todos tus dispositivos.
          </p>
          <p className="flex items-center gap-1.5">
            <WifiOff className="h-3.5 w-3.5 text-primary" aria-hidden />
            Funciona sin conexión una vez cargada
          </p>
        </div>
      </div>
    </div>
  );
}
