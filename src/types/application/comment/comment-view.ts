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
  /** Quando o autor editou (nulo se nunca editado) — vira o "editado" na tela. */
  editedAt?: string | null;
  status: "ACTIVE" | "DELETED";
};
