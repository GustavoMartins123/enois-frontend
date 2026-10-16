import type { ReactionType } from "@/types/application/reaction/reaction-type";

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
  /** Reação do próprio leitor — é o que mantém o like ao recarregar a página. */
  currentUserReaction?: ReactionType | null;
};
