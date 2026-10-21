/** Um pedido do jogo preso ao jogo e à sessão do quadro que o fez — nunca muda de dono. */
export type GamePendingRequest<T> = T & {
  gameId: string;
  session: number;
};
