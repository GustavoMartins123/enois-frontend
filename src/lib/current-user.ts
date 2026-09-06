import { queryOptions, useQuery } from "@tanstack/react-query";

import { profileApi } from "./api";
import { getSessionToken } from "./api-client";
import { getBrowserQueryClient } from "./query-client";

const CURRENT_USER_QUERY_KEY = ["me"] as const;

type CurrentUser = Awaited<ReturnType<typeof profileApi.me>>;

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => profileApi.me(),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCurrentUser() {
  const token = getSessionToken();

  return useQuery({
    ...currentUserQueryOptions(),
    enabled: !!token,
  });
}

export function getCurrentUser(): CurrentUser | null {
  if (!getSessionToken()) return null;

  return getBrowserQueryClient()?.getQueryData<CurrentUser>(CURRENT_USER_QUERY_KEY) ?? null;
}

export function getCurrentUserId() {
  return getCurrentUser()?.id ?? null;
}
