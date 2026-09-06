import type { QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient | null = null;

export function registerBrowserQueryClient(queryClient: QueryClient) {
  if (typeof window === "undefined") return;
  browserQueryClient = queryClient;
}

export function getBrowserQueryClient() {
  return browserQueryClient;
}
