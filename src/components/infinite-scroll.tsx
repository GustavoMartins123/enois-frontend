import { useEffect, useRef } from "react";

import type { InfiniteScrollProps } from "@/types/components/infinite-scroll-props";
import { Loader2 } from "lucide-react";

/**
 * Sentinela de scroll infinito: quando ela entra na viewport (com margem para ja ir buscando
 * antes de chegar no fim), dispara onLoadMore. Tambem mostra o estado do carregamento e o fim
 * da lista, para o usuario saber que nao ha mais paginas.
 */
export function InfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  loadingLabel,
  endLabel,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "400px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (hasMore) {
    return (
      <div ref={sentinelRef} className="flex justify-center py-4">
        {loading && (
          <span className="inline-flex items-center gap-2 text-[13px] font-light text-text-subtle">
            <Loader2 className="h-4 w-4 animate-spin" />

            <>{loadingLabel}</>
          </span>
        )}
      </div>
    );
  }

  if (!endLabel) return null;

  return <p className="py-6 text-center text-[13px] font-light text-text-subtle">{endLabel}</p>;
}
