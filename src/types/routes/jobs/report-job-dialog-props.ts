import type { Job } from "@/types/application/job/job";

export type ReportJobDialogProps = {
  job: Job | null;
  onOpenChange: (open: boolean) => void;
};
