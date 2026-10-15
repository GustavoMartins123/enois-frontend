export type LinkedProvider = {
  provider: string;
  email: string | null;
  linkedAt: string | null;
  /** Se existe outra forma de entrar (senha definida) — a tela usa para avisar antes de desvincular. */
  hasUsablePassword: boolean;
};