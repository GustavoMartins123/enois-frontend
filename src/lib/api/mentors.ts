import { api, buildQuery } from "../api-client";

export interface Mentor {
  id: string;
  userId: string;
  expertise: string[];
  rating: number;
  sessions: number;
  price: string;
  nextSlot: string;
}

export interface TimeSlot {
  id: string;
  startsAt: string;
  endsAt: string;
  available: boolean;
}

export interface CreateMentorInput {
  expertise: string[];
  price: string;
}

export interface CreateSlotInput {
  startsAt: string;
  endsAt: string;
}

export interface PageResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export const mentorsApi = {
  list: (expertise?: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Mentor>>(`/mentors${buildQuery({ expertise, cursor, limit })}`),

  get: (mentorId: string) => api.get<Mentor>(`/mentors/${mentorId}`),

  create: (data: CreateMentorInput) => api.post<Mentor>("/mentors", data),

  getSlots: (mentorId: string) => api.get<TimeSlot[]>(`/mentors/${mentorId}/slots`),

  createSlot: (mentorId: string, data: CreateSlotInput) =>
    api.post<TimeSlot>(`/mentors/${mentorId}/slots`, data),

  bookSession: (mentorId: string, slotId: string, message?: string) =>
    api.post<{ status: string; sessionId: string }>(`/mentors/${mentorId}/sessions`, {
      slotId,
      message,
    }),
};
