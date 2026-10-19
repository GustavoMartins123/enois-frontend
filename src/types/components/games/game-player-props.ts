import type { ReactNode } from "react";

import type { GameIdentityGrant } from "@/types/application/games/game-identity-grant";
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
  identity?: GameIdentityGrant | null;
  stats?: ReactNode;
  onStart?: (retry: boolean, session: number) => void;
  onShareRequest?: (request: GameShareRequest, session: number) => void;
  onSpendRequest?: (request: GameSpendRequest, session: number) => void;
};
