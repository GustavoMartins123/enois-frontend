/**
 * Seletor de emojis dos campos de escrita.
 *
 * Quem chama recebe o caractere e decide onde ele entra (no texto, na posição do cursor) — o
 * seletor não conhece o campo, então serve para o composer, os comentários e o chat.
 */
export type EmojiPickerProps = {
  /** Emoji escolhido (o caractere pronto, não um atalho). */
  onPick: (emoji: string) => void;
  /** Classes do botão-gatilho (cada superfície tem as suas). */
  buttonClassName: string;
  /** Texto do `title`/`aria-label` do gatilho. */
  buttonTitle: string;
};
