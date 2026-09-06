import type { PageResponse } from "@/types/application/api/page-response";
import type { StatusResponse } from "@/types/application/api/status-response";
import type { BookSessionResponse } from "@/types/application/mentor/book-session-response";
import type { CreateMentorInput } from "@/types/application/mentor/create-mentor-input";
import type { CreateSlotInput } from "@/types/application/mentor/create-slot-input";
import type { Mentor } from "@/types/application/mentor/mentor";
import type { TimeSlot } from "@/types/application/mentor/time-slot";
import type { UpdateMentorInput } from "@/types/application/mentor/update-mentor-input";

import { api, buildQuery } from "../api-client";

export const mentorsApi = {
  list: (expertise?: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Mentor>>(`/mentors${buildQuery({ expertise, cursor, limit })}`),

  get: (mentorId: string) => api.get<Mentor>(`/mentors/${mentorId}`),

  create: (data: CreateMentorInput) => api.post<Mentor>("/mentors", data),

  update: (mentorId: string, data: UpdateMentorInput) =>
    api.patch<Mentor>(`/mentors/${mentorId}`, data),

  remove: (mentorId: string) => api.delete<StatusResponse>(`/mentors/${mentorId}`),

  getSlots: (mentorId: string) => api.get<TimeSlot[]>(`/mentors/${mentorId}/slots`),

  createSlot: (mentorId: string, data: CreateSlotInput) =>
    api.post<TimeSlot>(`/mentors/${mentorId}/slots`, data),

  bookSession: (mentorId: string, slotId: string, message?: string) =>
    api.post<BookSessionResponse>(`/mentors/${mentorId}/sessions`, {
      slotId,
      message,
    }),
};
