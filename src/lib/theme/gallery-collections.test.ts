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

  /**
   * O segundo bug do relato: "não tem campo no schema, testei 15 nomes e nenhum pega".
   * `muted`, `onPrimary` e `text.date` não são obrigatórios na porta, mas sempre puderam
   * ser publicados — e eram simplesmente jogados fora. Derivação é plano B para o pacote
   * que não declara, não substituição do que o autor escolheu.
   */
  it("obedece ao muted, ao onPrimary e ao text.date do pacote", () => {
    const collection = published({
      palette: {
        background: "#282a36",
        surface: "#44475a",
        border: "#6272a4",
        primary: "#bd93f9",
        muted: "#383a4c",
        onPrimary: "#191a21",
        text: { strong: "#f8f8f2", subtle: "#bfbfbf", date: "#8be9fd" },
      },
    });
    const tokens = collection.tokens.dark!;

    expect(tokens["--muted"]).toBe("#383a4c");
    // --surface-2 é o fundo do item selecionado da navegação: sai do muted, não da derivação.
    expect(tokens["--surface-2"]).toBe("#383a4c");
    expect(tokens["--primary-foreground"]).toBe("#191a21");
    expect(tokens["--text-date"]).toBe("#8be9fd");
    expect(buildCollectionCss(collection, "dark")).toContain("--surface-2: #383a4c;");
  });

  /**
   * Terceiro ponto do relato, e o que ele media com `getComputedStyle`: `--surface-2` e
   * `--muted` saíam `#000000`. A causa era o `mixHex` médio em canal 0–1 arredondado como
   * se fosse 0–255 — todo canal virava 0. Como nenhum pacote declarava `muted`, TODOS os
   * temas publicados tinham o item selecionado da navegação em preto.
   */
  it("sem declaração, deriva como antes — e um valor fora de forma é ignorado", () => {
    const derivado = dracula().tokens.dark!;
    // mixHex(surface #44475a, background #282a36, 0.6).
    expect(derivado["--muted"]).toBe("#393b4c");
    expect(derivado["--primary-foreground"]).toMatch(/^oklch\(/);

    const invalido = published({
      palette: {
        background: "#282a36",
        surface: "#44475a",
        border: "#6272a4",
        primary: "#bd93f9",
        muted: "#000",
        onPrimary: "transparent",
        text: { strong: "#f8f8f2", subtle: "#bfbfbf", date: "rgb(1,2,3)" },
      },
    }).tokens.dark!;

    // O mesmo pacote sem declarar date: valor estranho não degrada nada, é como se não estivesse lá.
    const semDate = published({
      palette: {
        background: "#282a36",
        surface: "#44475a",
        border: "#6272a4",
        primary: "#bd93f9",
        muted: "#000",
        onPrimary: "transparent",
        text: { strong: "#f8f8f2", subtle: "#bfbfbf" },
      },
    }).tokens.dark!;

    expect(invalido).toEqual(semDate);
  });
});

function published(palette: unknown) {
  return buildGalleryCollection({
    id: "theme_full",
    name: "Completo",
    packageJson: JSON.stringify(palette),
    modeDefault: "dark",
  });
}
