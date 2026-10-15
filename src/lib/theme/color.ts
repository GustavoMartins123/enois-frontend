import type { RgbColor } from "@/types/preferences/rgb-color";
import type { ThemeContrastLevel } from "@/types/preferences/theme-contrast-level";

/** Converte um valor de canal linear (0–1) para o codificado em sRGB (0–1). */
function encodeSrgb(value: number): number {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
}

/** oklch → sRGB. Canais fora da gamut são recortados. */
export function oklchToRgb(lightness: number, chroma: number, hue: number): RgbColor {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return {
    r: encodeSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: encodeSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: encodeSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

/** Cor como o CSS espera, mantendo a notação oklch (mais fiel à paleta). */
export function oklch(lightness: number, chroma: number, hue: number): string {
  return `oklch(${round(lightness)} ${round(chroma)} ${round(hue)})`;
}

/** Cor em hexadecimal, para tokens que o CSS da marca declara em hex. */
export function oklchToHex(lightness: number, chroma: number, hue: number): string {
  return rgbToHex(oklchToRgb(lightness, chroma, hue));
}

export function hexToRgb(hex: string): RgbColor {
  const value = hex.replace("#", "");
  const channel = (start: number) => parseInt(value.slice(start, start + 2), 16) / 255;
  return { r: channel(0), g: channel(2), b: channel(4) };
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (value: number) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Luminância relativa da WCAG. */
export function relativeLuminance({ r, g, b }: RgbColor): number {
  const channel = (value: number) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Razão de contraste da WCAG entre duas cores (1 a 21). */
export function contrastRatio(first: RgbColor, second: RgbColor): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Nível de contraste da WCAG para texto normal. */
export function classifyContrast(ratio: number): ThemeContrastLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA_LARGE";
  return "FAIL";
}

/**
 * Escolhe o texto (quase branco ou quase preto) que se lê melhor sobre a cor dada.
 * É assim que o contraste fica garantido por construção, em qualquer combinação.
 */
export function readableForeground(
  background: RgbColor,
  hue: number,
): { css: string; rgb: RgbColor; ratio: number } {
  const light = oklchToRgb(0.99, 0.005, hue);
  const dark = oklchToRgb(0.16, 0.02, hue);
  const lightRatio = contrastRatio(background, light);
  const darkRatio = contrastRatio(background, dark);

  return lightRatio >= darkRatio
    ? { css: oklch(0.99, 0.005, hue), rgb: light, ratio: lightRatio }
    : { css: oklch(0.16, 0.02, hue), rgb: dark, ratio: darkRatio };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
