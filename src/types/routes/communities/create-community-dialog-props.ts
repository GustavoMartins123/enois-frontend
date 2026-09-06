import type { PropsWithChildren } from "react";

export type CreateCommunityDialogProps = PropsWithChildren<{
  open: boolean;
  onOpenChange: (value: boolean) => void;
}>;
