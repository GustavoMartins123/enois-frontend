import type { Job } from "@/types/application/job/job";

export type JobEditDialogProps = {
  /** Vaga a editar; `null` fecha o diálogo. */
  job: Job | null;
  onOpenChange: (open: boolean) => void;
};
