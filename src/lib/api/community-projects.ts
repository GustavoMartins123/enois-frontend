import type { CommunityProjectInput } from "@/types/application/projects/community-project-input";
import type { CommunityProjectPageView } from "@/types/application/projects/community-project-page-view";
import type { CommunityProjectView } from "@/types/application/projects/community-project-view";

import { api, buildQuery } from "../api-client";

export const communityProjectsApi = {
  catalog: (
    params: { query?: string; order?: string; limit?: number; cursor?: string | null } = {},
  ) => api.get<CommunityProjectPageView>(`/community-projects${buildQuery(params)}`),

  byUser: (username: string) =>
    api.get<CommunityProjectView[]>(`/community-projects/${encodeURIComponent(username)}`),

  bySlug: (username: string, slug: string) =>
    api.get<CommunityProjectView>(
      `/community-projects/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`,
    ),

  mine: () => api.get<CommunityProjectView[]>("/me/community-projects"),

  submit: (data: CommunityProjectInput) =>
    api.post<CommunityProjectView>("/community-projects", data),

  edit: (projectId: string, data: CommunityProjectInput) =>
    api.patch<CommunityProjectView>(`/community-projects/${encodeURIComponent(projectId)}`, data),

  remove: (projectId: string) =>
    api.delete<{ id: string }>(`/community-projects/${encodeURIComponent(projectId)}`),

  resubmit: (projectId: string) =>
    api.post<{ id: string; status: string }>(
      `/community-projects/${encodeURIComponent(projectId)}/resubmit`,
      {},
    ),

  pending: (limit = 30) =>
    api.get<CommunityProjectView[]>(`/moderation/community-projects?limit=${limit}`),

  approve: (projectId: string, note?: string) =>
    api.post<{ id: string; status: string }>(
      `/moderation/community-projects/${encodeURIComponent(projectId)}/approve`,
      {
        note,
      },
    ),

  reject: (projectId: string, note: string) =>
    api.post<{ id: string; status: string }>(
      `/moderation/community-projects/${encodeURIComponent(projectId)}/reject`,
      {
        note,
      },
    ),

  suspend: (projectId: string, note: string) =>
    api.post<{ id: string; status: string }>(
      `/admin/community-projects/${encodeURIComponent(projectId)}/suspend`,
      { note },
    ),
};
