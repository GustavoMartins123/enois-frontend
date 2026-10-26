// @vitest-environment jsdom
import { act } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { texts } from "@/texts";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { walletApi } from "@/lib/api";

import { WalletHistory } from "./wallet-history";

vi.mock("@/lib/api", () => ({ walletApi: { extract: vi.fn() } }));

const entries = (start: number, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    amount: -1_000,
    kind: "PURCHASE",
    message: `Compra de demonstração ${start + index}`,
    refId: `compra-${start + index}`,
    createdAt: "2026-10-20T15:00:00Z",
  }));

describe("Extrato da carteira", () => {
  let host: HTMLDivElement;
  let root: Root;
  let client: QueryClient;
  const onContest = vi.fn();

  async function flush() {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }

  async function settle() {
    await flush();
    await flush();
  }

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.resetAllMocks();
    vi.mocked(walletApi.extract).mockImplementation(async ({ page, size, from, to }) => ({
      entries: from || to ? entries(100, 1) : entries(page * 20, page === 0 ? 20 : 2),
      page,
      size,
      hasNext: !from && !to && page === 0,
    }));
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <WalletHistory onContest={onContest} />
        </QueryClientProvider>,
      ),
    );
    await settle();
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    client.clear();
    host.remove();
    vi.unstubAllGlobals();
  });

  function button(label: string) {
    return [...host.querySelectorAll("button")].find((element) => element.textContent === label)!;
  }

  async function click(label: string) {
    await act(async () => button(label).click());
    await settle();
  }

  async function changeDate(index: number, value: string) {
    const input = host.querySelectorAll("input")[index];
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  it("busca páginas no servidor e respeita o fim do extrato", async () => {
    expect(host.querySelectorAll(".wallet-history-list li")).toHaveLength(20);
    expect(button(texts.wallet.historyPrevious).disabled).toBe(true);
    await click(texts.wallet.historyNext);
    expect(walletApi.extract).toHaveBeenLastCalledWith({ page: 1, size: 20, from: "", to: "" });
    expect(host.querySelectorAll(".wallet-history-list li")).toHaveLength(2);
    expect(host.textContent).toContain(texts.wallet.historyPage(2));
    expect(button(texts.wallet.historyNext).disabled).toBe(true);
    await click(texts.wallet.historyPrevious);
    expect(host.querySelectorAll(".wallet-history-list li")).toHaveLength(20);
  });

  it("aplica datas somente ao filtrar e volta à primeira página", async () => {
    await click(texts.wallet.historyNext);
    const calls = vi.mocked(walletApi.extract).mock.calls.length;
    await changeDate(0, "2026-10-01");
    await changeDate(1, "2026-10-20");
    expect(walletApi.extract).toHaveBeenCalledTimes(calls);
    await click(texts.wallet.historyApply);
    expect(walletApi.extract).toHaveBeenLastCalledWith({
      page: 0,
      size: 20,
      from: "2026-10-01",
      to: "2026-10-20",
    });
    expect(host.textContent).toContain(texts.wallet.historyPage(1));
    expect(host.querySelectorAll(".wallet-history-list li")).toHaveLength(1);
  });

  it("aceita somente data final e limpa o período e a página", async () => {
    await changeDate(1, "2026-10-20");
    await click(texts.wallet.historyApply);
    expect(walletApi.extract).toHaveBeenLastCalledWith({
      page: 0,
      size: 20,
      from: "",
      to: "2026-10-20",
    });
    await click(texts.wallet.historyClear);
    expect([...host.querySelectorAll("input")].map((input) => input.value)).toEqual(["", ""]);
    expect(host.querySelectorAll(".wallet-history-list li")).toHaveLength(20);
    expect(host.textContent).toContain(texts.wallet.historyPage(1));
  });

  it("recusa período invertido e mantém a consulta aplicada", async () => {
    await changeDate(0, "2026-10-20");
    await changeDate(1, "2026-10-01");
    expect(host.querySelector('[role="alert"]')?.textContent).toBe(texts.wallet.historyInvalid);
    expect(button(texts.wallet.historyApply).disabled).toBe(true);
    await act(async () => {
      host
        .querySelector("form")!
        .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    expect(walletApi.extract).toHaveBeenCalledTimes(1);
    expect(host.querySelectorAll(".wallet-history-list li")).toHaveLength(20);
  });

  it("exibe erro de leitura sem apresentar um extrato vazio e permite tentar novamente", async () => {
    vi.mocked(walletApi.extract).mockRejectedValueOnce(new Error("Falha de leitura"));
    await click(texts.wallet.historyNext);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      texts.wallet.historyLoadError,
    );
    expect(host.textContent).not.toContain(texts.wallet.historyEmpty);
    expect(host.querySelector(".wallet-history-list")).toBeNull();
    await click(texts.common.retry);
    expect(host.querySelectorAll(".wallet-history-list li")).toHaveLength(2);
  });

  it("diferencia um período sem resultado de uma carteira sem movimentações", async () => {
    vi.mocked(walletApi.extract).mockImplementationOnce(async ({ page, size }) => ({
      entries: [],
      page,
      size,
      hasNext: false,
    }));
    await changeDate(0, "2025-01-01");
    await click(texts.wallet.historyApply);
    expect(host.textContent).toContain(texts.wallet.historyPeriodEmpty);
    expect(button(texts.wallet.historyNext).disabled).toBe(true);
  });

  it("mantém a referência da transferência ao abrir a contestação", async () => {
    await act(async () =>
      client.setQueryData(["carteira-extrato", 0, "", ""], {
        entries: [{ ...entries(0, 1)[0], kind: "TRANSFER_OUT", refId: "transferencia-demo" }],
        page: 0,
        size: 20,
        hasNext: false,
      }),
    );
    await settle();
    await click(texts.wallet.contest);
    expect(onContest).toHaveBeenCalledWith("transferencia-demo");
  });
});
