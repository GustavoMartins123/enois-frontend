import type { PostSeals } from "@/types/application/feed/post-seals";

import { api, buildQuery } from "../api-client";

/**
 * Selos de post. A leitura é pública e vem em lote (`ids` com os posts da tela); a escrita exige
 * sessão e é um selo por pessoa por post — o mesmo POST alterna (clicar de novo remove, outro troca).
 */
export const sealsApi = {
  forPosts: (postIds: string[]) =>
    api.get<Record<string, PostSeals>>(
      `/feed/posts/seals${buildQuery({ ids: postIds.join(",") })}`,
    ),

  toggle: (postId: string, seal: string) =>
    api.post<PostSeals>(`/feed/posts/${encodeURIComponent(postId)}/seals`, { seal }),

  remove: (postId: string) =>
    api.delete<PostSeals>(`/feed/posts/${encodeURIComponent(postId)}/seals`),
};
