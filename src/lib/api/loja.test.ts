import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "../api-client";
import { lojaApi } from "./loja";

vi.mock("../api-client", () => ({ api: { get: vi.fn(), post: vi.fn() } }));

const oldest = {
  id: "moldura-ambar",
  name: "Âmbar",
  description: "",
  priceMf: 2000,
  cssRing: "",
  releaseOrder: 1,
};
const newest = { ...oldest, id: "moldura-galaxia", name: "Galáxia", releaseOrder: 18 };

describe("Contrato de ordenação da loja", () => {
  beforeEach(() => vi.resetAllMocks());

  it("solicita as mais antigas por padrão e mantém a resposta da API", async () => {
    vi.mocked(api.get).mockResolvedValue([oldest, newest]);
    expect(await lojaApi.catalog()).toEqual([oldest, newest]);
    expect(api.get).toHaveBeenCalledWith("/loja?order=oldest");
  });

  it("solicita as mais novas e mantém a resposta da API", async () => {
    vi.mocked(api.get).mockResolvedValue([newest, oldest]);
    expect(await lojaApi.catalog("newest")).toEqual([newest, oldest]);
    expect(api.get).toHaveBeenCalledWith("/loja?order=newest");
  });

  it("recusa o contrato antigo sem sequência de lançamento", async () => {
    const { releaseOrder, ...legacy } = oldest;
    vi.mocked(api.get).mockResolvedValue([legacy]);
    await expect(lojaApi.catalog()).rejects.toThrow();
  });

  it.each(["oldest", "newest"] as const)(
    "recusa a resposta fora da ordem %s, sem reordenar localmente",
    async (order) => {
      vi.mocked(api.get).mockResolvedValue(
        order === "oldest" ? [newest, oldest] : [oldest, newest],
      );
      await expect(lojaApi.catalog(order)).rejects.toThrow(
        "O catálogo não respeitou a ordenação solicitada.",
      );
    },
  );

  it("recusa sequências de lançamento duplicadas", async () => {
    vi.mocked(api.get).mockResolvedValue([oldest, { ...newest, releaseOrder: 1 }]);
    await expect(lojaApi.catalog()).rejects.toThrow();
  });

  it("recusa itens duplicados mesmo com sequências diferentes", async () => {
    vi.mocked(api.get).mockResolvedValue([oldest, { ...newest, id: oldest.id }]);
    await expect(lojaApi.catalog()).rejects.toThrow();
  });

  it("propaga a falha da API", async () => {
    const failure = new Error("Catálogo indisponível");
    vi.mocked(api.get).mockRejectedValue(failure);
    await expect(lojaApi.catalog()).rejects.toBe(failure);
  });
});
