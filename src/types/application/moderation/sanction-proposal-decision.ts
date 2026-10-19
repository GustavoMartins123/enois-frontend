export type SanctionProposalDecision = {
  approveVotes: number;
  rejectVotes: number;
  requiredVotes: number;
  myVote: "APPROVE" | "REJECT";
  status: "PENDING" | "APPLIED" | "REJECTED";
  decision: "PENDING" | "APPLIED" | "REJECTED";
  message: string;
};
