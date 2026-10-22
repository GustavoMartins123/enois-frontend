import { describe, expect, it } from "vitest";

import { insertSnippet } from "./insert-snippet";

describe("insertSnippet", () => {
  it("insere onde o cursor está", () => {
    // Emoji ocupa DUAS posições no texto do navegador (par substituto), e o cursor vai depois dele.
    expect(insertSnippet("bom dia", 3, 3, "😀")).toEqual({
      value: "bom😀 dia",
      selectionStart: 5,
      selectionEnd: 5,
    });
  });

  it("substitui o que estava selecionado", () => {
    expect(insertSnippet("bom dia", 4, 7, "🔥")).toEqual({
      value: "bom 🔥",
      selectionStart: 6,
      selectionEnd: 6,
    });
  });

  it("no fim do texto, acrescenta", () => {
    const result = insertSnippet("valeu", 5, 5, "👏");

    expect(result.value).toBe("valeu👏");
    expect(result.selectionStart).toBe(7);
  });

  it("com a seleção fora da faixa, não estoura o texto", () => {
    expect(insertSnippet("oi", 99, 120, "!").value).toBe("oi!");
    expect(insertSnippet("oi", -5, 2, "!").value).toBe("!");
  });

  it("seleção invertida (fim antes do começo) não come pedaço a mais", () => {
    // Mesma regra do `applyFormat`: o fim nunca fica antes do começo, então nada é engolido.
    expect(insertSnippet("abcde", 4, 1, "-").value).toBe("abcd-e");
  });
});
