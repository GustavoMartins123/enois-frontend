import type { HTMLAttributes } from "react";

import type { VariantProps } from "class-variance-authority";

import type { badgeVariants } from "@/components/ui/badge-variants";

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
