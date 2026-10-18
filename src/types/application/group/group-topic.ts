/** Tópico interno do grupo — só quem é membro vê. */
export type GroupTopic = {
  id: string;
  groupId: string;
  name: string;
  description: string | null;
  position: number;
  status: "OPEN" | "ARCHIVED";
  createdAt: string;
};
