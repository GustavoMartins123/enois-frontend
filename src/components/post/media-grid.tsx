import { useQueries } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { PostView } from "@/types/application/feed/post-view";

import { mediaApi } from "@/lib/api";
import { resolveCdnUrl, withImageKitOriginal } from "@/lib/api/media";
import { autoplayVideoRef } from "@/lib/feed/video-autoplay";

import { LiteVideo } from "./lite-video";
import { SpoilerMedia } from "./spoiler-media";

/** Grade de mídias do post (vídeo único ou imagens) com visualização em tela cheia.
 *
 * `compact` encolhe as imagens para caber em espacos apertados (comentarios) sem quebrar
 * a largura em telas pequenas.
 */
export function MediaGrid({
  mediaIds,
  compact = false,
  mediaSpoiler = false,
}: Pick<PostView, "mediaIds"> & { compact?: boolean; mediaSpoiler?: boolean }) {
  const queryResults = useQueries({
    queries: mediaIds.map((id) => ({
      queryKey: ["media", id],
      queryFn: () => mediaApi.get(id),
      staleTime: 60_000,
    })),
  });

  const items = queryResults.filter((q) => q.data?.cdnUrl).map((q) => q.data!);

  if (items.length === 0) return null;

  const isVideo = items.some((m) => m.mimeType.startsWith("video/"));

  // Áudio (gravado no comentário): player com controles, sem autoplay — som que começa sozinho no
  // meio de uma conversa é o oposto do que esta rede quer.
  if (items.some((m) => m.mimeType.startsWith("audio/"))) {
    return (
      <div className="rounded-xl border border-border-soft bg-surface-1 p-2">
        <audio
          src={withImageKitOriginal(items[0].cdnUrl)}
          controls
          preload="metadata"
          className="w-full"
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="overflow-hidden rounded-xl border border-border-soft">
        <SpoilerMedia active={mediaSpoiler} label={texts.posts.mediaSpoiler.reveal}>
          {(revealed) => (
            <LiteVideo
              src={withImageKitOriginal(items[0].cdnUrl)}
              registerRef={revealed ? autoplayVideoRef : undefined}
            />
          )}
        </SpoilerMedia>
      </div>
    );
  }

  return (
    <>
      <SpoilerMedia active={mediaSpoiler} label={texts.posts.mediaSpoiler.reveal}>
        {() => (
          <div
            className={`grid gap-2 ${items.length === 1 ? "grid-cols-1" : "grid-cols-2"} ${
              compact ? "max-w-[280px]" : ""
            }`}
          >
            {items.map((m) => (
              <ImageLightbox key={m.id} src={resolveCdnUrl(m.cdnUrl)}>
                <button
                  type="button"
                  aria-label={texts.posts.imagePreview.open}
                  className="cursor-zoom-in overflow-hidden rounded-xl border border-border-soft bg-surface-1 text-left"
                >
                  <img
                    src={resolveCdnUrl(m.cdnUrl)}
                    alt=""
                    loading="lazy"
                    className={
                      items.length === 1
                        ? `h-auto w-full object-contain ${compact ? "max-h-[280px]" : "max-h-[36rem]"}`
                        : "aspect-square w-full object-contain"
                    }
                  />
                </button>
              </ImageLightbox>
            ))}
          </div>
        )}
      </SpoilerMedia>
    </>
  );
}
