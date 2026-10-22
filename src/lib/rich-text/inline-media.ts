/**
 * Marcador de mídia NO MEIO do texto (item 9 do backlog): `{{media:<id>}}`.
 *
 * O autor anexa a mídia e insere o marcador no ponto exato do texto; quem renderiza troca cada
 * marcador pela mídia real (quando o id é anexo da publicação). Sem marcador, a mídia continua
 * sendo anexo no fim — o comportamento de sempre. O id precisa existir na lista de mídias da
 * publicação: marcador de mídia que não é anexo não renderiza (e o backend recusa na gravação).
 */
/** Casas `{{media:<id>}}` e captura o id (mesmo padrão validado no backend). */
import type { InlineChunk } from "@/types/lib/rich-text/inline-chunk";

export const INLINE_MEDIA_MARKER = /\{\{media:([A-Za-z0-9_-]+)\}\}/g;

/** Ids referenciados no texto, na ordem em que aparecem, sem repetição. */
export function inlineMediaIds(content: string): string[] {
  if (!content) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const match of content.matchAll(INLINE_MEDIA_MARKER)) {
    if (!seen.has(match[1])) {
      seen.add(match[1]);
      ids.push(match[1]);
    }
  }
  return ids;
}

/** Divide o conteúdo em trechos de texto e mídia, na ordem do texto. */
export function splitByInlineMedia(content: string): InlineChunk[] {
  const chunks: InlineChunk[] = [];
  let last = 0;
  for (const match of content.matchAll(INLINE_MEDIA_MARKER)) {
    const start = match.index ?? 0;
    if (start > last) {
      chunks.push({ kind: "text", text: content.slice(last, start) });
    }
    chunks.push({ kind: "media", mediaId: match[1] });
    last = start + match[0].length;
  }
  if (last < content.length) {
    chunks.push({ kind: "text", text: content.slice(last) });
  }
  return chunks;
}
