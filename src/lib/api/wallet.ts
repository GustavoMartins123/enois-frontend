import { api } from "../api-client";

/** Lançamento do extrato da faísca. */
export type WalletEntry = {
  amount: number;
  kind: string;
  message: string | null;
  createdAt: string;
};

export type Wallet = {
  /** Saldo em MILÉSIMOS de faísca (1 faísca = 1.000 mf). */
  balance: number;
  escala: number;
  cotacaoBrlCents: number;
  chave: string;
  entries: WalletEntry[];
};

/** A cotação de referência (mini bolsa): NÃO é câmbio — remuneração de criador. */
export type CoinQuote = {
  brlCents: number;
  escala: number;
  atualizadaEm: string;
  historico: { brlCents: number; em: string }[];
};

export const walletApi = {
  wallet: () => api.get<Wallet>("/carteira"),
  cotacao: (historico = 90) => api.get<CoinQuote>(`/coin/cotacao?historico=${historico}`),
  transfer: (toUsername: string, amount: number, message?: string) =>
    api.post<{ status: string; amount: number; toUsername: string }>("/carteira/transferencias", {
      toUsername,
      amount,
      message: message ?? null,
    }),
};
