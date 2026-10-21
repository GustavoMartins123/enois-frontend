import { api } from "../api-client";

/** Lançamento do extrato da faísca. */
export type WalletEntry = {
  amount: number;
  kind: string;
  message: string | null;
  /** O identificador da transação (a contestação fala por ele). */
  refId: string | null;
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

/** Uma contestação de transferência na fila de moderação. */
export type CoinDisputeView = {
  id: string;
  entryRef: string;
  amount: number;
  reason: string;
  state: "OPEN" | "UPHELD" | "REJECTED";
  createdAt: string;
  reviewNote?: string;
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
  /** A vítima contesta uma transferência (golpe) — vai para a fila de moderação. */
  contestar: (refId: string, reason: string, description: string) =>
    api.post<{ id: string; state: string }>(`/carteira/transacoes/${refId}/contestar`, {
      reason,
      description,
    }),
  /** A fila das contestações (admin). */
  disputasPendentes: (limit = 30) =>
    api.get<CoinDisputeView[]>(`/admin/carteira/disputas?limit=${limit}`),
  /** Contestação VERDADEIRA: reverte a transferência e restringe o golpista. */
  deferirDisputa: (id: string, note?: string) =>
    api.post<{ id: string; state: string }>(`/admin/carteira/disputas/${id}/deferir`, {
      note: note ?? null,
    }),
  /** Contestação FALSA: quem contestou é restringido. */
  rejeitarDisputa: (id: string, note?: string) =>
    api.post<{ id: string; state: string }>(`/admin/carteira/disputas/${id}/rejeitar`, {
      note: note ?? null,
    }),
  transfer: (toUsername: string, amount: number, message?: string) =>
    api.post<{ status: string; amount: number; toUsername: string }>("/carteira/transferencias", {
      toUsername,
      amount,
      message: message ?? null,
    }),
};
