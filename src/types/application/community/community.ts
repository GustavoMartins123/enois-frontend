import type { CommunityTopic } from "./community-topic";

export type Community = {
  id: string;
  name: string;
  description: string;
  topic: CommunityTopic;
  members: number;
  joined: boolean;
  cover: string | null;
  avatar: string | null;
};
