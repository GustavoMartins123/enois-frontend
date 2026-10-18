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
  found: number;
};
