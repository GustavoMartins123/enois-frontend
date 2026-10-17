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
  /** Capa em HTML/CSS sanitizado (igual à do perfil); nulo = usa a foto da capa. */
  bannerHtml?: string | null;
};
