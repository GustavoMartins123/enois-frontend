export type SandboxedHtmlFrameProps = {
  /** HTML a renderizar. Pode vir cru (preview do autor) ou sanitizado (post publicado). */
  html: string;
  /** Altura/classe do quadro; o padrão é uma altura de "mini página". */
  className?: string;
  /** Descrição do quadro para leitores de tela. */
  title: string;
  /**
   * Folga interna em volta do conteúdo (o "papel" da página). `false` faz o HTML começar na borda
   * do quadro, para quem quer usar o espaço inteiro — é o caso da bio do perfil, onde o quadro
   * ocupa a largura do card e uma margem branca em volta parecia sobra.
   */
  innerPadding?: boolean;
};
