import type { PostCommunity } from "@/types/application/community/post-community";
import type { ReactionType } from "@/types/application/reaction/reaction-type";

export type PostView = {
  id: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorBadge?: string | null;
  authorAvatar: string | null;
  type:
    | "INSIGHT"
    | "ARTICLE"
    | "QUESTION"
    | "PROJECT"
    | "OPPORTUNITY"
    | "PAGE"
    | "NEWS"
    | "TUTORIAL"
    | "REVIEW"
    | "DIVERTIDO"
    | "MOMENT"
    /** Ponteiro de um post de blog: o conteúdo mora em /blog/{username}. */
    | "BLOG";
  content: string;
  /** HTML já sanitizado da mini página (só em posts do tipo PAGE; nulo nos demais). */
  pageHtml?: string | null;
  /**
   * Texto do artigo (só em posts do tipo ARTICLE, e só na leitura do post único — a listagem traz
   * o resumo em `content`). Fica em tabela própria no backend.
   */
  articleBody?: string | null;
  tags: string[];
  mediaIds: string[];
  createdAt: string;
  visibility: "PUBLIC" | "CONNECTIONS" | "MENTORS";
  counters: {
    reactions: number;
    comments: number;
    saves: number;
    shares: number;
  };
  status: "ACTIVE" | "DELETED";
  currentUserReaction?: ReactionType | null;
  /** Comunidade do post, quando publicado numa comunidade. */
  communityId?: string | null;
  community?: PostCommunity | null;
  /** Quando o autor editou o post (nulo se nunca editado). */
  editedAt?: string | null;
  /** Prazo do Momento (some sozinho em 24h); null nos demais tipos. */
  expiresAt?: string | null;
};
