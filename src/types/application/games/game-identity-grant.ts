/** O token vale só para a sessão do quadro que o pediu (cada "Tentar de novo" abre outra). */
export type GameIdentityGrant = {
  session: number;
  token: string;
};
