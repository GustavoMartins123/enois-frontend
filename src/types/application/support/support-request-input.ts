export type SupportRequestInput = {
  subject: string;
  message: string;
  contactEmail: string;
  /** Print anexado ao pedido (URL do CDN, opcional). */
  imageUrl?: string | null;
};
