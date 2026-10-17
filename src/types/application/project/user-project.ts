/** Um card de projeto do perfil: dados estruturados ou HTML próprio (sanitizado no backend). */
export type UserProject = {
  id: string;
  title: string;
  stack: string[];
  repoUrl: string | null;
  status: string | null;
  diary: { date: string; text: string }[];
  html?: string | null;
};

/** Corpo de criação/edição (o id vai na URL). */
export type UserProjectInput = {
  title: string;
  stack: string[];
  repoUrl: string | null;
  status: string | null;
  diary: { date: string; text: string }[];
  html: string | null;
};
