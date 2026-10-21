import { api } from "../api-client";

/** Tema publicado na galeria da comunidade (pacote = JSON de tokens, sem CSS livre). */
export type ThemeGalleryItem = {
  id: string;
  name: string;
  description: string;
  packageJson: string;
  modeDefault: string;
  installs: number;
  createdAt: string;
};

export const themesApi = {
  list: (limit = 60) =>
    api.get<ThemeGalleryItem[]>(`/temas/galeria${limit ? `?limit=${limit}` : ""}`),

  /** Os MEUS temas (qualquer estado) — é daqui que o marketplace lista o que dá para vender. */
  mine: () => api.get<ThemeGalleryItem[]>("/temas/galeria/mine"),
  get: (themeId: string) =>
    api.get<{ id: string; name: string; packageJson: string; modeDefault: string }>(
      `/temas/galeria/${themeId}`,
    ),
  publish: (data: {
    name: string;
    description?: string;
    packageJson: string;
    modeDefault: string;
  }) => api.post<{ id: string; status: string }>("/temas/galeria", data),
  install: (themeId: string) => api.post<{ status: string }>(`/temas/galeria/${themeId}/install`),
  report: (themeId: string) => api.post<{ status: string }>(`/temas/galeria/${themeId}/report`),
  hide: (themeId: string) => api.post<{ status: string }>(`/temas/galeria/${themeId}/hide`),
};
