import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "./api-client";

/**
 * Duas abas e UM token de refresh.
 *
 * O backend **gira** o refresh token a cada renovação (`refreshSession` revoga o antigo e emite um
 * novo). Como o armazenamento é compartilhado entre as abas do mesmo navegador, a cena é:
 *
 * 1. a aba A renova e guarda a sessão nova;
 * 2. a aba B renova com o token VELHO (já revogado) e leva 401;
 * 3. o 401 não quer dizer que a sessão acabou — a sessão nova está no armazenamento, guardada
 *    pela aba A.
 *
 * Antes, o 401 do refresh chamava `clearSession()` e apagava a sessão nova da outra aba: as duas
 * abas caíam no login "sem motivo" — o sintoma que a dona reclamou ("sai do nada").
 */
describe("refresh com outra aba renovando antes", () => {
  let valores: Map<string, string>;

  beforeEach(() => {
    valores = new Map<string, string>([
      ["session_token", "acesso-velho"],
      ["refresh_token", "refresh-velho"],
      ["session_expires_at", String(Date.now() + 10 * 60_000)],
      ["refresh_expires_at", String(Date.now() + 30 * 24 * 3600 * 1000)],
    ]);
    vi.stubGlobal("window", {
      location: { href: "", origin: "https://enois.ia.br" },
      addEventListener: () => {},
    });
    vi.stubGlobal("document", { addEventListener: () => {} });
    vi.stubGlobal("localStorage", {
      getItem: (chave: string) => valores.get(chave) ?? null,
      setItem: (chave: string, valor: string) => valores.set(chave, valor),
      removeItem: (chave: string) => valores.delete(chave),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("mantém a sessão quando o token guardado já é de outra aba", async () => {
    const urls: string[] = [];
    let chamadasDaApi = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        urls.push(url);
        if (url.includes("/auth/refresh")) {
          // A outra aba renovou enquanto esta chamada corria: o token guardado já é o novo.
          valores.set("session_token", "acesso-novo");
          valores.set("refresh_token", "refresh-novo");
          return new Response(JSON.stringify({ code: "INVALID_REFRESH_TOKEN" }), { status: 401 });
        }
        chamadasDaApi += 1;
        // A primeira chamada leva 401 (token velho); a repetição, com o token novo da outra aba, passa.
        if (chamadasDaApi === 1) {
          return new Response(JSON.stringify({ code: "UNAUTHENTICATED" }), { status: 401 });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }),
    );

    const resposta = await api.get<{ ok: boolean }>("/qualquer");

    expect(resposta).toEqual({ ok: true });
    expect(urls.some((u) => u.includes("/auth/refresh"))).toBe(true);
    // A sessão da outra aba continua valendo: nada foi apagado.
    expect(valores.get("session_token")).toBe("acesso-novo");
    expect(valores.get("refresh_token")).toBe("refresh-novo");
  });

  it("encerra a sessão quando o refresh é recusado de verdade (nenhuma outra aba renovou)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/auth/refresh")) {
          return new Response(JSON.stringify({ code: "INVALID_REFRESH_TOKEN" }), { status: 401 });
        }
        return new Response(JSON.stringify({ code: "UNAUTHENTICATED" }), { status: 401 });
      }),
    );

    await expect(api.get("/qualquer")).rejects.toBeTruthy();

    expect(valores.get("session_token")).toBeUndefined();
    expect(valores.get("refresh_token")).toBeUndefined();
  });
});
