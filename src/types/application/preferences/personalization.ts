/** Os três controles de personalização da conta (GET/PUT /me/preferences). */
export type Personalization = {
  likedTopics: string[];
  blockedTopics: string[];
  disabledModules: string[];
  /** Lembrete de descanso entre 00:00 e 04:59 no relógio do aparelho. */
  nightRestReminder: boolean;
};
