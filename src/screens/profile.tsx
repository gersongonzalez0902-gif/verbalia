"use client";

/**
 * Perfil del jugador · Identidad, rango, estimaciones MCER por habilidad,
 * logros y gestión de datos (exportar/importar/borrar).
 */

import { useRef, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { levelProgress, rankForLevel, cefrFromSkill, skillMasteryLabel } from "@/engine/xp";
import { SKILL_LABELS, SKILL_COLORS } from "@/data/regions";
import { ACHIEVEMENTS } from "@/data/achievements";
import { LevelBadge, XpBar, ProgressRing } from "@/components/game/widgets";
import { getIcon } from "@/components/game/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Download, PenLine, Trash2, Upload } from "lucide-react";

const AVATAR_EMOJI: Record<string, string> = {
  buho: "🦉", zorro: "🦊", ballena: "🐳", tortuga: "🐢", loro: "🦜", mariposa: "🦋",
};

export function ProfileScreen() {
  const { profile, core, srs, updateProfile, resetAll, exportJson, importJson } = useGameStore();
  const navigate = useUiStore((s) => s.navigate);
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name);
  const fileRef = useRef<HTMLInputElement>(null);

  const { level, into, needed } = levelProgress(core.xp);
  const rank = rankForLevel(level);
  const unlockedCount = Object.keys(core.achievements).length;
  const wordsLearned = Object.values(srs).filter((c) => c.reps >= 2).length;
  const wordsMastered = Object.values(srs).filter((c) => c.state === "review" && c.intervalDays >= 21).length;

  const saveName = () => {
    updateProfile({ name: nameDraft.trim() || profile.name });
    setEditing(false);
    sfx.pop();
    toast({ title: "Perfil actualizado", description: "Tu bitácora ya luce tu nuevo nombre." });
  };

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
    toast({ title: "Copia exportada", description: "Archivo JSON descargado con todo tu progreso." });
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

  const memberSince = new Date(profile.createdAt).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <ScreenHeader title="Perfil del jugador" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-10">
        {/* ===== Identidad ===== */}
        <section className="card-aurora relative mt-4 flex items-center gap-4 overflow-hidden rounded-3xl border bg-card p-5">
          <span aria-hidden className="anim-twinkle absolute -right-2 -top-2 text-4xl opacity-20 select-none">✨</span>
          <Avatar className="gloss h-16 w-16 border-2 border-primary/30">
            <AvatarFallback className="bg-secondary text-3xl">
              <span className="anim-bob">{AVATAR_EMOJI[profile.avatar] ?? "🦉"}</span>
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  maxLength={20}
                  aria-label="Nuevo nombre"
                  className="h-10"
                />
                <Button size="sm" onClick={saveName} className="font-bold">Guardar</Button>
              </div>
            ) : (
              <button
                onClick={() => { sfx.tap(); setNameDraft(profile.name); setEditing(true); }}
                className="group flex items-center gap-2 text-left"
                aria-label="Editar nombre"
              >
                <h2 className="font-display title-sheen truncate text-2xl font-bold">{profile.name}</h2>
                <PenLine className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" aria-hidden />
              </button>
            )}
            <p className="text-sm text-muted-foreground">
              {rank.name} · explorando desde {memberSince}
            </p>
          </div>
          <LevelBadge level={level} size="lg" />
        </section>

        {/* ===== Progreso global ===== */}
        <section className="mt-4 grid grid-cols-3 gap-2.5">
          <StatCard value={`${core.xp}`} label="XP total" />
          <StatCard value={`${core.streak.best}`} label="Mejor racha" />
          <StatCard value={`${core.stats.totalSessions}`} label="Sesiones" />
        </section>

        <section className="card-aurora mt-4 rounded-3xl border bg-card p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-sm font-bold">Nivel {level} · {rank.name}</p>
            <p className="numeric text-xs text-muted-foreground">{into}/{needed} XP</p>
          </div>
          <XpBar into={into} needed={needed} />
        </section>

        {/* ===== Estimaciones MCER por habilidad ===== */}
        <section className="mt-6" aria-labelledby="skills-title">
          <h3 id="skills-title" className="font-display text-lg font-bold">
            Tus habilidades
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Estimación orientativa basada en tu rendimiento. VerbalIA no certifica niveles oficiales.
          </p>
          <div className="mt-3 space-y-2.5">
            {(["vocabulario", "gramatica", "ortografia", "lectura"] as const).map((skill) => {
              const lvl = core.skills[skill];
              const cefr = cefrFromSkill(lvl);
              return (
                <div key={skill} className="card-aurora flex items-center gap-3 rounded-2xl border bg-card p-3.5">
                  <span className="gloss h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: SKILL_COLORS[skill], boxShadow: `0 0 8px color-mix(in oklch, ${SKILL_COLORS[skill]} 60%, transparent)` }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-bold">{SKILL_LABELS[skill]}</p>
                      <p className="text-xs font-bold text-muted-foreground">
                        {skillMasteryLabel(lvl)} · <span className="text-foreground">{cefr}</span>
                      </p>
                    </div>
                    <div className="groove mt-1.5 h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${(lvl / 10) * 100}%`, background: SKILL_COLORS[skill] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {(["audicion", "expresion"] as const).map((skill) => (
              <div key={skill} className="flex items-center gap-3 rounded-2xl border border-dashed bg-card/50 p-3.5">
                <span className="h-3 w-3 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden />
                <p className="flex-1 text-sm font-bold text-muted-foreground">
                  {SKILL_LABELS[skill]}
                </p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Etapa 2-3
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Colección + logros ===== */}
        <section className="mt-6 grid gap-3 sm:grid-cols-[1fr_1.2fr]">
          <div className="card-aurora flex items-center gap-4 rounded-3xl border bg-card p-4">
            <ProgressRing value={wordsLearned / Math.max(1, wordsLearned + Math.max(0, 48 - wordsLearned))} size={80} stroke={8}>
              <span className="numeric font-display text-base font-bold">{wordsLearned}</span>
            </ProgressRing>
            <div>
              <p className="text-sm font-bold">Palabras aprendidas</p>
              <p className="text-xs text-muted-foreground">{wordsMastered} dominadas</p>
              <Button variant="link" className="h-auto p-0 text-xs font-bold" onClick={() => { sfx.click(); navigate({ name: "collection" }); }}>
                Ver la colección →
              </Button>
            </div>
          </div>
          <div className="card-aurora rounded-3xl border bg-card p-4">
            <p className="text-sm font-bold">Logros: {unlockedCount} / {ACHIEVEMENTS.length}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ACHIEVEMENTS.slice(0, 10).map((a) => {
                const Icon = getIcon(a.icon);
                const got = Boolean(core.achievements[a.id]);
                return (
                  <span
                    key={a.id}
                    title={`${a.name}: ${a.description}`}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      got ? "bg-[var(--xp)]/25 text-[var(--xp)]" : "bg-muted text-muted-foreground/50",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                );
              })}
              <span className="self-center text-xs text-muted-foreground">…</span>
            </div>
            <Button variant="link" className="h-auto p-0 text-xs font-bold" onClick={() => { sfx.click(); navigate({ name: "missions" }); }}>
              Ver todos los logros →
            </Button>
          </div>
        </section>

        {/* ===== Tus datos ===== */}
        <section className="mt-6" aria-labelledby="data-title">
          <h3 id="data-title" className="font-display text-lg font-bold">Tus datos</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Todo vive en este dispositivo (IndexedDB). Sin cuentas, sin servidores, sin rastreadores.
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <Button variant="outline" onClick={() => { sfx.page(); doExport(); }}>
              <Download className="mr-2 h-4 w-4" aria-hidden /> Exportar copia
            </Button>
            <Button variant="outline" onClick={() => { sfx.page(); fileRef.current?.click(); }}>
              <Upload className="mr-2 h-4 w-4" aria-hidden /> Importar copia
            </Button>
            <input
              ref={fileRef}
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="font-bold">
                  <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Borrar todo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Borrar todos tus datos?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se eliminarán perfil, XP, niveles, palabras, logros e historial de este dispositivo.
                    Esta acción no se puede deshacer (a menos que tengas una copia exportada).
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
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="gloss card-aurora rounded-2xl border bg-card p-3 text-center">
      <p className="numeric font-display title-sheen text-xl font-bold">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

export { CheckCircle2, Circle };
