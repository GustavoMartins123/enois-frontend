export type SanctionProposalVoteView = {
  moderatorId: string;
  username: string | null;
  name: string | null;
  vote: "APPROVE" | "REJECT";
  note: string | null;
  createdAt: string;
};
