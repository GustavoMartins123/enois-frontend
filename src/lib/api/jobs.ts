import type { PageResponse } from "@/types/application/api/page-response";
import type { StatusResponse } from "@/types/application/api/status-response";
import type { Job } from "@/types/application/job/job";
import type { ListJobsParams } from "@/types/application/job/list-jobs-params";

import { api, buildQuery } from "../api-client";

export const jobsApi = {
  list: (params?: ListJobsParams) =>
    api.get<PageResponse<Job>>(
      `/jobs${buildQuery({ ...params, cursor: params?.cursor ?? undefined, limit: params?.limit ?? 20 })}`,
    ),

  get: (jobId: string) => api.get<Job>(`/jobs/${jobId}`),

  apply: (jobId: string) => api.post<StatusResponse>(`/jobs/${jobId}/applications`),

  save: (jobId: string) => api.post<StatusResponse>(`/jobs/${jobId}/saves`),

  removeSave: (jobId: string) => api.delete<StatusResponse>(`/jobs/${jobId}/saves`),
};
