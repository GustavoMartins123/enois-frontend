export type CommunityStats = {
  /** Usuários que usaram a plataforma na janela (sessão viva ou conteúdo publicado). */
  activeUsers: number;
  /** Total de contas na plataforma. */
  totalUsers: number;
  /** Tamanho da janela de atividade, em dias. */
  windowDays: number;
  /** Quando o número foi calculado (pode estar alguns minutos atrás: vem de cache). */
  computedAt: string;
};
