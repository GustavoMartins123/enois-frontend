import type { BackgroundStyle } from "@/types/preferences/background-style";

import { hexToRgb, readableForeground, rgbToHex } from "./color";

/**
 * Emite uma cor com transparência. Alpha 100 devolve o hex puro (CSS limpo);
 * abaixo disso, `color-mix` com transparente — cor válida até como background-color.
 */
export function withAlpha(hex: string, alpha: number): string {
  if (alpha >= 100) return hex;
  return `color-mix(in srgb, ${hex} ${Math.round(alpha)}%, transparent)`;
}

/** O valor CSS do fundo escolhido: cor direta ou gradiente na direção/ângulo pedidos. */
export function backgroundValue(style: BackgroundStyle): string {
  if (style.type === "solid") return withAlpha(style.color, style.alpha);

  const first = withAlpha(style.from, style.fromAlpha);
  const second = withAlpha(style.to, style.toAlpha);
  switch (style.direction) {
    case "radial":
      return `radial-gradient(circle at 50% 0%, ${first}, ${second})`;
    case "horizontal":
      return `linear-gradient(90deg, ${first}, ${second})`;
    case "custom":
      return `linear-gradient(${Math.round(style.angle)}deg, ${first}, ${second})`;
    case "vertical":
      return `linear-gradient(180deg, ${first}, ${second})`;
    default:
      return `linear-gradient(135deg, ${first}, ${second})`;
  }
}

/** Ponto médio do fundo (o próprio colorido, ou a média dos extremos do gradiente). */
export function representativeHex(style: BackgroundStyle): string {
  if (style.type === "solid") return style.color;
  const first = hexToRgb(style.from);
  const second = hexToRgb(style.to);
  return rgbToHex({
    r: (first.r + second.r) / 2,
    g: (first.g + second.g) / 2,
    b: (first.b + second.b) / 2,
  });
}

/** Alpha média efetiva do estilo (sólido usa a própria; gradiente, a média das pontas). */
export function effectiveAlpha(style: BackgroundStyle): number {
  if (style.type === "solid") return Math.min(100, Math.max(0, style.alpha));
  return Math.min(100, Math.max(0, Math.round((style.fromAlpha + style.toAlpha) / 2)));
}

function textDeclarations(fittedCss: string, mid: string): Record<string, string> {
  return {
    "--foreground": fittedCss,
    "--text-strong": fittedCss,
    "--card-foreground": fittedCss,
    "--popover-foreground": fittedCss,
    "--sidebar-foreground": fittedCss,
    "--text-subtle": `color-mix(in srgb, ${fittedCss} 55%, ${mid})`,
    "--muted-foreground": `color-mix(in srgb, ${fittedCss} 55%, ${mid})`,
    "--text-date": `color-mix(in srgb, ${fittedCss} 35%, ${mid})`,
  };
}

/**
 * Declarações da COR DE WIDGET: o interno de cartões, painéis, menus e sidebar.
 *
 * Quem pinta o widget é dono da leitura dele: o texto é ajustado pelo contraste
 * contra a cor EFETIVA (a escolhida com a transparência dela aplicada sobre o fundo
 * representativo da página) — widget translúcido continua legível.
 */
export function buildWidgetDeclarations(
  style: BackgroundStyle,
  pageRepresentativeHex: string,
): Record<string, string> {
  const surface = backgroundValue(style);
  const mid = representativeHex(style);
  const backdrop = hexToRgb(pageRepresentativeHex);
  const own = hexToRgb(mid);
  const a = effectiveAlpha(style) / 100;
  const effective = rgbToHex({
    r: own.r * a + backdrop.r * (1 - a),
    g: own.g * a + backdrop.g * (1 - a),
    b: own.b * a + backdrop.b * (1 - a),
  });
  const fitted = readableForeground(hexToRgb(effective), 290);

  return {
    "--card": surface,
    "--popover": surface,
    "--sidebar": surface,
    "--surface-card": surface,
    ...textDeclarations(fitted.css, mid),
  };
}

/**
 * Declarações do PLANO DE FUNDO: só o `--background`, a página atrás de tudo.
 *
 * Sem readaptação de texto de propósito: quem tem cor própria para texto são os
 * widgets (acima), e texto solto direto sobre a página é raro — a identidade do
 * tema e a legibilidade dos cartões valem mais.
 */
export function buildPageDeclarations(
  style: BackgroundStyle,
  fitText = false,
): Record<string, string> {
  const declarations: Record<string, string> = { "--background": backgroundValue(style) };

  // Com a camada livre ativa (sem tema da galeria), a página é dona do texto-base:
  // pílulas, rótulos da coluna e o que senta direto sobre ela são ajustados ao mid
  // do fundo — senão a faixa clara de um degradê engole texto claro (e vice-versa).
  if (fitText) {
    const mid = representativeHex(style);
    const fitted = readableForeground(hexToRgb(mid), 290).css;
    Object.assign(declarations, {
      "--foreground": fitted,
      "--text-strong": fitted,
      "--muted-foreground": `color-mix(in srgb, ${fitted} 55%, ${mid})`,
      "--text-subtle": `color-mix(in srgb, ${fitted} 55%, ${mid})`,
      "--text-date": `color-mix(in srgb, ${fitted} 35%, ${mid})`,
    });
  }

  return declarations;
}

/** Cor sólida representativa do plano de fundo (para ajustar o texto dos widgets). */
export function pageRepresentative(style: BackgroundStyle): string {
  return representativeHex(style);
}

/** Onde cada camada pinta: página usa o utilitário do fundo (e o body); widgets, as superfícies. */
export const PAGE_PAINT_TARGETS = ".bg-background, body";
export const WIDGET_PAINT_TARGETS =
  ".bg-card, .bg-popover, .bg-surface-card, .bg-sidebar, .surface-card";

/**
 * Regra de pintura para fundos em GRADIENTE (gradiente não é cor: background-color
 * rejeita e a declaração cai fora — a pintura que funciona é background-image).
 * Fundo sólido não precisa disto: com ou sem alpha, é cor válida pelo token.
 */
export function paintGradientCss(
  value: string,
  scope: string,
  targets: string,
  fixed = false,
): string {
  if (!value.includes("gradient")) return "";
  return `${scope} ${targets} { background-image: ${value};${fixed ? " background-attachment: fixed" : ""} }`;
}
