import type { Theme } from "@/types/preferences/theme";
import type { ThemeSettings } from "@/types/preferences/theme-settings";

export type PreferencesState = {
  theme: Theme;
  sidebarCollapsed: boolean;
  themeSettings: ThemeSettings;
  setTheme: (theme: Theme) => void;
  setThemeSettings: (settings: ThemeSettings) => void;
  resetThemeSettings: () => void;
  toggleSidebar: () => void;
};
