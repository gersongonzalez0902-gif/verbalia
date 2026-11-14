"use client";

/**
 * Ajustes 2.0 · Tema (claro/oscuro/sistema), paleta de color,
 * tamaño de texto, lectura nocturna, movimiento reducido, sonido
 * (incluida la música dentro de partidas y la estación del jugador),
 * ritmo de juego y gestión de datos: copia sin cuenta (Ola 1.2),
 * borrados finos y espacio usado. La migración de dispositivo la hace
 * la cuenta (sync automático); sin cuenta, la copia manual es la única
 * vía para mudar el progreso a otro aparato.
 */

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useOnlineStore } from "@/store/online-store";
import { useUiStore } from "@/store/ui-store";
import { sfx, sfxShowcase, playSfxByName, toggleAmbientPreview } from "@/services/audio";
import { APP_VERSION } from "@/lib/version";
import { localDataLines } from "@/lib/local-data";
import { loadSyncMeta } from "@/services/storage";
import { ScreenHeader } from "@/components/game/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ThemeColorId } from "@/types";
import { Check, Cloud, Database, Download, HardDrive, Lock, Moon, Palette, Sun, Trash2, Upload } from "lucide-react";

const TEXT_SIZES = [
  { id: "md", label: "Normal" },
  { id: "lg", label: "Grande" },
  { id: "xl", label: "Muy grande" },
] as const;

const PALETAS: { id: ThemeColorId; label: string; swatch: string[]; premium?: boolean }[] = [
  { id: "aurora", label: "Aurora", swatch: ["oklch(0.5 0.16 275)", "oklch(0.82 0.135 85)"] },
  { id: "coral", label: "Coral", swatch: ["oklch(0.5 0.16 30)", "oklch(0.82 0.135 85)"] },
  { id: "miel", label: "Miel", swatch: ["oklch(0.5 0.16 75)", "oklch(0.82 0.135 85)"] },
  { id: "lavanda", label: "Lavanda", swatch: ["oklch(0.5 0.16 305)", "oklch(0.82 0.135 85)"] },
  { id: "oceano", label: "Océano", swatch: ["oklch(0.5 0.16 235)", "oklch(0.82 0.135 85)"] },
  { id: "magenta", label: "Magenta", swatch: ["oklch(0.5 0.16 340)", "oklch(0.82 0.135 85)"] },
  { id: "bosque", label: "Bosque", swatch: ["oklch(0.5 0.13 152)", "oklch(0.82 0.12 130)"] },
  { id: "atardecer", label: "Atardecer", swatch: ["oklch(0.56 0.17 38)", "oklch(0.82 0.13 75)"] },
  { id: "turquesa", label: "Turquesa", swatch: ["oklch(0.52 0.11 195)", "oklch(0.82 0.11 185)"] },
  { id: "ciruela", label: "Ciruela", swatch: ["oklch(0.5 0.15 325)", "oklch(0.82 0.1 320)"] },
  { id: "midnight", label: "Medianoche", swatch: ["oklch(0.35 0.11 268)", "oklch(0.72 0.13 250)"], premium: true },
  { id: "selva", label: "Selva", swatch: ["oklch(0.42 0.11 148)", "oklch(0.7 0.14 140)"], premium: true },
  { id: "brasa", label: "Brasa", swatch: ["oklch(0.45 0.16 30)", "oklch(0.72 0.16 38)"], premium: true },
  { id: "perla", label: "Perla", swatch: ["oklch(0.5 0.03 260)", "oklch(0.88 0.012 260)"], premium: true },
];

export function SettingsScreen() {
  const { settings, updateSettings, profile, core, srs, resetAll, resetProgress, resetSrs, exportJson, importJson } = useGameStore();
  const navigate = useUiStore((s) => s.navigate);
  const user = useOnlineStore((s) => s.user);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);
  const [importOutcome, setImportOutcome] = useState<{ ok: boolean; words: number } | null>(null);
  const [ambientPreview, setAmbientPreview] = useState(false);
  /** ¿Este aparato vibra? Sin vibración, el switch sería mentir (Área 15.3). */
  const canVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;
  /** Última sincronización con el barco, para la ficha de datos (Área 16.2). */
  const [lastSyncMeta] = useState(() => loadSyncMeta());
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      navigator.storage
        .estimate()
        .then((e) => setStorageInfo({ usage: e.usage ?? 0, quota: e.quota ?? 0 }))
        .catch(() => setStorageInfo(null));
    }
  }, [core, srs]);

  const fmtMB = (n: number) => `${(n / (1024 * 1024)).toFixed(1)} MB`;

  /* ===== Ola 1.2 · copia de la bitácora sin cuenta =====
   * El bloque solo aparece sin sesión: con cuenta el servidor guarda
   * todo (syncOnLogin) y la copia manual sería una fuente de confusión. */
  const handleExportCopy = () => {
    sfx.click();
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const name = `verbalia-bitacora-${stamp}.json`;
      const url = URL.createObjectURL(new Blob([exportJson()], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3_000);
      toast({
        title: "Copia exportada",
        description: `${name} está en tus descargas. Pásala al otro aparato para importarla ahí.`,
      });
    } catch {
      toast({
        title: "No se pudo exportar",
        description: "El navegador bloqueó la descarga. Revisa los permisos e inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleImportCopy = async (file: File) => {
    sfx.page();
    try {
      const text = await file.text();
      const ok = await importJson(text);
      setImportOutcome({ ok, words: ok ? Object.keys(useGameStore.getState().srs).length : 0 });
    } catch {
      setImportOutcome({ ok: false, words: 0 });
    } finally {
      // Se limpia el input para que el mismo archivo pueda reimportarse.
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  return (
    <div>
      <ScreenHeader title="Ajustes" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-28 pt-4">
        {/* ===== Índice de Ajustes (Área 15.2): saltar a la sección que toca ===== */}
        <nav aria-label="Secciones de Ajustes" className="mt-3 flex flex-wrap gap-1.5">
          {[
            ["apariencia", "Apariencia"],
            ["sonido", "Sonido"],
            ["ritmo", "Ritmo"],
            ["datos", "Tus datos"],
            ["privacidad", "Privacidad"],
            ["acerca", "Acerca de"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                sfx.tap();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="tap-target rounded-full border bg-card px-3 py-1 text-[11px] font-bold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </nav>

        <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="cuenta-online">
          <h2 id="cuenta-online" className="type-h2 flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" aria-hidden /> Cuenta
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea una cuenta para amarrar tu bitácora al barco: tu progreso viaja
            contigo entre dispositivos. El juego sigue funcionando sin cuenta,
            exactamente igual que hoy.
          </p>
          <Button className="mt-3" onClick={() => navigate({ name: "account" })}>
            Abrir mi cuenta
          </Button>
        </section>

        {/* ===== Apariencia ===== */}
        <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="apariencia">
          <h2 id="apariencia" className="type-h2 flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" aria-hidden /> Apariencia
          </h2>

          <div className="mt-4 space-y-5">
            {/* Tema claro/oscuro */}
            <div>
              <Label className="text-sm font-bold">Modo</Label>
              <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Elegir modo">
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

            {/* Paleta de color */}
            <div>
              <Label className="text-sm font-bold">Paleta de color</Label>
              <p className="text-xs text-muted-foreground">El tono del Archipiélago: elígelo como se elige un barco. Las marcadas con ✦ se desbloquean en el Bazar.</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5" role="group" aria-label="Elegir paleta de color">
                {PALETAS.map((p) => {
                  const shopId = `pal-${p.id}`;
                  const owned = !p.premium || core.wallet?.owned?.includes(shopId);
                  const selected = settings.themeColor === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (owned) { sfx.click(); updateSettings({ themeColor: p.id }); }
                        else { sfx.tap(); navigate({ name: "shop" }); }
                      }}
                      aria-pressed={selected}
                      aria-label={owned ? `Paleta ${p.label}` : `Paleta ${p.label} (se desbloquea en el Bazar)`}
                      className={cn(
                        "tap-target flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2 text-[11px] font-bold transition",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                        !owned && "opacity-70",
                      )}
                    >
                      <span
                        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/30"
                        style={{ background: `linear-gradient(135deg, ${p.swatch[0]}, ${p.swatch[1]})` }}
                        aria-hidden
                      >
                        {selected && <Check className="h-4 w-4 text-white" aria-hidden />}
                        {!owned && <Lock className="h-3.5 w-3.5 text-white drop-shadow" aria-hidden />}
                      </span>
                      {p.premium && <span className="text-[9px] text-[var(--xp)]">✦</span>}
                      {p.label}
                    </button>
                  );
                })}
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
                  {TEXT_SIZES.map((o) => (
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
                  Luz cálida y tenue para jugar de noche (compatible con claro y oscuro).
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

        {/* ===== Sonido ===== */}
        <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="sonido">
          <h2 id="sonido" className="type-h2">Sonido y música</h2>

          <div className="mt-4 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="sound" className="text-sm font-bold">Sonido maestro</Label>
                <p className="text-xs text-muted-foreground">
                  Todo el audio del juego: ambiente, efectos y reloj.
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
                    <Label className="text-sm font-bold">Ambiente</Label>
                    <span className="numeric text-sm font-bold text-primary">{Math.round(settings.musicVolume * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Olas suaves, brisa y algún pájaro lejano: el mismo ambiente en portada, mapa, regiones y juegos.
                  </p>
                  <Slider
                    className="mt-3"
                    value={[settings.musicVolume]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([v]) => updateSettings({ musicVolume: v })}
                    aria-label="Volumen del ambiente"
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <Label className="text-sm font-bold">Volumen de tu estación</Label>
                    <span className="numeric text-sm font-bold text-primary">{Math.round(settings.stationVolume * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Las canciones que cargues en la Estación del navegante.
                  </p>
                  <Slider
                    className="mt-3"
                    value={[settings.stationVolume]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([v]) => updateSettings({ stationVolume: v })}
                    aria-label="Volumen de la estación"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor="station-in-games" className="text-sm font-bold">Tu música sigue en partidas</Label>
                    <p className="text-xs text-muted-foreground">
                      Si lo apagas, la estación se pausa al entrar a jugar.
                    </p>
                  </div>
                  <Switch
                    id="station-in-games"
                    checked={settings.stationInGames}
                    onCheckedChange={(v) => { sfx.toggle(); updateSettings({ stationInGames: v }); }}
                    aria-label="Estación de música durante las partidas"
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <Label className="text-sm font-bold">Efectos y reloj</Label>
                    <span className="numeric text-sm font-bold text-primary">{Math.round(settings.sfxVolume * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aciertos, fallos, monedas, naipes… y el latido lejano de los retos cronometrados.
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

                <div>
                  <Label className="text-sm font-bold">Probar sonidos</Label>
                  <p className="text-xs text-muted-foreground">
                    Escucha el ambiente y los efectos principales sin jugar, para comprobar que todo suena en tu aparato.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={ambientPreview ? "default" : "secondary"}
                      size="sm"
                      className="h-8 rounded-full px-3 text-xs"
                      onClick={() => setAmbientPreview(toggleAmbientPreview())}
                    >
                      {ambientPreview ? "Parar ambiente" : "Ambiente (olas y brisa)"}
                    </Button>
                    {sfxShowcase().map(({ key, label }) => (
                      <Button
                        key={key}
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-full px-3 text-xs"
                        onClick={() => playSfxByName(key)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Teclado del Taller de Escritura */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="typing-sounds" className="text-sm font-bold">Sonido de las teclas</Label>
                    <p className="text-xs text-muted-foreground">
                      El clac del Taller de Escritura al teclear. Apágalo si prefieres escribir en silencio.
                    </p>
                  </div>
                  <Switch
                    id="typing-sounds"
                    checked={settings.typingSounds}
                    onCheckedChange={(v) => { sfx.toggle(); updateSettings({ typingSounds: v }); }}
                    aria-label="Sonido de las teclas"
                  />
                </div>

                {/* Velocidad de la voz (Etapa 4) */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <Label className="text-sm font-bold">Velocidad de la voz del navegador</Label>
                    <span className="numeric text-sm font-bold text-primary">×{settings.ttsRate.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dictados, tarjetas y lectura inmersiva: ajusta el ritmo del faro a tu oído.
                  </p>
                  <Slider
                    className="mt-3"
                    value={[settings.ttsRate]}
                    min={0.5}
                    max={1.3}
                    step={0.05}
                    onValueChange={([v]) => updateSettings({ ttsRate: v })}
                    onValueCommit={() => sfx.tap()}
                    aria-label="Velocidad de la voz"
                  />
                </div>

                {/* Vibración / háptics (Etapa 4): el control solo existe donde
                 * hay vibración — un switch muerto sería mentir (Área 15.3). */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="haptics" className="text-sm font-bold">Vibración de aciertos</Label>
                    <p className="text-xs text-muted-foreground">
                      {canVibrate
                        ? "Un toque físico en aciertos, combos y subidas de nivel."
                        : "Tu aparato no vibra: este control no hace falta aquí."}
                    </p>
                  </div>
                  {canVibrate && (
                    <Switch
                      id="haptics"
                      checked={settings.haptics}
                      onCheckedChange={(v) => { sfx.toggle(); updateSettings({ haptics: v }); }}
                      aria-label="Vibración de aciertos"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ===== Ritmo de juego ===== */}
        <section className="card-aurora rounded-3xl border bg-card p-5" aria-labelledby="ritmo">
          <h2 id="ritmo" className="type-h2">Ritmo de juego</h2>

          <div className="mt-4 space-y-5">
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

        {/* ===== Tus datos (gestión completa) ===== */}
        <section className="card-aurora rounded-3xl border bg-card p-5" aria-labelledby="datos">
          <h2 id="datos" className="type-h2 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" aria-hidden /> Tus datos
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Tu partida vive en este dispositivo: perfil, {core.stats.totalSessions} sesiones,{" "}
            {Object.keys(srs).length} tarjetas. Con una cuenta, además, viaja al barco
            y te espera en cualquier aparato.
          </p>

          {/* Área 16.2 · Ficha «Tus datos en este aparato»: lo que hay, en claro */}
          <div className="mt-3 rounded-2xl border bg-background/60 p-3.5" aria-label="Tus datos en este aparato">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Tus datos en este aparato
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {localDataLines({
                gardenWords: Object.keys(srs).length,
                xp: core.xp,
                historySessions: core.stats.totalSessions,
                seenExercises: Object.keys(core.seenExercises ?? {}).length,
                storageBytes: storageInfo?.usage ?? null,
                lastSyncedAt: lastSyncMeta?.lastSyncedAt ?? null,
                hasAccount: Boolean(user),
              }).map((line) => (
                <div key={line.label} className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">{line.label}</dt>
                  <dd className="numeric font-bold">{line.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              {user
                ? "Con cuenta, la misma bitácora vive en el barco: puedes borrar este aparato al cerrar sesión y nada se pierde."
                : "Sin cuenta, esta copia solo vive aquí: descárgala (abajo) si vas a cambiar de aparato."}
            </p>
          </div>

          {storageInfo && (
            <p className="numeric mt-2 flex items-center gap-1.5 rounded-2xl bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <HardDrive className="h-3.5 w-3.5" aria-hidden />
              Espacio usado por el navegador: {fmtMB(storageInfo.usage)}
              {storageInfo.quota > 0 && ` de ${fmtMB(storageInfo.quota)} disponibles`}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="outline" onClick={() => { sfx.click(); navigate({ name: "music" }); }}>
              Estación de música →
            </Button>
          </div>

          {/* Copia sin cuenta (Ola 1.2): solo visible cuando NO hay sesión.
           * Con cuenta el servidor guarda la bitácora y la copia manual
           * sobra; el bloque desaparece para no crear dos verdades. */}
          {!user && (
            <div className="mt-4 rounded-2xl border border-dashed bg-muted/40 p-4" data-testid="copia-sin-cuenta">
              <p className="flex items-center gap-1.5 text-sm font-bold">
                <Download className="h-4 w-4 text-primary" aria-hidden />
                Copia de la bitácora
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Sin cuenta, esta copia es la forma de pasar tu progreso a otro aparato. Con cuenta no lo necesitas: el servidor lo guarda.
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <Button variant="outline" onClick={handleExportCopy}>
                  <Download className="mr-2 h-4 w-4" aria-hidden /> Exportar copia
                </Button>
                <Button variant="outline" onClick={() => { sfx.click(); importInputRef.current?.click(); }}>
                  <Upload className="mr-2 h-4 w-4" aria-hidden /> Importar copia
                </Button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  aria-hidden
                  tabIndex={-1}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleImportCopy(f);
                  }}
                />
              </div>
            </div>
          )}

          {/* Borrados parciales */}
          <div className="mt-4 space-y-2.5">
            <p className="text-sm font-bold">Borrados finos (nada de sustos)</p>
            <div className="flex flex-wrap gap-2.5">
              <ConfirmButton
                label="Reiniciar progreso"
                description="Se borran XP, niveles, logros, misiones e historial. Tu perfil, ajustes y palabras plantadas permanecen."
                confirmLabel="Reiniciar progreso"
                onConfirm={() => {
                  void resetProgress();
                  toast({ title: "Progreso reiniciado", description: "La bitácora vuelve a la página uno: el navegante sigue siendo tú." });
                }}
              />
              <ConfirmButton
                label="Vaciar el jardín"
                description="Se borran todas las tarjetas de repetición espaciada (tu colección de palabras). El XP y el perfil no se tocan."
                confirmLabel="Vaciar jardín"
                onConfirm={() => {
                  void resetSrs();
                  toast({ title: "Jardín vaciado", description: "Las tarjetas volverán a brotar desde la primera semilla." });
                }}
              />
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-3 w-full font-bold">
                <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Borrar todo (nueva vida pirata)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Borrar todos tus datos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminarán perfil ({profile.name}), XP ({core.xp}), tarjetas ({Object.keys(srs).length}),
                  logros e historial de este dispositivo. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Conservar mis datos</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    sfx.error();
                    void resetAll();
                    navigate({ name: "welcome" });
                  }}
                >
                  Borrar todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* Resultado de la importación (Ola 1.2): confirmación humana
           * de lo que pasó, con la consecuencia contada sin tecnicismos. */}
          <AlertDialog
            open={importOutcome !== null}
            onOpenChange={(open) => {
              if (!open) setImportOutcome(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {importOutcome?.ok ? "Bitácora restaurada" : "Esa copia no se pudo abrir"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {importOutcome?.ok
                    ? `Tu progreso volvió tal como estaba en la copia: ${importOutcome.words} ${importOutcome.words === 1 ? "palabra" : "palabras"} en el jardín, XP y perfil incluidos. Esta pantalla ya muestra el estado restaurado.`
                    : "El archivo no es una copia válida de VerbalIA (o está incompleta). No se ha cambiado nada: tu partida sigue exactamente como estaba."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => {
                    if (importOutcome?.ok) sfx.chime(); else sfx.error();
                    setImportOutcome(null);
                  }}
                >
                  Entendido
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        {/* ===== Sin conexión ===== */}
        <section className="card-aurora rounded-3xl border bg-card p-5" aria-labelledby="offline">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 id="offline" className="type-h2">Modo sin conexión</h2>
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
          <h2 id="privacidad" className="type-h2">Privacidad</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> Puedes jugar sin cuenta: nada se te pide para empezar.</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> Sin cuenta, todo se guarda solo en tu dispositivo; con cuenta, solo tu correo viaja al barco.</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> Sin rastreadores ni analítica de terceros.</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> La síntesis de voz (opcional) la pone tu navegador; no enviamos audio a ningún sitio.</li>
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> Las canciones de tu estación jamás salen del dispositivo.</li>
          </ul>
          <Button
            variant="outline"
            className="mt-3 font-bold"
            onClick={() => { sfx.page(); navigate({ name: "legal" }); }}
          >
            Leer la política completa (privacidad y cookies) →
          </Button>
        </section>

        {/* ===== Acerca de (Área 15.1): la página que dice la verdad de la app ===== */}
        <section className="card-aurora rounded-3xl border bg-card p-5" aria-labelledby="acerca">
          <h2 id="acerca" className="type-h2">Acerca de VerbalIA</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Un juego de español con alma náutica: ocho regiones, un jardín de
            palabras con repetición espaciada y un salón de minijuegos. Todo el
            contenido es original o de tradición oral libre, y el juego funciona
            completo sin conexión — la cuenta es un extra, nunca un requisito.
            Los niveles MCER que se muestran son estimaciones orientativas:
            VerbalIA no certifica el dominio oficial de un idioma.
          </p>
          <dl className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Versión</dt>
              <dd className="numeric font-bold">{APP_VERSION}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Sonido</dt>
              <dd className="font-bold">
                banco CC0 de archivos reales{" "}
                <a
                  href="/sfx/CREDITS.md"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  (créditos)
                </a>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Datos</dt>
              <dd className="font-bold">en tu aparato; con cuenta, en tu barco</dd>
            </div>
          </dl>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <button
              className="font-bold text-primary hover:underline"
              onClick={() => { sfx.page(); navigate({ name: "legal" }); }}
            >
              Privacidad y cookies →
            </button>
            <button
              className="font-bold text-primary hover:underline"
              onClick={() => { sfx.page(); navigate({ name: "library" }); }}
            >
              Hoja de ruta completa →
            </button>
          </div>
        </section>

        <p className="rounded-2xl border border-dashed bg-muted/40 px-4 py-3 text-center text-xs leading-relaxed text-muted-foreground">
          Todo se aplica al momento y se guarda en tu dispositivo, incluso sin
          conexión. No hay botón de guardar: no hace falta.
        </p>
      </main>
    </div>
  );
}

/** Botón de borrado con confirmación en dos pasos. */
function ConfirmButton({
  label,
  description,
  confirmLabel,
  onConfirm,
}: {
  label: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-sm">
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmLabel}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              sfx.error();
              onConfirm();
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
