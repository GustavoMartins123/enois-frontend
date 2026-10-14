import { MIN_REPUTATION_TO_CREATE_JOB } from "@/constants/job-rules";

/** Quem tem a reputação mínima pode publicar vagas. */
export function canCreateJob(reputation: number | null | undefined): boolean {
  return (reputation ?? 0) >= MIN_REPUTATION_TO_CREATE_JOB;
}

/** Quanto falta de reputação para liberar a publicação de vagas. */
export function missingReputationToCreateJob(reputation: number | null | undefined): number {
  return Math.max(0, MIN_REPUTATION_TO_CREATE_JOB - (reputation ?? 0));
}
