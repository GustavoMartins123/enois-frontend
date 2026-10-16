import { texts } from "@/texts";
import type { PostView } from "@/types/application/feed/post-view";

/** URL de mídia direta de GIF (Giphy/Tenor) — renderiza a imagem, sem iframe. */
function gifMediaUrl(url: string): string | null {
  if (/^https?:\/\/(media|i)\.giphy\.com\//.test(url) || /^https?:\/\/media\d*\.tenor\.com\//.test(url)
      || /\.gif(\?|$)/i.test(url)) {
    return url;
  }
  // Página do Giphy: monta a mídia a partir do id no fim do slug.
  const giphy = url.match(/giphy\.com\/(?:gifs\/)?[^/?#]*-([a-zA-Z0-9]+)\/?$/);
  if (giphy) return `https://media.giphy.com/media/${giphy[1]}/giphy.gif`;
  return null;
}

import { EmbedPlayer } from "./embed-player";
import { extractVideoId } from "./extract-video-id";

/** Renderiza preview de cada URL do conteúdo de um post (vídeo embedado ou card do link). */
export function LinkPreviews({ content }: Pick<PostView, "content">) {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlRegex) ?? [];
  const seen = new Set<string>();

  return (
    <>
      {urls.map((url) => {
        if (seen.has(url)) return null;
        seen.add(url);

        const video = extractVideoId(url);
        if (video) {
          return <EmbedPlayer key={url} type={video.type} id={video.id} />;
        }

        const gif = gifMediaUrl(url);
        if (gif) {
          return (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
              <img
                src={gif}
                alt="GIF"
                loading="lazy"
                className="max-h-72 w-auto rounded-xl border border-border-soft"
              />
            </a>
          );
        }

        return (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-3 rounded-xl border border-border-soft bg-surface-1 px-4 py-3 text-[13px] font-light transition hover:bg-surface-3"
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

              <p className="truncate text-[11px] font-light text-text-subtle">{url}</p>
            </div>
          </a>
        );
      })}
    </>
  );
}
