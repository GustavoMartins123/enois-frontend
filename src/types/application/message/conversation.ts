export type Conversation = {
  id: string;
  kind: "DIRECT" | "GROUP" | "JOB";
  title: string | null;
  participantIds: string[];
  lastMessage: string | null;
  time: string | null;
  unread: number;
};
