export type ModeratorVoteResult = {
  punishVotes: number;
  dismissVotes: number;
  myVote: "PUNISH" | "DISMISS";
  reportStatus: string;
  decision: "PENDING" | "PENALIZED" | "DISMISSED" | "NEEDS_ADMIN";
  message: string;
  quorum: number;
};
