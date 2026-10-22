import type { ElementType, ReactNode } from "react";

export type EmptyStateProps = {
  icon?: ElementType;
  title: string;
  description?: string;
  /** Ação opcional (ex.: botão de criar) exibida abaixo do texto. */
  children?: ReactNode;
};
