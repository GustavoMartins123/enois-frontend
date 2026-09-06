import type { PropsWithChildren } from "react";

export type FieldProps = PropsWithChildren<{
  label: string;
  error?: string;
}>;
