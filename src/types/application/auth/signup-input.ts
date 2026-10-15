import type { LoginInput } from "./login-input";

export type SignupInput = LoginInput & {
  name: string;
  /** Aceite dos termos de uso e confirmacao de idade minima (18+). */
  acceptedTerms: boolean;
};
