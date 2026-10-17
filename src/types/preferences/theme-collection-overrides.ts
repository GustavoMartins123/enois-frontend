import type { BackgroundStyle } from "./background-style";
import type { ThemeAccent } from "./theme-accent";

/** Camadas livres aplicadas por cima de um tema da galeria. */
export type CollectionOverrides = {
  /** Cor livre do destaque; ausente/`null` = o destaque do próprio tema. */
  accent?: ThemeAccent | null;
  /** Plano de fundo livre; sobre um tema vale só o VALOR do fundo. */
  backgroundStyle?: BackgroundStyle | null;
};
