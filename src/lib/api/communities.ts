import type { PageResponse } from "@/types/application/api/page-response";
import type { StatusResponse } from "@/types/application/api/status-response";
import type { Community } from "@/types/application/community/community";
import type { CommunityMembersResponse } from "@/types/application/community/community-members-response";
import type { CommunityTopic } from "@/types/application/community/community-topic";
import type { CreateCommunityInput } from "@/types/application/community/create-community-input";
import type { PostView } from "@/types/application/feed/post-view";

import { api, buildQuery } from "../api-client";

export const communitiesApi = {
  list: (topic?: CommunityTopic, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Community>>(`/communities${buildQuery({ topic, cursor, limit })}`),

  get: (communityId: string) => api.get<Community>(`/communities/${communityId}`),

  create: (data: CreateCommunityInput) => api.post<Community>("/communities", data),

  update: (communityId: string, data: Partial<CreateCommunityInput>) =>
    api.patch<Community>(`/communities/${communityId}`, data),

  join: (communityId: string) => api.post<StatusResponse>(`/communities/${communityId}/members`),

  leave: (communityId: string) => api.delete<StatusResponse>(`/communities/${communityId}/members`),

  /** Comunidades das quais o usuário participa (menu lateral). */
  mine: (limit = 20) => api.get<PageResponse<Community>>(`/communities/mine${buildQuery({ limit })}`),

  /** Transfere a administração para outro membro (só o dono atual). */
  transfer: (communityId: string, newOwnerId: string) =>
    api.post<Community>(`/communities/${communityId}/transfer`, { newOwnerId }),

  /** Exclui a comunidade (só o dono). */
  remove: (communityId: string) => api.delete<StatusResponse>(`/communities/${communityId}`),

  getMembers: (communityId: string) =>
    api.get<CommunityMembersResponse>(`/communities/${communityId}/members`),

  getFeed: (communityId: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<PostView>>(
      `/communities/${communityId}/feed${buildQuery({ cursor, limit })}`,
    ),
};
