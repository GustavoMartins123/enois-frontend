import { create } from "zustand";

export const useMessagesStore = create((set) => ({
  activeConversationId: null as string | null,
  setActiveConversationId: (activeConversationId: string | null) => set({ activeConversationId }),
  clearActiveConversation: () => set({ activeConversationId: null }),
}));
