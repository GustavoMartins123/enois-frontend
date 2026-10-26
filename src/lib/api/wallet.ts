import type { CoinDisputeView } from "@/types/application/wallet/coin-dispute-view";
import type { CoinQuote } from "@/types/application/wallet/coin-quote";
import type { Wallet } from "@/types/application/wallet/wallet";
import type { WalletExtract } from "@/types/application/wallet/wallet-extract";
import type { WalletExtractQuery } from "@/types/application/wallet/wallet-extract-query";
import { z } from "zod";

import { api } from "../api-client";

const extractSchema = z.object({
  entries: z.array(
    z.object({
      amount: z.number().int(),
      kind: z.enum([
        "AIRDROP",
        "GENESIS_TREASURY",
        "TRANSFER_OUT",
        "TRANSFER_IN",
        "REWARD",
        "PURCHASE",
        "SALE",
        "REFUND",
        "ADJUSTMENT",
        "ESCROW_OUT",
        "ESCROW_HOLD",
        "ESCROW_RELEASE",
        "ESCROW_IN",
        "REFUND_IN",
        "FEE_IN",
        "REVERSAL_OUT",
        "REVERSAL_IN",
      ]),
      message: z.string().nullable(),
      refId: z.string().nullable(),
      createdAt: z.iso.datetime({ offset: true }),
    }),
  ),
  page: z.number().int().min(0).max(10_000),
  size: z.number().int().min(1).max(100),
  hasNext: z.boolean(),
});

export const walletApi = {
  wallet: () => api.get<Wallet>("/carteira"),
  extract: async (params: WalletExtractQuery): Promise<WalletExtract> => {
    const query = new URLSearchParams();
    query.set("page", String(params.page));
    query.set("size", String(params.size));
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    const result = extractSchema.parse(
      await api.get<unknown>(`/carteira/extrato?${query.toString()}`),
    );
    if (
      result.page !== params.page ||
      result.size !== params.size ||
      result.entries.length > result.size ||
      (result.hasNext && result.entries.length !== result.size)
    ) {
      throw new Error("A resposta do extrato não corresponde à página solicitada.");
    }
    return result;
  },
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
