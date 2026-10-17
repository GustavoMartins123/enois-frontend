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
  getTheme: () => api.get<{ theme: string | null }>("/me/theme"),

  setTheme: (theme: string | null) => api.put<void>("/me/theme", { theme }),

  /** Identidade exibida: apelido, nome social e pronomes (campo nulo/vazio limpa). */
  setIdentity: (data: {
    nickname?: string | null;
    socialName?: string | null;
    pronouns?: string | null;
  }) => api.put<Profile>("/me/identity", data),
};
