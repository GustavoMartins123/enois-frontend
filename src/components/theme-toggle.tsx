import { usePreferencesStore } from "@/stores/preferences.store";
import { useThemePreviewStore } from "@/stores/theme-preview.store";
import type { Theme } from "@rede-enois/design-system/domain";
import { ThemeToggle as ThemeToggleView } from "@rede-enois/design-system/patterns";

/** Alterna claro/escuro. A aplicação no DOM fica em `useThemeSync`, no root. */
export function ThemeToggle() {
  const savedTheme = usePreferencesStore((state) => state.theme);
  const previewMode = useThemePreviewStore((state) => state.preview?.mode);
  const theme = previewMode ?? savedTheme;
  const setTheme = usePreferencesStore((state) => state.setTheme);

  const cycleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    if (previewMode) useThemePreviewStore.getState().setPreviewMode(next);
    else setTheme(next);
  };

  return <ThemeToggleView theme={theme} onToggle={cycleTheme} />;
}
