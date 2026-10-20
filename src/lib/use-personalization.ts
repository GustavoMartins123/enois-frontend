import { useQuery } from "@tanstack/react-query";

import { preferencesApi } from "@/lib/api";
import { useIsAuthenticated } from "@/lib/use-auth";

/** Os três controles de personalização, da mesma fonte única do backend. */
export function usePersonalization() {
  const authenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ["personalization"],
    queryFn: () => preferencesApi.getPersonalization(),
    enabled: authenticated,
    staleTime: 60_000,
  });
}

/** Módulos desativados pelo usuário (vazio = tudo habilitado, o padrão). */
export function useDisabledModules(): Set<string> {
  const { data } = usePersonalization();
  return new Set(data?.disabledModules ?? []);
}
