import { queryOptions, useQuery } from "@tanstack/react-query";

import { profileApi } from "./api";
import { getSessionToken } from "./api-client";
import { getBrowserQueryClient } from "./query-client";

const CURRENT_USER_QUERY_KEY = ["me"] as const;

type CurrentUser = Awaited<ReturnType<typeof profileApi.me>>;

function getStoredCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("current_user");
  if (!stored) return null;

  try {
    return JSON.parse(stored) as CurrentUser;
  } catch {
    return null;
  }
}

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const user = await profileApi.me();
      localStorage.setItem("current_user", JSON.stringify(user));
      return user;
    },
    staleTime: 60_000,
    retry: 1,
    initialData: getStoredCurrentUser() ?? undefined,
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

  const stored = getStoredCurrentUser();
  const cached = getBrowserQueryClient()?.getQueryData<CurrentUser>(CURRENT_USER_QUERY_KEY);

  if (stored && cached && stored.id !== cached.id) return stored;
  return cached ?? stored;
}

export function getCurrentUserId() {
  return getCurrentUser()?.id ?? null;
}
