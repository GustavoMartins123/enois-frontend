import type { GalleryThemePackage } from "@/types/lib/theme/gallery-theme-package";
import type { ThemePreview } from "@/types/lib/theme/theme-preview";
import type { Theme } from "@/types/preferences/theme";

export type ThemePreviewState = {
  preview: ThemePreview | null;
  startPreview: (theme: GalleryThemePackage, title: string) => void;
  setPreviewMode: (mode: Theme) => void;
  stopPreview: () => void;
};
