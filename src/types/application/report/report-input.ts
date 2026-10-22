import type { ReportReason } from "./report-reason";
import type { ReportTargetType } from "./report-target-type";

export type ReportInput = {
  targetId: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  description?: string;
};
