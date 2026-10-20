/** Opções canônicas de nível, local e tipo usadas na listagem e na criação de vagas. */
export const JOB_LEVELS = ["JUNIOR", "MID", "SENIOR", "LEAD"] as const;

export const JOB_LOCATIONS = ["Remoto", "Híbrido", "Presencial"] as const;

export const JOB_TYPES = ["CLT", "PJ", "FREELANCE", "INTERN"] as const;

/** Períodos do valor da vaga (o backend aceita exatamente estes códigos). */
export const SALARY_PERIODS = [
  { value: "HOUR", label: "por hora" },
  { value: "DAY", label: "por dia" },
  { value: "MONTH", label: "por mês" },
  { value: "YEAR", label: "por ano" },
] as const;
