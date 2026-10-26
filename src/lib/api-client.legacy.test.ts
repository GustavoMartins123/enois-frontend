// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./auth-hint", () => ({ clearAuthHint: vi.fn(), setAuthHint: vi.fn() }));
vi.mock("./query-client", () => ({ resetSessionScopedData: vi.fn() }));
vi.mock("./device-id", () => ({ getDeviceId: () => null }));

/**
 * Sessions opened before the cookie migration still have their tokens in localStorage. On load
 * the client trades the old refresh token for the cookies ONCE, keeping the person in the
 * logged-in shell while it runs, and deletes the token keys once the API settled the trade.
 */
describe("one-time move off localStorage tokens", () => {
  let values: Map<string, string>;
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    values = new Map([
      ["session_token", "legacy-access"],
      ["refresh_token", "legacy-refresh"],
    ]);
    vi.stubGlobal("window", { location: { href: "/feed" }, addEventListener: vi.fn() });
    vi.stubGlobal("document", { addEventListener: vi.fn() });
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("stays logged in during and after a successful exchange, without a reload", async () => {
    let answer!: (response: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise<Response>((resolve) => (answer = resolve)));
    fetchMock.mockResolvedValueOnce(Response.json({ id: "x" }));

    const { api } = await import("./api-client");
    const { hasSessionFlag } = await import("./session");
    // Logged-in shell from the first render, while the exchange is still in flight.
    expect(hasSessionFlag()).toBe(true);

    answer(
      Response.json({
        expiresAt: "2099-01-01T00:00:00Z",
        refreshExpiresAt: "2099-02-01T00:00:00Z",
      }),
    );
    await vi.waitFor(() => expect(values.has("refresh_token")).toBe(false));

    expect(hasSessionFlag()).toBe(true);
    expect(values.has("session_token")).toBe(false);
    expect(values.get("session_expires_at")).toBe("2099-01-01T00:00:00Z");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/refresh");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      credentials: "include",
      body: JSON.stringify({ refreshToken: "legacy-refresh" }),
    });
    await expect(api.get("/recurso")).resolves.toEqual({ id: "x" });
  });

  it("a 401 during the exchange waits for it instead of ending the session", async () => {
    let answer!: (response: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise<Response>((resolve) => (answer = resolve)));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    fetchMock.mockResolvedValueOnce(Response.json({ id: "x" }));

    const { api } = await import("./api-client");
    const request = api.get("/recurso");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    answer(Response.json({ expiresAt: "2099-01-01T00:00:00Z" }));

    await expect(request).resolves.toEqual({ id: "x" });
    expect(values.get("session_active")).toBe("1");
  });

  it("keeps the flag and the legacy token when the API cannot answer", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await import("./api-client");
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(values.get("refresh_token")).toBe("legacy-refresh");
    expect(values.get("session_active")).toBe("1");
  });

  it("ends the local session when the legacy refresh token is refused", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

    await import("./api-client");
    await vi.waitFor(() => expect(values.has("refresh_token")).toBe(false));

    expect(values.has("session_active")).toBe(false);
    // The legacy path never probes /auth/me: there was no cookie session to find.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
