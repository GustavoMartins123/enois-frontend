import type { PageResponse } from "@/types/application/api/page-response";
import type { SearchResult } from "@/types/application/search/search-result";

import { api, buildQuery } from "../api-client";

export const searchApi = {
  search: (q: string, types?: SearchResult["type"][], limit = 10) =>
    api.get<PageResponse<SearchResult>>(
      `/search${buildQuery({
        q,
        types: types?.join(","),
        limit,
      })}`,
    ),
};
