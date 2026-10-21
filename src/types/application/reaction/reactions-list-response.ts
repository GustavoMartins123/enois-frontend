import type { ReactionUser } from "../feed/reaction-user";
import type { ReactionSummary } from "./reaction-summary";

export type ReactionsListResponse = {
  postId?: string;
  summary: ReactionSummary;
  reactions: ReactionUser[];
};
