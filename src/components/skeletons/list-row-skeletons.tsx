import { texts } from "@/texts";
import type { SkeletonListProps } from "@/types/components/skeletons/skeleton-list-props";
import { Skeleton } from "@rede-enois/design-system/ui";

/**
 * Lista genérica que ainda não chegou: uma linha com avatar, duas linhas de texto e a ação à
 * direita. Serve para as filas de moderação e para as listas sem card próprio (mentores, horários),
 * onde desenhar um cartão específico do produto seria inventar um formato que a tela não tem.
 */
export function ListRowSkeletons({ count = 4 }: SkeletonListProps) {
  return (
    <div role="status" aria-label={texts.common.loading} className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="surface-card flex items-center gap-3 p-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-44" />
            <Skeleton className="h-3 w-2/3" />
          </div>

          <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}
