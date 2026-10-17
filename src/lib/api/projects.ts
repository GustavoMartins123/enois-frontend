import type { UserProject, UserProjectInput } from "@/types/application/project/user-project";

import { api } from "../api-client";

/** Cards de projeto do perfil: leitura pública por username e CRUD do dono. */
export const projectsApi = {
  byUser: (username: string) => api.get<UserProject[]>(`/users/${username}/projects`),

  mine: () => api.get<UserProject[]>("/me/projects"),

  create: (data: UserProjectInput) => api.post<UserProject>("/me/projects", data),

  update: (projectId: string, data: UserProjectInput) =>
    api.put<UserProject>(`/me/projects/${projectId}`, data),

  remove: (projectId: string) => api.delete<void>(`/me/projects/${projectId}`),
};
