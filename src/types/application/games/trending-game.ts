/** Um jogo do ranking "jogados hoje": o que ele fez nas últimas 24 horas, contado pelo servidor. */
export type TrendingGame = {
  id: string;
  /** O endereço público é `/games/{username}/{slug}` — o @ vem resolvido do perfil do criador. */
  username?: string | null;
  slug: string;
  title: string;
  cover?: string | null;
  icon?: string | null;
  /** Onde o jogo vive: sem capa nem foto, o ícone cai no favicon daqui. */
  url?: string | null;
  /** Sessões abertas na janela. */
  plays: number;
  /** Pessoas distintas na janela: uma pessoa em cinco sessões conta uma. */
  players: number;
};
