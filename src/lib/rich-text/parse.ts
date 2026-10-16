import type { RichNode } from "@/types/lib/rich-text/rich-node";

/**
 * Formatacao leve (um subconjunto de markdown) para posts e comentarios.
 *
 * O texto continua sendo texto no banco — nada de HTML por post comum. Aqui ele vira uma arvore
 * que o renderizador transforma em elementos React, entao o autor pode escrever `**negrito**`
 * sem que a gente precise injetar markup de terceiros na pagina.
 *
 * As marcacoes exigem carencia nas bordas (`*` colado em palavra nao abre italico, `_` entre
 * letras continua sendo underscore) para nao estragar texto comum ja publicado: `2 * 3 * 4` e
 * `user_id_temporario` seguem aparecendo como foram escritos.
 */
const INLINE_PATTERN = new RegExp(
  [
    "\\*\\*(?!\\s)(?<bold>[^*]+?)(?<!\\s)\\*\\*",
    "(?<![\\w*])\\*(?!\\s)(?<star>[^*\\n]+?)(?<!\\s)\\*",
    "(?<![\\w_])_(?!\\s)(?<underscore>[^_\\n]+?)(?<!\\s)_(?![\\w])",
    "~~(?!\\s)(?<strike>[^~]+?)(?<!\\s)~~",
    "`(?<code>[^`]+)`",
    "\\[(?<label>[^\\]]+)\\]\\((?<url>[^()\\s]+)\\)",
    "(?<mention>@\\w+)",
    "(?<bareUrl>https?:\\/\\/[^\\s]+)",
  ].join("|"),
  "g",
);

const HEADING = /^(#{1,3})\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const DIVIDER = /^\s*([-*_])\1{2,}\s*$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const FENCE = /^\s*```/;

/** Converte o texto do autor em blocos; dentro de cada bloco, em nos inline. */
export function parseRichText(content: string): RichNode[] {
  const lines = content.split("\n");
  const blocks: RichNode[] = [];
  let paragraph: string[] = [];
  let list: RichNode | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join("\n");
    paragraph = [];
    // Linhas vazias contam: o paragrafo e renderizado com `whitespace-pre-line`, entao um post
    // simples continua saindo exatamente igual ao que era antes da formatacao existir.
    if (text.trim() !== "") blocks.push({ kind: "paragraph", children: parseInline(text) });
  };

  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (FENCE.test(line)) {
      flushParagraph();
      flushList();
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !FENCE.test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      blocks.push({ kind: "codeBlock", text: body.join("\n") });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        kind: "heading",
        level: heading[1].length,
        children: parseInline(heading[2]),
      });
      continue;
    }

    const quote = QUOTE.exec(line);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "quote", children: parseInline(quote[1]) });
      continue;
    }

    if (DIVIDER.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "divider" });
      continue;
    }

    const bullet = BULLET.exec(line);
    const ordered = ORDERED.exec(line);
    if (bullet || ordered) {
      flushParagraph();
      // Marcador diferente abre outra lista: um `- item` logo depois de `1. item` nao vira item
      // numerado (o autor escreveu dois tipos de lista).
      const isOrdered = Boolean(ordered);
      if (!list || list.ordered !== isOrdered) {
        flushList();
        list = { kind: "list", ordered: isOrdered, children: [] };
      }
      list.children?.push({
        kind: "listItem",
        children: parseInline((bullet ?? ordered)?.[1] ?? ""),
      });
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

/** Le uma linha de texto e devolve os nos inline dela. */
export function parseInline(text: string): RichNode[] {
  const nodes: RichNode[] = [];
  let last = 0;

  INLINE_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push({ kind: "text", text: text.slice(last, match.index) });
    }

    const groups = match.groups ?? {};
    if (groups.bold) {
      nodes.push({ kind: "bold", text: groups.bold });
    } else if (groups.star || groups.underscore) {
      nodes.push({ kind: "italic", text: groups.star ?? groups.underscore });
    } else if (groups.strike) {
      nodes.push({ kind: "strike", text: groups.strike });
    } else if (groups.code) {
      nodes.push({ kind: "code", text: groups.code });
    } else if (groups.url) {
      nodes.push({ kind: "link", text: groups.label, href: groups.url });
    } else if (groups.mention) {
      nodes.push({ kind: "mention", text: groups.mention });
    } else if (groups.bareUrl) {
      nodes.push({ kind: "link", text: groups.bareUrl, href: groups.bareUrl });
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) {
    nodes.push({ kind: "text", text: text.slice(last) });
  }

  return nodes;
}
