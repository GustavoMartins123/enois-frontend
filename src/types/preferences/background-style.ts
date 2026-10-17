/**
 * Plano de fundo (ou cor de widget) escolhido: cor sólida ou gradiente de DOIS
 * matizes, com transparência por ponta — o "vidro" que vai de um alpha a outro.
 */
export type BackgroundStyle = {
  type: "solid" | "gradient";
  /** Cor única quando `type` é "solid". */
  color: string;
  /** Transparência da cor sólida (0–100; 100 = opaca). */
  alpha: number;
  /** Extremo inicial do gradiente (matiz A). */
  from: string;
  /** Transparência do extremo inicial (0–100). */
  fromAlpha: number;
  /** Extremo final do gradiente (matiz B — o degradê vai de um matiz ao outro). */
  to: string;
  /** Transparência do extremo final (0–100). */
  toAlpha: number;
  /** Direção predefinida; "custom" usa o ângulo livre. */
  direction: "diagonal" | "vertical" | "horizontal" | "radial" | "custom";
  /** Ângulo CSS (0–360, 0 = para cima) para a direção "custom". */
  angle: number;
};
