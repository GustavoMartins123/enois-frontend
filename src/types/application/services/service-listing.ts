export type ServiceListing = {
  id: string;
  sellerId: string;
  /** Quem vai prestar o servico (nome e foto): um servico sem rosto nao diz para quem e. */
  sellerName: string | null;
  sellerAvatar: string | null;
  category: string;
  title: string;
  description: string;
  deliverables: string;
  price: number;
  /** "BRL" (centavos) ou "FAISCA" (milesimos de faisca). */
  currency: "BRL" | "FAISCA";
  deliveryDays: number;
  status: "ACTIVE" | "REMOVED";
  createdAt: string;
};
