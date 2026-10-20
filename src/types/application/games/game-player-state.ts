import type { GamePlayerStatus } from "./game-player-status";

export type GamePlayerState = {
  status: GamePlayerStatus;
  session: number;
  progress: number | null;
  errorMessage: string | null;
  integrated: boolean;
  slow: boolean;
};
