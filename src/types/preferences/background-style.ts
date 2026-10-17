/** Plano de fundo escolhido pelo usuário na personalização: cor sólida ou gradiente. */
export type BackgroundStyle = {
  type: "solid" | "gradient";
  /** Cor única quando `type` é "solid". */
  color: string;
  /** Extremo inicial do gradiente. */
  from: string;
  /** Extremo final do gradiente. */
  to: string;
  /** Para onde o gradiente corre. */
  direction: "diagonal" | "vertical" | "radial";
};
