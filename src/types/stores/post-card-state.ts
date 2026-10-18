import type { CommentView } from "@/types/application/comment/comment-view";
import type { PostView } from "@/types/application/feed/post-view";
import type { ReactionType } from "@/types/application/reaction/reaction-type";

export type PostCardState = {
  draft: string;
  commentMentions: string[];
  replyToId: string | null;
  localComments: CommentView[];
  postCounters: PostView["counters"];
  reactionStatus: ReactionType | null;
  showReactions: boolean;
  /** A lista de quem marcou o post com selos (o diálogo da linha de selos). */
  showSeals: boolean;
  showReport: boolean;
};
