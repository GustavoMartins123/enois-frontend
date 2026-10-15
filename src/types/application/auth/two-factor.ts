export type TwoFactorMethod = "TOTP" | "EMAIL";

/** Estado do segundo fator e da verificação da conta (tela de segurança). */
export type TwoFactorStatus = {
  emailVerified: boolean;
  totpEnabled: boolean;
  emailOtpEnabled: boolean;
  /** Segundo fator garantido pelo provedor (Google/Apple) — veio do vínculo, não foi ativado aqui. */
  providerSecondFactor: boolean;
  twoFactorEnabled: boolean;
  identityVerified: boolean;
  backupCodesLeft: number;
  /** false quando a instalação não tem a chave de cifra configurada (não oferecemos o caminho). */
  totpAvailable: boolean;
};

/** Desafio devolvido pelo login quando a conta tem segundo fator. */
export type TwoFactorChallenge = {
  twoFactorRequired: true;
  challengeId: string;
  method: TwoFactorMethod;
  expiresAt: string;
};

/** Setup do aplicativo authenticator: segredo (digitado no app) + URI otpauth. */
export type TotpSetup = {
  secret: string;
  otpauthUri: string;
};

export type TwoFactorEnableResult = {
  status: string;
  /** Códigos de recuperação — mostrados uma única vez. */
  backupCodes: string[];
};