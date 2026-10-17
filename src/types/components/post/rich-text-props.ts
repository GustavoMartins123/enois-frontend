export type RichTextProps = {
  content: string;
  className?: string;
  /**
   * Classe dos links e das menções. Existe porque o mesmo texto aparece em fundos diferentes (a
   * bolha da mensagem, por exemplo, é colorida) — o padrão é o azul do app.
   */
  linkClassName?: string;
};
