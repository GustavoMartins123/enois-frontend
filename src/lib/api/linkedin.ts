import type { LinkedInIntegrationStatus } from "@/types/application/linkedin/linkedin-integration-status";

import { api } from "../api-client";

/**
 * Publicação das publicações do Énóis no LinkedIn.
 *
 * O token do LinkedIn fica no servidor (cifrado); o front só vê o estado e liga/desliga a
 * preferência. Quem publica é o handler do outbox, depois do commit da publicação.
 */
export const linkedInIntegrationApi = {
  status: () => api.get<LinkedInIntegrationStatus>("/me/integrations/linkedin"),
  setPostSync: (postSync: boolean) =>
    api.put<LinkedInIntegrationStatus>("/me/integrations/linkedin", { postSync }),
};
