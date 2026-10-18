/** Oferta de serviço (modelo Fiverr): preço fixo em faíscas, prazo, entregáveis. */
export type ServiceListing = {
  id: string;
  sellerId: string;
  category: string;
  title: string;
  description: string;
  deliverables: string;
  price: number;
  deliveryDays: number;
  status: "ACTIVE" | "REMOVED";
  createdAt: string;
};

/** Pedido de serviço (demanda): orçamento em faixa, entregáveis obrigatórios. */
export type ServiceRequest = {
  id: string;
  requesterId: string;
  category: string;
  title: string;
  description: string;
  deliverables: string;
  budgetMin: number;
  budgetMax: number;
  deadline?: string | null;
  status: "OPEN" | "CHOSEN" | "CLOSED";
  createdAt: string;
};

export type ServiceProposal = {
  id: string;
  requestId: string;
  userId: string;
  message: string;
  price: number;
  status: "SENT" | "CHOSEN" | "DECLINED";
  createdAt: string;
};

/** O contrato do escrow: HELD → (RELEASED | REFUNDED). */
export type ServiceContract = {
  id: string;
  listingId?: string | null;
  requestId?: string | null;
  buyerId: string;
  sellerId: string;
  price: number;
  escrowState: "HELD" | "RELEASED" | "REFUNDED";
  deliverableNote?: string | null;
  createdAt: string;
  acceptedAt?: string | null;
};
