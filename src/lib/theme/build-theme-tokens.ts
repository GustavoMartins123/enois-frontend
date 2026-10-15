import {
  DEFAULT_THEME_SETTINGS,
  FIXED_THEME_COLORS,
  THEME_LIMITS,
} from "@/constants/theme-defaults";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeAccent } from "@/types/preferences/theme-accent";
import type { ThemeContrastReport } from "@/types/preferences/theme-contrast-report";
import type { ThemeSettings } from "@/types/preferences/theme-settings";
import type { ThemeTokenMap } from "@/types/preferences/theme-token-map";

import {
  classifyContrast,
  contrastRatio,
  hexToRgb,
  oklch,
  oklchToHex,
  oklchToRgb,
  readableForeground,
} from "./color";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Traz qualquer valor para dentro das faixas seguras de contraste. */
export function clampThemeSettings(settings: ThemeSettings): ThemeSettings {
  return {
    accent: {
      hue: clamp(settings.accent.hue, THEME_LIMITS.hue.min, THEME_LIMITS.hue.max),
      chroma: clamp(
        settings.accent.chroma,
        THEME_LIMITS.accentChroma.min,
        THEME_LIMITS.accentChroma.max,
      ),
      lightness: clamp(
        settings.accent.lightness,
        THEME_LIMITS.accentLightness.min,
        THEME_LIMITS.accentLightness.max,
      ),
    },
    background: {
      hue: clamp(settings.background.hue, THEME_LIMITS.hue.min, THEME_LIMITS.hue.max),
      chroma: clamp(
        settings.background.chroma,
        THEME_LIMITS.backgroundChroma.min,
        THEME_LIMITS.backgroundChroma.max,
      ),
    },
  };
}

/** Compara duas configurações depois de normalizá-las. */
export function sameThemeSettings(first: ThemeSettings, second: ThemeSettings): boolean {
  const a = clampThemeSettings(first);
  const b = clampThemeSettings(second);
  return (
    a.accent.hue === b.accent.hue &&
    a.accent.chroma === b.accent.chroma &&
    a.accent.lightness === b.accent.lightness &&
    a.background.hue === b.background.hue &&
    a.background.chroma === b.background.chroma
  );
}

/** Sem personalização, o app usa o CSS de `src/styles.css` (visual atual intacto). */
export function isDefaultThemeSettings(settings: ThemeSettings): boolean {
  return sameThemeSettings(settings, DEFAULT_THEME_SETTINGS);
}

/** No escuro o destaque sobe de brilho para continuar legível sobre o fundo escuro. */
function accentForMode(accent: ThemeAccent, mode: Theme): ThemeAccent {
  if (mode === "light") return accent;

  const { min, max } = THEME_LIMITS.darkAccentLightness;
  return { ...accent, lightness: clamp(accent.lightness + THEME_LIMITS.darkAccentLift, min, max) };
}

/**
 * O brilho que garante o texto do botão legível.
 *
 * Existe uma faixa de luminância média em que NENHUM texto (nem claro nem escuro)
 * atinge o contraste mínimo da WCAG — é uma propriedade da norma, não um bug. Escolher
 * o brilho livremente cairia nela, então o valor é empurrado para o lado mais próximo
 * que passa, mudando o mínimo possível.
 */
function fitAccentLightness(lightness: number, chroma: number, hue: number): number {
  const contrastAt = (value: number) =>
    readableForeground(oklchToRgb(value, chroma, hue), hue).ratio;

  if (contrastAt(lightness) >= THEME_LIMITS.contrastTarget) return lightness;

  for (let step = 0.01; step <= 0.4; step += 0.01) {
    const darker = clamp(lightness - step, 0.05, 0.95);
    if (contrastAt(darker) >= THEME_LIMITS.contrastTarget) return darker;

    const lighter = clamp(lightness + step, 0.05, 0.95);
    if (contrastAt(lighter) >= THEME_LIMITS.contrastTarget) return lighter;
  }

  return lightness;
}

/** Brilho efetivamente aplicado ao destaque, já corrigido para ser legível. */
function effectiveAccentLightness(accent: ThemeAccent, mode: Theme): number {
  const { lightness } = accentForMode(accent, mode);
  return fitAccentLightness(lightness, accent.chroma, accent.hue);
}

/** Tingimento do fundo: no escuro a intensidade precisa ser um pouco maior para aparecer. */
function surfaceChroma(chroma: number, mode: Theme, extra = 0): number {
  const base = mode === "dark" ? Math.max(chroma, 0.02) : chroma;
  return clamp(base + extra, 0, 0.08);
}

export function buildThemeTokens(settings: ThemeSettings, mode: Theme): ThemeTokenMap {
  const { accent, background } = clampThemeSettings(settings);
  const { hue } = accent;
  const lightness = effectiveAccentLightness(accent, mode);
  const chroma = accent.chroma;
  const surfaceHue = background.hue;
  const surface = (extraC: number, lightnessValue: number, hueShift = 0) =>
    oklch(lightnessValue, surfaceChroma(background.chroma, mode, extraC), surfaceHue + hueShift);

  // O texto do destaque é escolhido pelo que se lê melhor — nunca fica ilegível.
  const primaryForeground = readableForeground(oklchToRgb(lightness, chroma, hue), hue).css;

  const accentTokens = {
    "--primary": oklch(lightness, chroma, hue),
    "--primary-foreground": primaryForeground,
    "--primary-soft": oklch(mode === "dark" ? 0.26 : 0.95, mode === "dark" ? 0.06 : 0.04, hue),
    "--secondary": oklch(mode === "dark" ? 0.32 : 0.82, mode === "dark" ? 0.08 : 0.1, hue + 12),
    "--secondary-foreground":
      mode === "dark" ? oklch(0.96, 0.008, hue) : oklch(0.25, 0.05, hue + 12),
    "--accent": oklch(mode === "dark" ? 0.28 : 0.95, mode === "dark" ? 0.06 : 0.04, hue),
    "--accent-foreground": mode === "dark" ? oklch(0.92, 0.04, hue) : oklch(0.35, 0.15, hue),
    "--ring": oklch(mode === "dark" ? lightness : 0.52, mode === "dark" ? chroma : 0.22, hue),
    "--gradient-primary": `linear-gradient(135deg, ${oklch(
      lightness - 0.02,
      Math.max(0, chroma - 0.03),
      hue,
    )}, ${oklch(lightness + 0.14, Math.max(0, chroma - 0.07), hue + 15)})`,
    "--shadow-soft": `0 1px 2px ${oklch(0.2, 0.05, hue)} / 0.04, 0 4px 16px ${oklch(
      0.2,
      0.05,
      hue,
    )} / 0.04`,
    "--shadow-card": `0 1px 3px ${oklch(0.2, 0.05, hue)} / 0.06, 0 8px 24px -8px ${oklch(
      0.2,
      0.05,
      hue,
    )} / 0.08`,
    "--mentorship-button": oklchToHex(lightness, chroma, hue),
    // Badges e avatar de projeto seguem o destaque (o CSS da marca os deixava roxos fixos).
    "--highlight-project": oklch(0.9, 0.06, hue),
    "--highlight-project-text": oklch(0.52, 0.2, hue),
    "--background-user-project": oklch(0.8, 0.09, hue),
    "--project-text": oklch(0.33, 0.12, hue),
  } satisfies Partial<ThemeTokenMap>;

  const surfaceTokens =
    mode === "dark"
      ? {
          "--background": surface(0, 0.13),
          "--card": surface(0.017, 0.19),
          "--popover": surface(0.017, 0.19),
          "--muted": surface(0, 0.25),
          "--border": surface(0, 0.3),
          "--input": surface(0, 0.3),
          "--sidebar": surface(0.006, 0.17),
          "--sidebar-border": surface(0, 0.28),
          "--surface-card": surface(0.02, 0.17),
          "--surface-1": surface(0.02, 0.23),
          "--surface-2": surface(0.045, 0.29, 8),
          "--surface-3": surface(0.02, 0.21),
          "--border-soft": surface(0.012, 0.29),
        }
      : {
          "--background": surface(0, 0.98),
          "--card": surface(0, 1),
          "--popover": surface(0, 1),
          "--muted": surface(0.006, 0.96),
          "--border": surface(0.006, 0.92),
          "--input": surface(0.006, 0.92),
          "--sidebar": surface(0, 1),
          "--sidebar-border": surface(0.006, 0.93),
          "--surface-card": surface(0, 1),
          "--surface-1": surface(0, 0.98),
          "--surface-2": surface(0.008, 0.93),
          "--surface-3": surface(0.006, 0.96),
          "--border-soft": surface(0.008, 0.9),
        };

  return { ...accentTokens, ...surfaceTokens } as ThemeTokenMap;
}

/** Bloco CSS pronto para injetar — é também o que fica salvo para o pré-paint. */
export function buildThemeCss(settings: ThemeSettings, mode: Theme): string {
  const tokens = buildThemeTokens(settings, mode);
  const declarations = Object.entries(tokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return `:root {\n${declarations}\n}`;
}

/** Cor da barra do navegador/instalação — acompanha o destaque escolhido. */
export function buildThemeColor(settings: ThemeSettings, mode: Theme): string {
  const { accent } = clampThemeSettings(settings);
  return oklchToHex(effectiveAccentLightness(accent, mode), accent.chroma, accent.hue);
}

/** Mede os pares que decidem se o tema é legível e devolve o pior deles. */
export function reportThemeContrast(settings: ThemeSettings, mode: Theme): ThemeContrastReport {
  const { accent } = clampThemeSettings(settings);
  const lightness = effectiveAccentLightness(accent, mode);
  const fixed = FIXED_THEME_COLORS[mode];

  const primary = oklchToRgb(lightness, accent.chroma, accent.hue);

  const pairs = [
    {
      name: "texto do botão",
      foreground: readableForeground(primary, accent.hue).rgb,
      background: primary,
    },
    {
      name: "texto sobre o fundo",
      foreground: hexToRgb(fixed.strong),
      background: oklchToRgb(
        mode === "dark" ? 0.13 : 0.98,
        settings.background.chroma,
        settings.background.hue,
      ),
    },
    {
      name: "texto secundário",
      foreground: hexToRgb(fixed.subtle),
      background: oklchToRgb(
        mode === "dark" ? 0.17 : 1,
        settings.background.chroma,
        settings.background.hue,
      ),
    },
  ];

  const worst = pairs.reduce(
    (current, pair) => {
      const ratio = contrastRatio(pair.foreground, pair.background);
      return ratio < current.ratio ? { ratio, pair } : current;
    },
    { ratio: Number.POSITIVE_INFINITY, pair: pairs[0] },
  );

  return {
    level: classifyContrast(worst.ratio),
    ratio: Math.round(worst.ratio * 100) / 100,
    worstPair: worst.pair.name,
  };
}
