import type { PostView } from "@/types/application/feed/post-view";
import type { ShareMeta } from "@/types/lib/open-graph/share-meta";

import { resolveCdnUrl } from "@/lib/api/media";

/**
 * Monta o metadado da miniatura de um post compartilhado.
 *
 * Quem lê isto é o rastreador do WhatsApp/Telegram/X/LinkedIn: ele recebe o HTML do servidor e nada
 * mais — sem sessão, sem JS. Então o texto do post e a imagem têm de estar no `<head>` da página, e
 * a imagem tem de ser um endereço https fechado (o CDN do ImageKit é), não um endpoint da API.
 *
 * Recortes: título curto (é o que aparece em negrito), descrição em ~160 caracteres e imagem em
 * 1200×630 — a proporção que as plataformas esperam. O ImageKit faz esse recorte na hora, então a
 * foto do post vira miniatura sem ninguém precisar gerar arquivo: `tr=w-1200,h-630,fo-auto` para
 * imagem e `/ik-thumbnail.jpg` para vídeo (o quadro do vídeo).
 */
const DESCRIPTION_LIMIT = 160;
const TITLE_LIMIT = 70;
const IMAGE_TRANSFORM = "tr=w-1200%2Ch-630%2Cfo-auto";
const VIDEO_THUMB_TRANSFORM = "tr=w-1200%2Ch-630";

/** Vírgula não pode ir crua no `tr` quando o endereço já tem query (o CDN devolve 400). */

export function buildPostShareMeta(input: {
  post: PostView;
  /** URL absoluta e canônica do post (o link que a pessoa compartilhou). */
  postUrl: string;
  /** Imagem de marca usada quando o post não tem mídia (endereço absoluto). */
  fallbackImageUrl: string;
  /**
   * Cartão desenhado pelo servidor com o TEXTO da página (endereço absoluto), só para posts do tipo
   * página. É o que faz a miniatura mostrar o que a pessoa escreveu em vez da imagem de marca.
   */
  pagePreviewUrl?: string | null;
  /** Tipo e endereço da primeira mídia do post, quando houver (buscados à parte). */
  media?: { mimeType: string | null; cdnUrl: string | null } | null;
}): ShareMeta {
  const { post, postUrl, fallbackImageUrl, pagePreviewUrl, media } = input;
  const author = post.authorName || `@${post.authorUsername}`;
  const text = collapse(post.content);

  const isPage = post.type === "PAGE";
  const title = isPage
    ? `${author} publicou uma página`
    : text
      ? excerpt(text, TITLE_LIMIT)
      : `${author} publicou no Énóis`;

  const description = isPage
    ? `Página publicada por ${author} no Énóis.`
    : text
      ? `${excerpt(text, DESCRIPTION_LIMIT)} · ${author}`
      : `Publicação de ${author} no Énóis.`;

  const mediaUrl = resolveCdnUrl(media?.cdnUrl ?? null);
  const mimeType = media?.mimeType ?? "";
  const isVideo = mimeType.startsWith("video/");

  // Página: o cartão do servidor (texto da página). Post comum: a mídia, recortada; sem mídia, a marca.
  const imageUrl =
    isPage && pagePreviewUrl
      ? pagePreviewUrl
      : !mediaUrl
        ? fallbackImageUrl
        : isVideo
          ? `${mediaUrl}/ik-thumbnail.jpg?${VIDEO_THUMB_TRANSFORM}`
          : `${mediaUrl}?${IMAGE_TRANSFORM}`;

  return {
    title,
    description,
    url: postUrl,
    imageUrl,
    imageAlt: isPage
      ? `Página publicada por ${author}`
      : isVideo
        ? `Vídeo publicado por ${author}`
        : `Publicação de ${author}`,
    videoUrl: isVideo ? (mediaUrl ?? null) : null,
    type: isVideo ? "video.other" : "article",
  };
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function excerpt(text: string, limit: number): string {
  if (text.length <= limit) return text;
  // Corta na última palavra inteira: miniatura com palavra picada lê pior que miniatura menor.
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
