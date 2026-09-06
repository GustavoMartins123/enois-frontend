import type { ComponentPropsWithoutRef } from "react";

import type * as DialogPrimitive from "@radix-ui/react-dialog";

export type ForgotPasswordDialogProps = Required<
  Pick<ComponentPropsWithoutRef<typeof DialogPrimitive.Root>, "open" | "onOpenChange">
>;
