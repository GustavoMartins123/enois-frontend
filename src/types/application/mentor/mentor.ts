export type Mentor = {
  id: string;
  userId: string;
  expertise: string[];
  rating: number;
  sessions: number;
  price: string;
  /** Banner/capa do perfil de mentor (URL do CDN). */
  banner: string | null;
  nextSlot: string;
};
