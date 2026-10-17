import type { JobApplicationStatus } from "./job-application-status";

export type JobApplicationFieldType = "TEXT" | "TEXTAREA" | "NUMBER" | "LINK";

/** Campo personalizado que quem publica a vaga define para o formulário de candidatura. */
export type JobApplicationField = {
  id: string;
  label: string;
  type: JobApplicationFieldType;
  required: boolean;
};

/** Campo como o autor está montando (sem id, antes de publicar). */
export type JobApplicationFieldInput = {
  label: string;
  type: JobApplicationFieldType;
  required: boolean;
};

/** Quem publicou a vaga, com o que sustenta a credibilidade dele. */
export type JobAuthor = {
  id: string;
  username: string | null;
  name: string;
  avatar: string | null;
  headline: string | null;
  reputation: number;
  identityVerified: boolean;
};

/** Retrato do candidato congelado no momento da inscrição. */
export type JobCandidate = {
  userId: string;
  name: string;
  /** Nome social congelado na inscrição; a empresa vê os dois, um abaixo do outro. */
  socialName?: string | null;
  username: string;
  headline: string;
  location: string;
  avatar: string;
  skills: string[];
  experienceYears: number;
  experiencesCount: number;
  reputation: number;
  identityVerified: boolean;
};

export type JobApplicationAnswer = {
  label: string;
  value: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  /** Estado persistido no backend; a tela nao inventa estado. */
  status: JobApplicationStatus;
  appliedAt: string;
  answersCount: number;
  candidate: JobCandidate | null;
  message: string | null;
  answers: JobApplicationAnswer[];
};

export type JobApplicationInput = {
  message?: string;
  answers: { fieldId: string; value: string }[];
};
