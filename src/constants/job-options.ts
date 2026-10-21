import { texts } from "@/texts";

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

/** Nome de tela do nível; código desconhecido (vaga externa) passa como veio. */
export function jobLevelLabel(code: string): string {
  return (texts.jobs.filters.levels as Record<string, string>)[code] ?? code;
}

/** Nome de tela do tipo de contrato; código desconhecido passa como veio. */
export function jobTypeLabel(code: string): string {
  return (texts.jobs.filters.types as Record<string, string>)[code] ?? code;
}
