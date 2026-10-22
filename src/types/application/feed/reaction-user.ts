import type { ReactionType } from "@/types/application/reaction/reaction-type";

export type ReactionUser = {
  userId: string;
  type: ReactionType;
  createdAt: string;
};
