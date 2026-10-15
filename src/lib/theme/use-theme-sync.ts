import { useEffect } from "react";

import { hydratePreferences, usePreferencesStore } from "@/stores/preferences.store";

import { applyThemeSettings } from "./apply-theme";

/**
 * Único ponto que leva modo (claro/escuro) e personalização para o DOM.
 *
 * Fica no root para valer em qualquer rota — inclusive nas telas públicas, que
 * não renderizam o botão de tema.
 */
export function useThemeSync(): void {
  const theme = usePreferencesStore((state) => state.theme);
  const themeSettings = usePreferencesStore((state) => state.themeSettings);

  useEffect(() => {
    hydratePreferences();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    applyThemeSettings(themeSettings, theme);
  }, [theme, themeSettings]);
}
