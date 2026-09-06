import type { CommentView, PostView } from "@/lib/api";

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
