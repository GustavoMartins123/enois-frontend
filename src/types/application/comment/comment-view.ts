export type CommentView = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  /** Username do autor — é o que permite abrir o perfil pelo nome/foto. */
  authorUsername: string | null;
  authorAvatar: string | null;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  status: "ACTIVE" | "DELETED";
};
