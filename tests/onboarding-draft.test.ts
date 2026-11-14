import { describe, expect, test } from "bun:test";
import { finalName, saveDraft, loadDraft, clearDraft } from "@/lib/onboarding-draft";

const od = { saveDraft, loadDraft, clearDraft };

/**
 * Área 19 · onboarding: el nombre que llega a la bitácora es el que se
 * prometió (recortado, no vacío, ≤ 20). El borrador de sessionStorage
 * se prueba indirectamente: solo expone DOM de sessionStorage en bun
 * mediante un shim mínimo.
 */

describe("Área 19 · nombre final del navegante", () => {
  test("recorta espacios y respeta el tope de 20", () => {
    expect(finalName("  Marina  ")).toBe("Marina");
    expect(finalName("1234567890123456789012345")).toBe("12345678901234567890");
  });

  test("sin nombre válido, el fallback entra en escena", () => {
    expect(finalName("")).toBe("Explorador·a");
    expect(finalName("   ")).toBe("Explorador·a");
  });
});

describe("Área 19 · borrador en sessionStorage (shim mínimo)", () => {
  test("lo guardado es lo cargado; lo corrupto se descarta", () => {
    const store = new Map<string, string>();
    const g = globalThis as Record<string, unknown>;
    g.sessionStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    // las funciones leen sessionStorage en cada llamada: el shim vale
    const { saveDraft, loadDraft, clearDraft } = od;
    saveDraft({ step: 3, name: "Marina", goal: "escribir", experience: "medio", gender: "f", theme: "coral" });
    const d = loadDraft(5);
    expect(d).toEqual({ step: 3, name: "Marina", goal: "escribir", experience: "medio", gender: "f", theme: "coral" });
    // JSON corrupto → sin borrador, se empieza de cero
    store.set("verbalia-onboarding-draft-v1", "{esto no es json");
    expect(loadDraft(5)).toBeNull();
    // paso fuera de rango → 0; nombre vacío → sin borrador
    saveDraft({ step: 9, name: "X", goal: "", experience: "", gender: "", theme: "" });
    expect(loadDraft(5)?.step).toBe(0);
    saveDraft({ step: 1, name: "  ", goal: "", experience: "", gender: "", theme: "" });
    expect(loadDraft(5)).toBeNull();
    clearDraft();
    expect(loadDraft(5)).toBeNull();
    delete g.sessionStorage;
  });
});
