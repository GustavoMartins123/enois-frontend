import type { ElementType, PropsWithChildren } from "react";

export type SectionProps = PropsWithChildren<{
  title: string;
  icon?: ElementType;
}>;
