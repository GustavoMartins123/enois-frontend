import type { Blog } from "@/types/application/blog/blog";

export type BlogEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Blog existente (edição) ou null (criação). */
  blog: Blog | null;
};
