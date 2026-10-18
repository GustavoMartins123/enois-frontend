import type { GameView } from "@/types/application/games/game-view";

import { api } from "../api-client";

/** Agregador de jogos (Parte E do plano): envio de LINK, moderação e páginas do criador. */
export const gamesApi = {
  /** Catálogo público de jogos publicados. */
  catalog: (limit = 60) => api.get<GameView[]>(`/games?limit=${limit}`),

  /** Página pública de jogos de um criador. */
  byUser: (username: string) => api.get<GameView[]>(`/games/${username}`),

  /** Um jogo específico de um criador (a rota de jogo embutido). */
  bySlug: (username: string, gameSlug: string) => api.get<GameView>(`/games/${username}/${gameSlug}`),

  /** Jogos de quem está logado (todos os status, para acompanhar a moderação). */
  mine: () => api.get<GameView[]>("/me/games"),

  /** Envia um jogo para moderação: o Énóis não hospeda, o link é obrigatório (https). */
  submit: (data: { slug: string; title: string; description?: string; cover?: string; url: string; tags?: string }) =>
    api.post<{ id: string; slug: string; status: string }>("/games", data),

  /** Reenvia um jogo rejeitado para nova rodada de moderação. */
  resubmit: (gameId: string) => api.post<{ id: string; status: string }>(`/games/${gameId}/resubmit`, {}),
};
