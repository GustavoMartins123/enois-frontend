import type { ThemePresetId } from "@/types/preferences/theme-preset-id";
import type { ThemeSettings } from "@/types/preferences/theme-settings";

export type PresetRowProps = {
  /** Paleta atual, ou `null` quando o usuário já ajustou algo à mão. */
  activeId: ThemePresetId | null;
  onSelect: (settings: ThemeSettings) => void;
};
