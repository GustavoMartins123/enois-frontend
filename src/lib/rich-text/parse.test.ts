import type { RichNode } from "@/types/lib/rich-text/rich-node";
import { describe, expect, it } from "vitest";

import { parseInline, parseRichText } from "./parse";

/** Achata a árvore e devolve os nós do tipo pedido (para checar sem escrever o caminho inteiro). */
function nodesOfKind(nodes: RichNode[], kind: RichNode["kind"]): RichNode[] {
  return nodes.flatMap((node) => [
    ...(node.kind === kind ? [node] : []),
    ...nodesOfKind(node.children ?? [], kind),
    ...nodesOfKind(node.nested ?? [], kind),
  ]);
}

/** O texto que o leitor vê, na ordem em que aparece. */
function flattenText(nodes: RichNode[]): string {
  return nodes
    .map((node) => {
      if (node.kind === "codeBlock") return node.text ?? "";
      if (node.kind === "text" || node.kind === "code" || node.kind === "mention") {
        return node.text ?? "";
      }
      if (node.children && node.children.length > 0) return flattenText(node.children);
      return node.text ?? "";
    })
    .join("");
}

describe("parseRichText — o que já existia continua igual", () => {
  it("texto sem marcação sai como um parágrafo único", () => {
    const blocks = parseRichText("bom dia, pessoal");

    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBe("paragraph");
    expect(flattenText(blocks)).toBe("bom dia, pessoal");
  });

  it("não estraga conta com asterisco solto nem underscore no meio da palavra", () => {
    expect(nodesOfKind(parseInline("2 * 3 * 4"), "italic")).toHaveLength(0);
    expect(nodesOfKind(parseInline("user_id_temporario"), "italic")).toHaveLength(0);
    expect(flattenText(parseInline("2 * 3 * 4"))).toBe("2 * 3 * 4");
  });

  it("negrito, itálico, riscado, código e spoiler", () => {
    expect(parseInline("**forte**")[0]).toMatchObject({ kind: "bold", text: "forte" });
    expect(parseInline("*leve*")[0]).toMatchObject({ kind: "italic", text: "leve" });
    expect(parseInline("_leve_")[0]).toMatchObject({ kind: "italic", text: "leve" });
    expect(parseInline("~~cortado~~")[0]).toMatchObject({ kind: "strike", text: "cortado" });
    expect(parseInline("`codigo`")[0]).toMatchObject({ kind: "code", text: "codigo" });
    expect(parseInline("||segredo||")[0]).toMatchObject({ kind: "spoiler", text: "segredo" });
  });

  it("título, citação, divisória e blocos de código", () => {
    expect(parseRichText("# titulo")[0]).toMatchObject({ kind: "heading", level: 1 });
    expect(parseRichText("## dois")[0]).toMatchObject({ kind: "heading", level: 2 });
    expect(parseRichText("> citado")[0].kind).toBe("quote");
    expect(parseRichText("---")[0].kind).toBe("divider");
    expect(parseRichText("```\nlinha\n```")[0]).toMatchObject({
      kind: "codeBlock",
      text: "linha",
    });
  });

  it("listas com marcador e numeradas", () => {
    const bullets = parseRichText("- um\n- dois");
    expect(bullets[0]).toMatchObject({ kind: "list", ordered: false });
    expect(bullets[0].children).toHaveLength(2);

    const ordered = parseRichText("1. um\n2. dois");
    expect(ordered[0]).toMatchObject({ kind: "list", ordered: true });
  });

  it("link, menção e endereço solto", () => {
    expect(parseInline("[texto](https://a.com)")[0]).toMatchObject({
      kind: "link",
      href: "https://a.com",
    });
    expect(parseInline("@mel")[0]).toMatchObject({ kind: "mention", text: "@mel" });
    expect(parseInline("veja https://a.com/x")[1]).toMatchObject({
      kind: "link",
      href: "https://a.com/x",
    });
  });

  it("e-mail não vira menção", () => {
    const nodes = parseInline("escreve para mel@exemplo.com");
    expect(nodesOfKind(nodes, "mention")).toHaveLength(0);
    expect(flattenText(nodes)).toBe("escreve para mel@exemplo.com");
  });
});

describe("parseRichText — o que o GitHub faz e agora funciona aqui", () => {
  it("aninha formatação dentro de formatação", () => {
    const nodes = parseInline("**forte com _leve_ dentro**");
    expect(nodes[0]).toMatchObject({ kind: "bold" });
    expect(nodesOfKind(nodes, "italic")).toHaveLength(1);
    expect(flattenText(nodes)).toBe("forte com leve dentro");
  });

  it("link com formatação no rótulo", () => {
    const nodes = parseInline("[**forte** link](https://a.com)");
    expect(nodes[0]).toMatchObject({ kind: "link", href: "https://a.com" });
    expect(nodesOfKind(nodes, "bold")).toHaveLength(1);
  });

  it("negrito com underscore duplo", () => {
    expect(parseInline("__forte__")[0]).toMatchObject({ kind: "bold", text: "forte" });
  });

  it("crase vence as outras marcações", () => {
    expect(parseInline("`a * b * c`")[0]).toMatchObject({ kind: "code", text: "a * b * c" });
  });

  it("escape deixa o caractere literal", () => {
    const nodes = parseInline("\\*não é itálico\\*");
    expect(nodesOfKind(nodes, "italic")).toHaveLength(0);
    expect(flattenText(nodes)).toBe("*não é itálico*");
  });

  it("tabela com cabeçalho e alinhamento", () => {
    const blocks = parseRichText("| nome | nota |\n| --- | ---: |\n| ana | 10 |");
    const table = blocks[0];

    expect(table.kind).toBe("table");
    expect(table.children).toHaveLength(2);

    const [head, row] = table.children ?? [];
    expect(head.header).toBe(true);
    expect(head.children?.[1]).toMatchObject({ kind: "tableCell", align: "right" });
    expect(flattenText(row.children ?? [])).toBe("ana10");
  });

  it("linha com pipe sem separador continua sendo texto", () => {
    const blocks = parseRichText("a | b\nc | d");
    expect(blocks[0].kind).toBe("paragraph");
  });

  it("lista com caixa de marcar", () => {
    const list = parseRichText("- [ ] pendente\n- [x] feito")[0];
    expect(list.children?.[0]).toMatchObject({ kind: "listItem", checked: false });
    expect(list.children?.[1]).toMatchObject({ kind: "listItem", checked: true });
    expect(flattenText(list.children ?? [])).toBe("pendentefeito");
  });

  it("lista dentro de lista", () => {
    const list = parseRichText("- um\n  - dentro\n- dois")[0];
    expect(list.children).toHaveLength(2);
    expect(list.children?.[0].nested?.[0]).toMatchObject({ kind: "list" });
    expect(flattenText(list.children?.[0].nested ?? [])).toBe("dentro");
  });

  it("imagem vira nó de imagem com o texto alternativo", () => {
    expect(parseInline("![foto](/media/abc)")[0]).toMatchObject({
      kind: "image",
      text: "foto",
      href: "/media/abc",
    });
  });

  it("pontuação colada no endereço não entra no link", () => {
    const nodes = parseInline("olha https://a.com/x.");
    expect(nodes[1]).toMatchObject({ kind: "link", href: "https://a.com/x" });
    expect(nodes[2]).toMatchObject({ kind: "text", text: "." });
  });

  it("não abre marcação sem fechamento", () => {
    expect(parseInline("**sem fim")[0]).toMatchObject({ kind: "text", text: "**sem fim" });
    expect(parseInline("|sem fim|")[0]).toMatchObject({ kind: "text" });
  });
});
