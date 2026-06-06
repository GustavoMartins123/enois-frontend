import { api, buildQuery } from "../api-client";

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string | null;
  location: string;
  type: string;
  level: string;
  salary: string | null;
  skills: string[];
  postedAt: string;
  matchScore: number | null;
}

export interface PageResponse<T> {
  items: T[];
  nextCursor: string | null;
}

export const jobsApi = {
  list: (params?: {
    query?: string;
    type?: string;
    level?: string;
    location?: string;
    skills?: string;
    cursor?: string | null;
    limit?: number;
  }) => api.get<PageResponse<Job>>(`/jobs${buildQuery({ ...params, cursor: params?.cursor ?? undefined, limit: params?.limit ?? 20 })}`),

  get: (jobId: string) => api.get<Job>(`/jobs/${jobId}`),

  apply: (jobId: string) => api.post<{ status: string }>(`/jobs/${jobId}/applications`),

  save: (jobId: string) => api.post<{ status: string }>(`/jobs/${jobId}/saves`),

  removeSave: (jobId: string) => api.delete<{ status: string }>(`/jobs/${jobId}/saves`),
};
