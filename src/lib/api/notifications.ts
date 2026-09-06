import type { PageResponse } from "@/types/application/api/page-response";
import type { Notification } from "@/types/application/notification/notification";

import { api, buildQuery } from "../api-client";

export type { PageResponse } from "@/types/application/api/page-response";
export type { Notification } from "@/types/application/notification/notification";

export const notificationsApi = {
  list: (cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Notification>>(`/notifications${buildQuery({ cursor, limit })}`),

  markAsRead: (notificationId: string) => api.post<void>(`/notifications/${notificationId}/read`),

  markAllAsRead: () => api.post<void>("/notifications/read-all"),
};
