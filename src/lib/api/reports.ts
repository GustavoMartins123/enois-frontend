import { REPORT_REASONS } from "@/constants/report-reasons";
import type { StatusResponse } from "@/types/application/api/status-response";
import type { ReportInput } from "@/types/application/report/report-input";
import type { ReportReason } from "@/types/application/report/report-reason";

import { api } from "../api-client";

export { REPORT_REASONS } from "@/constants/report-reasons";
export type { ReportInput } from "@/types/application/report/report-input";
export type { ReportReason } from "@/types/application/report/report-reason";

export const reportsApi = {
  create: (data: ReportInput) =>
    api.post<StatusResponse & { id: string }>("/reports", data),
};
