import type { BackgroundStyle } from "@/types/preferences/background-style";
import type { Theme } from "@/types/preferences/theme";
import type { ThemeSettings } from "@/types/preferences/theme-settings";

export type PreferencesState = {
  theme: Theme;
  sidebarCollapsed: boolean;
  themeSettings: ThemeSettings;
  /** Coleção temática ativa (`null` = padrão da marca). */
  themeCollection: string | null;
  /** Cor de widget escolhida (cartões/painéis/menus); `null` = do tema ou da marca. */
  widgetBackground: BackgroundStyle | null;
  /** Plano de fundo da página (atrás de tudo); `null` = do tema ou da marca. */
  pageBackground: BackgroundStyle | null;
  setTheme: (theme: Theme) => void;
  setThemeSettings: (settings: ThemeSettings) => void;
  resetThemeSettings: () => void;
  setThemeCollection: (collectionId: string | null) => void;
  setWidgetBackground: (style: BackgroundStyle | null) => void;
  setPageBackground: (style: BackgroundStyle | null) => void;
  toggleSidebar: () => void;
};
