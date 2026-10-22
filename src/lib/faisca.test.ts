import { describe, expect, it } from "vitest";

import { FAIS_SCALE, formatFaisca, parseFaiscaInput } from "./faisca";

describe("faísca fracionada", () => {
  it("50 faíscas inteiras aparecem como 50 (sem vírgula desnecessária)", () => {
    expect(formatFaisca(50 * FAIS_SCALE)).toBe("50");
  });

  it("usa vírgula decimal no padrão pt-BR", () => {
    expect(formatFaisca(1_500)).toBe("1,5");
    expect(formatFaisca(1_234_500)).toBe("1.234,5");
  });

  it("lê o que a pessoa digita como faísca inteira e decimal", () => {
    expect(parseFaiscaInput("50")).toBe(50_000);
    expect(parseFaiscaInput("50,5")).toBe(50_500);
    expect(parseFaiscaInput("1.234,56")).toBe(1_234_560);
    expect(parseFaiscaInput("50.5")).toBe(50_500);
  });
});
