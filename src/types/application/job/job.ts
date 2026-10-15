export type Job = {
  id: string;
  title: string;
  company: string;
  logo: string | null;
  location: string;
  type: string;
  level: string;
  salary: string | null;
  /** Moeda da faixa salarial: BRL, USD ou EUR. */
  currency: string | null;
  skills: string[];
  postedAt: string;
  matchScore: number | null;
  description?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  authorReputation?: number | null;
  /** Marcada como falsa pela moderação — o autor perde a reputação acumulada. */
  isFake?: boolean;
  /** Estado para o usuário autenticado. */
  applied: boolean;
  saved: boolean;
  owner: boolean;
  /** Quantas candidaturas a vaga recebeu (exposto apenas para quem publicou). */
  applicationsCount: number;
};
