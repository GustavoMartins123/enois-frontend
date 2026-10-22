/** Uma nota do diário de desenvolvimento (o que mudou nesta versão). */
export type GameUpdateView = {
  id: string;
  gameId: string;
  title: string;
  body?: string | null;
  version?: string | null;
  createdAt: string;
};
