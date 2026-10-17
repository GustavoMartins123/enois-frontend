import type { BackgroundStyle } from "@/types/preferences/background-style";
import { describe, expect, it } from "vitest";

import {
  backgroundValue,
  buildPageDeclarations,
  buildWidgetDeclarations,
} from "./build-background-style";
import { hexToHsl, hexToRgb, hslToHex, readableForeground } from "./color";

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
    const declarations = buildWidgetDeclarations(solidDark);
    const expected = readableForeground(hexToRgb("#0b1220"), 290).css;
    expect(declarations["--foreground"]).toBe(expected);
    // O texto claro é o quase-branco da marca (oklch ~0.99), não o escuro.
    expect(declarations["--foreground"]).toContain("0.99");
  });

  it("fundo claro escolhido mantém texto escuro", () => {
    const declarations = buildWidgetDeclarations(solidLight);
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

    const declarations = buildWidgetDeclarations(gradient);
    // O médio de #1a1030 e #e6dcf7 é meio-clara: o texto é o que lê melhor sobre ele.
    expect(declarations["--foreground"]).toBe(readableForeground(hexToRgb("#808690"), 290).css);
    expect(declarations["--text-subtle"]).toContain("color-mix");
  });

  it("a cor sólida escolhida é o próprio widget (não o gradiente padrão)", () => {
    const declarations = buildWidgetDeclarations(solidDark);
    expect(declarations["--card"]).toBe("#0b1220");
    expect(declarations["--surface-card"]).toBe("#0b1220");
    expect(declarations["--card"]).not.toContain("gradient");
  });

  it("o plano de fundo da página troca só o --background, sem tocar em texto", () => {
    const declarations = buildPageDeclarations(solidDark);
    expect(declarations).toEqual({ "--background": "#0b1220" });
  });

  it("direções viram o CSS esperado", () => {
    const diagonal: BackgroundStyle = { ...solidDark, type: "gradient", direction: "diagonal" };
    expect(backgroundValue(diagonal)).toContain("linear-gradient(135deg");
    expect(backgroundValue({ ...diagonal, direction: "radial" })).toContain("radial-gradient");
  });
});

describe("conversões HSL dos sliders de fundo", () => {
  it("hsl e hex conversam nos dois sentidos (dentro da quantização de 8 bits)", () => {
    for (const hex of ["#0b1220", "#f4f1fb", "#ff71ce", "#000000", "#ffffff"]) {
      const { h, s, l } = hexToHsl(hex);
      const back = hexToHsl(hslToHex(h, s, l));
      const circular = Math.min(Math.abs(back.h - h), 360 - Math.abs(back.h - h));
      expect(circular).toBeLessThanOrEqual(2);
      // Em brilho baixo, 8 bits custa alguns pontos de saturação — tolerância maior lá.
      expect(Math.abs(back.s - s)).toBeLessThanOrEqual(6);
      expect(Math.abs(back.l - l)).toBeLessThanOrEqual(6);
    }
  });

  it("a extensão do degradê gera rampa de um matiz só, do claro ao escuro", () => {
    const from = hexToHsl("#e6dcf7");
    const to = hslToHex(from.h, from.s, Math.max(0, from.l - 30));
    const second = hexToHsl(to);
    expect(second.h).toBe(from.h);
    expect(Math.abs(second.l - (from.l - 30))).toBeLessThanOrEqual(1);
  });
});
