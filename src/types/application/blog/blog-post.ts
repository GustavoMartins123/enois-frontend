import type { BlogPostFormat } from "./blog-post-format";

export type BlogPost = {
  id: string;
  title: string;
  /**
   * O que o autor escreveu: HTML já sanitizado (bodyFormat HTML) ou markdown simples
   * (bodyFormat MARKDOWN), que a tela renderiza como texto formatado.
   */
  body: string;
  bodyFormat: BlogPostFormat;
  publishedAt: string;
  updatedAt: string;
};
