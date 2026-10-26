import type { Theme } from "@/types/preferences/theme";
import type { ThemeCollection } from "@/types/preferences/theme-collection";

export type ThemePreview = {
  collection: ThemeCollection;
  mode: Theme;
  title: string;
};
