import type { GifItem } from "./gif-item";

export type GifSearchResult = {
  /**
   * `false` = nenhum provedor tem chave configurada no servidor. O seletor usa isso para dizer
   * "indisponível" em vez de mostrar "nenhum resultado" — que seria mentira (a busca nem rodou).
   */
  available: boolean;
  provider: string | null;
  items: GifItem[];
};
