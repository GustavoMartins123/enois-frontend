import { authApi, clearSession } from "./api";

/**
 * Encerra a sessão: avisa o backend (best-effort), limpa os tokens locais e
 * recarrega a aplicação para descartar qualquer estado em memória.
 */
export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // O token pode já estar inválido no backend — a limpeza local acontece de qualquer forma.
  }

  clearSession();

  if (typeof window !== "undefined") {
    window.location.href = "/entrar";
  }
}
