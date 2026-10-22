import type { ThemePreset } from "@/types/preferences/theme-preset";

import { DEFAULT_THEME_SETTINGS } from "./theme-defaults";

/**
 * Combinações já conferidas de destaque + fundo.
 *
 * Todas passam no contraste mínimo; servem para o usuário chegar a um resultado
 * bonito em um clique e só então afinar o que quiser.
 */
export const THEME_PRESETS: ThemePreset[] = [
  { id: "uva", settings: DEFAULT_THEME_SETTINGS },
  {
    id: "oceano",
    settings: {
      accent: { hue: 240, chroma: 0.18, lightness: 0.52 },
      background: { hue: 240, chroma: 0.012 },
    },
  },
  {
    id: "menta",
    settings: {
      accent: { hue: 168, chroma: 0.14, lightness: 0.44 },
      background: { hue: 168, chroma: 0.014 },
    },
  },
  {
    id: "porDoSol",
    settings: {
      accent: { hue: 45, chroma: 0.16, lightness: 0.48 },
      background: { hue: 45, chroma: 0.016 },
    },
  },
  {
    id: "rosa",
    settings: {
      accent: { hue: 340, chroma: 0.2, lightness: 0.55 },
      background: { hue: 340, chroma: 0.012 },
    },
  },
  {
    id: "grafite",
    settings: {
      accent: { hue: 285, chroma: 0.03, lightness: 0.42 },
      background: { hue: 285, chroma: 0.004 },
    },
  },
];
