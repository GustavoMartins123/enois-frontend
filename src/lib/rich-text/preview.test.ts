import { describe, expect, it } from "vitest";

import { plainPreview } from "./preview";

describe("plainPreview", () => {
  it("devolve texto puro como está", () => {
    expect(plainPreview("Escrevi um texto simples.")).toBe("Escrevi um texto simples.");
  });

  it("resolve a formatação do post (negrito, título, lista)", () => {
    const preview = plainPreview("# Título\n\nUm **texto** com _ênfase_\n\n- primeiro\n- segundo");

    expect(preview).toBe("Título Um texto com ênfase primeiro segundo");
  });

  it("mostra o rótulo do link, nunca o endereço", () => {
    expect(plainPreview("Veja [o meu portfólio](https://exemplo.com/x)")).toBe(
      "Veja o meu portfólio",
    );
  });

  it("deixa imagem, código e spoiler de fora", () => {
    const preview = plainPreview(
      "Começo\n\n![foto](https://exemplo.com/a.png)\n\n```\ncódigo\n```\n\n||segredo||\n\nfim",
    );

    expect(preview).toBe("Começo fim");
  });

  it("mantém menção e código de uma linha", () => {
    expect(plainPreview("Oi @maria, use `npm run build`")).toBe("Oi @maria, use npm run build");
  });

  it("não estraga texto que só parece formatação", () => {
    expect(plainPreview("2 * 3 * 4 = 24 e user_id_temporario")).toBe(
      "2 * 3 * 4 = 24 e user_id_temporario",
    );
  });

  it("corta na última palavra inteira e marca o corte", () => {
    const preview = plainPreview(`${"palavra ".repeat(40)}fim`, 40);

    expect(preview.endsWith("…")).toBe(true);
    expect(preview.length).toBeLessThanOrEqual(41);
    expect(preview).not.toContain("  ");
  });

  it("não corta texto que cabe no limite", () => {
    expect(plainPreview("curto", 40)).toBe("curto");
  });
});
