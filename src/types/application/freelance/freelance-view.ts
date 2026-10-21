export type FreelanceView = {
  id: string;
  userId: string;
  username: string | null;
  title: string;
  scope: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  owned: boolean;
};

export type FreelancePage = {
  items: FreelanceView[];
  nextCursor: string | null;
};
