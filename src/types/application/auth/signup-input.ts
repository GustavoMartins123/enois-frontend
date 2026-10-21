import type { LoginInput } from "./login-input";

export type SignupInput = LoginInput & {
  name: string;
  /** Data de nascimento em ISO (aaaa-mm-dd); o backend valida o mínimo de 18 anos. */
  birthDate: string;
  /** Aceite dos termos de uso e confirmacao de idade minima (18+). */
  acceptedTerms: boolean;
  /** Honeypot — nunca preenchido por humanos. */
  website?: string;
  /** Turnstile/Cloudflare (quando configurado no backend). */
  turnstileToken?: string;
  /** Desafio próprio do backend (fallback sem Turnstile). */
  challengeId?: string;
  challengeAnswer?: number;
};
