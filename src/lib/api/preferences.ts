import type { LinkedinImportPreview } from "@/types/application/profile/linkedin-import-preview";
import type { Profile } from "@/types/application/profile/profile";

import { api } from "../api-client";

/**
 * Preferências sincronizadas com a conta.
 *
 * O tema da coleção é a primeira: escolha individual, persistida no backend para
 * acompanhar a pessoa entre dispositivos. Convidado não tem conta — para ele a
 * preferência é só local, e estes endpoints nunca são chamados.
 */
export const preferencesApi = {
  /** Coleção temática ativa na conta; `null` é o padrão da marca. */
  getTheme: () => api.get<{ theme: string | null; updatedAt: string | null }>("/me/theme"),

  setTheme: (theme: string | null) => api.put<void>("/me/theme", { theme }),

  /** Identidade exibida: apelido, nome social e pronomes (campo nulo/vazio limpa). */
  setIdentity: (data: {
    nickname?: string | null;
    socialName?: string | null;
    pronouns?: string | null;
  }) => api.put<Profile>("/me/identity", data),

  /** Até 5 emblemas (URLs do CDN); lista vazia limpa. */
  setBadges: (badges: string[]) => api.put<Profile>("/me/badges", { badges }),

  /**
   * Importar o ARQUIVO DE DADOS do LinkedIn (multipart): devolve o retrato parseado
   * para revisão — nada é salvo automaticamente. Usa fetch direto (multipart).
   */
  importLinkedinArchive: async (file: File) => {
    const { getSessionToken } = await import("../api-client");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/me/import/linkedin", {
      method: "POST",
      headers: { "X-Session-Token": getSessionToken() ?? "" },
      body: formData,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.message ?? "Não foi possível ler o arquivo do LinkedIn.");
    }
    return (await response.json()) as LinkedinImportPreview;
  },
};
