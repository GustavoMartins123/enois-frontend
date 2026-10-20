import type { SupportCategory } from "./support-category";

export type SupportRequestInput = {
  subject: string;
  message: string;
  contactEmail: string;
  /** Print anexado ao pedido (URL do CDN, opcional). */
  imageUrl?: string | null;
  /** Categoria do pedido; ausente = OUTRO (compatível com clientes antigos). */
  category?: SupportCategory;
};
