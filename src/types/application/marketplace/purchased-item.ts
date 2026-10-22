import type { MarketplaceKind } from "@/constants/marketplace-kinds";

/** Conteúdo entregue ao comprador (só ele abre). */
export type PurchasedItem = {
  kind: MarketplaceKind;
  title: string;
  itemId: string;
  content: string;
};
