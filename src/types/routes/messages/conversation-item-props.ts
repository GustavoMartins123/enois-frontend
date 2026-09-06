import type { Conversation } from "@/types/application/message/conversation";

export type ConversationItemProps = {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
};
