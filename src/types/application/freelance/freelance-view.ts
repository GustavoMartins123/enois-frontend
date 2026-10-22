export type FreelanceView = {
  id: string;
  userId: string;
  username: string | null;
  title: string;
  scope: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  paymentMethod: "CASH" | "FAISCAS";
  status: "OPEN" | "CLOSED";
  createdAt: string;
  owned: boolean;
};
