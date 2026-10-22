/**
 * Intenção do usuário ao começar um login social.
 *
 * O backend precisa saber disso para recusar um cadastro cujo e-mail já tem conta,
 * em vez de simplesmente entrar na conta existente.
 */
export type OAuthMode = "login" | "signup";
