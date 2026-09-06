import type { PropsWithChildren, ReactNode } from "react";

export type FieldProps = PropsWithChildren<{
  label: string;
  error?: string;
  right?: ReactNode;
}>;
