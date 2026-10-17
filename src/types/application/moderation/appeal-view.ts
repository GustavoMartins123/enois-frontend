/** Recurso de sancao (GET /me/sanctions e fila do admin). */
export type AppealView = {
  id: string;
  sanctionId: string;
  userId: string;
  message: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  createdAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
};
