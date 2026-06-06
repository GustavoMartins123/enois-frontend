import { api, buildQuery } from "../api-client";
import type { PostView } from "./feed";

export interface Community {
  id: string;
  name: string;
  description: string;
  topic: string;
  members: number;
  joined: boolean;
  cover: string | null;
}

export interface CommunityMember {
  userId: string;
  username: string;
  name: string;
  avatar: string | null;
  role: "ADMIN" | "MEMBER";
}

export interface CreateCommunityInput {
  name: string;
  description: string;
  topic: string;
  cover?: string | null;
}

export interface PageResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export const communitiesApi = {
  list: (topic?: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Community>>(`/communities${buildQuery({ topic, cursor, limit })}`),

  get: (communityId: string) => api.get<Community>(`/communities/${communityId}`),

  create: (data: CreateCommunityInput) => api.post<Community>("/communities", data),

  update: (communityId: string, data: Partial<CreateCommunityInput>) =>
    api.patch<Community>(`/communities/${communityId}`, data),

  join: (communityId: string) => api.post<{ status: string }>(`/communities/${communityId}/members`),

  leave: (communityId: string) => api.delete<{ status: string }>(`/communities/${communityId}/members`),

  getMembers: (communityId: string) =>
    api.get<{ items: CommunityMember[] }>(`/communities/${communityId}/members`),

  getFeed: (communityId: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<PostView>>(
      `/communities/${communityId}/feed${buildQuery({ cursor, limit })}`,
    ),
};
