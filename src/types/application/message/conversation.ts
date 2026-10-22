export type Conversation = {
  id: string;
  kind: "DIRECT" | "GROUP" | "JOB" | "SERVICE";
  title: string | null;
  participantIds: string[];
  lastMessage: string | null;
  time: string | null;
  unread: number;
};
