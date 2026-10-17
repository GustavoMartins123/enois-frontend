import type { UserProjectInput } from "@/types/application/project/user-project-input";

/** Projeto em edição no gerenciador (id presente = edição). */
export type EditingProject = (UserProjectInput & { id?: string }) | null;
