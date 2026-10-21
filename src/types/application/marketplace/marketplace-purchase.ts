import type { MarketplaceKind } from "@/constants/marketplace-kinds";

export type MarketplacePurchase = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  state: "HELD" | "RELEASED" | "REFUNDED";
  createdAt: string;
  decidedAt?: string | null;
  /** Categoria e título da listagem (para agrupar em "Minhas compras"). */
  itemKind?: MarketplaceKind | null;
  title?: string | null;
  /** Id do item (tema na galeria ou conteúdo em marketplace_items). */
  itemId?: string | null;
};
