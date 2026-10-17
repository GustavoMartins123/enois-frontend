import type { BackgroundStyle } from "@/types/preferences/background-style";

import { hexToRgb, readableForeground, rgbToHex } from "./color";

/** O valor CSS do fundo escolhido: cor direta ou gradiente na direção pedida. */
export function backgroundValue(style: BackgroundStyle): string {
  if (style.type === "solid") return style.color;
  switch (style.direction) {
    case "vertical":
      return `linear-gradient(180deg, ${style.from}, ${style.to})`;
    case "radial":
      return `radial-gradient(circle at 50% 0%, ${style.from}, ${style.to})`;
    default:
      return `linear-gradient(135deg, ${style.from}, ${style.to})`;
  }
}

/** Ponto médio do fundo (o próprio colorido, ou a média dos extremos do gradiente). */
function representativeHex(style: BackgroundStyle): string {
  if (style.type === "solid") return style.color;
  const first = hexToRgb(style.from);
  const second = hexToRgb(style.to);
  return rgbToHex({
    r: (first.r + second.r) / 2,
    g: (first.g + second.g) / 2,
    b: (first.b + second.b) / 2,
  });
}

/**
 * Declarações que o plano de fundo escolhido sobrescreve.
 *
 * O fundo escolhido é dono da leitura: o texto da marca (escuro no modo claro) não
 * sobrevive a um fundo escuro. O texto principal é escolhido pelo contraste (a mesma
 * matemática dos temas da galeria) e os tons auxiliares saem por `color-mix` contra
 * o ponto médio do fundo — o CSS faz a conta, como no resto do sistema de temas.
 */
export function buildBackgroundDeclarations(style: BackgroundStyle): Record<string, string> {
  const background = backgroundValue(style);
  const mid = representativeHex(style);
  const fitted = readableForeground(hexToRgb(mid), 290);

  return {
    "--background": background,
    "--foreground": fitted.css,
    "--text-strong": fitted.css,
    "--card-foreground": fitted.css,
    "--popover-foreground": fitted.css,
    "--sidebar-foreground": fitted.css,
    "--text-subtle": `color-mix(in srgb, ${fitted.css} 55%, ${mid})`,
    "--muted-foreground": `color-mix(in srgb, ${fitted.css} 55%, ${mid})`,
    "--text-date": `color-mix(in srgb, ${fitted.css} 35%, ${mid})`,
  };
}
