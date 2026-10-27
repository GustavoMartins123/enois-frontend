import { texts } from "@/texts";
import type { SkeletonListProps } from "@/types/components/skeletons/skeleton-list-props";
import { Skeleton } from "@rede-enois/design-system/ui";

/**
 * Balões da conversa em `mensagens`, alternando os dois lados como na tela real.
 *
 * O lado "minha mensagem" usa `bg-surface-2` em vez do primário: o skeleton só marca o espaço que
 * o balão vai ocupar, e um bloco colorido grande pulsando chamaria mais atenção que o conteúdo.
 */
export function MessageSkeletons({ count = 5 }: SkeletonListProps) {
  return (
    <div role="status" aria-label={texts.common.loading} className="space-y-3">
      {Array.from({ length: count }, (_, index) => {
        const isMine = index % 2 === 1;
        const widths = ["w-40", "w-56", "w-32"];

        return (
          <div
            key={index}
            className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
          >
            {!isMine && <Skeleton className="h-7 w-7 shrink-0 rounded-full" />}

            <div className="max-w-[75%] space-y-1.5">
              <Skeleton className={`h-4 rounded-xl ${widths[index % widths.length]}`} />
              <Skeleton className="h-4 rounded-xl bg-surface-2/70" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
