import type { Conversation } from "@/types/application/message/conversation";

export type ConversationThreadProps = {
  /** A conversa aberta. É o que o dock usa para renderizar um filão por aba. */
  conversation: Conversation;
  /** Id de quem está vendo: decide o lado do balão e quem é "o outro" da conversa. */
  currentUserId: string | null;
  /** Voltar para a lista — só no mobile, onde a tela inteira troca de lista para filão. */
  onBack?: () => void;
};
