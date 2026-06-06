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
  list: (query?: string, type?: string, cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Job>>(`/jobs${buildQuery({ query, type, cursor, limit })}`),

  get: (jobId: string) => api.get<Job>(`/jobs/${jobId}`),

  apply: (jobId: string) => api.post<{ status: string }>(`/jobs/${jobId}/applications`),

  save: (jobId: string) => api.post<{ status: string }>(`/jobs/${jobId}/saves`),

  removeSave: (jobId: string) => api.delete<{ status: string }>(`/jobs/${jobId}/saves`),
};
