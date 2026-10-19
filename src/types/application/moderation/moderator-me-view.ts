import type { ModeratorApplicationView } from "./moderator-application-view";

/** Estado do usuário no painel (GET /moderation/me). */
export type ModeratorMeView = {
  reputation: number;
  minReputation: number;
  eligible: boolean;
  moderator: boolean;
  admin: boolean;
  /** Quantos moderadores aprovados existem hoje. */
  moderatorCount: number;
  /** A partir deste número a punição por votação passa a existir. */
  minModeratorsForSanction: number;
  application: ModeratorApplicationView | null;
};
