/**
 * Cadastros abertos?
 *
 * A criação de contas foi fechada durante o ataque de contas falsas (2026-10-20). O ataque passou
 * e o cadastro foi reaberto com as defesas que ficaram: captcha no signup, honeypot, data de
 * nascimento (ECA) e o painel de contas suspeitas.
 *
 * Para reabrir: `true` aqui e `rede.auth.signup-enabled=true` no backend (perfil qa/prd).
 */
export const SIGNUP_OPEN = true;
