import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const PREFERENCES_STORAGE_KEY = "connect-grow-preferences";
const LEGACY_THEME_STORAGE_KEY = "connect-grow-theme";
const LEGACY_SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

const preferencesStorage = {
  getItem: (name: string) => {
    const stored = localStorage.getItem(name);
    if (stored !== null) return stored;

    const legacyTheme = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    const legacySidebarCollapsed = localStorage.getItem(LEGACY_SIDEBAR_STORAGE_KEY);

    if (legacyTheme === null && legacySidebarCollapsed === null) return null;

    const theme =
      legacyTheme === "light" || legacyTheme === "dark" || legacyTheme === "system"
        ? legacyTheme
        : "system";

    return JSON.stringify({
      state: {
        theme,
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

export const usePreferencesStore = create()(
  persist(
    (set) => ({
      theme: "system" as "light" | "dark" | "system",
      sidebarCollapsed: false,

      setTheme: (theme: "light" | "dark" | "system") => set({ theme }),
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
