export type ApiUseCase = {
  id: string;
  title: string;
  description: string;
  /** Passos em curl (ou nota curta) — a sequencia executa de ponta a ponta. */
  steps: { note: string; code?: string }[];
};
