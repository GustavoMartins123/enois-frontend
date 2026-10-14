import { REPORT_REASONS } from "@/constants/report-reasons";
import type { CreateReportResponse } from "@/types/application/report/create-report-response";
import type { ReportInput } from "@/types/application/report/report-input";

import { api } from "../api-client";

export { REPORT_REASONS } from "@/constants/report-reasons";

export const reportsApi = {
  create: (data: ReportInput) => api.post<CreateReportResponse>("/reports", data),
};
