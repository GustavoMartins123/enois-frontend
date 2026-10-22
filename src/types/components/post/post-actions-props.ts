import type { ReactNode } from "react";

import type { PostView } from "@/types/application/feed/post-view";

/**
 * A fileira de ações de um post (reagir, comentar, compartilhar, salvar, denunciar).
 *
 * O estado é o do card do post no feed — a chave é o id —, então o mesmo post aberto em telas
 * diferentes (o feed, a página do post, o post do blog) mostra e grava o mesmo estado.
 */
export type PostActionsProps = {
  /** O post do feed. No post do blog é o ponteiro: mesmo id, mesmas contagens, mesma conversa. */
  post: PostView;
  /** O que o botão de comentários faz nesta tela: abrir a conversa aqui ou rolar até ela. */
  onComments: () => void;
  /** Endereço compartilhado; sem ele, o do post no feed. */
  shareUrl?: string;
  /** Ações extras no fim da fileira (os selos do feed, por exemplo). */
  children?: ReactNode;
};
