import type { ReactionUser } from "../feed/reaction-user";
import type { ReactionSummary } from "./reaction-summary";

export type ReactionsListResponse = {
  postId?: string;
  summary: ReactionSummary;
  reactions: ReactionUser[];
  /**
   * Só do front: o cache nasceu do resumo do feed (ou do otimismo) e `reactions` ainda não foi
   * carregado. O diálogo trata como velho e busca a lista ao abrir.
   */
  partial?: boolean;
};
