import type { ReactionUser } from "../feed/reaction-user";

export type ReactionsListResponse = {
  postId?: string;
  summary: Record<string, number>;
  reactions: ReactionUser[];
};
