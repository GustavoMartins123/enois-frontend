export type AuthUser = {
  id: string;
  username: string;
  name: string;
  headline: string;
  email: string;
  /** E-mail confirmado pelo link. */
  emailVerified: boolean;
  /** Segundo fator ativo (aplicativo authenticator ou código por e-mail). */
  twoFactorEnabled: boolean;
  /** Conta verificada: e-mail confirmado ou segundo fator ativo — é o que sustenta a reputação. */
  identityVerified: boolean;
};
