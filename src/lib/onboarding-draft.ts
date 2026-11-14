/**
 * Borrador del onboarding (Área 19) — pure y testeable.
 * Si el navegante recarga a mitad de camino, no vuelve a empezar:
 * el borrador vive en sessionStorage (sin tocar el esquema de datos).
 */

export interface OnboardingDraft {
  step: number;
  name: string;
  goal: string;
  experience: string;
  gender: string;
  theme: string;
}

const KEY = "verbalia-onboarding-draft-v1";

export function saveDraft(draft: OnboardingDraft): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* sin sessionStorage: no pasa nada, se empieza de cero */
  }
}

export function loadDraft(totalSteps: number): OnboardingDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<OnboardingDraft>;
    // Sanidad: paso en rango, nombre válido; lo dudoso se descarta.
    const step = typeof d.step === "number" && d.step >= 0 && d.step < totalSteps ? d.step : 0;
    if (typeof d.name !== "string" || d.name.trim().length === 0) return null;
    return {
      step,
      name: d.name.trim().slice(0, 20),
      goal: typeof d.goal === "string" ? d.goal : "leer",
      experience: typeof d.experience === "string" ? d.experience : "principiante",
      gender: typeof d.gender === "string" ? d.gender : "x",
      theme: typeof d.theme === "string" ? d.theme : "aurora",
    };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

/** El nombre que llega a la bitácora: recortado, no vacío y ≤ 20. */
export function finalName(draftName: string, fallback = "Explorador·a"): string {
  const clean = draftName.trim().slice(0, 20);
  return clean.length > 0 ? clean : fallback;
}
