/**
 * Cadastros abertos?
 *
 * Cadastros abertos (2026-10-21), com captcha e confirmação de e-mail ANTES de a conta existir:
 * o backend guarda o cadastro em `pending_signups` e só cria a conta quando o link é usado.
 * Fechar de novo: `false` aqui e `REDE_AUTH_SIGNUP_ENABLED=false` no backend — os CTAs somem e
 * `/entrar` abre com o aviso de cadastros fechados.
 */
export const SIGNUP_OPEN = true;
