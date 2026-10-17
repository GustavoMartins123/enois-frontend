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
 * Declarações da COR DE WIDGET: o interno de cartões, painéis, menus e sidebar.
 *
 * Quem pinta o widget é dono da leitura dele: o texto principal é escolhido pelo
 * contraste (a mesma matemática dos temas da galeria) e os tons auxiliares saem
 * por `color-mix` contra o ponto médio — o CSS faz a conta, como no resto do
 * sistema de temas.
 */
export function buildWidgetDeclarations(style: BackgroundStyle): Record<string, string> {
  const surface = backgroundValue(style);
  const mid = representativeHex(style);
  const fitted = readableForeground(hexToRgb(mid), 290);

  return {
    "--card": surface,
    "--popover": surface,
    "--sidebar": surface,
    "--surface-card": surface,
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

/**
 * Declarações do PLANO DE FUNDO: só o `--background`, a página atrás de tudo.
 *
 * Sem readaptação de texto de propósito: quem tem cor própria para texto são os
 * widgets (acima), e texto solto direto sobre a página é raro — a identidade do
 * tema e a legibilidade dos cartões valem mais.
 */
export function buildPageDeclarations(style: BackgroundStyle): Record<string, string> {
  return { "--background": backgroundValue(style) };
}
