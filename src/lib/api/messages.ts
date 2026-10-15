import type { PageResponse } from "@/types/application/api/page-response";
import type { Conversation } from "@/types/application/message/conversation";
import type { CreateConversationInput } from "@/types/application/message/create-conversation-input";
import type { Message } from "@/types/application/message/message";

import { api, buildQuery } from "../api-client";

export const messagesApi = {
  listConversations: (cursor?: string | null, limit = 20) =>
    api.get<PageResponse<Conversation>>(`/conversations${buildQuery({ cursor, limit })}`),

  createConversation: (data: CreateConversationInput) =>
    api.post<Conversation>("/conversations", data),

  /** Abre (ou reaproveita) a conversa direta com um usuario — botao "Mensagem" do perfil. */
  openDirect: (userId: string) => api.post<Conversation>("/conversations/direct", { userId }),

  getConversation: (conversationId: string) =>
    api.get<Conversation>(`/conversations/${conversationId}`),

  listMessages: (conversationId: string, cursor?: string | null, limit = 50) =>
    api.get<PageResponse<Message>>(
      `/conversations/${conversationId}/messages${buildQuery({ cursor, limit })}`,
    ),

  sendMessage: (conversationId: string, text: string) =>
    api.post<Message>(`/conversations/${conversationId}/messages`, { text }),

  markAsRead: (conversationId: string) => api.post<void>(`/conversations/${conversationId}/read`),

  search: (q: string, limit = 20) =>
    api.get<PageResponse<Conversation>>(`/conversations/search${buildQuery({ q, limit })}`),
};
