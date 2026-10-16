import type { EmbedPlayerProps } from "@/types/components/post/embed-player-props";
import type { PageEmbed } from "@/types/lib/post-page/page-embed";

import { extractVideoId } from "@/components/post/extract-video-id";

/**
 * Mídias embutidas de uma página: os marcadores que o backend deixou no HTML e os links para
 * provedor que o autor escreveu no texto.
 *
 * O quadro da página roda sem script, então o player não pode morar lá dentro — ele é montado pelo
 * app, abaixo da página, com o MESMO componente dos posts normais. Isso importa para a segurança:
 * o player recebe provedor e id (e monta o endereço do iframe por conta própria, a partir do id),
 * nunca o endereço cru que veio colado. Um "embed" de host desconhecido não passa por aqui.
 */
export function extractPageEmbeds(html: string): PageEmbed[] {
  const candidates: string[] = [];

  // Marcador deixado na gravação: <div data-enois-embed="https://...">
  for (const match of html.matchAll(/data-enois-embed="([^"]*)"/gi)) {
    candidates.push(decodeAttribute(match[1]));
  }

  // Links de provedor escritos no texto da página (o autor colou a URL do vídeo).
  for (const match of html.matchAll(/href="([^"]*)"/gi)) {
    candidates.push(decodeAttribute(match[1]));
  }

  const seen = new Set<string>();
  const embeds: PageEmbed[] = [];

  for (const url of candidates) {
    const player: EmbedPlayerProps | null = extractVideoId(url);
    if (!player) continue;

    const key = `${player.type}:${player.id}`;
    if (seen.has(key)) continue;

    seen.add(key);
    embeds.push({ ...player, url });
  }

  return embeds;
}

/** `&amp;` volta a ser `&` antes de procurar o id (URL de embed costuma trazer parâmetros). */
function decodeAttribute(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
