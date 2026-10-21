import type { GameIdentityGrant } from "./game-identity-grant";

export type GameIdentityBinding = GameIdentityGrant & {
  gameId: string;
};
