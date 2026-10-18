/** Item à venda no marketplace (v1: temas da galeria), preço em faíscas. */
export type MarketplaceListing = {
  id: string;
  sellerId: string;
  itemKind: "THEME";
  itemId: string;
  title: string;
  description?: string | null;
  price: number;
  status: "ACTIVE" | "SOLD" | "REMOVED";
  createdAt: string;
};

/** A compra com escrow: HELD → (RELEASED | REFUNDED). */
export type MarketplacePurchase = {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  state: "HELD" | "RELEASED" | "REFUNDED";
  createdAt: string;
  decidedAt?: string | null;
};
