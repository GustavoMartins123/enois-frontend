/**
 * Um post AGENDADO: ainda não existe no feed — fica na fila até a hora marcada, quando o
 * backend publica pelo mesmo caminho do composer. `lastError` aparece quando a publicação
 * foi recusada (conta restrita, comunidade inexistente…) e o autor decide o que fazer.
 */
export type ScheduledPostView = {
  id: string;
  type: string;
  content?: string | null;
  pageHtml?: string | null;
  communityId?: string | null;
  scheduledAt: string;
  createdAt: string;
  lastError?: string | null;
  attempts: number;
};
