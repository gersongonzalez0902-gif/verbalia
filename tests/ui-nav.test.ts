/**
 * Pruebas del recuerdo de origen en el enrutador · Ola E · 2 (P0-1).
 *
 * El «Volver» de las cabeceras (ScreenHeader) usa lastScreen como destino
 * cuando existe. Lo que hay que garantizar a nivel de store:
 * - navigate() deja la pantalla de origen en lastScreen;
 * - navegar a la misma pantalla no machaca el origen;
 * - syncFromHash (flechas del navegador) también alimenta el origen.
 * El caso guía: portada → «Entrar con cuenta» → Cuenta → atrás = PORTADA.
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { useUiStore } from "@/store/ui-store";

beforeEach(() => {
  useUiStore.setState({ screen: { name: "welcome" }, lastScreen: null });
});

describe("ui-store · lastScreen (el «Volver» aterriza donde toca)", () => {
  test("portada → Cuenta deja el origen en lastScreen", () => {
    useUiStore.getState().navigate({ name: "account" });
    expect(useUiStore.getState().screen.name).toBe("account");
    expect(useUiStore.getState().lastScreen).toEqual({ name: "welcome" });
  });

  test("de Inicio a Ajustes a Cuenta: el origen de Cuenta es Ajustes", () => {
    useUiStore.getState().navigate({ name: "settings" });
    useUiStore.getState().navigate({ name: "account" });
    expect(useUiStore.getState().lastScreen).toEqual({ name: "settings" });
  });

  test("navegar a la misma pantalla no machaca el origen", () => {
    useUiStore.getState().navigate({ name: "account" });
    const origin = useUiStore.getState().lastScreen;
    useUiStore.getState().navigate({ name: "account" });
    expect(useUiStore.getState().lastScreen).toEqual(origin);
  });

  test("syncFromHash (flecha del navegador) también alimenta el origen", () => {
    const g = globalThis as Record<string, unknown>;
    g.window = { location: { hash: "#/cuenta" } };
    try {
      useUiStore.getState().syncFromHash();
      expect(useUiStore.getState().screen.name).toBe("account");
      expect(useUiStore.getState().lastScreen).toEqual({ name: "welcome" });
    } finally {
      delete g.window;
    }
  });

  test("carga directa por URL: sin origen, el respaldo (backTo) manda", () => {
    // Sin navegación previa lastScreen queda a null: ScreenHeader usará
    // su backTo (Cuenta → Ajustes) en vez de inventar un origen falso.
    expect(useUiStore.getState().lastScreen).toBeNull();
  });
});
