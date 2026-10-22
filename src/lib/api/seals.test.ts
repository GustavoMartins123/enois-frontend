import { afterEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();

vi.mock("../api-client", () => ({
  api: { get: (path: string): unknown => get(path) },
  buildQuery: (params: Record<string, string>): string => `?ids=${params.ids}`,
}));

const { sealsApi } = await import("./seals");

const sealsOf = (id: string): { seals: { seal: string; count: number }[]; mySeals: string[] } => ({
  seals: [{ seal: "TIP", count: id.length }],
  mySeals: [],
});

describe("sealsApi.forPost", () => {
  afterEach(() => get.mockReset());

  it("turns the cards of one render into a single batched request", async () => {
    get.mockImplementation(async (path: string): Promise<Record<string, unknown>> => {
      const ids = path.split("ids=")[1]?.split(",") ?? [];
      return Object.fromEntries(
        ids.filter((id): boolean => id !== "p3").map((id) => [id, sealsOf(id)]),
      );
    });

    const results = await Promise.all(["p1", "p22", "p3", "p1"].map((id) => sealsApi.forPost(id)));

    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith("/feed/posts/seals?ids=p1,p22,p3");
    expect(results[0]).toEqual(sealsOf("p1"));
    expect(results[1]).toEqual(sealsOf("p22"));
    // A post the backend did not return resolves to empty, and duplicates share the answer.
    expect(results[2]).toEqual({ seals: [], mySeals: [] });
    expect(results[3]).toEqual(results[0]);
  });

  it("splits more than 100 ids into chunks the backend accepts", async () => {
    get.mockResolvedValue({});
    const ids = Array.from({ length: 150 }, (_, index): string => `post_${index}`);

    await Promise.all(ids.map((id) => sealsApi.forPost(id)));

    expect(get).toHaveBeenCalledTimes(2);
  });

  it("rejects every waiter of a chunk when the request fails", async () => {
    get.mockRejectedValue(new Error("boom"));

    await expect(sealsApi.forPost("p9")).rejects.toThrow("boom");
  });
});
