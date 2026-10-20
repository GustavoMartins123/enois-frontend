/** Cadastro de vaga achada em outro site: o Énóis lista e o botão leva ao link de origem. */
export type CreateExternalJobInput = {
  title: string;
  company: string;
  location?: string;
  /** Link https da vaga na plataforma original (é para onde o "Candidatar-se" vai). */
  url: string;
  /** Descrição das atividades (opcional). */
  description?: string;
  /** Faixa salarial opcional: mínimo, máximo e período. */
  salaryMin?: string;
  salaryMax?: string;
  salaryPeriod?: "HOUR" | "DAY" | "MONTH" | "YEAR";
  /** E-mail de candidatura opcional: se informado, o botão vira "Enviar candidatura". */
  applyEmail?: string;
  /** Declaração de que a vaga é real e respeita as regras da comunidade. */
  communityAgreement: boolean;
};
