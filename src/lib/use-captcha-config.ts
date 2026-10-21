import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/lib/api";

/** Configuração pública do captcha: vem do backend para não depender de VITE_* no build. */
export function useCaptchaConfig() {
  return useQuery({
    queryKey: ["auth", "config"],
    queryFn: () => authApi.config(),
    staleTime: 5 * 60_000,
    retry: false,
  });
}
