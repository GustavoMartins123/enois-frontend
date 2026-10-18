import type { PostSeals } from "@/types/application/feed/post-seals";
import type { SealsPeople } from "@/types/application/feed/seals-people";

import { api, buildQuery } from "../api-client";

/**
 * Selos de post. A leitura é pública e vem em lote (`ids` com os posts da tela); a escrita exige
 * sessão. Cada selo é independente: o mesmo POST alterna UM selo (clicar de novo tira, clicar em
 * outro acrescenta), e o DELETE tira todos os meus de uma vez.
 */
export const sealsApi = {
  forPosts: (postIds: string[]) =>
    api.get<Record<string, PostSeals>>(
      `/feed/posts/seals${buildQuery({ ids: postIds.join(",") })}`,
    ),

  /** Quem marcou o post, com o selo de cada pessoa — o que a linha de selos abre. */
  people: (postId: string) =>
    api.get<SealsPeople>(`/feed/posts/${encodeURIComponent(postId)}/seals/people`),

  toggle: (postId: string, seal: string) =>
    api.post<PostSeals>(`/feed/posts/${encodeURIComponent(postId)}/seals`, { seal }),

  /** Tira todos os meus selos deste post. */
  remove: (postId: string) =>
    api.delete<PostSeals>(`/feed/posts/${encodeURIComponent(postId)}/seals`),
};
