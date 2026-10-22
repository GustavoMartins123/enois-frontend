import type { CommentView } from "@/types/application/comment/comment-view";
import type { PostView } from "@/types/application/feed/post-view";
import type { ReactionSummary } from "@/types/application/reaction/reaction-summary";
import type { ReactionType } from "@/types/application/reaction/reaction-type";

export type PostCardState = {
  draft: string;
  commentMentions: string[];
  replyToId: string | null;
  localComments: CommentView[];
  postCounters: PostView["counters"];
  reactionStatus: ReactionType | null;
  /** Resumo de reações que veio com o post (base do otimismo quando o cache ainda não existe). */
  reactionSummary: ReactionSummary | null;
  /** Reação em andamento: enquanto true, a prop do feed não pode sobrescrever o estado otimista. */
  reactionPending: boolean;
  showReactions: boolean;
  /** A lista de quem marcou o post com selos (o diálogo da linha de selos). */
  showSeals: boolean;
  showReport: boolean;
};
