"use client";

/**
 * Onboarding · Cinco pasos rápidos: nombre, género de tratamiento,
 * rumbo, experiencia previa y paleta de color (Etapa 4).
 * La paleta se aplica en vivo para probarla antes de decidir.
 * (Ola 1.1: fuera la elección de compañía/mascota; Léxico, el búho guía
 * del juego, sigue siendo el personaje del Archipiélago.)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/ui-store";
import { useGameStore } from "@/store/game-store";
import { LexicoBubble } from "@/components/game/lexico";
import { LEXICO_ONBOARDING } from "@/data/companion";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Briefcase, GraduationCap, Map as MapIcon, PenLine, Plane, BookOpen, Palette } from "lucide-react";
import type { PlayerProfile, ThemeColorId } from "@/types";

const GOALS = [
  { id: "viajar", label: "Viajar", icon: Plane, desc: "Soltarme en cualquier conversación" },
  { id: "trabajar", label: "Trabajar", icon: Briefcase, desc: "Escribir y hablar mejor en el trabajo" },
  { id: "leer", label: "Leer más", icon: BookOpen, desc: "Disfrutar libros sin diccionario" },
  { id: "escribir", label: "Escribir", icon: PenLine, desc: "Expresar ideas con claridad" },
  { id: "estudiar", label: "Estudiar", icon: GraduationCap, desc: "Preparar exámenes y certificaciones" },
];

const EXPERIENCES: { id: PlayerProfile["experience"]; label: string; desc: string }[] = [
  { id: "principiante", label: "Principiante", desc: "Empiezo desde la orilla" },
  { id: "intermedio", label: "Intermedio", desc: "Navego, pero con mareos" },
  { id: "avanzado", label: "Avanzado", desc: "Busco afinar el rumbo" },
];

const TOTAL_STEPS = 5;

/** Paletas seleccionables desde el onboarding (Etapa 4): vista previa en vivo. */
const PALETTES: { id: ThemeColorId; label: string; desc: string; css: string }[] = [
  { id: "aurora", label: "Aurora", desc: "Índigo profundo y cielo claro", css: "linear-gradient(135deg, oklch(0.55 0.17 285), oklch(0.72 0.13 210) 60%, oklch(0.85 0.10 90))" },
  { id: "coral", label: "Coral", desc: "Atardecer cálido del puerto", css: "linear-gradient(135deg, oklch(0.6 0.17 25), oklch(0.75 0.13 50) 70%, oklch(0.9 0.08 85))" },
  { id: "miel", label: "Miel", desc: "Pergamino y luz de biblioteca", css: "linear-gradient(135deg, oklch(0.7 0.14 70), oklch(0.82 0.13 90) 55%, oklch(0.95 0.05 95))" },
  { id: "lavanda", label: "Lavanda", desc: "Tardes de observatorio", css: "linear-gradient(135deg, oklch(0.5 0.16 305), oklch(0.7 0.13 280) 65%, oklch(0.88 0.08 320))" },
  { id: "oceano", label: "Océano", desc: "Marea alta y bruma", css: "linear-gradient(135deg, oklch(0.4 0.11 250), oklch(0.6 0.11 215) 60%, oklch(0.85 0.09 195))" },
  { id: "magenta", label: "Magenta", desc: "Fucsia de la Forja", css: "linear-gradient(135deg, oklch(0.5 0.20 340), oklch(0.66 0.18 320) 55%, oklch(0.88 0.10 300))" },
];

const GENDERS: { id: PlayerProfile["gender"]; label: string; desc: string }[] = [
  { id: "f", label: "Femenino", desc: "«Exploradora», «Guardiana»…" },
  { id: "m", label: "Masculino", desc: "«Explorador», «Guardián»…" },
  { id: "x", label: "Neutro / otro", desc: "«Explorador·a», trato inclusivo" },
];

export function OnboardingScreen() {
  const navigate = useUiStore((s) => s.navigate);
  const finishOnboarding = useGameStore((s) => s.finishOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("leer");
  const [experience, setExperience] = useState<PlayerProfile["experience"]>("principiante");
  const [gender, setGender] = useState<PlayerProfile["gender"]>("x");
  const [theme, setTheme] = useState<ThemeColorId>("aurora");
  const updateSettings = useGameStore((s) => s.updateSettings);

  const canContinue =
    step === 0 ? name.trim().length > 0 && name.trim().length <= 20 : true;

  const finish = () => {
    updateSettings({ themeColor: theme });
    finishOnboarding({
      name: name.trim() || "Explorador·a",
      // El campo sigue existiendo por compatibilidad con datos ya
      // sincronizados, pero ya no se elige: la compañía fija es el búho Léxico.
      avatar: "buho",
      goal,
      experience,
      gender,
      bio: "",
      banner: "preset:aurora",
      photo: "",
      featuredBadge: "",
    });
    navigate({ name: "placement" });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-6">
      {/* Progreso del onboarding */}
      <div className="mb-5 flex items-center gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Paso ${step + 1} de ${TOTAL_STEPS}`}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={cn(
              "groove h-2 flex-1 overflow-hidden rounded-full",
            )}
          >
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-[width] duration-500",
                i <= step ? "w-full" : "w-0",
              )}
            />
          </div>
        ))}
      </div>

      <LexicoBubble
        text={
          [
            LEXICO_ONBOARDING.name,
            LEXICO_ONBOARDING.gender,
            LEXICO_ONBOARDING.goal,
            LEXICO_ONBOARDING.experience,
            "Elige la paleta con la que más a gusto navegues: la verás aplicarse al instante. Podrás cambiarla en Ajustes.",
          ][step] ?? LEXICO_ONBOARDING.welcome
        }
        className="mb-5"
      />

      <div className="flex-1">
        {step === 0 && (
          <section className="anim-slide-up space-y-4">
            <h1 className="type-h1">¿Cómo te llamamos?</h1>
            <p className="text-sm text-muted-foreground">
              Aparecerá en tu bitácora. Puedes usar tu nombre o un alias de viaje.
            </p>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canContinue && setStep(1)}
              placeholder="Por ejemplo: Marina"
              maxLength={20}
              aria-label="Tu nombre de explorador"
              className="h-12 rounded-2xl text-lg font-semibold"
            />
            {name.trim().length === 0 && (
              <p className="text-xs text-muted-foreground">Máximo 20 caracteres. Sin datos enviados a ningún servidor.</p>
            )}
          </section>
        )}

        {step === 1 && (
          <section className="anim-slide-up space-y-4">
            <h1 className="type-h1">¿Cómo prefieres que te llamemos?</h1>
            <p className="text-sm text-muted-foreground">
              Solo afecta a los títulos del viaje (rangos y logros). Puedes cambiarlo cuando quieras.
            </p>
            <div className="space-y-2.5">
              {GENDERS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => { sfx.tap(); setGender(g.id); }}
                  aria-pressed={gender === g.id}
                  className={cn(
                    "tap-3d tap-target flex w-full items-center justify-between gap-3 rounded-2xl border-2 bg-card p-4 text-left",
                    gender === g.id ? "border-primary" : "border-border",
                  )}
                >
                  <span>
                    <span className="block font-bold">{g.label}</span>
                    <span className="block text-xs text-muted-foreground">{g.desc}</span>
                  </span>
                  <span
                    className={cn(
                      "h-5 w-5 shrink-0 rounded-full border-2",
                      gender === g.id ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--card)]" : "border-border",
                    )}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="anim-slide-up space-y-4">
            <h1 className="type-h1">¿Cuál es tu rumbo?</h1>
            <p className="text-sm text-muted-foreground">Nos ayuda a recomendarte sesiones y contenidos.</p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {GOALS.map((g) => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => { sfx.tap(); setGoal(g.id); }}
                    aria-pressed={goal === g.id}
                    className={cn(
                      "tap-3d tap-target flex items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left",
                      goal === g.id ? "border-primary" : "border-border",
                    )}
                  >
                    <span className={cn("gloss flex h-10 w-10 items-center justify-center rounded-xl", goal === g.id ? "chip-icon" : "bg-secondary text-secondary-foreground")}>
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-bold">{g.label}</span>
                      <span className="block text-xs text-muted-foreground">{g.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="anim-slide-up space-y-4">
            <h1 className="type-h1">¿Cuánta experiencia tienes?</h1>
            <p className="text-sm text-muted-foreground">
              Sé sincero: la evaluación inicial ajustará tu nivel real en cada habilidad.
            </p>
            <div className="space-y-2.5">
              {EXPERIENCES.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => { sfx.tap(); setExperience(e.id); }}
                  aria-pressed={experience === e.id}
                  className={cn(
                    "tap-3d tap-target flex w-full items-center justify-between gap-3 rounded-2xl border-2 bg-card p-4 text-left",
                    experience === e.id ? "border-primary" : "border-border",
                  )}
                >
                  <span>
                    <span className="block font-bold">{e.label}</span>
                    <span className="block text-xs text-muted-foreground">{e.desc}</span>
                  </span>
                  <span
                    className={cn(
                      "h-5 w-5 shrink-0 rounded-full border-2",
                      experience === e.id ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--card)]" : "border-border",
                    )}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="anim-slide-up space-y-4">
            <h1 className="type-h1">Tu paleta de navegación</h1>
            <p className="text-sm text-muted-foreground">
              Se aplica en vivo: pruébalas todas antes de decidir. Podrás cambiarla en Ajustes cuando quieras.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { sfx.tap(); setTheme(p.id); updateSettings({ themeColor: p.id }); }}
                  aria-pressed={theme === p.id}
                  aria-label={`Paleta ${p.label}`}
                  className={cn(
                    "tap-3d tap-target flex flex-col gap-1.5 rounded-2xl border-2 bg-card p-3 text-left",
                    theme === p.id ? "border-primary" : "border-border",
                  )}
                >
                  <span className="h-10 w-full rounded-xl border" style={{ background: p.css }} aria-hidden />
                  <span className="flex items-center gap-1 text-xs font-bold">
                    {theme === p.id && <Palette className="h-3 w-3 text-primary" aria-hidden />}
                    {p.label}
                  </span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{p.desc}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Navegación */}
      <div className="mt-6 flex gap-2.5">
        {step > 0 && (
          <Button variant="outline" size="lg" className="px-6" onClick={() => { sfx.back(); setStep((s) => s - 1); }}>
            Atrás
          </Button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <Button size="lg" className="flex-1" disabled={!canContinue} onClick={() => { sfx.go(); setStep((s) => s + 1); }}>
            Continuar
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={finish}>
            <MapIcon className="mr-2 h-4 w-4" aria-hidden />
            Ir a la evaluación
          </Button>
        )}
      </div>
    </div>
  );
}
