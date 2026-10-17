import type { ThemeAccent } from "./theme-accent";

/** Camadas livres aplicadas por cima de um tema da galeria. */
export type CollectionOverrides = {
  /** Cor livre do destaque; ausente/`null` = o destaque do próprio tema. */
  accent?: ThemeAccent | null;
  /** Transparência do destaque (0–100). */
  accentAlpha?: number | null;
  /** Transparência das superfícies do tema (re-aplicada sobre a cor bruta). */
  widgetAlpha?: number | null;
  /** Transparência do fundo do tema (só vale quando o fundo dele é cor sólida). */
  pageAlpha?: number | null;
};
