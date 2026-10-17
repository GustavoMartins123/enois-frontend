import type { BackgroundStyle } from "@/types/preferences/background-style";
import { describe, expect, it } from "vitest";

import { backgroundValue, buildBackgroundDeclarations } from "./build-background-style";
import { hexToRgb, readableForeground } from "./color";

const solidDark: BackgroundStyle = {
  type: "solid",
  color: "#0b1220",
  from: "#0b1220",
  to: "#0b1220",
  direction: "diagonal",
};

const solidLight: BackgroundStyle = { ...solidDark, color: "#f4f1fb" };

/**
 * O fundo escolhido é dono da leitura: qualquer que seja a cor, o texto aplicado
 * sobre ela tem que passar do piso de leitura — é isso que estes testes travam.
 */
describe("plano de fundo personalizado", () => {
  it("fundo escuro escolhido vira texto claro", () => {
    const declarations = buildBackgroundDeclarations(solidDark);
    const expected = readableForeground(hexToRgb("#0b1220"), 290).css;
    expect(declarations["--foreground"]).toBe(expected);
    // O texto claro é o quase-branco da marca (oklch ~0.99), não o escuro.
    expect(declarations["--foreground"]).toContain("0.99");
  });

  it("fundo claro escolhido mantém texto escuro", () => {
    const declarations = buildBackgroundDeclarations(solidLight);
    expect(declarations["--foreground"]).toBe(readableForeground(hexToRgb("#f4f1fb"), 290).css);
    expect(declarations["--foreground"]).toContain("0.16");
  });

  it("gradiente usa a direção pedida e o texto se apoia no ponto médio", () => {
    const gradient: BackgroundStyle = {
      type: "gradient",
      color: "#f4f1fb",
      from: "#1a1030",
      to: "#e6dcf7",
      direction: "vertical",
    };
    expect(backgroundValue(gradient)).toContain("linear-gradient(180deg, #1a1030, #e6dcf7)");

    const declarations = buildBackgroundDeclarations(gradient);
    // O médio de #1a1030 e #e6dcf7 é meio-clara: o texto é o que lê melhor sobre ele.
    expect(declarations["--foreground"]).toBe(readableForeground(hexToRgb("#808690"), 290).css);
    expect(declarations["--text-subtle"]).toContain("color-mix");
  });

  it("direções viram o CSS esperado", () => {
    const diagonal: BackgroundStyle = { ...solidDark, type: "gradient", direction: "diagonal" };
    expect(backgroundValue(diagonal)).toContain("linear-gradient(135deg");
    expect(backgroundValue({ ...diagonal, direction: "radial" })).toContain("radial-gradient");
  });
});
