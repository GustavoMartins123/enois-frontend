import type { EmailLogView } from "@/types/application/moderation/email-log-view";
import type { GameReviewView } from "@/types/application/moderation/game-review-view";
import type { ModeratorApplicationView } from "@/types/application/moderation/moderator-application-view";
import type { ModeratorMeView } from "@/types/application/moderation/moderator-me-view";
import type { ModeratorPanelReportView } from "@/types/application/moderation/moderator-panel-report-view";
import type { ModeratorSanctionResult } from "@/types/application/moderation/moderator-sanction-result";
import type { ModeratorVoteResult } from "@/types/application/moderation/moderator-vote-result";

import { api } from "../api-client";

/**
 * Candidatura a moderador e painel de votação.
 *
 * As rotas de admin exigem o papel de admin (allowlist de e-mail/username no backend); as de
 * moderação exigem candidatura aprovada. O front não decide nada: só mostra o que a API libera.
 */
export const moderationApi = {
  me: () => api.get<ModeratorMeView>("/moderation/me"),

  apply: (data: { motivation: string; experience?: string; availability?: string }) =>
    api.post<ModeratorApplicationView>("/moderation/applications", data),

  reports: (limit = 20) =>
    api.get<ModeratorPanelReportView[]>(`/moderation/reports?limit=${limit}`),

  vote: (reportId: string, vote: "PUNISH" | "DISMISS", note?: string) =>
    api.post<ModeratorVoteResult>(`/moderation/reports/${reportId}/vote`, { vote, note }),

  applications: (status = "PENDING", limit = 50) =>
    api.get<ModeratorApplicationView[]>(
      `/admin/moderator-applications?status=${status}&limit=${limit}`,
    ),

  approveApplication: (applicationId: string, note?: string) =>
    api.post<ModeratorApplicationView>(`/admin/moderator-applications/${applicationId}/approve`, {
      note,
    }),

  rejectApplication: (applicationId: string, note: string) =>
    api.post<ModeratorApplicationView>(`/admin/moderator-applications/${applicationId}/reject`, {
      note,
    }),

  revoke: (userId: string, note?: string) =>
    api.post<ModeratorApplicationView>(`/admin/moderators/${userId}/revoke`, { note }),

  sanctionUser: (username: string, type: "RESTRICTION" | "BAN", reason: string) =>
    api.post<ModeratorSanctionResult>(`/admin/users/${encodeURIComponent(username)}/sanction`, {
      type,
      reason,
    }),

  /** Fila de jogos enviados pela comunidade (moderador ou admin). */
  games: (limit = 30) => api.get<GameReviewView[]>(`/moderation/games?limit=${limit}`),

  approveGame: (gameId: string, note?: string) =>
    api.post<{ id: string; status: string }>(`/moderation/games/${gameId}/approve`, { note }),

  rejectGame: (gameId: string, note: string) =>
    api.post<{ id: string; status: string }>(`/moderation/games/${gameId}/reject`, { note }),

  /** Metadados dos e-mails enviados (admin). O corpo não é armazenado. */
  emails: (limit = 50) => api.get<EmailLogView[]>(`/admin/emails?limit=${limit}`),
};
