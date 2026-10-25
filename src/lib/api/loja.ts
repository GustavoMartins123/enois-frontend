import type { CatalogOrder } from "@/types/application/loja/catalog-order";
import type { LojaItem } from "@/types/application/loja/loja-item";
import { z } from "zod";

import { api } from "../api-client";

const catalogSchema = z.array(
  z.object({
    id: z.string().min(1),
    name: z.string(),
    description: z.string(),
    priceMf: z.number().int().nonnegative(),
    cssRing: z.string(),
    releaseOrder: z.number().int().positive(),
    owned: z.boolean().optional(),
    equipped: z.boolean().optional(),
  }),
);

/** A loja de cosméticos: compra direta (auditada no ledger) e equipar. */
export const lojaApi = {
  catalog: async (order: CatalogOrder = "oldest"): Promise<LojaItem[]> => {
    const items = catalogSchema.parse(await api.get<unknown>(`/loja?order=${order}`));
    const ids = new Set(items.map((item) => item.id));
    if (
      ids.size !== items.length ||
      items.some((item, index) => {
        if (index === 0) return false;
        const previous = items[index - 1].releaseOrder;
        return order === "oldest" ? item.releaseOrder <= previous : item.releaseOrder >= previous;
      })
    ) {
      throw new Error("O catálogo não respeitou a ordenação solicitada.");
    }
    return items;
  },
  buy: (itemId: string) => api.post<{ id: string; owned: boolean }>(`/loja/${itemId}/comprar`, {}),
  equip: (itemId: string) =>
    api.post<{ id: string; equipped: boolean }>(`/loja/${itemId}/equipar`, {}),
};
