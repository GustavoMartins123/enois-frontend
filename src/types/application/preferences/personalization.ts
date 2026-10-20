/** Os três controles de personalização da conta (GET/PUT /me/preferences). */
export type Personalization = {
  likedTopics: string[];
  blockedTopics: string[];
  disabledModules: string[];
};
