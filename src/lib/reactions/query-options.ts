import { queryOptions } from "@tanstack/react-query";

import { reactionsApi } from "@/lib/api";

/**
 * Cache única do resumo (pílulas) e da lista (diálogo).
 *
 * Antes havia duas caches para o MESMO endpoint — `["reactions-summary", postId]` no resumo e
 * `["reactions", postId]` no diálogo. Remover uma reação atualizava uma e deixava a outra velha.
 * Com uma chave só, as duas telas enxergam a mesma verdade.
 */
export function reactionsQueryOptions(postId: string) {
  return queryOptions({
    queryKey: ["reactions", postId] as const,
    queryFn: () => reactionsApi.listReactions(postId),
    staleTime: 30_000,
  });
}
