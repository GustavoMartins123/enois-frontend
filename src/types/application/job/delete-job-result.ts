/** Resposta do DELETE de vaga: o aviso de penalidade volta nela (item 7 do backlog). */
export type DeleteJobResult = {
  jobId: string;
  /** Candidaturas que continuavam em APPLIED quando a vaga foi excluída. */
  unanswered: number;
  /** true quando a exclusão registrou penalidade de credibilidade. */
  penalized: boolean;
};
