"use client";

/**
 * Onboarding · Cuatro pasos rápidos: nombre, avatar, objetivo y
 * experiencia previa. El tema se gestiona en Ajustes (y aquí se
 * preseleccióna claro/oscuro según el sistema).
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/store/ui-store";
import { useGameStore } from "@/store/game-store";
import { TintaBubble } from "@/components/game/tinta";
import { TINTA_ONBOARDING } from "@/data/companion";
import { cn } from "@/lib/utils";
import { Briefcase, GraduationCap, Map as MapIcon, PenLine, Plane, BookOpen } from "lucide-react";
import type { PlayerProfile } from "@/types";

const AVATARS = [
  { id: "buho", emoji: "🦉", label: "Búho" },
  { id: "zorro", emoji: "🦊", label: "Zorro" },
  { id: "ballena", emoji: "🐳", label: "Ballena" },
  { id: "tortuga", emoji: "🐢", label: "Tortuga" },
  { id: "loro", emoji: "🦜", label: "Loro" },
  { id: "mariposa", emoji: "🦋", label: "Mariposa" },
];

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

const TOTAL_STEPS = 4;

export function OnboardingScreen() {
  const navigate = useUiStore((s) => s.navigate);
  const finishOnboarding = useGameStore((s) => s.finishOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("buho");
  const [goal, setGoal] = useState("leer");
  const [experience, setExperience] = useState<PlayerProfile["experience"]>("principiante");

  const canContinue =
    step === 0 ? name.trim().length > 0 && name.trim().length <= 20 : true;

  const finish = () => {
    finishOnboarding({
      name: name.trim() || "Explorador·ra",
      avatar,
      goal,
      experience,
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
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      <TintaBubble
        text={
          [TINTA_ONBOARDING.name, TINTA_ONBOARDING.avatar, TINTA_ONBOARDING.goal, TINTA_ONBOARDING.experience][step] ??
          TINTA_ONBOARDING.welcome
        }
        className="mb-5"
      />

      <div className="flex-1">
        {step === 0 && (
          <section className="anim-slide-up space-y-4">
            <h1 className="font-display text-2xl font-bold">¿Cómo te llamamos?</h1>
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
            <h1 className="font-display text-2xl font-bold">Elige tu compañía</h1>
            <p className="text-sm text-muted-foreground">Tu avatar te acompañará en el mapa.</p>
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAvatar(a.id)}
                  aria-pressed={avatar === a.id}
                  aria-label={`Avatar ${a.label}`}
                  className={cn(
                    "tap-target flex flex-col items-center gap-1 rounded-2xl border-2 bg-card p-3 transition-all duration-150",
                    avatar === a.id
                      ? "-translate-y-0.5 border-primary shadow-md"
                      : "border-border hover:border-primary/50 hover:shadow-sm",
                  )}
                >
                  <span className="text-3xl" aria-hidden>{a.emoji}</span>
                  <span className="text-xs font-bold">{a.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="anim-slide-up space-y-4">
            <h1 className="font-display text-2xl font-bold">¿Cuál es tu rumbo?</h1>
            <p className="text-sm text-muted-foreground">Nos ayuda a recomendarte sesiones y contenidos.</p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {GOALS.map((g) => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    aria-pressed={goal === g.id}
                    className={cn(
                      "tap-target flex items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left transition-all duration-150",
                      goal === g.id
                        ? "-translate-y-0.5 border-primary shadow-md"
                        : "border-border hover:border-primary/50 hover:shadow-sm",
                    )}
                  >
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", goal === g.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
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
            <h1 className="font-display text-2xl font-bold">¿Cuánta experiencia tienes?</h1>
            <p className="text-sm text-muted-foreground">
              Sé sincero: la evaluación inicial ajustará tu nivel real en cada habilidad.
            </p>
            <div className="space-y-2.5">
              {EXPERIENCES.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setExperience(e.id)}
                  aria-pressed={experience === e.id}
                  className={cn(
                    "tap-target flex w-full items-center justify-between gap-3 rounded-2xl border-2 bg-card p-4 text-left transition-all duration-150",
                    experience === e.id
                      ? "-translate-y-0.5 border-primary shadow-md"
                      : "border-border hover:border-primary/50 hover:shadow-sm",
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
      </div>

      {/* Navegación */}
      <div className="mt-6 flex gap-2.5">
        {step > 0 && (
          <Button variant="outline" size="lg" className="px-6 font-bold" onClick={() => setStep((s) => s - 1)}>
            Atrás
          </Button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <Button size="lg" className="flex-1 font-bold" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
            Continuar
          </Button>
        ) : (
          <Button size="lg" className="flex-1 font-bold" onClick={finish}>
            <MapIcon className="mr-2 h-4 w-4" aria-hidden />
            Ir a la evaluación
          </Button>
        )}
      </div>
    </div>
  );
}
