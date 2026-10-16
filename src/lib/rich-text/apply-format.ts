import { texts } from "@/texts";
import type { FormatResult } from "@/types/lib/rich-text/format-result";
import type { RichTextFormat } from "@/types/lib/rich-text/rich-text-format";

/**
 * Aplica uma formatacao no trecho selecionado do campo de escrita.
 *
 * Funcao pura (recebe o texto e a selecao, devolve o texto novo e onde o cursor fica) para o
 * mesmo comportamento valer no composer, na edicao de post e nos comentarios — e para dar para
 * testar sem navegador.
 */
export function applyFormat(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  format: RichTextFormat,
): FormatResult {
  const start = Math.max(0, Math.min(selectionStart, text.length));
  const end = Math.max(start, Math.min(selectionEnd, text.length));

  if (format === "heading") return prefixLines(text, start, end, "## ");
  if (format === "bulletList") return prefixLines(text, start, end, "- ");
  if (format === "quote") return prefixLines(text, start, end, "> ");
  if (format === "link") return insertLink(text, start, end);

  const [opening, closing, placeholder] = INLINE_MARKERS[format];
  const selected = text.slice(start, end);
  const inner = selected || placeholder;
  const value = text.slice(0, start) + opening + inner + closing + text.slice(end);

  return {
    value,
    selectionStart: start + opening.length,
    selectionEnd: start + opening.length + inner.length,
  };
}

const INLINE_MARKERS: Record<"bold" | "italic" | "strike" | "code", [string, string, string]> = {
  bold: ["**", "**", texts.posts.formatting.boldPlaceholder],
  italic: ["*", "*", texts.posts.formatting.italicPlaceholder],
  strike: ["~~", "~~", texts.posts.formatting.strikePlaceholder],
  code: ["`", "`", texts.posts.formatting.codePlaceholder],
};

/** `[texto](https://)` com a URL selecionada, que e o que falta preencher. */
function insertLink(text: string, start: number, end: number): FormatResult {
  const label = text.slice(start, end) || texts.posts.formatting.linkPlaceholder;
  const url = "https://";
  const value = `${text.slice(0, start)}[${label}](${url})${text.slice(end)}`;
  const urlStart = start + label.length + 3;

  return { value, selectionStart: urlStart, selectionEnd: urlStart + url.length };
}

/**
 * Prefixa as linhas tocadas pela selecao (titulo, lista, citacao). Aplica em todas as linhas
 * selecionadas de uma vez: marcar um paragrafo inteiro como lista e o caso comum, e fazer isso
 * com um clique e melhor do que linha a linha.
 */
function prefixLines(text: string, start: number, end: number, prefix: string): FormatResult {
  const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const block = text.slice(lineStart, end);

  if (block === "") {
    const value = text.slice(0, lineStart) + prefix + text.slice(end);
    const cursor = lineStart + prefix.length;

    return { value, selectionStart: cursor, selectionEnd: cursor };
  }

  const prefixed = block
    .split("\n")
    .map((line) => prefix + line)
    .join("\n");
  const value = text.slice(0, lineStart) + prefixed + text.slice(end);

  return { value, selectionStart: lineStart, selectionEnd: lineStart + prefixed.length };
}
