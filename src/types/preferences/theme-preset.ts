import type { ThemePresetId } from "./theme-preset-id";
import type { ThemeSettings } from "./theme-settings";

export type ThemePreset = {
  id: ThemePresetId;
  settings: ThemeSettings;
};
