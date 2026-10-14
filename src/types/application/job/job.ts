export type Job = {
  id: string;
  title: string;
  company: string;
  logo: string | null;
  location: string;
  type: string;
  level: string;
  salary: string | null;
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
};
