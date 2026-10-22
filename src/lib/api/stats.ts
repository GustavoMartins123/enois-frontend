import type { CommunityStats } from "@/types/application/stats/community-stats";

import { api } from "../api-client";

/**
 * Números públicos da comunidade (contador da landing). Não pede sessão: quem ainda não entrou
 * também vê o número, e ele é agregado — não identifica ninguém.
 */
export const statsApi = {
  community: () => api.get<CommunityStats>("/stats/community"),
};
