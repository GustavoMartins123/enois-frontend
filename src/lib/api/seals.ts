import type { PostSeals } from "@/types/application/feed/post-seals";
import type { SealsPeople } from "@/types/application/feed/seals-people";
import type { SealsWaiter } from "@/types/lib/api/seals-waiter";

import { api, buildQuery } from "../api-client";

/**
 * Selos de post. A leitura é pública e vem em lote (`ids` com os posts da tela); a escrita exige
 * sessão. Cada selo é independente: o mesmo POST alterna UM selo (clicar de novo tira, clicar em
 * outro acrescenta), e o DELETE tira todos os meus de uma vez.
 */
/** Teto de ids por chamada: o mesmo `MAX_IDS` do backend (ids além disso são ignorados lá). */
const SEALS_BATCH_MAX_IDS = 100;
/** Janela para juntar os cards que montam juntos (a página do feed) numa chamada só. */
const SEALS_BATCH_WINDOW_MS = 0;
const EMPTY_SEALS: PostSeals = { seals: [], mySeals: [] };

let pendingSeals: Map<string, SealsWaiter[]> | null = null;

async function flushSeals(batch: Map<string, SealsWaiter[]>): Promise<void> {
  const ids = [...batch.keys()];
  for (let start = 0; start < ids.length; start += SEALS_BATCH_MAX_IDS) {
    const chunk = ids.slice(start, start + SEALS_BATCH_MAX_IDS);
    try {
      const all = await sealsApi.forPosts(chunk);
      for (const id of chunk) {
        for (const waiter of batch.get(id) ?? []) waiter.resolve(all[id] ?? EMPTY_SEALS);
      }
    } catch (error) {
      for (const id of chunk) {
        for (const waiter of batch.get(id) ?? []) waiter.reject(error);
      }
    }
  }
}

export const sealsApi = {
  forPosts: (postIds: string[]) =>
    api.get<Record<string, PostSeals>>(
      `/feed/posts/seals${buildQuery({ ids: postIds.join(",") })}`,
    ),

  /**
   * Selos de UM post, mas em lote: cada card pede o seu e os pedidos do mesmo instante viram uma
   * chamada só ao `forPosts`. Antes cada card chamava `forPosts([id])` e o lote não servia de nada.
   */
  forPost: (postId: string): Promise<PostSeals> =>
    new Promise<PostSeals>((resolve, reject) => {
      if (!pendingSeals) {
        pendingSeals = new Map();
        setTimeout(() => {
          const batch = pendingSeals;
          pendingSeals = null;
          if (batch) void flushSeals(batch);
        }, SEALS_BATCH_WINDOW_MS);
      }
      const waiters = pendingSeals.get(postId) ?? [];
      waiters.push({ resolve, reject });
      pendingSeals.set(postId, waiters);
    }),

  /** Quem marcou o post, com o selo de cada pessoa — o que a linha de selos abre. */
  people: (postId: string) =>
    api.get<SealsPeople>(`/feed/posts/${encodeURIComponent(postId)}/seals/people`),

  toggle: (postId: string, seal: string) =>
    api.post<PostSeals>(`/feed/posts/${encodeURIComponent(postId)}/seals`, { seal }),

  /** Tira todos os meus selos deste post. */
  remove: (postId: string) =>
    api.delete<PostSeals>(`/feed/posts/${encodeURIComponent(postId)}/seals`),
};
