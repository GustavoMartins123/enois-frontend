import { DEFAULT_THEME_SETTINGS } from "@/constants/theme-defaults";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeSettings } from "@/types/preferences/theme-settings";
import type { PreferencesState } from "@/types/stores/preferences-state";
import type { PreferencesStorageValue } from "@/types/stores/preferences-storage-value";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { resolveThemeCollection } from "@/lib/theme/build-collection-css";
import { clampThemeSettings } from "@/lib/theme/build-theme-tokens";

const PREFERENCES_STORAGE_KEY = "connect-grow-preferences";
const LEGACY_THEME_STORAGE_KEY = "connect-grow-theme";
const LEGACY_SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

function readNumber(source: Record<string, unknown>, key: string, fallback: number): number {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Traz o tema salvo de volta para uma forma válida.
 *
 * O storage é editável à mão e sobrevive a versões antigas do app, então nada
 * aqui pode confiar no formato: valores fora das faixas seguras são corrigidos.
 */
function normalizeThemeSettings(value: unknown): ThemeSettings {
  if (typeof value !== "object" || value === null) return DEFAULT_THEME_SETTINGS;

  const settings = value as Record<string, unknown>;
  const accent = (settings.accent ?? {}) as Record<string, unknown>;
  const background = (settings.background ?? {}) as Record<string, unknown>;

  return clampThemeSettings({
    accent: {
      hue: readNumber(accent, "hue", DEFAULT_THEME_SETTINGS.accent.hue),
      chroma: readNumber(accent, "chroma", DEFAULT_THEME_SETTINGS.accent.chroma),
      lightness: readNumber(accent, "lightness", DEFAULT_THEME_SETTINGS.accent.lightness),
    },
    background: {
      hue: readNumber(background, "hue", DEFAULT_THEME_SETTINGS.background.hue),
      chroma: readNumber(background, "chroma", DEFAULT_THEME_SETTINGS.background.chroma),
    },
  });
}

/**
 * Coleção temática do storage: só aceita identificador que existe hoje.
 *
 * Um tema removido (ou um valor inventado no localStorage) volta a `null` — o
 * padrão da marca — em vez de carregar um tema pela metade.
 */
function normalizeThemeCollection(value: unknown): string | null {
  return typeof value === "string" ? (resolveThemeCollection(value)?.id ?? null) : null;
}

const preferencesStorage = {
  getItem: (name: string) => {
    const stored = localStorage.getItem(name);
    if (stored !== null) {
      try {
        const parsed = JSON.parse(stored) as PreferencesStorageValue;

        if (parsed.state) {
          parsed.state.theme = parsed.state.theme === "dark" ? "dark" : "light";
          parsed.state.themeSettings = normalizeThemeSettings(parsed.state.themeSettings);
          parsed.state.themeCollection = normalizeThemeCollection(parsed.state.themeCollection);
        }

        return JSON.stringify(parsed);
      } catch {
        return stored;
      }
    }

    const legacyTheme = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    const legacySidebarCollapsed = localStorage.getItem(LEGACY_SIDEBAR_STORAGE_KEY);

    if (legacyTheme === null && legacySidebarCollapsed === null) return null;

    return JSON.stringify({
      state: {
        theme: legacyTheme === "dark" ? "dark" : "light",
        sidebarCollapsed: legacySidebarCollapsed === "true",
      },
      version: 0,
    });
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value);
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
    localStorage.removeItem(LEGACY_SIDEBAR_STORAGE_KEY);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarCollapsed: false,
      themeSettings: DEFAULT_THEME_SETTINGS,
      themeCollection: null,

      setTheme: (theme: Theme) => set({ theme }),
      setThemeSettings: (themeSettings: ThemeSettings) =>
        set({ themeSettings: clampThemeSettings(themeSettings) }),
      // Restaurar o padrão devolve a marca inteira: cores livres E sem coleção.
      resetThemeSettings: () =>
        set({ themeSettings: DEFAULT_THEME_SETTINGS, themeCollection: null }),
      setThemeCollection: (themeCollection: string | null) => set({ themeCollection }),
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => preferencesStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        themeSettings: state.themeSettings,
        themeCollection: state.themeCollection,
      }),
      skipHydration: true,
    },
  ),
);

let hydrationStarted = false;

export function hydratePreferences() {
  if (hydrationStarted) return;
  hydrationStarted = true;
  void usePreferencesStore.persist.rehydrate();
}
