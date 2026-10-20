import type { CommunityTopic } from "./community-topic";

export type Community = {
  id: string;
  name: string;
  /** Opcional: uma comunidade pode nascer só com o nome e ganhar descrição depois. */
  description: string | null;
  topic: CommunityTopic;
  members: number;
  joined: boolean;
  cover: string | null;
  avatar: string | null;
  /** Capa em HTML/CSS sanitizado (igual à do perfil); nulo = usa a foto da capa. */
  bannerHtml?: string | null;
};
