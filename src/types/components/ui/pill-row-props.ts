import type { WithRequiredChildren } from "@/types/components/with-required-children";

export type PillRowProps = WithRequiredChildren<{
  /** Nome do grupo de filtros, lido pelo leitor de tela. */
  label: string;
  className?: string;
}>;
