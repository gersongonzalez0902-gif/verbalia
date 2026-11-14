import { describe, expect, test } from "bun:test";
import { lastPlayedTraining, recommendTraining } from "@/lib/training-picks";
import { GAMES } from "@/data/games";

/**
 * Área 6 · Entrenamientos: reto de hoy (habilidad más débil abierta)
 * y retomar el último formato.
 */

describe("Área 6 · reto de hoy", () => {
  test("recomienda un formato abierto de la habilidad más débil", () => {
    const rec = recommendTraining(
      { vocabulario: 4, audicion: 1, gramatica: 7 },
      () => true, // todo abierto
    );
    expect(rec).not.toBeNull();
    expect(rec!.skill).toBe("audicion");
  });

  test("si la habilidad más débil está toda cerrada, recomienda entre los abiertos", () => {
    const rec = recommendTraining(
      { audicion: 1, vocabulario: 6 },
      (id) => GAMES[id]?.skill === "vocabulario", // solo vocabulario abierto
    );
    expect(rec).not.toBeNull();
    expect(rec!.skill).toBe("vocabulario");
  });

  test("sin nada abierto no inventa recomendación", () => {
    expect(recommendTraining({ vocabulario: 3 }, () => false)).toBeNull();
  });

  test("habilidades sin valor usan el nivel por defecto (2)", () => {
    const rec = recommendTraining({}, () => true);
    expect(rec).not.toBeNull();
    // Empate general a 2: gana la primera del orden fijo (vocabulario).
    expect(rec!.skill).toBe("vocabulario");
  });
});

describe("Área 6 · retomar el último formato", () => {
  test("devuelve el formato del último gameId real", () => {
    const someId = Object.keys(GAMES)[0];
    expect(lastPlayedTraining(someId)?.id).toBe(someId);
  });

  test("sin partida previa o con id desconocido, nada que retomar", () => {
    expect(lastPlayedTraining(undefined)).toBeNull();
    expect(lastPlayedTraining("formato-inexistente")).toBeNull();
  });
});
