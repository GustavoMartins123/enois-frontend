import type { GameShareRequest } from "./game-share-request";
import type { GameSpendRequest } from "./game-spend-request";

export type GameBridgeMessage =
  | { type: "enois:identity" }
  | ({ type: "enois:share" } & GameShareRequest)
  | ({ type: "enois:spend" } & GameSpendRequest)
  | { type: "enois:loading"; progress: number | null }
  | { type: "enois:ready" }
  | { type: "enois:error"; message: string | null };
