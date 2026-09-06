import type { CommentView } from "@/types/application/comment/comment-view";

export type CommentItemProps = {
  comment: CommentView;
  replyingTo?: CommentView["authorName"];
};
