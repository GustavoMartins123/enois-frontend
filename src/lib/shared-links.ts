import { isOwnMediaUrl } from "@/lib/api/media";

/**
 * Os links dentro de um post: o que vira MÍDIA/PREVIEW e o que sai do texto.
 *
 * Regra visual (pedido da Mel): depois de postado, o link cru NÃO aparece —
 * mídia direta (GIF, imagem, vídeo, áudio) roda no próprio texto, link de player
 * (YouTube, Vimeo, Twitch, Spotify…) é representado pelo player logo abaixo e
 * página externa vira um card. Clicar no card abre o site de origem. O texto cru
 * continua no campo de edição.
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

/** O link é mídia direta que o RichText desenha no próprio texto? */
export function rendersInline(url: string): boolean {
  if (isOwnMediaUrl(url)) return true; // a mídia da casa vira imagem no RichText
  if (gifMediaUrl(url)) return true;
  return directMediaKind(url) !== null;
}

/**
 * O endereço sem a pontuação final — `olha .../giphy.gif.` termina com o ponto DA FRASE, e o
 * RichText já sabe disso (o parser não engole a pontuação no link).
 *
 * Quem extrai URLs por regex (`[^\s]+`) pega o ponto junto; sem tirá-lo, a checagem de mídia falha
 * por um caractere e a mesma mídia aparece duas vezes (imagem no texto + card abaixo).
 */
export function trimTrailingPunctuation(url: string): string {
  return url.replace(/[.,;:!?»”"')\]}]+$/, "");
}

/**
 * O texto do post SEM os links que outra peça representa: página externa vira
 * card e link de player vira o player abaixo (o link cru não fica no corpo).
 * Mídia direta fica — ela se mostra por si, renderizada pelo RichText.
 */
export function hideExternalPageUrls(content: string): string {
  const limpo = content.replace(SHARED_URL_REGEX, (url) => (rendersInline(url) ? url : ""));
  return limpo
    .split("\n")
    .map((linha) => linha.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
