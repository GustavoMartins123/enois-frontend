export type GifItem = {
  id: string;
  /** Mídia direta (.gif) que o comentário aceita — a mesma que o reconhecimento de link renderiza. */
  url: string;
  /** Versão leve, usada na grade do seletor. */
  previewUrl: string;
  width: number;
  height: number;
  /** Descrição do provedor (pode vir vazia); usada no alt/rótulo do botão. */
  description: string | null;
  provider: string;
};
