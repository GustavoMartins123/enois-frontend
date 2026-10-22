import type { FormatResult } from "@/types/lib/rich-text/format-result";

/**
 * Insere um trecho no lugar da seleção e devolve onde o cursor fica — o mesmo contrato do
 * `applyFormat`, para o emoji entrar exatamente como as formatações entram.
 *
 * Existe separado porque inserir NÃO é formatar: não há marcador em volta nem texto de exemplo, e
 * o trecho pode substituir o que estava selecionado (escrever por cima é o comportamento que
 * qualquer editor tem).
 */
export function insertSnippet(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  snippet: string,
): FormatResult {
  const start = Math.max(0, Math.min(selectionStart, text.length));
  const end = Math.max(start, Math.min(selectionEnd, text.length));
  const value = text.slice(0, start) + snippet + text.slice(end);
  const cursor = start + snippet.length;

  return { value, selectionStart: cursor, selectionEnd: cursor };
}
