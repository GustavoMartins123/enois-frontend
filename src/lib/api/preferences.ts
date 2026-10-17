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
};
