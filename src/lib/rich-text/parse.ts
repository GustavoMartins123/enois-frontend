import type { OpenList } from "@/types/lib/rich-text/open-list";
import type { RichNode } from "@/types/lib/rich-text/rich-node";

/**
 * Formatação leve (markdown) para posts, comentários e todo campo de texto que não é HTML.
 *
 * O texto continua sendo texto no banco — nada de HTML por post comum. Aqui ele vira uma árvore
 * que o renderizador transforma em elementos React, então o autor pode escrever `**negrito**` sem
 * que a gente precise injetar markup de terceiros na página.
 *
 * A régua é o markdown que a pessoa já conhece (o do GitHub): colar um texto pronto funciona, e o
 * que a barra de ferramentas insere é o mesmo que se escreve à mão. O que **não** entra, de
 * propósito: imagem de servidor de terceiro (carregar imagem remota entrega o IP de quem lê para o
 * dono dela — o renderizador transforma em link), tabela de várias linhas por célula e markdown
 * dentro de HTML, coisas que exigem um parser completo e não aparecem em post de rede social.
 *
 * As marcações exigem carência nas bordas (`*` colado em palavra não abre itálico, `_` entre letras
 * continua sendo underscore) para não estragar texto comum já publicado: `2 * 3 * 4` e
 * `user_id_temporario` seguem aparecendo como foram escritos.
 */

/** Delimitadores que aceitam escape com barra invertida (a lista do markdown clássico). */
const ESCAPABLE = new Set([
  "\\",
  "`",
  "*",
  "_",
  "{",
  "}",
  "[",
  "]",
  "(",
  ")",
  "#",
  "+",
  "-",
  ".",
  "!",
  "~",
  "|",
  ">",
]);

const HEADING = /^(#{1,3})\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const DIVIDER = /^\s*([-*_])\1{2,}\s*$/;
const BULLET = /^(\s*)[-*+]\s+(.*)$/;
const ORDERED = /^(\s*)\d+[.)]\s+(.*)$/;
const FENCE = /^\s*```/;
/** `- [ ] texto` / `- [x] texto`: item com caixa de marcar (o "task list" do GitHub). */
const TASK = /^\[([ xX])\]\s+(.*)$/;
/** `| a | b |` seguido de `| --- | --- |` é tabela; uma linha com pipe sozinha é só texto. */
const TABLE_ROW = /^\s*\|(.+)\|\s*$/;
const TABLE_DIVIDER = /^\s*\|?[\s:|-]+\|[\s:|-]*$/;

/** Marca o caractere que veio de escape: o scanner não pode lê-lo como marcação. */
const ESCAPE_MARK = "\u0001";

/** Converte o texto do autor em blocos; dentro de cada bloco, em nós inline. */
export function parseRichText(content: string): RichNode[] {
  const lines = content.split("\n");
  const blocks: RichNode[] = [];
  const stack: OpenList[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join("\n");
    paragraph = [];
    // Linhas vazias contam: o parágrafo é renderizado com `whitespace-pre-line`, então um post
    // simples continua saindo exatamente igual ao que era antes da formatação existir.
    if (text.trim() !== "") blocks.push({ kind: "paragraph", children: parseInline(text) });
  };

  /** Onde uma lista nova entra: no bloco, ou dentro do último item do nível de cima. */
  const listFor = (indent: number, ordered: boolean): RichNode => {
    // Fecha as listas mais fundas do que esta linha (menos 2 espaços já sai do nível).
    while (stack.length > 0 && indent + 2 <= stack[stack.length - 1].indent) stack.pop();

    const top = stack[stack.length - 1];
    if (top && indent >= top.indent + 2) {
      const last = top.list.children?.[top.list.children.length - 1];
      if (last) {
        const nested: RichNode = { kind: "list", ordered, children: [] };
        last.nested = [...(last.nested ?? []), nested];
        stack.push({ indent, list: nested, siblings: last.nested });
        return nested;
      }
    }
    if (top && top.list.ordered === ordered) return top.list;

    // Tipo diferente no mesmo nível: lista nova, irmã da anterior.
    const siblings = top ? top.siblings : blocks;
    const created: RichNode = { kind: "list", ordered, children: [] };
    siblings.push(created);
    stack.push({ indent, list: created, siblings });
    return created;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (FENCE.test(line)) {
      flushParagraph();
      stack.length = 0;
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !FENCE.test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      blocks.push({ kind: "codeBlock", text: body.join("\n") });
      continue;
    }

    // Tabela: a linha de pipes só vira tabela se a seguinte for o separador (`| --- |`).
    const head = TABLE_ROW.exec(line);
    const next = lines[index + 1];
    if (head && next !== undefined && next.includes("-") && TABLE_DIVIDER.test(next)) {
      flushParagraph();
      stack.length = 0;
      const align = splitCells(next).map(alignmentOf);
      const rows: RichNode[] = [
        { kind: "tableRow", header: true, children: rowCells(head[1], align) },
      ];
      index += 2;
      while (index < lines.length && TABLE_ROW.test(lines[index])) {
        const body = TABLE_ROW.exec(lines[index]);
        rows.push({ kind: "tableRow", children: rowCells(body?.[1] ?? "", align) });
        index += 1;
      }
      index -= 1;
      blocks.push({ kind: "table", children: rows });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flushParagraph();
      stack.length = 0;
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
      stack.length = 0;
      blocks.push({ kind: "quote", children: parseInline(quote[1]) });
      continue;
    }

    if (DIVIDER.test(line)) {
      flushParagraph();
      stack.length = 0;
      blocks.push({ kind: "divider" });
      continue;
    }

    const bullet = BULLET.exec(line);
    const ordered = ORDERED.exec(line);
    if (bullet || ordered) {
      flushParagraph();
      const match = bullet ?? ordered;
      const list = listFor(match?.[1]?.length ?? 0, Boolean(ordered));
      const raw = (match?.[2] ?? "").trimEnd();
      const task = TASK.exec(raw);
      list.children = list.children ?? [];
      list.children.push({
        kind: "listItem",
        checked: task ? task[1].toLowerCase() === "x" : undefined,
        children: parseInline(task ? task[2] : raw),
      });
      continue;
    }

    stack.length = 0;
    paragraph.push(line);
  }

  flushParagraph();

  return blocks;
}

/** Células cruas de uma linha de tabela (sem os pipes das pontas). */
function splitCells(row: string): string[] {
  return row
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|");
}

/** Células de uma linha de tabela, já com o alinhamento que o separador declarou. */
function rowCells(row: string, align?: (string | undefined)[]): RichNode[] {
  return splitCells(row).map((cell, index) => ({
    kind: "tableCell" as const,
    align: align?.[index],
    children: parseInline(cell.trim()),
  }));
}

/** `:---:` centralizado, `---:` à direita, `:---` (ou nada) à esquerda. */
function alignmentOf(cell: string): string | undefined {
  const trimmed = cell.trim();
  if (trimmed.startsWith(":") && trimmed.endsWith(":")) return "center";
  if (trimmed.endsWith(":")) return "right";
  return undefined;
}

/** O caractere daquela posição veio de um escape (`\*`)? */
function isEscaped(text: string, index: number): boolean {
  return text[index] === ESCAPE_MARK;
}

function isWord(char: string | undefined): boolean {
  return char !== undefined && /[\p{L}\p{N}_]/u.test(char);
}

/**
 * Lê uma linha de texto e devolve os nós inline dela.
 *
 * É um scanner (e não uma expressão regular única) porque marcação aninha: `**negrito com
 * _itálico_ dentro**` precisa que o conteúdo do negrito seja lido de novo. A crase tem precedência
 * — dentro dela nada é marcação.
 */
export function parseInline(text: string): RichNode[] {
  const nodes: RichNode[] = [];
  let plain = "";
  let index = 0;

  const flush = () => {
    if (plain) {
      nodes.push({ kind: "text", text: restoreEscapes(plain) });
      plain = "";
    }
  };

  const take = (node: RichNode, end: number) => {
    flush();
    nodes.push(node);
    index = end;
  };

  while (index < text.length) {
    const char = text[index];

    // 1. Escape: o caractere seguinte é literal.
    if (char === "\\" && index + 1 < text.length && ESCAPABLE.has(text[index + 1])) {
      plain += ESCAPE_MARK + text[index + 1];
      index += 2;
      continue;
    }

    // 2. Código: vence qualquer outra marcação (`` `a * b` `` não tem itálico).
    if (char === "`") {
      const close = text.indexOf("`", index + 1);
      if (close > index + 1) {
        take({ kind: "code", text: text.slice(index + 1, close) }, close + 1);
        continue;
      }
    }

    // 3. Imagem: `![texto](endereço)`.
    if (char === "!" && text[index + 1] === "[") {
      const image = readDestination(text, index + 1);
      if (image) {
        take({ kind: "image", text: image.label, href: image.url }, image.end);
        continue;
      }
    }

    // 4. Link: `[texto](endereço)`, com formatação dentro do texto.
    if (char === "[") {
      const link = readDestination(text, index);
      if (link) {
        take(
          { kind: "link", href: link.url, text: link.label, children: parseInline(link.label) },
          link.end,
        );
        continue;
      }
    }

    // 5. Negrito, itálico, riscado e spoiler — nesta ordem, porque `**` vem antes de `*`.
    const wrapped =
      readWrapped(text, index, "**", "bold") ??
      readWrapped(text, index, "__", "bold", { leftBoundary: true, rightBoundary: true }) ??
      readWrapped(text, index, "*", "italic", { leftBoundary: true }) ??
      readWrapped(text, index, "_", "italic", { leftBoundary: true, rightBoundary: true }) ??
      readWrapped(text, index, "~~", "strike") ??
      readWrapped(text, index, "||", "spoiler");
    if (wrapped) {
      take(
        {
          kind: wrapped.kind as RichNode["kind"],
          text: wrapped.content,
          // O spoiler guarda o texto cru: quem decide mostrar é o componente, e o que está escondido
          // não deve virar link clicável antes da hora.
          children: wrapped.kind === "spoiler" ? undefined : parseInline(wrapped.content),
        },
        wrapped.end,
      );
      continue;
    }

    // 6. Menção: `@nome` no começo ou depois de espaço (e-mail não vira menção). O username pode
    // ter hífen (`@wesley-rodrigues`); o hífen só entra se estiver seguido de letra/número.
    if (char === "@" && !isWord(text[index - 1]) && isWord(text[index + 1])) {
      let end = index + 1;
      while (
        end < text.length &&
        (isWord(text[end]) || (text[end] === "-" && isWord(text[end + 1])))
      ) {
        end += 1;
      }
      take({ kind: "mention", text: text.slice(index, end) }, end);
      continue;
    }

    // 7. Endereço solto: quem cola um link espera poder clicar.
    if ((char === "h" || char === "H") && /^https?:\/\//i.test(text.slice(index))) {
      const end = readBareUrl(text, index);
      const url = text.slice(index, end);
      take({ kind: "link", text: url, href: url }, end);
      continue;
    }

    plain += char;
    index += 1;
  }

  flush();

  return nodes;
}

/** `[texto](endereço)` a partir do colchete; devolve o texto, o endereço e onde a marcação acaba. */
function readDestination(
  text: string,
  start: number,
): { label: string; url: string; end: number } | null {
  if (text[start] !== "[") return null;

  let depth = 0;
  let close = -1;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (char === "\n") return null;
    if (char === "[" && !isEscaped(text, index - 1)) depth += 1;
    if (char === "]" && !isEscaped(text, index - 1)) {
      depth -= 1;
      if (depth === 0) {
        close = index;
        break;
      }
    }
  }
  if (close === -1 || text[close + 1] !== "(") return null;

  const end = text.indexOf(")", close + 2);
  if (end === -1) return null;

  const url = restoreEscapes(text.slice(close + 2, end)).trim();
  if (url === "" || /\s/.test(url)) return null;

  return { label: text.slice(start + 1, close), url, end: end + 1 };
}

/**
 * Marcação que envolve um trecho (`**negrito**`, `~~riscado~~`).
 *
 * As bordas seguem as regras do markdown: o miolo não começa nem termina em espaço (senão
 * `2 * 3 * 4` viraria itálico) e, no itálico, o delimitador não pode estar colado numa palavra
 * (senão `user_id_temporario` viraria itálico no meio).
 */
function readWrapped(
  text: string,
  start: number,
  delimiter: string,
  kind: string,
  options: { leftBoundary?: boolean; rightBoundary?: boolean } = {},
): { kind: string; content: string; end: number } | null {
  if (!text.startsWith(delimiter, start)) return null;
  if (options.leftBoundary && isWord(text[start - 1])) return null;

  const from = start + delimiter.length;
  if (text[from] === undefined || /\s/.test(text[from])) return null;

  let search = from;
  while (search < text.length) {
    const close = text.indexOf(delimiter, search);
    if (close === -1) return null;
    if (isEscaped(text, close - 1)) {
      search = close + 1;
      continue;
    }
    const content = text.slice(from, close);
    const after = text[close + delimiter.length];
    if (content !== "" && !/\s$/.test(content) && !(options.rightBoundary && isWord(after))) {
      return { kind, content: restoreEscapes(content), end: close + delimiter.length };
    }
    search = close + 1;
  }

  return null;
}

/** O endereço vai até o espaço; pontuação final do texto não faz parte do link. */
function readBareUrl(text: string, start: number): number {
  let end = start;
  while (end < text.length && !/\s/.test(text[end])) end += 1;
  while (end > start && /[.,;:!?]$/.test(text[end - 1])) end -= 1;
  if (text[end - 1] === ")" && !text.slice(start, end).includes("(")) end -= 1;
  return end;
}

/** Devolve o texto como o autor escreveu (a marca de escape só existiu para o scanner). */
function restoreEscapes(text: string): string {
  return text.replaceAll(ESCAPE_MARK, "");
}
