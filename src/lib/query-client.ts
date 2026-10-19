import type { QueryClient } from "@tanstack/react-query";

import { isSessionKeyEvent } from "./session-key";

let browserQueryClient: QueryClient | null = null;

export function registerBrowserQueryClient(queryClient: QueryClient) {
  if (typeof window === "undefined") return;
  browserQueryClient = queryClient;

  // Entrar, sair ou trocar de conta em outra aba muda quem é o leitor desta. Renovar o token não
  // muda a chave da sessão; o token que aparece ou some cobre sessões abertas antes da chave existir.
  window.addEventListener("storage", (event) => {
    if (event.storageArea !== localStorage) return;
    const sessionFlipped =
      event.key === "session_token" && (event.oldValue === null) !== (event.newValue === null);
    if (event.key === null || isSessionKeyEvent(event) || sessionFlipped) {
      void queryClient.resetQueries();
    }
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
