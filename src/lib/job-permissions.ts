import { MIN_REPUTATION_TO_CREATE_JOB } from "@/constants/job-rules";

/**
 * A regra é "mais de 150 de reputação", igual ao backend (`reputation <= 150` responde 403):
 * exatamente 150 ainda não publica, senão a tela liberaria o formulário e a API recusaria.
 */
export function canCreateJob(reputation: number | null | undefined): boolean {
  return (reputation ?? 0) > MIN_REPUTATION_TO_CREATE_JOB;
}

/** Quanto falta de reputação para liberar a publicação de vagas. */
export function missingReputationToCreateJob(reputation: number | null | undefined): number {
  return Math.max(0, MIN_REPUTATION_TO_CREATE_JOB + 1 - (reputation ?? 0));
}
