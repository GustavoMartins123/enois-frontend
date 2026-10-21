import { texts } from "@/texts";
import type { SkeletonListProps } from "@/types/components/skeletons/skeleton-list-props";

import { Skeleton } from "@/components/ui/skeleton";

/** Mesmo desenho do card de vaga (logo, título, empresa, tags, rodapé), sem o conteúdo. */
export function JobCardSkeletons({ count = 4 }: SkeletonListProps) {
  return (
    <div
      role="status"
      aria-label={texts.common.loading}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="surface-card space-y-4 p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
