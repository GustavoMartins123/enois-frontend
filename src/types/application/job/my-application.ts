import type { JobApplicationStatus } from "./job-application-status";

/** Candidatura como o CANDIDATO a vê: a vaga, o estado e o retorno do empregador. */
export type MyApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  status: JobApplicationStatus;
  feedback?: string | null;
  reviewedAt?: string | null;
  appliedAt: string;
};
