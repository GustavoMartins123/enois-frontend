import type { PropsWithChildren, ReactNode } from "react";

export type WithRequiredChildren<T = unknown> = PropsWithChildren<T> & {
  children: ReactNode;
};
