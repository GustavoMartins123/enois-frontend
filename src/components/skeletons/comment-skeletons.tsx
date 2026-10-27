import { texts } from "@/texts";
import type { SkeletonListProps } from "@/types/components/skeletons/skeleton-list-props";
import { Skeleton } from "@rede-enois/design-system/ui";

/** Mesmo desenho do `CommentItem` (avatar, nome, balão de texto), sem o conteúdo. */
export function CommentSkeletons({ count = 3 }: SkeletonListProps) {
  return (
    <div role="status" aria-label={texts.common.loading} className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex gap-2 sm:gap-2.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1">
            <div className="rounded-xl bg-surface-1 px-3 py-2">
              <Skeleton className="h-3 w-28" />

              <div className="mt-2 space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>

            <Skeleton className="mt-1.5 ml-3 h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
