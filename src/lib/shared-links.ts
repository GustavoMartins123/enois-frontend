import { isOwnMediaUrl } from "@/lib/api/media";

import { extractVideoId } from "@/components/post/extract-video-id";

/**
 * Os links dentro de um post: o que vira MÍDIA/PREVIEW e o que sai do texto.
 *
 * Regra visual (pedido da Mel): depois de postado, o link cru NÃO aparece —
 * mídia (GIF, imagem, vídeo, áudio) roda direto no player e página externa vira
 * um card; clicar abre o site de origem. O texto cru continua no campo de edição.
 */

export const SHARED_URL_REGEX = /https?:\/\/[^\s]+/g;

/** GIF: mídia direta do Giphy/Tenor (ou página do Giphy, que vira a mídia pelo id). */
export function gifMediaUrl(url: string): string | null {
  if (
    /^https?:\/\/(media|i)\.giphy\.com\//.test(url) ||
    /^https?:\/\/media\d*\.tenor\.com\//.test(url) ||
    /\.gif(\?|$)/i.test(url)
  ) {
    return url;
  }
  const giphy = url.match(/giphy\.com\/(?:gifs\/)?[^/?#]*-([a-zA-Z0-9]+)\/?$/);
  if (giphy) return `https://media.giphy.com/media/${giphy[1]}/giphy.gif`;
  return null;
}

/** Mídia direta por extensão, de qualquer host (imagem, vídeo ou áudio). */
export function directMediaKind(url: string): "image" | "video" | "audio" | null {
  const path = url.split(/[?#]/)[0].toLowerCase();
  if (/\.(jpe?g|png|webp|avif|gif)$/.test(path)) return "image";
  if (/\.(mp4|webm|mov|m4v)$/.test(path)) return "video";
  if (/\.(mp3|ogg|oga|wav|m4a|aac)$/.test(path)) return "audio";
  return null;
}

/** O link vira player/imagem (não é "página externa" para esconder do texto)? */
function rendersAsMedia(url: string): boolean {
  if (isOwnMediaUrl(url)) return true; // a mídia da casa vira imagem no RichText
  if (extractVideoId(url)) return true; // YouTube/Vimeo embedados
  if (gifMediaUrl(url)) return true;
  return directMediaKind(url) !== null;
}

/**
 * O texto do post SEM os links de página externa (somem do corpo depois de postar,
 * porque o card de preview os representa). Mídia e links da casa ficam — eles se
 * mostram por si.
 */
export function hideExternalPageUrls(content: string): string {
  const limpo = content.replace(SHARED_URL_REGEX, (url) => (rendersAsMedia(url) ? url : ""));
  return limpo
    .split("\n")
    .map((linha) => linha.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
