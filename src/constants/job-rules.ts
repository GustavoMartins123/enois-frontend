/**
 * Regras de negócio de vagas aplicadas no client.
 *
 * O backend é a autoridade final — estas regras existem para antecipar o
 * feedback na interface e evitar requisições que seriam recusadas.
 */

/** Reputação mínima para publicar uma vaga. */
export const MIN_REPUTATION_TO_CREATE_JOB = 150;

/** Motivo enviado ao denunciar uma vaga como falsa. */
export const FAKE_JOB_REPORT_REASON = "FAKE_CONTENT";

/** Toda a reputação acumulada é perdida quando a vaga é confirmada como falsa. */
export const FAKE_JOB_REPUTATION_PENALTY = "ALL";

/** Motivos aceitos ao denunciar uma vaga. */
export const JOB_REPORT_REASONS = [
  "FAKE_CONTENT",
  "SCAM",
  "DISCRIMINATION",
  "SPAM",
  "OTHER",
] as const;
