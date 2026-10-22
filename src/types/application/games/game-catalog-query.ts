/** Os filtros do catálogo (o backend só aceita estes valores — a lista é fechada). */
export type GameCatalogQuery = {
  query?: string;
  genre?: string;
  tag?: string;
  stage?: string;
  distribution?: string;
  order?: "recent" | "plays" | "title";
  limit?: number;
  cursor?: string | null;
};
