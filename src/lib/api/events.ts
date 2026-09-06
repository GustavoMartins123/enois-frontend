import type { PageResponse } from "@/types/application/api/page-response";
import type { StatusResponse } from "@/types/application/api/status-response";
import type { CreateEventRequest } from "@/types/application/event/create-event-request";
import type { Event } from "@/types/application/event/event";

import { api, buildQuery } from "../api-client";

export const eventsApi = {
  list: (format?: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Event>>(`/events${buildQuery({ format, cursor, limit })}`),

  get: (eventId: string) => api.get<Event>(`/events/${eventId}`),

  create: (data: CreateEventRequest) => api.post<Event>("/events", data),

  attend: (eventId: string) => api.post<StatusResponse>(`/events/${eventId}/attendees`),

  cancelAttendance: (eventId: string) =>
    api.delete<StatusResponse>(`/events/${eventId}/attendees`),
};
