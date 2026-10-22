/** Resposta do convite de supervisão: o link vale 7 dias e o e-mail foi enviado? */
export type ParentalInviteView = {
  status: "PENDING" | "ACTIVE" | "REJECTED" | "REVOKED";
  expiresAt: string;
  emailSent: boolean;
};
