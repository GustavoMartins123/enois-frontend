import { api } from "../api-client";

/** Item da loja de cosméticos (C3): molduras de avatar nativas, preço em milésimos. */
export type LojaItem = {
  id: string;
  name: string;
  description: string;
  priceMf: number;
  cssRing: string;
  owned?: boolean;
  equipped?: boolean;
};

/** A loja de cosméticos: compra direta (auditada no ledger) e equipar. */
export const lojaApi = {
  catalog: () => api.get<LojaItem[]>("/loja"),
  buy: (itemId: string) => api.post<{ id: string; owned: boolean }>(`/loja/${itemId}/comprar`, {}),
  equip: (itemId: string) =>
    api.post<{ id: string; equipped: boolean }>(`/loja/${itemId}/equipar`, {}),
};
