export type ServiceListing = {
  id: string;
  sellerId: string;
  category: string;
  title: string;
  description: string;
  deliverables: string;
  price: number;
  /** FAISCA (escrow) ou BRL (pagamento combinado direto). */
  currency: string;
  deliveryDays: number;
  status: "ACTIVE" | "REMOVED";
  createdAt: string;
};
