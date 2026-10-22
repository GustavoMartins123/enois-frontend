/** Retorno de POST /me/import/linkedin — o retrato parseado, para revisão no front. */
export type LinkedinImportPreview = {
  experiences: {
    title: string | null;
    company: string | null;
    location: string | null;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    currentlyHere: boolean;
  }[];
  education: {
    school: string;
    degree: string | null;
    field: string | null;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    currentlyHere: boolean;
  }[];
  certifications: {
    name: string;
    issuer: string | null;
    issueDate: string | null;
  }[];
  projects: {
    title: string;
    description: string | null;
    url: string | null;
    startDate: string | null;
    endDate: string | null;
  }[];
  /** Campos do Profile.csv com casa no perfil (aplicados em um update). */
  profile: {
    name: string | null;
    headline: string | null;
    summary: string | null;
    location: string | null;
    industry: string | null;
  } | null;
  /** Skills.csv — entram na lista de habilidades do perfil. */
  skills: string[];
  /** O que veio no arquivo mas não tem estrutura no Énóis (idiomas, prêmios, cursos…). */
  semEstrutura: Record<string, number>;
  found: number;
};
