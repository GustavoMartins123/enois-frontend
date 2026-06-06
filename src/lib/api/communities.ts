import { api, buildQuery } from "../api-client";

export interface Community {
  id: string;
  name: string;
  description: string;
  topic: string;
  memberCount: number;
  joined: boolean;
  cover: string | null;
}

export interface PageResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export interface CreateCommunityInput {
  name: string;
  description: string;
  topic: string;
}

export const communitiesApi = {
  list: (topic?: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Community>>(`/communities${buildQuery({ topic, cursor, limit })}`),

  create: (data: CreateCommunityInput) => api.post<Community>("/communities", data),

  get: (communityId: string) => api.get<Community>(`/communities/${communityId}`),

  update: (communityId: string, data: Partial<CreateCommunityInput>) =>
    api.patch<Community>(`/communities/${communityId}`, data),

  join: (communityId: string) =>
    api.post<{ status: string }>(`/communities/${communityId}/members`),

  leave: (communityId: string) =>
    api.delete<{ status: string }>(`/communities/${communityId}/members`),
};
