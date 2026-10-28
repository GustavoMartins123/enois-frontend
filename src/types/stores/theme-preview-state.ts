import type { ThemePreview } from "@/types/lib/theme/theme-preview";
import type { GalleryThemePackage, Theme } from "@rede-enois/design-system/domain";

export type ThemePreviewState = {
  preview: ThemePreview | null;
  startPreview: (theme: GalleryThemePackage, title: string) => void;
  setPreviewMode: (mode: Theme) => void;
  stopPreview: () => void;
};
