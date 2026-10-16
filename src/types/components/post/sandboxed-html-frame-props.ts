export type SandboxedHtmlFrameProps = {
  /** HTML a renderizar. Pode vir cru (preview do autor) ou sanitizado (post publicado). */
  html: string;
  /** Altura/classe do quadro; o padrão é uma altura de "mini página". */
  className?: string;
  /** Descrição do quadro para leitores de tela. */
  title: string;
};
