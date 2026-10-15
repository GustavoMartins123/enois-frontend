import type { ThemeSettings } from "@/types/preferences/theme-settings";

/**
 * Tema padrão: reproduz a paleta que já está em `src/styles.css`.
 *
 * Enquanto o usuário não personaliza nada, o app usa o CSS de sempre — estes
 * valores só entram em cena para completar o que ele não mexeu.
 */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  accent: { hue: 293, chroma: 0.25, lightness: 0.54 },
  background: { hue: 285, chroma: 0.008 },
};

/**
 * Cores de texto e semânticas que a personalização NÃO toca.
 *
 * Ficam aqui em hex porque são os mesmos literais de `src/styles.css`; a interface
 * usa esses valores para medir o contraste real das escolhas do usuário.
 */
export const FIXED_THEME_COLORS = {
  light: { strong: "#0f0f14", subtle: "#6b7280" },
  dark: { strong: "#e8e6ff", subtle: "#9ca3af" },
} as const;

export const THEME_LIMITS = {
  hue: { min: 0, max: 360 },
  accentChroma: { min: 0, max: 0.28 },
  accentLightness: { min: 0.38, max: 0.58 },
  backgroundChroma: { min: 0, max: 0.03 },
  /**
   * No tema escuro o destaque sobe de brilho para continuar legível sobre o fundo
   * escuro — mesma relação que a paleta original usa (0.54 claro → 0.7 escuro).
   */
  darkAccentLift: 0.16,
  /** Faixa do destaque no tema escuro (onde o texto do botão passa a ser escuro). */
  darkAccentLightness: { min: 0.62, max: 0.82 },
  /**
   * Alvo de contraste do texto do botão. Um pouco acima do mínimo da WCAG (4.5)
   * para que o arredondamento das cores não encoste no limite.
   */
  contrastTarget: 4.6,
  /** Abaixo disso o par é considerado ilegível e o brilho é corrigido. */
  contrastMinimum: 4.5,
} as const;
