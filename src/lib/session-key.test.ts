import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { dropSessionKey, getSessionKey, renewSessionKey } from "./session-key";

describe("chave da sessão", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("renova a chave com um UUID criptográfico", () => {
    const id = "3503be82-853b-4ae8-9d20-49facd47dc92";
    vi.stubGlobal("crypto", { randomUUID: () => id });
    renewSessionKey();
    expect(getSessionKey()).toBe(id);
  });

  it("falha sem randomUUID e preserva a chave anterior", () => {
    localStorage.setItem("session_id", "sessao-anterior");
    vi.stubGlobal("crypto", {});
    expect(() => renewSessionKey()).toThrow(TypeError);
    expect(getSessionKey()).toBe("sessao-anterior");
  });

  it("sair remove a chave da sessão", () => {
    localStorage.setItem("session_id", "sessao-atual");
    dropSessionKey();
    expect(getSessionKey()).toBeNull();
  });

  it("no servidor não lê o armazenamento do navegador", () => {
    vi.stubGlobal("window", undefined);
    expect(getSessionKey()).toBeNull();
  });
});
