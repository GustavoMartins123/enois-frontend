import type { BackgroundStyle } from "@/types/preferences/background-style";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeSettings } from "@/types/preferences/theme-settings";

export type PreferencesState = {
  theme: Theme;
  sidebarCollapsed: boolean;
  themeSettings: ThemeSettings;
  /** Coleção temática ativa (`null` = padrão da marca). */
  themeCollection: string | null;
  /** Plano de fundo escolhido na personalização (`null` = comportamento automático). */
  backgroundStyle: BackgroundStyle | null;
  setTheme: (theme: Theme) => void;
  setThemeSettings: (settings: ThemeSettings) => void;
  resetThemeSettings: () => void;
  setThemeCollection: (collectionId: string | null) => void;
  setBackgroundStyle: (style: BackgroundStyle | null) => void;
  toggleSidebar: () => void;
};
