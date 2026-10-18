/** Comentário numa publicação do grupo. */
export type GroupComment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatar: string | null;
  authorBadges: string[];
  parentCommentId: string | null;
  content: string;
  createdAt: string;
};
