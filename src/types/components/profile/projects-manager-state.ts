import type { UserProjectInput } from "@/types/application/project/user-project";

/** Projeto em edição no gerenciador (id presente = edição). */
export type EditingProject = (UserProjectInput & { id?: string }) | null;

/** Os dois modos de um card: preencher o formulário ou escrever o HTML. */
export type ProjectCardMode = "estruturado" | "html";
