import type { PostView } from "@/types/application/feed/post-view";

export type PostCardProps = {
  post: PostView;
  /**
   * O card É a página do post (não um item de lista): mostra o texto inteiro e não oferece "Ler
   * mais" — o link levaria para a página em que a pessoa já está, e sem isto o texto completo de um
   * post longo não aparecia em lugar nenhum (a lista corta e a página do post usava o mesmo card).
   */
  fullPost?: boolean;

  /** É o post fixado no topo da comunidade (mostra o selo "Fixado"). */
  pinned?: boolean;

  /** Presente para quem administra a comunidade: mostra o botão de fixar/desafixar. */
  onTogglePin?: () => void;

  pinPending?: boolean;
};
