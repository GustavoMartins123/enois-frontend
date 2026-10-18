import type { GameView } from "./game-view";

/**
 * A página do criador: identidade do Énóis + o que é do Games + os jogos publicados.
 * `following` e `owner` são de quem está lendo.
 */
export type DeveloperPage = {
  userId: string;
  username: string;
  name: string;
  badge?: string | null;
  avatar?: string | null;
  cover?: string | null;
  displayName?: string | null;
  headline?: string | null;
  bio?: string | null;
  links: string[];
  games: GameView[];
  followers: number;
  following: boolean;
  owner: boolean;
};
