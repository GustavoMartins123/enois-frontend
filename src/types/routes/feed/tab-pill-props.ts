import type { ComponentPropsWithoutRef } from "react";

import type { WithRequiredChildren } from "@/types/components/with-required-children";

export type TabPillProps = WithRequiredChildren<{
  active?: boolean;
  onClick?: ComponentPropsWithoutRef<"button">["onClick"];
}>;
