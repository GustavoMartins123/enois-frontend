import type { ModeratorApplicationView } from "./moderator-application-view";

/** Estado do usuário no painel (GET /moderation/me). */
export type ModeratorMeView = {
  reputation: number;
  minReputation: number;
  eligible: boolean;
  moderator: boolean;
  admin: boolean;
  application: ModeratorApplicationView | null;
};
