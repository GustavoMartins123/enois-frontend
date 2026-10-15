import type { PostCommunity } from "@/types/application/community/post-community";
import type { ReactionType } from "@/types/application/reaction/reaction-type";

export type PostView = {
  id: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string | null;
  type: "INSIGHT" | "ARTICLE" | "QUESTION" | "PROJECT" | "OPPORTUNITY";
  content: string;
  tags: string[];
  mediaIds: string[];
  createdAt: string;
  visibility: "PUBLIC" | "CONNECTIONS" | "MENTORS";
  counters: {
    reactions: number;
    comments: number;
    saves: number;
    shares: number;
  };
  status: "ACTIVE" | "DELETED";
  currentUserReaction?: ReactionType | null;
  /** Comunidade do post, quando publicado numa comunidade. */
  communityId?: string | null;
  community?: PostCommunity | null;
  /** Quando o autor editou o post (nulo se nunca editado). */
  editedAt?: string | null;
};
