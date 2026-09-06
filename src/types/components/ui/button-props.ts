import type { ButtonHTMLAttributes } from "react";

import type { VariantProps } from "class-variance-authority";

import type { buttonVariants } from "@/components/ui/button-variants";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
