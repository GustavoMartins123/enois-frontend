export type ChangeEmailInput = {
  email: string;
  /** Confirmação de identidade exigida pelo backend para trocar o e-mail. */
  password: string;
};
