import { queryOptions } from "@tanstack/react-query";

import { reactionsApi } from "@/lib/api";

/**
 * Cache única do resumo (pílulas) e da lista (diálogo).
 *
 * Antes havia duas caches para o MESMO endpoint — `["reactions-summary", postId]` no resumo e
 * `["reactions", postId]` no diálogo. Remover uma reação atualizava uma e deixava a outra velha.
 * Com uma chave só, as duas telas enxergam a mesma verdade.
 */
const REACTIONS_STALE_MS = 30_000;

export function reactionsQueryOptions(postId: string) {
  return queryOptions({
    queryKey: ["reactions", postId] as const,
    queryFn: () => reactionsApi.listReactions(postId),
    // Cache parcial (resumo do feed / otimismo, sem a lista) conta como velho: abrir o diálogo busca.
    staleTime: (query) => (query.state.data?.partial ? 0 : REACTIONS_STALE_MS),
  });
}
