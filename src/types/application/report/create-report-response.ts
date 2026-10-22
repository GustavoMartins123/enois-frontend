import type { StatusResponse } from "@/types/application/api/status-response";

export type CreateReportResponse = StatusResponse & {
  id: string;
};
