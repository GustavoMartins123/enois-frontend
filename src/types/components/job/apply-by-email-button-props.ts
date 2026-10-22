import type { Job } from "@/types/application/job/job";

export type ApplyByEmailButtonProps = {
  job: Job;
  /** Endereço de candidatura que a vaga já traz (vagas externas). Sem ele, o texto é procurado na
   * descrição — vaga publicada aqui que diz "mande seu currículo para x@y.com". */
  email?: string | null;
};
