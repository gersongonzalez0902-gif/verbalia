"use client";

/**
 * Ajustes · Tema, tamaño de texto, movimiento reducido, sonido,
 * objetivo diario, tarjetas nuevas, PWA y aviso legal/privacidad.
 */

import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { sfx } from "@/services/audio";
import { ScreenHeader } from "@/components/game/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Check, Moon, Sun } from "lucide-react";

export function SettingsScreen() {
  const { settings, updateSettings } = useGameStore();
  const navigate = useUiStore((s) => s.navigate);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const textSizeOptions = [
    { id: "md", label: "Normal" },
    { id: "lg", label: "Grande" },
    { id: "xl", label: "Muy grande" },
  ] as const;

  return (
    <div>
      <ScreenHeader title="Ajustes" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-10 pt-4">
        {/* ===== Apariencia ===== */}
        <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="apariencia">
          <h2 id="apariencia" className="font-display text-lg font-bold">Apariencia</h2>

          <div className="mt-4 space-y-5">
            <div>
              <Label className="text-sm font-bold">Tema</Label>
              <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Elegir tema">
                {[
                  { id: "light", label: "Claro", icon: Sun },
                  { id: "dark", label: "Oscuro", icon: Moon },
                  { id: "system", label: "Sistema", icon: null },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { sfx.click(); setTheme(opt.id); }}
                    aria-pressed={theme === opt.id}
                    className={cn(
                      "tap-target flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-xs font-bold transition",
                      theme === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    {opt.icon ? <opt.icon className="h-5 w-5" aria-hidden /> : <span aria-hidden>🖥️</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold">Tamaño del texto</Label>
              <p className="text-xs text-muted-foreground">Escala toda la interfaz para leer cómodamente.</p>
              <Tabs
                value={settings.textSize}
                onValueChange={(v) => { sfx.tap(); updateSettings({ textSize: v as typeof settings.textSize }); }}
                className="mt-2"
              >
                <TabsList className="grid w-full grid-cols-3">
                  {textSizeOptions.map((o) => (
                    <TabsTrigger key={o.id} value={o.id} className="text-xs font-bold">
                      {o.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="night-mode" className="text-sm font-bold">Modo lectura nocturna</Label>
                <p className="text-xs text-muted-foreground">
                  Luz cálida y tenue para jugar de noche sin deslumbrarte (compatible con claro y oscuro).
                </p>
              </div>
              <Switch
                id="night-mode"
                checked={settings.nightMode}
                onCheckedChange={(v) => { sfx.toggle(); updateSettings({ nightMode: v }); }}
                aria-label="Modo lectura nocturna"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="reduce-motion" className="text-sm font-bold">Reducir movimiento</Label>
                <p className="text-xs text-muted-foreground">
                  Desactiva animaciones y celebraciones. Respeta también la preferencia de tu sistema.
                </p>
              </div>
              <Switch
                id="reduce-motion"
                checked={settings.reduceMotion}
                onCheckedChange={(v) => { if (v) sfx.toggle(); updateSettings({ reduceMotion: v }); }}
                aria-label="Reducir movimiento"
              />
            </div>
          </div>
        </section>

        {/* ===== Juego ===== */}
        <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="juego">
          <h2 id="juego" className="font-display text-lg font-bold">Juego</h2>

          <div className="mt-4 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="sound" className="text-sm font-bold">Sonido maestro</Label>
                <p className="text-xs text-muted-foreground">
                  Todo el audio del juego: música ambiental generativa, efectos y el reloj. Sin descargas.
                </p>
              </div>
              <Switch
                id="sound"
                checked={settings.sound}
                onCheckedChange={(v) => {
                  updateSettings({ sound: v });
                  if (v) setTimeout(() => sfx.chime(), 80);
                }}
                aria-label="Sonido maestro"
              />
            </div>

            {settings.sound && (
              <>
                <div>
                  <div className="flex items-baseline justify-between">
                    <Label className="text-sm font-bold">Música ambiental</Label>
                    <span className="numeric text-sm font-bold text-primary">{Math.round(settings.musicVolume * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Banda sonora generativa: cada región del Archipiélago compone su propia música en vivo.
                  </p>
                  <Slider
                    className="mt-3"
                    value={[settings.musicVolume]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([v]) => updateSettings({ musicVolume: v })}
                    aria-label="Volumen de la música ambiental"
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <Label className="text-sm font-bold">Efectos y reloj</Label>
                    <span className="numeric text-sm font-bold text-primary">{Math.round(settings.sfxVolume * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aciertos, fallos, combos, naipes… y el tic-tac en contratiempo de los retos cronometrados.
                  </p>
                  <Slider
                    className="mt-3"
                    value={[settings.sfxVolume]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([v]) => updateSettings({ sfxVolume: v })}
                    onValueCommit={() => sfx.tap()}
                    aria-label="Volumen de efectos"
                  />
                </div>
              </>
            )}

            <div>
              <div className="flex items-baseline justify-between">
                <Label className="text-sm font-bold">Objetivo diario de XP</Label>
                <span className="numeric text-sm font-bold text-primary">{settings.dailyGoalXp} XP</span>
              </div>
              <p className="text-xs text-muted-foreground">Ritmo diario que quieres mantener (recomendado: 120).</p>
              <Slider
                className="mt-3"
                value={[settings.dailyGoalXp]}
                min={60}
                max={300}
                step={10}
                onValueChange={([v]) => updateSettings({ dailyGoalXp: v })}
                aria-label="Objetivo diario de XP"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <Label className="text-sm font-bold">Tarjetas nuevas al día</Label>
                <span className="numeric text-sm font-bold text-primary">{settings.newCardsPerDay}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cuántas palabras nuevas introduce el jardín cada día. Menos palabras, más repaso.
              </p>
              <Slider
                className="mt-3"
                value={[settings.newCardsPerDay]}
                min={0}
                max={15}
                step={1}
                onValueChange={([v]) => updateSettings({ newCardsPerDay: v })}
                aria-label="Tarjetas nuevas por día"
              />
            </div>
          </div>
        </section>

        {/* ===== Sin conexión ===== */}
        <section className="card-aurora rounded-3xl border bg-card p-5" aria-labelledby="offline">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 id="offline" className="font-display text-lg font-bold">Modo sin conexión</h2>
              <p className="text-xs text-muted-foreground">
                {"serviceWorker" in navigator
                  ? "La aplicación puede instalarse y funcionar sin conexión (PWA). Las funciones de voz dependen del navegador."
                  : "Tu navegador no soporta instalación PWA; el juego seguirá funcionando con conexión normal."}
              </p>
            </div>
            <span className="anim-bob flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl" aria-hidden>
              📴
            </span>
          </div>
        </section>

        {/* ===== Privacidad ===== */}
        <section className="card-aurora rounded-3xl border bg-card p-5" aria-labelledby="privacidad">
          <h2 id="privacidad" className="font-display text-lg font-bold">Privacidad</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> Sin cuentas, sin correo, sin datos personales pedidos.</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> Todo el progreso se guarda en tu dispositivo (IndexedDB).</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> Sin rastreadores ni analítica de terceros.</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> La síntesis de voz (opcional) la pone tu navegador; no enviamos audio a ningún sitio.</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Puedes exportar o borrar tus datos desde tu perfil.
          </p>
        </section>

        {/* ===== Acerca de ===== */}
        <section className="card-aurora rounded-3xl border bg-card p-5" aria-labelledby="acerca">
          <h2 id="acerca" className="font-display text-lg font-bold">Acerca de VerbalIA</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Etapa 1 (MVP jugable). Videojuego educativo de lenguaje en español con progresión adaptativa.
            Los niveles MCER que se muestran son estimaciones orientativas: VerbalIA no certifica el
            dominio oficial de un idioma.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-bold text-secondary-foreground">v1.0.0-etapa1</span>
            <button
              className="font-bold text-primary hover:underline"
              onClick={() => { sfx.page(); navigate({ name: "library" }); }}
            >
              Ver la hoja de ruta completa →
            </button>
          </div>
        </section>

        <Button
          variant="outline"
          className="w-full font-bold"
          onClick={() =>
            toast({
              title: "Consejo de Tinta",
              description: "Los ajustes se aplican al momento y se guardan en tu dispositivo, incluso sin conexión.",
            })
          }
        >
          💾 Todo se guarda automáticamente
        </Button>
      </main>
    </div>
  );
}
