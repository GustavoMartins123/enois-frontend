import type { GifSearchResult } from "@/types/application/gifs/gif-search-result";

import { api, buildQuery } from "../api-client";

/**
 * Busca de GIF para o seletor do comentário.
 *
 * A chave do provedor (Tenor/GIPHY) fica só no servidor: aqui é o backend que fala com o provedor e
 * devolve as URLs prontas. Sem chave configurada, `available` volta `false` e o seletor avisa.
 */
export const gifsApi = {
  search: (query: string, limit = 24) =>
    api.get<GifSearchResult>(`/gifs/search${buildQuery({ q: query, limit })}`),
};
