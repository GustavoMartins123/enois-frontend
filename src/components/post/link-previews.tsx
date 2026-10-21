import { texts } from "@/texts";
import type { PostView } from "@/types/application/feed/post-view";
import type { LinkPreviewsProps } from "@/types/components/post/link-previews-props";

import { rendersInline, trimTrailingPunctuation } from "@/lib/shared-links";

import { EmbedPlayer } from "./embed-player";
import { extractVideoId } from "./extract-video-id";

/** Renderiza preview de cada URL do conteúdo de um post (vídeo embedado ou card do link). */
export function LinkPreviews({ content, autoplay = false }: LinkPreviewsProps) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlRegex) ?? [];
  const seen = new Set<string>();

  return (
    <>
      {urls.map((url) => {
        if (seen.has(url)) return null;
        seen.add(url);

        // GIF/imagem/vídeo/áudio de URL direta já são renderizados DENTRO do RichText; repetir
        // aqui era o que fazia o GIF aparecer duas vezes no post e no comentário. A pontuação final
        // sai antes da checagem: `.../giphy.gif.` (ponto da frase) tem que ser lido como o GIF dele.
        if (rendersInline(trimTrailingPunctuation(url))) return null;

        const video = extractVideoId(url);
        if (video) {
          return <EmbedPlayer key={url} type={video.type} id={video.id} autoplay={autoplay} />;
        }

        return (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-3 rounded-xl border border-border-soft bg-surface-1 px-4 py-3 text-sm font-normal transition hover:bg-surface-3"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-bold text-primary">
              {(() => {
                try {
                  return new URL(url).hostname.slice(0, 2).toUpperCase();
                } catch {
                  return texts.posts.video.icons.web;
                }
              })()}
            </div>

            <div className="min-w-0">
              <p className="truncate font-normal text-text-strong">
                {(() => {
                  try {
                    return new URL(url).hostname;
                  } catch {
                    return url;
                  }
                })()}
              </p>

              <p className="truncate text-xs font-normal text-text-subtle">
                {texts.posts.video.openLabel}
              </p>
            </div>
          </a>
        );
      })}
    </>
  );
}
