/** Canal privado de uma comunidade (visível só para membros). */
export type CommunityChannel = {
  id: string;
  name: string;
  slug: string;
  topic: string | null;
  description: string | null;
  createdAt: string;
};
