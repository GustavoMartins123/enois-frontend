import type { SanctionProposalVoteView } from "./sanction-proposal-vote-view";

/** Proposta de punição aberta por moderadores (GET /moderation/sanction-proposals). */
export type SanctionProposalView = {
  id: string;
  targetUserId: string;
  targetUsername: string;
  targetName: string | null;
  type: "RESTRICTION" | "BAN";
  reason: string;
  proposerId: string;
  proposer: string | null;
  proposerName: string | null;
  status: "PENDING" | "APPLIED" | "REJECTED" | "CANCELLED";
  requiredVotes: number;
  moderatorCount: number;
  approveVotes: number;
  rejectVotes: number;
  myVote: "APPROVE" | "REJECT" | null;
  createdAt: string;
  decidedAt: string | null;
  votes: SanctionProposalVoteView[];
};
