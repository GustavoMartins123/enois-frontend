import type { ResumePrefillField } from "./resume-prefill-field";

/**
 * Resposta de POST /me/import/resume/prefill/{jobId}. Espelha `ApplyPrefillView`: só sugere,
 * a inscrição continua no POST /jobs/{id}/applications com a pessoa revisando antes de enviar.
 */
export type ResumeApplyPrefill = {
  jobId: string;
  jobTitle: string;
  suggestedMessage: string | null;
  fields: ResumePrefillField[];
  filled: number;
  total: number;
};
