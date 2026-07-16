import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { profileApi } from "./api";
import { getSessionToken } from "./api-client";

export function isAuthenticated(): boolean {
  return !!getSessionToken();
}

export function useAuth() {
  const navigate = useNavigate();
  const token = getSessionToken();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: () => profileApi.me(),
    enabled: !!token,
    retry: 1,
    staleTime: 60_000,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!token,
    requireAuth: () => {
      if (!token) {
        navigate({ to: "/entrar", search: { tab: "login" } });
        return false;
      }
      return true;
    },
  };
}
