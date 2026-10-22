export type CreateFreelanceInput = {
  title: string;
  scope: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  paymentMethod: "CASH" | "FAISCAS";
};
