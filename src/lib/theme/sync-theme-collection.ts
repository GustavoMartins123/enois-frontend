import { preferencesApi } from "@/lib/api";
import { getSessionToken } from "@/lib/api-client";

/**
 * Leva a escolha de tema para a conta, quando existe uma.
 *
 * Fire-and-forget de propósito: a preferência local já vale para quem está
 * trocando — a sincronização existe para os outros dispositivos, e falhar
 * (offline, sessão expirando) não pode atrapalhar a troca em si. A próxima
 * escolha tenta de novo.
 */
export async function syncThemeCollection(collectionId: string | null): Promise<void> {
  if (!getSessionToken()) return;
  try {
    await preferencesApi.setTheme(collectionId);
  } catch {
    // silencioso: o valor da conta é recuperado no próximo login de qualquer forma
  }
}
