/**
 * Cadastros abertos?
 *
 * A pedido da Mel (2026-10-20), a criação de contas foi fechada por tempo indeterminado: o
 * backend recusa `POST /auth/signup` (403 SIGNUP_DISABLED) e o login por provedor não cria conta
 * nova — só entra em conta existente. No front, os botões de "Criar conta" somem e `/entrar`
 * abre em modo login com o aviso de cadastros fechados.
 *
 * Para reabrir: `true` aqui e `rede.auth.signup-enabled=true` no backend (perfil qa/prd).
 */
export const SIGNUP_OPEN = false;
