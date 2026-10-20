import { describe, expect, it } from "vitest";

import { buildCollectionCss } from "./build-collection-css";
import { buildGalleryCollection, galleryCollectionId } from "./gallery-collections";

/** O pacote que a usuária publicou (Dracula): só as cores que a API aceita. */
const DRACULA = JSON.stringify({
  palette: {
    background: "#282a36",
    surface: "#44475a",
    border: "#44475a",
    primary: "#bd93f9",
    text: { primary: "#f8f8f2", strong: "#ffffff", subtle: "#8b9bc4" },
  },
});

function dracula() {
  return buildGalleryCollection({
    id: "theme_1",
    name: "Dracula",
    description: "Paleta Dracula.",
    packageJson: DRACULA,
    modeDefault: "dark",
  });
}

describe("buildGalleryCollection", () => {
  /**
   * O bug: "Aplicar" só derivava um destaque e um fundo — superfície, borda e texto do
   * tema ficavam de fora, e um destaque parecido com o da marca parecia "não mudar nada".
   */
  it("expande o pacote nos tokens do tema, não só no destaque", () => {
    const collection = dracula();
    expect(collection.id).toBe(galleryCollectionId("theme_1"));
    const tokens = collection.tokens.dark!;

    expect(tokens["--background"]).toBe("#282a36");
    expect(tokens["--surface-card"]).toBe("#44475a");
    expect(tokens["--border"]).toBe("#44475a");
    expect(tokens["--primary"]).toBe("#bd93f9");
    expect(tokens["--text-strong"]).toBe("#ffffff");
    expect(tokens["--text-subtle"]).toBe("#8b9bc4");
  });

  it("calcula o texto sobre o destaque em vez de herdar o da página", () => {
    const tokens = dracula().tokens.dark!;
    // O auxiliar devolve oklch (o mesmo motor dos temas da casa), escolhido pela luminância.
    expect(tokens["--primary-foreground"]).toMatch(/^oklch\(/);
    expect(tokens["--primary-foreground"]).not.toBe(tokens["--text-strong"]);
  });

  it("vale nos dois modos (o pacote declara uma paleta só)", () => {
    const collection = dracula();
    expect(collection.tokens.light).toEqual(collection.tokens.dark);
  });

  it("o CSS final do tema carrega as cores do pacote", () => {
    const css = buildCollectionCss(dracula(), "dark");
    expect(css).toContain("#282a36"); // fundo
    expect(css).toContain("#bd93f9"); // destaque
    expect(css).toContain("#44475a"); // superfície/borda
  });

  it("pacote ilegível não quebra a tela: cai no padrão da marca", () => {
    const collection = buildGalleryCollection({
      id: "theme_broken",
      name: "Quebrado",
      packageJson: "{",
      modeDefault: "dark",
    });
    expect(collection.tokens.dark!["--primary"]).toBe("#7c3aed");
    expect(collection.tokens.dark!["--background"]).toBe("#141420");
  });
});
