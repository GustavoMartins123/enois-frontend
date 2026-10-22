import type { SupportRequestView } from "./support-request-view";

/** Visão do painel: além do ticket, a issue espelhada no repositório privado do suporte. */
export type SupportAdminView = SupportRequestView & {
  githubIssueNumber: number | null;
  githubIssueUrl: string | null;
};
