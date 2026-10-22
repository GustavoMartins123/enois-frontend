import type { ThemeContrastLevel } from "./theme-contrast-level";

export type ThemeContrastReport = {
  /** Pior par medido — é ele que define o nível. */
  level: ThemeContrastLevel;
  /** Razão de contraste do pior par (1 a 21). */
  ratio: number;
  /** Nome do par legível para usar na interface (ex.: "texto do botão"). */
  worstPair: string;
};
