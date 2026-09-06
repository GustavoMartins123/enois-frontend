import type { CommentView } from "@/types/application/comment/comment-view";
import type { PostView } from "@/types/application/feed/post-view";

export type PostCardState = {
  draft: string;
  commentMentions: string[];
  replyToId: string | null;
  localComments: CommentView[];
  postCounters: PostView["counters"];
  reactionStatus: string | null;
  showReactions: boolean;
  showReport: boolean;
};
