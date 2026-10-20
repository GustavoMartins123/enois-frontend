export type ModeratorPanelReportView = {
  reportId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  createdAt: string;
  reporter: string;
  authorId: string | null;
  author: string | null;
  content: string | null;
  punishVotes: number;
  dismissVotes: number;
  myVote: "PUNISH" | "DISMISS" | null;
  quorum: number;
};
