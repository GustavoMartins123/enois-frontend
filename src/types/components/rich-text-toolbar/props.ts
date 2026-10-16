import type { RichTextFormat } from "@/types/lib/rich-text/rich-text-format";

export type RichTextToolbarProps = {
  onFormat: (format: RichTextFormat) => void;
  /** Rótulo acessível do grupo de botões. */
  label: string;
  className?: string;
};
