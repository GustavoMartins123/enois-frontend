import { describe, expect, it } from "vitest";

import {
  applyReactionToSummary,
  buildReactionTabs,
  removeReactionFromSummary,
  sortReactionTabsStable,
} from "./summary";

describe("applyReactionToSummary", () => {
  it("incrementa um tipo que já existe", () => {
    expect(applyReactionToSummary({ LIKE: 2 }, "LIKE")).toEqual({ LIKE: 3 });
  });

  it("cria a chave quando o tipo ainda não existe", () => {
    expect(applyReactionToSummary({}, "LOVE")).toEqual({ LOVE: 1 });
  });

  it("não muda o objeto original", () => {
    const original = { LIKE: 1 };

    applyReactionToSummary(original, "LIKE");

    expect(original).toEqual({ LIKE: 1 });
  });
});

describe("removeReactionFromSummary", () => {
  it("decrementa mantendo a chave acima de zero", () => {
    expect(removeReactionFromSummary({ LIKE: 3 }, "LIKE")).toEqual({ LIKE: 2 });
  });

  it("remove a chave quando o contador zera", () => {
    expect(removeReactionFromSummary({ LIKE: 1 }, "LIKE")).toEqual({});
  });

  it("clampa em zero quando o resumo já não tinha o tipo", () => {
    expect(removeReactionFromSummary({}, "LIKE")).toEqual({});
  });

  it("não muda o objeto original", () => {
    const original = { LIKE: 2 };

    removeReactionFromSummary(original, "LIKE");

    expect(original).toEqual({ LIKE: 2 });
  });
});

describe("buildReactionTabs", () => {
  it("ordena por contagem decrescente", () => {
    expect(buildReactionTabs({ LIKE: 2, LOVE: 5, WOW: 1 })).toEqual([
      { type: "LOVE", count: 5 },
      { type: "LIKE", count: 2 },
      { type: "WOW", count: 1 },
    ]);
  });

  it("descarta tipos zerados", () => {
    expect(buildReactionTabs({ LIKE: 0, LOVE: 2 })).toEqual([{ type: "LOVE", count: 2 }]);
  });

  it("devolve lista vazia sem reações", () => {
    expect(buildReactionTabs({})).toEqual([]);
  });
});

describe("sortReactionTabsStable", () => {
  it("mantém a ordem anterior quando só as contagens mudam", () => {
    const previous = [
      { type: "LIKE" as const, count: 2 },
      { type: "WOW" as const, count: 1 },
    ];

    expect(sortReactionTabsStable(previous, { LIKE: 3, WOW: 5 })).toEqual([
      { type: "LIKE", count: 3 },
      { type: "WOW", count: 5 },
    ]);
  });

  it("insere um tipo novo na posição certa pela contagem", () => {
    const previous = [
      { type: "LIKE" as const, count: 2 },
      { type: "WOW" as const, count: 1 },
    ];

    expect(sortReactionTabsStable(previous, { LIKE: 2, WOW: 1, LOVE: 5 })).toEqual([
      { type: "LOVE", count: 5 },
      { type: "LIKE", count: 2 },
      { type: "WOW", count: 1 },
    ]);
  });

  it("remove o tipo que chegou a zero", () => {
    const previous = [
      { type: "LOVE" as const, count: 5 },
      { type: "LIKE" as const, count: 2 },
    ];

    expect(sortReactionTabsStable(previous, { LIKE: 2 })).toEqual([{ type: "LIKE", count: 2 }]);
  });

  it("ordena por contagem decrescente na primeira chamada", () => {
    expect(sortReactionTabsStable([], { LIKE: 2, LOVE: 5, WOW: 1 })).toEqual([
      { type: "LOVE", count: 5 },
      { type: "LIKE", count: 2 },
      { type: "WOW", count: 1 },
    ]);
  });
});
