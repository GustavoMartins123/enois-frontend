/**
 * Resultado do cadastro. A conta nasce pendente de confirmação de e-mail: o backend não emite
 * sessão aqui, então a tela mostra "confirme seu e-mail" em vez de entrar direto.
 */
export type SignupResult = {
  email: string;
  verificationRequired: boolean;
  /** false quando o envio falhou — a tela oferece reenviar. */
  emailSent: boolean;
};