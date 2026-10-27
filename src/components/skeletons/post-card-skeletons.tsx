import { texts } from "@/texts";
import type { SkeletonListProps } from "@/types/components/skeletons/skeleton-list-props";
import { Skeleton } from "@rede-enois/design-system/ui";

/** Mesmo desenho do `PostCard` (autor, texto, barra de ações), sem o conteúdo. */
export function PostCardSkeletons({ count = 3 }: SkeletonListProps) {
  return (
    <div role="status" aria-label={texts.common.loading} className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="surface-card space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-3/5" />
          </div>

          <div className="flex items-center gap-4 border-t border-border-soft pt-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      ))}
    </div>
  );
}
