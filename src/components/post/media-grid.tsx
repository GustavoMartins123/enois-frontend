import { useState } from "react";

import { useQueries } from "@tanstack/react-query";

import type { PostView } from "@/types/application/feed/post-view";

import { mediaApi } from "@/lib/api";
import { resolveCdnUrl, withImageKitOriginal } from "@/lib/api/media";
import { autoplayVideoRef } from "@/lib/feed/video-autoplay";

/** Grade de mídias do post (vídeo único ou imagens) com visualização em tela cheia.
 *
 * `compact` encolhe as imagens para caber em espacos apertados (comentarios) sem quebrar
 * a largura em telas pequenas.
 */
export function MediaGrid({
  mediaIds,
  compact = false,
}: Pick<PostView, "mediaIds"> & { compact?: boolean }) {
  const queryResults = useQueries({
    queries: mediaIds.map((id) => ({
      queryKey: ["media", id],
      queryFn: () => mediaApi.get(id),
      staleTime: 60_000,
    })),
  });

  const items = queryResults.filter((q) => q.data?.cdnUrl).map((q) => q.data!);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

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
        <video
          ref={autoplayVideoRef}
          src={withImageKitOriginal(items[0].cdnUrl)}
          // O play/pause automático (um vídeo por vez, sempre mudo) é feito por `autoplayVideoRef`.
          // `muted` + `playsInline` são o que fazem o play automático ser aceito no navegador (e no
          // iOS, sem virar tela cheia): o som vem quando a pessoa quiser, pelo controle do vídeo.
          muted
          playsInline
          preload="metadata"
          controls
          className="max-h-96 w-full bg-surface-1"
        />
      </div>
    );
  }

  return (
    <>
      <div className={`grid gap-2 ${items.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {items.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setFullscreenUrl(resolveCdnUrl(m.cdnUrl) ?? null)}
            className="overflow-hidden rounded-xl border border-border-soft text-left"
          >
            <img
              src={resolveCdnUrl(m.cdnUrl)}
              alt=""
              loading="lazy"
              className={`w-full object-cover bg-surface-1 transition hover:scale-105 ${
                compact ? "h-28 sm:h-36" : "h-48"
              }`}
            />
          </button>
        ))}
      </div>
      {fullscreenUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setFullscreenUrl(null)}
        >
          <img
            src={fullscreenUrl}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
