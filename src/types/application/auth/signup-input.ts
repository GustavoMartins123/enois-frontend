import type { LoginInput } from "./login-input";

export type SignupInput = LoginInput & {
  name: string;
  /** Data de nascimento em ISO (aaaa-mm-dd) — exigida pelo backend (ECA Digital), que recalcula a idade. */
  birthDate: string;
  /** Aceite dos termos de uso e confirmacao de idade minima (18+). */
  acceptedTerms: boolean;
  /** Data de nascimento em ISO (aaaa-mm-dd) — exigida pelo backend (ECA Digital). */
  birthDate?: string;
  /** Honeypot — nunca preenchido por humanos. */
  website?: string;
  /** Turnstile/Cloudflare (quando configurado no backend). */
  turnstileToken?: string;
  /** Desafio próprio do backend (fallback sem Turnstile). */
  challengeId?: string;
  challengeAnswer?: number;
};
