import type { SkeletonProps } from "@/types/components/ui/skeleton-props";

import { cn } from "@/lib/utils";

/**
 * Bloco cinza pulsando no lugar de um conteúdo que ainda vai chegar.
 *
 * `aria-hidden`: quem anuncia o carregamento para o leitor de tela é o contêiner da lista (com
 * `role="status"`), não cada pedaço — senão ele lia "carregando" uma dúzia de vezes.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-surface-2", className)} />;
}
