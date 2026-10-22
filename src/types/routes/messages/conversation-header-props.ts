import type { ReactNode } from "react";

import type { Conversation } from "@/types/application/message/conversation";

export type ConversationHeaderProps = {
  conversation: Pick<Conversation, "title" | "participantIds">;
  onBack?: () => void;
  /** Ação da tela à direita do nome (hoje: "Selecionar" mensagens). */
  action?: ReactNode;
};
