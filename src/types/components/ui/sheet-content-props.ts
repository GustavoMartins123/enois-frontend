import type { ComponentPropsWithoutRef } from "react";

import type * as SheetPrimitive from "@radix-ui/react-dialog";

export interface SheetContentProps extends ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: "top" | "bottom" | "left" | "right" | null;
  overlayClassName?: string;
}
