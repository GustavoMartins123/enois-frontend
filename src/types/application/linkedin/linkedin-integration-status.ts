/** Estado da publicação automática no LinkedIn (GET/PUT /me/integrations/linkedin). */
export type LinkedInIntegrationStatus = {
  connected: boolean;
  postSync: boolean;
  /** O servidor consegue publicar: token presente, válido e com a chave de criptografia. */
  canPost: boolean;
  tokenExpiresAt: string | null;
  reason: "NOT_CONNECTED" | "SERVER_KEY_MISSING" | "TOKEN_EXPIRED" | null;
};
