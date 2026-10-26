// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./auth-hint", () => ({ clearAuthHint: vi.fn(), setAuthHint: vi.fn() }));
vi.mock("./query-client", () => ({ resetSessionScopedData: vi.fn() }));
vi.mock("./device-id", () => ({ getDeviceId: () => null }));

/**
 * Sessions opened before the cookie migration still have their tokens in localStorage. On load
 * the client trades the old refresh token for the cookies ONCE and deletes every token key.
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

  it("trades the legacy refresh token for cookies and leaves no token in storage", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        expiresAt: "2099-01-01T00:00:00Z",
        refreshExpiresAt: "2099-02-01T00:00:00Z",
      }),
    );
    fetchMock.mockResolvedValueOnce(Response.json({ id: "x" }));

    const { api } = await import("./api-client");

    expect(values.has("session_token")).toBe(false);
    expect(values.has("refresh_token")).toBe(false);

    // Requests keep working on the cookies the migration obtained.
    await expect(api.get("/recurso")).resolves.toEqual({ id: "x" });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/refresh");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      credentials: "include",
      body: JSON.stringify({ refreshToken: "legacy-refresh" }),
    });
    expect(values.get("session_active")).toBe("1");
  });

  it("ends the local session when the legacy refresh token is refused", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

    await import("./api-client");
    await vi.waitFor(() => expect(values.has("session_active")).toBe(false));

    expect(values.has("refresh_token")).toBe(false);
    // The legacy path never probes /auth/me: there was no cookie session to find.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
