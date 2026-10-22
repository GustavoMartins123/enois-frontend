/** O que entra no texto do e-mail: a vaga e o que a pessoa já tem no perfil. */
export type ApplicationEmailInput = {
  jobTitle: string;
  company?: string | null;
  name: string;
  headline?: string | null;
  skills?: string[] | null;
  portfolio?: string | null;
  hasResume: boolean;
};
