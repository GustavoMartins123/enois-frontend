import type { BlogPost } from "@/types/application/blog/blog-post";

export type BlogPostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Post existente = edição (preenche e salva por cima); sem ele o diálogo publica um post novo. */
  post?: BlogPost | null;
};
