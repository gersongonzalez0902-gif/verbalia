"use client";

/**
 * Ajustes 2.0 · Tema (claro/oscuro/sistema), paleta de color,
 * tamaño de texto, lectura nocturna, movimiento reducido, sonido
 * (incluida la música dentro de partidas y la estación del jugador),
 * ritmo de juego y gestión completa de datos: exportar, importar,
 * borrados parciales, migración de dispositivo y bóveda cifrada.
 */

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { sfx } from "@/services/audio";
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
import { uploadVault, downloadVault } from "@/lib/crypto-vault";
import { Check, Database, Download, HardDrive, Lock, Moon, Palette, Sun, Trash2, Upload } from "lucide-react";

const TEXT_SIZES = [
  { id: "md", label: "Normal" },
  { id: "lg", label: "Grande" },
  { id: "xl", label: "Muy grande" },
] as const;

const PALETAS: { id: ThemeColorId; label: string; swatch: string[] }[] = [
  { id: "aurora", label: "Aurora", swatch: ["oklch(0.5 0.16 275)", "oklch(0.82 0.135 85)"] },
  { id: "coral", label: "Coral", swatch: ["oklch(0.5 0.16 30)", "oklch(0.82 0.135 85)"] },
  { id: "miel", label: "Miel", swatch: ["oklch(0.5 0.16 75)", "oklch(0.82 0.135 85)"] },
  { id: "lavanda", label: "Lavanda", swatch: ["oklch(0.5 0.16 305)", "oklch(0.82 0.135 85)"] },
  { id: "oceano", label: "Océano", swatch: ["oklch(0.5 0.16 235)", "oklch(0.82 0.135 85)"] },
  { id: "magenta", label: "Magenta", swatch: ["oklch(0.5 0.16 340)", "oklch(0.82 0.135 85)"] },
];

export function SettingsScreen() {
  const { settings, updateSettings, profile, core, srs, resetAll, resetProgress, resetSrs, exportJson, importJson } = useGameStore();
  const navigate = useUiStore((s) => s.navigate);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const importRef = useRef<HTMLInputElement>(null);
  const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      navigator.storage
        .estimate()
        .then((e) => setStorageInfo({ usage: e.usage ?? 0, quota: e.quota ?? 0 }))
        .catch(() => setStorageInfo(null));
    }
  }, [core, srs]);

  const fmtMB = (n: number) => `${(n / (1024 * 1024)).toFixed(1)} MB`;

  const doExport = () => {
    const json = exportJson();
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verbalia-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Copia exportada", description: "Guárdala bien: contiene todo tu progreso." });
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    const ok = await importJson(text);
    toast({
      title: ok ? "Copia restaurada" : "Archivo no válido",
      description: ok
        ? "Tu progreso importado se ha cargado."
        : "No hemos podido leer esa copia. Comprueba que es una exportación de VerbalIA.",
      variant: ok ? undefined : "destructive",
    });
  };

  return (
    <div>
      <ScreenHeader title="Ajustes" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-28 pt-4">
        {/* ===== Apariencia ===== */}
        <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-5" aria-labelledby="apariencia">
          <h2 id="apariencia" className="font-display flex items-center gap-2 text-lg font-bold">
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
              <p className="text-xs text-muted-foreground">El tono del Archipiélago: elígelo como se elige un barco.</p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6" role="group" aria-label="Elegir paleta de color">
                {PALETAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { sfx.click(); updateSettings({ themeColor: p.id }); }}
                    aria-pressed={settings.themeColor === p.id}
                    className={cn(
                      "tap-target flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2 text-[11px] font-bold transition",
                      settings.themeColor === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30"
                      style={{ background: `linear-gradient(135deg, ${p.swatch[0]}, ${p.swatch[1]})` }}
                      aria-hidden
                    >
                      {settings.themeColor === p.id && <Check className="h-4 w-4 text-white" aria-hidden />}
                    </span>
                    {p.label}
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
          <h2 id="sonido" className="font-display text-lg font-bold">Sonido y música</h2>

          <div className="mt-4 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="sound" className="text-sm font-bold">Sonido maestro</Label>
                <p className="text-xs text-muted-foreground">
                  Todo el audio del juego: música ambiental, efectos y reloj.
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
                    Banda sonora generativa: cada región compone su propia música en vivo.
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

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor="music-in-games" className="text-sm font-bold">Música dentro de partidas</Label>
                    <p className="text-xs text-muted-foreground">
                      Desactívalo para jugar solo con efectos (recomendado: el menú calla, el juego suena).
                    </p>
                  </div>
                  <Switch
                    id="music-in-games"
                    checked={settings.musicInGames}
                    onCheckedChange={(v) => { sfx.toggle(); updateSettings({ musicInGames: v }); }}
                    aria-label="Música dentro de partidas"
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
                    Aciertos, fallos, combos, naipes… y el tic-tac de los retos cronometrados.
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
          </div>
        </section>

        {/* ===== Ritmo de juego ===== */}
        <section className="card-aurora rounded-3xl border bg-card p-5" aria-labelledby="ritmo">
          <h2 id="ritmo" className="font-display text-lg font-bold">Ritmo de juego</h2>

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
          <h2 id="datos" className="font-display flex items-center gap-2 text-lg font-bold">
            <Database className="h-5 w-5 text-primary" aria-hidden /> Tus datos
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Todo vive en este dispositivo (IndexedDB): perfil, {core.stats.totalSessions} sesiones,{" "}
            {Object.keys(srs).length} tarjetas. Sin cuentas ni rastreadores.
          </p>

          {storageInfo && (
            <p className="numeric mt-2 flex items-center gap-1.5 rounded-2xl bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <HardDrive className="h-3.5 w-3.5" aria-hidden />
              Espacio usado por el navegador: {fmtMB(storageInfo.usage)}
              {storageInfo.quota > 0 && ` de ${fmtMB(storageInfo.quota)} disponibles`}
            </p>
          )}

          {/* Migrar a otro dispositivo */}
          <div className="mt-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3.5">
            <p className="text-sm font-bold">Migrar a otro dispositivo</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              1) <strong>Exporta</strong> la copia aquí y guarda el archivo JSON.
              2) En el otro dispositivo, abre VerbalIA → Ajustes → <strong>Importar copia</strong>.
              La copia incluye perfil, ajustes, XP, logros, tarjetas y racha.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button variant="outline" onClick={() => { sfx.page(); doExport(); }}>
              <Download className="mr-2 h-4 w-4" aria-hidden /> Exportar copia
            </Button>
            <Button variant="outline" onClick={() => importRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" aria-hidden /> Importar copia
            </Button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="hidden"
              aria-hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void doImport(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" onClick={() => { sfx.click(); navigate({ name: "music" }); }}>
              Estación de música →
            </Button>
          </div>

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
        </section>

        {/* ===== Bóveda cifrada ===== */}
        <VaultSection />

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
            <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> Las canciones de tu estación jamás salen del dispositivo.</li>
          </ul>
        </section>

        {/* ===== Acerca de ===== */}
        <section className="card-aurora rounded-3xl border bg-card p-5" aria-labelledby="acerca">
          <h2 id="acerca" className="font-display text-lg font-bold">Acerca de VerbalIA</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Etapa 3 · 51 minijuegos, 7 islas y 5 000 ejercicios. Videojuego educativo de lenguaje con progresión adaptativa.
            Los niveles MCER que se muestran son estimaciones orientativas: VerbalIA no certifica el
            dominio oficial de un idioma.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-bold text-secondary-foreground">v3.0.0-etapa3</span>
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
              title: "Consejo de Léxico",
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

/* ============================ Bóveda cifrada ============================ */

function VaultSection() {
  const exportJson = useGameStore((s) => s.exportJson);
  const importJson = useGameStore((s) => s.importJson);
  const { toast } = useToast();
  const [pass, setPass] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);

  const saveToVault = async () => {
    if (pass.length < 8) {
      toast({ title: "Contraseña corta", description: "Usa al menos 8 caracteres: cierra bien el sobre.", variant: "destructive" });
      return;
    }
    const json = exportJson();
    if (!json) return;
    setBusy(true);
    try {
      const { id, expiresAt } = await uploadVault(json, pass);
      setLastCode(id);
      toast({
        title: "Sobre guardado en la bóveda",
        description: `Código ${id.slice(0, 10)}… Caduca el ${new Date(expiresAt).toLocaleDateString("es-ES")}. Anótalo junto a tu contraseña.`,
      });
    } catch (e) {
      toast({ title: "No se pudo guardar", description: e instanceof Error ? e.message : "Error inesperado", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const restoreFromVault = async () => {
    if (!/^\\S+$/.test(code.trim())) {
      toast({ title: "Falta el código", description: "Pega el código de 64 caracteres que te dieron al guardar.", variant: "destructive" });
      return;
    }
    if (!pass) {
      toast({ title: "Falta la contraseña", description: "La misma con la que sellaste el sobre.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const json = await downloadVault(code.trim(), pass);
      const ok = await importJson(json);
      toast({
        title: ok ? "¡Bóveda abierta!" : "Sobre corrupto",
        description: ok ? "Tu progreso ha regresado del viaje." : "El contenido no era una copia de VerbalIA.",
        variant: ok ? undefined : "destructive",
      });
    } catch (e) {
      toast({ title: "La bóveda no abrió", description: e instanceof Error ? e.message : "Error inesperado", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card-aurora rounded-3xl border bg-card p-5" aria-labelledby="boveda">
      <h2 id="boveda" className="font-display flex items-center gap-2 text-lg font-bold">
        <Lock className="h-5 w-5 text-primary" aria-hidden /> Bóveda cifrada (zero-knowledge)
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Tu progreso se cifra <strong>en este dispositivo</strong> (AES-GCM, PBKDF2 con 600 000
        iteraciones) y el servidor solo guarda un sobre sellado que <em>no puede</em> abrir:
        ni la contraseña ni el contenido viajan en claro. Ideal como copia de emergencia
        con una contraseña que recuerdes.
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <Label htmlFor="vault-pass" className="text-sm font-bold">Contraseña del sobre</Label>
          <input
            id="vault-pass"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="new-password"
            aria-label="Contraseña de la bóveda"
            className="mt-1.5 h-10 w-full rounded-2xl border border-border bg-card px-3 text-sm font-semibold outline-none focus:border-primary"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button onClick={saveToVault} disabled={busy} className="font-bold">
            <Upload className="mr-2 h-4 w-4" aria-hidden /> Guardar copia cifrada
          </Button>
        </div>

        {lastCode && (
          <div className="anim-pop rounded-2xl border border-success/50 bg-success/10 p-3">
            <p className="text-xs font-bold text-success">Código de tu sobre (anótalo):</p>
            <p className="mt-1 break-all rounded-lg bg-card px-2 py-1.5 font-mono text-[11px]">{lastCode}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Se borra de la bóveda a los 30 días. Sin la contraseña, nadie (ni nosotros) puede abrirlo.
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="vault-code" className="text-sm font-bold">Recuperar con código</Label>
          <input
            id="vault-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            aria-label="Código del sobre guardado"
            className="mt-1.5 h-10 w-full rounded-2xl border border-border bg-card px-3 font-mono text-xs outline-none focus:border-primary"
            placeholder="Pega aquí el código de 64 caracteres"
          />
        </div>
        <Button variant="outline" onClick={restoreFromVault} disabled={busy} className="font-bold">
          <Download className="mr-2 h-4 w-4" aria-hidden /> Abrir sobre y restaurar
        </Button>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        El servidor no guarda contraseñas, correos ni cookies de sesión: solo sobres cifrados
        que caducan solos. Para máxima privacidad, sigue disponible la exportación manual de JSON.
      </p>
    </section>
  );
}
