export type ThemeAccent = {
  /** Matiz em graus (0–360). */
  hue: number;
  /** Saturação (0–0.28). Acima disso o texto do botão começa a sofrer. */
  chroma: number;
  /** Brilho no tema claro (0.38–0.62). No escuro o tom sobe para manter a leitura. */
  lightness: number;
};
