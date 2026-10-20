/** Um dia da série de uso do jogo (o painel sempre devolve TODOS os dias da janela). */
export type GameAnalyticsDay = {
  date: string;
  pageViews: number;
  plays: number;
  shares: number;
  /** Jogadores distintos NAQUELE dia (quem joga em dois dias conta nos dois). */
  players: number;
};

/** Números de uso do jogo: totais + série diária. Só o criador recebe (403 para os outros). */
export type GameAnalytics = {
  from: string;
  to: string;
  days: number;
  plays: number;
  players: number;
  favorites: number;
  updates: number;
  series: GameAnalyticsDay[];
};
