import type { Theme, ThemeCollection } from "@rede-enois/design-system/domain";

export type ThemePreview = {
  collection: ThemeCollection;
  mode: Theme;
  title: string;
};
