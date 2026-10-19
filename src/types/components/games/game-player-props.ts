import type { ReactNode } from "react";

import type { GameShareRequest } from "@/types/application/games/game-share-request";
import type { GameSpendRequest } from "@/types/application/games/game-spend-request";

export type GamePlayerProps = {
  url: string;
  title: string;
  aspect?: string | null;
  playable?: boolean;
  autoStart?: boolean;
  tallOnMobile?: boolean;
  /** Sem `identity` o player não responde pedidos de identidade (ex.: moderação). */
  identity?: string | null;
  stats?: ReactNode;
  onStart?: (retry: boolean) => void;
  onShareRequest?: (request: GameShareRequest) => void;
  onSpendRequest?: (request: GameSpendRequest) => void;
};
