export type CreateJobInput = {
  title: string;
  company: string;
  location: string;
  type: string;
  level: string;
  salary?: string;
  skills: string[];
  description?: string;
};
