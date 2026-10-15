export type CreateJobInput = {
  title: string;
  company: string;
  location: string;
  type: string;
  level: string;
  salary?: string;
  /** Moeda vigente da vaga (BRL por padrão). */
  currency?: string;
  skills: string[];
  description?: string;
  /** Declaração de que a vaga é real e respeita as regras da comunidade. */
  communityAgreement?: boolean;
};
