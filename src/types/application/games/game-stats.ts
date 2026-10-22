/**
 * Os números do jogo, contados pelo servidor: sessões iniciadas, jogadores distintos estimados,
 * quantos guardaram na biblioteca e quantas novidades o criador publicou.
 */
export type GameStats = {
  plays: number;
  players: number;
  favorites: number;
  updates: number;
};
