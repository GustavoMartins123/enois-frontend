import type { ReactNode } from "react";

export type SpoilerPreviewProps = {
  active?: boolean;
  label: string;
  children: ReactNode;
  className?: string;
};
