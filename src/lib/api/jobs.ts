import type { PageResponse } from "@/types/application/api/page-response";
import type { StatusResponse } from "@/types/application/api/status-response";
import type { CreateJobInput } from "@/types/application/job/create-job-input";
import type { Job } from "@/types/application/job/job";
import type { ListJobsParams } from "@/types/application/job/list-jobs-params";

import { api, buildQuery } from "../api-client";

export const jobsApi = {
  list: (params?: ListJobsParams) =>
    api.get<PageResponse<Job>>(
      `/jobs${buildQuery({ ...params, cursor: params?.cursor ?? undefined, limit: params?.limit ?? 20 })}`,
    ),

  get: (jobId: string) => api.get<Job>(`/jobs/${jobId}`),

  /** Vagas publicadas por mim (o autor ve o total de candidaturas). */
  mine: (cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Job>>(`/jobs/mine${buildQuery({ cursor, limit })}`),

  /** Vagas em que eu me candidatei. */
  applications: (cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Job>>(`/jobs/applications${buildQuery({ cursor, limit })}`),

  create: (data: CreateJobInput) => api.post<Job>("/jobs", data),

  update: (jobId: string, data: CreateJobInput) => api.put<Job>(`/jobs/${jobId}`, data),

  remove: (jobId: string) => api.delete<void>(`/jobs/${jobId}`),

  apply: (jobId: string) => api.post<StatusResponse>(`/jobs/${jobId}/applications`),

  save: (jobId: string) => api.post<StatusResponse>(`/jobs/${jobId}/saves`),

  removeSave: (jobId: string) => api.delete<StatusResponse>(`/jobs/${jobId}/saves`),
};
