import type { SearchResponse } from "@/types/application/search/search-response";

import { api, buildQuery } from "../api-client";

export const searchApi = {
  search: (q: string, types?: string[], limit = 10) =>
    api.get<SearchResponse>(
      `/search${buildQuery({
        q,
        types: types?.join(","),
        limit,
      })}`,
    ),
};
