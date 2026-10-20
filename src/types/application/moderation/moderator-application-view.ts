export type ModeratorApplicationView = {
  id: string;
  userId: string;
  username: string | null;
  name: string | null;
  motivation: string;
  experience: string | null;
  availability: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
  createdAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
};
