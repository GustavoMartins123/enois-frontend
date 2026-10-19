import type { QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient | null = null;

export function registerBrowserQueryClient(queryClient: QueryClient) {
  if (typeof window === "undefined") return;
  browserQueryClient = queryClient;

  // Entrar ou sair em outra aba muda quem é o leitor desta. A renovação do token (valor trocado
  // por outro valor) é a mesma pessoa e não conta.
  window.addEventListener("storage", (event) => {
    if (event.storageArea !== localStorage) return;
    const sessionFlipped =
      event.key === "session_token" && (event.oldValue === null) !== (event.newValue === null);
    if (event.key === null || sessionFlipped) void queryClient.resetQueries();
  });
}

export function getBrowserQueryClient() {
  return browserQueryClient;
}

/**
 * Muitas respostas dependem de quem lê (favoritado, dono, seguindo). Trocar de sessão zera a cache
 * inteira: o que é privado some e o que está na tela é buscado de novo com a sessão nova.
 */
export function resetSessionScopedData() {
  void browserQueryClient?.resetQueries();
}
