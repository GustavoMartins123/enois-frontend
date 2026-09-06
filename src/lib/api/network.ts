import type { PageResponse } from "@/types/application/api/page-response";
import type { ConnectionRequest } from "@/types/application/network/connection-request";
import type { ConnectionStatusResult } from "@/types/application/network/connection-status-result";
import type { ConnectionStatus } from "@/types/application/network/connection-status";
import type { NetworkSummary } from "@/types/application/network/network-summary";
import type { NetworkUser } from "@/types/application/network/network-user";

import { api, buildQuery } from "../api-client";

export type { PageResponse } from "@/types/application/api/page-response";
export type { ConnectionRequest } from "@/types/application/network/connection-request";
export type { ConnectionStatusResult } from "@/types/application/network/connection-status-result";
export type { ConnectionStatus } from "@/types/application/network/connection-status";
export type { NetworkSummary } from "@/types/application/network/network-summary";
export type { NetworkUser } from "@/types/application/network/network-user";

export const networkApi = {
  list: (query?: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<NetworkUser>>(`/network/users${buildQuery({ query, cursor, limit })}`),

  suggestions: (limit = 4) =>
    api.get<NetworkUser[]>(`/network/suggestions${buildQuery({ limit })}`),

  summary: () => api.get<NetworkSummary>("/network/summary"),

  requests: (cursor?: string | null, limit = 20) =>
    api.get<PageResponse<ConnectionRequest>>(`/network/requests${buildQuery({ cursor, limit })}`),

  connect: (targetUserId: string) =>
    api.post<ConnectionStatus>(`/network/connections/${targetUserId}`),

  accept: (targetUserId: string) =>
    api.put<ConnectionStatus>(`/network/connections/${targetUserId}/accept`),

  remove: (targetUserId: string) =>
    api.delete<ConnectionStatus>(`/network/connections/${targetUserId}`),

  status: (targetUserId: string) =>
    api.get<ConnectionStatusResult>(`/network/connections/${targetUserId}/status`),
};
