import type { CreateFreelanceInput } from "@/types/application/freelance/create-freelance-input";
import type { FreelancePage, FreelanceView } from "@/types/application/freelance/freelance-view";

import { api, buildQuery } from "../api-client";

export const freelancesApi = {
  list: (params: { limit?: number; cursor?: string | null } = {}) =>
    api.get<FreelancePage>(`/freelances${buildQuery(params)}`),
  mine: () => api.get<FreelanceView[]>("/me/freelances"),
  create: (data: CreateFreelanceInput) => api.post<FreelanceView>("/freelances", data),
  close: (id: string) =>
    api.post<{ id: string; status: string }>(`/freelances/${encodeURIComponent(id)}/close`, {}),
};
