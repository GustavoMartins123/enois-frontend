import type { UserSearchResult } from "@/types/application/user/user-search-result";

import { api, buildQuery } from "../api-client";

export const usersApi = {
  search: (query: string) =>
    api.get<UserSearchResult[]>(`/users/search${buildQuery({ q: query })}`),
};
