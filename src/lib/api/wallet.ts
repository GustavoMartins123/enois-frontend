import { api } from "../api-client";

/** Lançamento do extrato da faísca. */
export type WalletEntry = {
  amount: number;
  kind: string;
  message: string | null;
  createdAt: string;
};

export type Wallet = {
  balance: number;
  chave: string;
  entries: WalletEntry[];
};

export const walletApi = {
  wallet: () => api.get<Wallet>("/carteira"),
  transfer: (toUsername: string, amount: number, message?: string) =>
    api.post<{ status: string; amount: number; toUsername: string }>("/carteira/transferencias", {
      toUsername,
      amount,
      message: message ?? null,
    }),
};
