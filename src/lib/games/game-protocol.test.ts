import { describe, expect, it } from "vitest";

import {
  SHARE_IMAGE_MAX_CHARS,
  SPEND_REQUEST_ID_MAX,
  frameSandbox,
  gameOrigin,
  identityReply,
  isFromGameFrame,
  parseGameMessage,
} from "./game-protocol";

const PNG = "data:image/png;base64,iVBORw0KGgo=";

describe("gameOrigin", () => {
  it("devolve a origem exata do endereço https", () => {
    expect(gameOrigin("https://jogo.exemplo.com/")).toBe("https://jogo.exemplo.com");
    expect(gameOrigin("https://jogo.exemplo.com:8443/build/index.html?x=1")).toBe(
      "https://jogo.exemplo.com:8443",
    );
  });

  it("recusa http, inclusive local (a CSP do Énóis só permite frame-src https:)", () => {
    expect(gameOrigin("http://localhost:4173/jogo.html")).toBeNull();
    expect(gameOrigin("http://jogo.exemplo.com/")).toBeNull();
  });

  it("recusa o que não vira quadro", () => {
    expect(gameOrigin("javascript:alert(1)")).toBeNull();
    expect(gameOrigin("data:text/html,<p>oi</p>")).toBeNull();
    expect(gameOrigin("não é url")).toBeNull();
    expect(gameOrigin("")).toBeNull();
  });
});

describe("frameSandbox", () => {
  it("mantém o sandbox mínimo para jogo de outra origem", () => {
    expect(frameSandbox("https://jogo.exemplo.com", "https://enois.ia.br")).toBe(
      "allow-scripts allow-same-origin allow-pointer-lock",
    );
  });

  it("tira allow-same-origin quando o jogo é da mesma origem do Énóis", () => {
    expect(frameSandbox("https://enois.ia.br", "https://enois.ia.br")).toBe(
      "allow-scripts allow-pointer-lock",
    );
  });
});

describe("isFromGameFrame", () => {
  const origin = "https://jogo.exemplo.com";
  const frame = {} as Window;

  it("aceita a origem e a janela exatas do quadro ativo", () => {
    expect(isFromGameFrame({ origin, source: frame }, origin, frame)).toBe(true);
  });

  it("recusa origem parecida (sem includes nem startsWith)", () => {
    for (const forged of [
      "https://jogo.exemplo.com.evil.com",
      "https://evil.com/https://jogo.exemplo.com",
      "http://jogo.exemplo.com",
      "https://jogo.exemplo.com:444",
      "null",
    ]) {
      expect(isFromGameFrame({ origin: forged, source: frame }, origin, frame)).toBe(false);
    }
  });

  it("recusa a origem certa vinda de outra janela", () => {
    expect(isFromGameFrame({ origin, source: {} as Window }, origin, frame)).toBe(false);
    expect(isFromGameFrame({ origin, source: null }, origin, frame)).toBe(false);
  });

  it("recusa tudo quando não há quadro na tela", () => {
    expect(isFromGameFrame({ origin, source: frame }, origin, null)).toBe(false);
    expect(isFromGameFrame({ origin, source: null }, origin, undefined)).toBe(false);
  });
});

describe("parseGameMessage — ciclo de vida", () => {
  it("lê loading com e sem progresso", () => {
    expect(parseGameMessage({ type: "enois:loading", version: 1, progress: 65 })).toEqual({
      type: "enois:loading",
      progress: 65,
    });
    expect(parseGameMessage({ type: "enois:loading", version: 1, progress: 0 })).toEqual({
      type: "enois:loading",
      progress: 0,
    });
    expect(parseGameMessage({ type: "enois:loading", version: 1, progress: 100 })).toEqual({
      type: "enois:loading",
      progress: 100,
    });
    expect(parseGameMessage({ type: "enois:loading" })).toEqual({
      type: "enois:loading",
      progress: null,
    });
  });

  it("recusa progresso fora de 0 a 100 ou que não é número", () => {
    for (const progress of [-1, 100.5, 1000, Number.NaN, Infinity, "65", true, [50], { v: 1 }]) {
      expect(parseGameMessage({ type: "enois:loading", version: 1, progress })).toBeNull();
    }
  });

  it("lê ready", () => {
    expect(parseGameMessage({ type: "enois:ready", version: 1 })).toEqual({ type: "enois:ready" });
  });

  it("lê error com mensagem curta e limpa", () => {
    expect(
      parseGameMessage({
        type: "enois:error",
        version: 1,
        message: "  Falha na inicialização do jogo  ",
      }),
    ).toEqual({ type: "enois:error", message: "Falha na inicialização do jogo" });
    expect(parseGameMessage({ type: "enois:error", version: 1 })).toEqual({
      type: "enois:error",
      message: null,
    });
    expect(parseGameMessage({ type: "enois:error", message: "   " })).toEqual({
      type: "enois:error",
      message: null,
    });

    const longa = parseGameMessage({ type: "enois:error", message: "x".repeat(5000) });
    expect(longa).toEqual({ type: "enois:error", message: "x".repeat(200) });
  });

  it("recusa error com mensagem que não é texto", () => {
    expect(parseGameMessage({ type: "enois:error", message: { html: "<b>" } })).toBeNull();
    expect(parseGameMessage({ type: "enois:error", message: 42 })).toBeNull();
  });

  it("aceita versão futura pelos campos conhecidos e recusa versão inválida", () => {
    expect(parseGameMessage({ type: "enois:ready", version: 2, extra: true })).toEqual({
      type: "enois:ready",
    });
    for (const version of [0, -1, 1.5, "1", null]) {
      expect(parseGameMessage({ type: "enois:ready", version })).toBeNull();
    }
  });
});

describe("parseGameMessage — mensagens malformadas", () => {
  it("descarta o que não é objeto do protocolo", () => {
    for (const data of [
      null,
      undefined,
      "enois:ready",
      42,
      [],
      ["enois:ready"],
      {},
      { type: "ready" },
      { type: "enois:desconhecido" },
      { type: "ENOIS:READY" },
      { type: 1 },
    ]) {
      expect(parseGameMessage(data)).toBeNull();
    }
  });

  it("ignora mensagens de outras bibliotecas no mesmo canal", () => {
    expect(parseGameMessage({ source: "react-devtools-content-script", payload: {} })).toBeNull();
    expect(parseGameMessage({ type: "webpackOk" })).toBeNull();
  });
});

describe("parseGameMessage — contratos que já existiam", () => {
  it("identity continua sem versão", () => {
    expect(parseGameMessage({ type: "enois:identity" })).toEqual({ type: "enois:identity" });
  });

  it("share preserva texto e imagem e corta o texto em 600", () => {
    expect(parseGameMessage({ type: "enois:share", texto: "Nível 10!", imagem: PNG })).toEqual({
      type: "enois:share",
      texto: "Nível 10!",
      imagem: PNG,
    });
    const longo = parseGameMessage({ type: "enois:share", texto: "a".repeat(900) });
    expect(longo).toEqual({ type: "enois:share", texto: "a".repeat(600), imagem: null });
  });

  it("share descarta imagem que não é raster em base64 ou passa do teto", () => {
    for (const imagem of [
      "https://evil.com/x.png",
      "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
      "data:text/html;base64,PGgxPm9pPC9oMT4=",
      "data:image/png;base64,<script>",
      `data:image/png;base64,${"A".repeat(SHARE_IMAGE_MAX_CHARS)}`,
      42,
    ]) {
      expect(parseGameMessage({ type: "enois:share", texto: "oi", imagem })).toEqual({
        type: "enois:share",
        texto: "oi",
        imagem: null,
      });
    }
  });

  it("share sem texto é recusado", () => {
    expect(parseGameMessage({ type: "enois:share", texto: "" })).toBeNull();
    expect(parseGameMessage({ type: "enois:share", texto: "   " })).toBeNull();
    expect(parseGameMessage({ type: "enois:share", imagem: PNG })).toBeNull();
  });

  it("spend exige valor inteiro positivo e requestId", () => {
    expect(
      parseGameMessage({ type: "enois:spend", amount: 5, motivo: "Poção", requestId: "r-1" }),
    ).toEqual({ type: "enois:spend", amount: 5, motivo: "Poção", requestId: "r-1" });
    expect(parseGameMessage({ type: "enois:spend", amount: 5, requestId: "r-1" })).toEqual({
      type: "enois:spend",
      amount: 5,
      motivo: "",
      requestId: "r-1",
    });

    for (const amount of [0, -5, 1.5, "5", Number.MAX_SAFE_INTEGER + 1, Number.NaN]) {
      expect(parseGameMessage({ type: "enois:spend", amount, requestId: "r-1" })).toBeNull();
    }
    expect(parseGameMessage({ type: "enois:spend", amount: 5 })).toBeNull();
    expect(parseGameMessage({ type: "enois:spend", amount: 5, requestId: "  " })).toBeNull();
    expect(parseGameMessage({ type: "enois:spend", amount: 5, requestId: 7 })).toBeNull();
  });

  it("spend corta motivo e requestId nos limites de antes", () => {
    const parsed = parseGameMessage({
      type: "enois:spend",
      amount: 1,
      motivo: "m".repeat(500),
      requestId: "r".repeat(500),
    });
    expect(parsed).toEqual({
      type: "enois:spend",
      amount: 1,
      motivo: "m".repeat(200),
      requestId: "r".repeat(SPEND_REQUEST_ID_MAX),
    });
  });

  it("a resposta de identidade leva só o token opaco", () => {
    expect(identityReply("abc")).toEqual({ type: "enois:identity", token: "abc" });
  });
});
