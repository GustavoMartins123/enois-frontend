import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";

export type TabBtnProps = PropsWithChildren<{
  active: boolean;
  onClick: NonNullable<ComponentPropsWithoutRef<"button">["onClick"]>;
}>;
