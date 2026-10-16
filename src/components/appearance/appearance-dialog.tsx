import { useMemo } from "react";

import { THEME_LIMITS } from "@/constants/theme-defaults";
import { THEME_PRESETS } from "@/constants/theme-presets";
import { usePreferencesStore } from "@/stores/preferences.store";
import { texts } from "@/texts";
import type { AppearanceDialogProps } from "@/types/components/appearance/appearance-dialog-props";
import type { ThemeAccent } from "@/types/preferences/theme-accent";
import type { ThemeBackground } from "@/types/preferences/theme-background";
import type { ThemePresetId } from "@/types/preferences/theme-preset-id";
import { Moon, RotateCcw, Sun } from "lucide-react";

import { reportThemeContrast, sameThemeSettings } from "@/lib/theme/build-theme-tokens";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ContrastNotice } from "./contrast-notice";
import { PresetRow } from "./preset-row";
import { RangeField } from "./range-field";
import { ThemePreview } from "./theme-preview";

/** Sliders trabalham em 0–100; a conversão para o valor real fica aqui. */
const CHROMA_MAX = {
  accent: THEME_LIMITS.accentChroma.max,
  background: THEME_LIMITS.backgroundChroma.max,
} as const;

function percent(value: number, max: number): string {
  return `${Math.round((value / max) * 100)}%`;
}

/**
 * Personalização do tema.
 *
 * As mudanças valem na hora — o diálogo é o próprio preview, com uma amostra do
 * app ao lado e um aviso de contraste que avisa quando a combinação fica difícil
 * de ler. Não há "salvar" porque não há o que desfazer depois: é preferência.
 */
export function AppearanceDialog({ open, onOpenChange }: AppearanceDialogProps) {
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const settings = usePreferencesStore((state) => state.themeSettings);
  const setThemeSettings = usePreferencesStore((state) => state.setThemeSettings);
  const resetThemeSettings = usePreferencesStore((state) => state.resetThemeSettings);

  const report = useMemo(() => reportThemeContrast(settings, theme), [settings, theme]);

  const activePresetId = useMemo<ThemePresetId | null>(() => {
    const match = THEME_PRESETS.find((preset) => sameThemeSettings(preset.settings, settings));
    return match ? match.id : null;
  }, [settings]);

  const updateAccent = (patch: Partial<ThemeAccent>) =>
    setThemeSettings({ ...settings, accent: { ...settings.accent, ...patch } });

  const updateBackground = (patch: Partial<ThemeBackground>) =>
    setThemeSettings({ ...settings, background: { ...settings.background, ...patch } });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-normal">{texts.appearance.title}</DialogTitle>

          <DialogDescription>{texts.appearance.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <section className="space-y-2">
            <h3 className="text-xs font-medium text-text-strong">{texts.appearance.mode}</h3>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-normal transition",
                  theme === "light"
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border-soft bg-surface-1 text-text-subtle hover:text-text-strong",
                )}
              >
                <Sun className="h-3.5 w-3.5" />

                <>{texts.theme.light}</>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-normal transition",
                  theme === "dark"
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border-soft bg-surface-1 text-text-subtle hover:text-text-strong",
                )}
              >
                <Moon className="h-3.5 w-3.5" />

                <>{texts.theme.dark}</>
              </button>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-medium text-text-strong">{texts.appearance.presets}</h3>

            <PresetRow activeId={activePresetId} onSelect={setThemeSettings} />
          </section>

          <section className="space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-medium text-text-strong">
                {texts.appearance.accentSection}
              </h3>

              <p className="text-xs font-normal text-text-subtle">
                {texts.appearance.accentHint}
              </p>
            </div>

            <RangeField
              label={texts.appearance.hue}
              value={settings.accent.hue}
              min={THEME_LIMITS.hue.min}
              max={THEME_LIMITS.hue.max}
              step={1}
              valueLabel={texts.appearance.hueValue(Math.round(settings.accent.hue))}
              onChange={(hue) => updateAccent({ hue })}
              hueTrack
            />
            <RangeField
              label={texts.appearance.saturation}
              value={settings.accent.chroma}
              min={THEME_LIMITS.accentChroma.min}
              max={THEME_LIMITS.accentChroma.max}
              step={0.005}
              valueLabel={percent(settings.accent.chroma, CHROMA_MAX.accent)}
              onChange={(chroma) => updateAccent({ chroma })}
            />
            <RangeField
              label={texts.appearance.brightness}
              value={settings.accent.lightness}
              min={THEME_LIMITS.accentLightness.min}
              max={THEME_LIMITS.accentLightness.max}
              step={0.005}
              valueLabel={percent(
                settings.accent.lightness - THEME_LIMITS.accentLightness.min,
                THEME_LIMITS.accentLightness.max - THEME_LIMITS.accentLightness.min,
              )}
              onChange={(lightness) => updateAccent({ lightness })}
              hint={texts.appearance.brightnessHint}
            />
          </section>

          <section className="space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-medium text-text-strong">
                {texts.appearance.backgroundSection}
              </h3>

              <p className="text-xs font-normal text-text-subtle">
                {texts.appearance.backgroundHint}
              </p>
            </div>

            <RangeField
              label={texts.appearance.hue}
              value={settings.background.hue}
              min={THEME_LIMITS.hue.min}
              max={THEME_LIMITS.hue.max}
              step={1}
              valueLabel={texts.appearance.hueValue(Math.round(settings.background.hue))}
              onChange={(hue) => updateBackground({ hue })}
              hueTrack
            />
            <RangeField
              label={texts.appearance.backgroundIntensity}
              value={settings.background.chroma}
              min={THEME_LIMITS.backgroundChroma.min}
              max={THEME_LIMITS.backgroundChroma.max}
              step={0.001}
              valueLabel={percent(settings.background.chroma, CHROMA_MAX.background)}
              onChange={(chroma) => updateBackground({ chroma })}
            />
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-medium text-text-strong">{texts.appearance.preview}</h3>

            <ThemePreview />
            <ContrastNotice report={report} />
          </section>

          <div className="flex flex-wrap justify-between gap-2 border-t border-border-soft pt-4">
            <Button
              type="button"
              variant="ghost"
              className="w-auto rounded-full gap-2 text-sm"
              onClick={resetThemeSettings}
            >
              <RotateCcw className="h-3.5 w-3.5" />

              <>{texts.appearance.reset}</>
            </Button>

            <Button
              type="button"
              className="w-auto rounded-full px-6 text-sm"
              onClick={() => onOpenChange(false)}
            >
              {texts.appearance.done}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
