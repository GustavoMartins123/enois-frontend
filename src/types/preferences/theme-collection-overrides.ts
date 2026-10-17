import type { ThemeAccent } from "./theme-accent";

/** Camadas livres aplicadas por cima de um tema da galeria. */
export type CollectionOverrides = {
  /** Cor livre do destaque; ausente/`null` = o destaque do próprio tema. */
  accent?: ThemeAccent | null;
};
