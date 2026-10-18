/** Evento do Chrome/Edge/Android que libera o prompt nativo de instalação do PWA. */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
