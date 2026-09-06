import type { ComponentPropsWithoutRef } from "react";

import type { WithRequiredChildren } from "@/types/components/with-required-children";

export type TabBtnProps = WithRequiredChildren<{
  active: boolean;
  onClick: NonNullable<ComponentPropsWithoutRef<"button">["onClick"]>;
}>;
