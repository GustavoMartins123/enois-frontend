export type PostPageProps = {
  /** Id do post: o quadro busca a página em `{CONTENT_ORIGIN}/pages/{postId}`. */
  postId: string;
  /** HTML já sanitizado — usado só no modo de reserva (sem origem de conteúdo) e na prévia do editor. */
  html: string;
};
