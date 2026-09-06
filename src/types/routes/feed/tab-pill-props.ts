import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";

export type TabPillProps = PropsWithChildren<{
  active?: boolean;
  onClick?: ComponentPropsWithoutRef<"button">["onClick"];
}>;
