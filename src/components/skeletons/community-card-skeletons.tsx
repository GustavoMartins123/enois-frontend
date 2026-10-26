import { texts } from "@/texts";
import type { SkeletonListProps } from "@/types/components/skeletons/skeleton-list-props";
import { Skeleton } from "@rede-enois/design-system/ui";

/** Mesmo desenho do `CommunityCard` (capa, avatar, título, descrição, rodapé), sem o conteúdo. */
export function CommunityCardSkeletons({ count = 6 }: SkeletonListProps) {
  return (
    <div
      role="status"
      aria-label={texts.common.loading}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="surface-card overflow-hidden">
          <Skeleton className="h-32 w-full rounded-none" />

          <div className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />

            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
