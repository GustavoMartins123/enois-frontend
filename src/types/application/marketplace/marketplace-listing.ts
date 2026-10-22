import type { MarketplaceKind } from "@/constants/marketplace-kinds";

export type MarketplaceListing = {
  id: string;
  sellerId: string;
  /** Nome e @ de quem publicou (podem faltar em contas removidas). */
  sellerName?: string | null;
  sellerUsername?: string | null;
  itemKind: MarketplaceKind;
  itemId: string;
  title: string;
  description?: string | null;
  price: number;
  status: "ACTIVE" | "SOLD" | "REMOVED";
  createdAt: string;
};
