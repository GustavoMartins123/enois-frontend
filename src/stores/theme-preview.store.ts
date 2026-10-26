import type { ThemePreviewState } from "@/types/stores/theme-preview-state";
import { create } from "zustand";

import { buildGalleryCollection } from "@/lib/theme/gallery-collections";

// Sem persistência: recarregar ou fechar a página nunca conserva um tema em avaliação.
export const useThemePreviewStore = create<ThemePreviewState>((set) => ({
  preview: null,
  startPreview: (theme, title) =>
    set({
      preview: {
        collection: buildGalleryCollection(theme),
        mode: theme.modeDefault === "dark" ? "dark" : "light",
        title,
      },
    }),
  setPreviewMode: (mode) =>
    set((state) => ({ preview: state.preview ? { ...state.preview, mode } : null })),
  stopPreview: () => set({ preview: null }),
}));
