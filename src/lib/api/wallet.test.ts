import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "../api-client";
import { walletApi } from "./wallet";

vi.mock("../api-client", () => ({ api: { get: vi.fn() } }));

const query = { page: 0, size: 20 };
const response = { entries: [], page: 0, size: 20, hasNext: false };

describe("Contrato do extrato", () => {
  beforeEach(() => vi.resetAllMocks());

  it("solicita somente a página e os filtros informados", async () => {
    vi.mocked(api.get).mockResolvedValue(response);
    expect(await walletApi.extract({ ...query, from: "2026-10-01" })).toEqual(response);
    expect(api.get).toHaveBeenCalledExactlyOnceWith(
      "/carteira/extrato?page=0&size=20&from=2026-10-01",
    );
  });

  it("recusa resposta sem os campos do contrato", async () => {
    vi.mocked(api.get).mockResolvedValue({ entries: [] });
    await expect(walletApi.extract(query)).rejects.toThrow();
  });

  it("recusa página diferente da solicitada", async () => {
    vi.mocked(api.get).mockResolvedValue({ ...response, page: 1 });
    await expect(walletApi.extract(query)).rejects.toThrow("não corresponde");
  });

  it("recusa indicação de próxima página com página incompleta", async () => {
    vi.mocked(api.get).mockResolvedValue({ ...response, hasNext: true });
    await expect(walletApi.extract(query)).rejects.toThrow("não corresponde");
  });

  it("propaga falha da API sem buscar outra rota", async () => {
    const error = new Error("Serviço indisponível");
    vi.mocked(api.get).mockRejectedValue(error);
    await expect(walletApi.extract(query)).rejects.toBe(error);
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});
