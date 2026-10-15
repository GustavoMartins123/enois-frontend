import { THEME_PRESETS } from "@/constants/theme-presets";
import { texts } from "@/texts";
import type { PresetRowProps } from "@/types/components/appearance/preset-row-props";

import { oklchToHex } from "@/lib/theme/color";
import { cn } from "@/lib/utils";

/** Paletas prontas: dois círculos (destaque e fundo) e o nome. */
export function PresetRow({ activeId, onSelect }: PresetRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {THEME_PRESETS.map((preset) => {
        const { accent, background } = preset.settings;
        const active = preset.id === activeId;

        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset.settings)}
            aria-pressed={active}
            title={texts.appearance.presetLabels[preset.id]}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-light transition",
              active
                ? "border-primary bg-primary-soft text-primary"
                : "border-border-soft bg-surface-1 text-text-subtle hover:text-text-strong",
            )}
          >
            <span className="flex -space-x-1" aria-hidden>
              <span
                className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                style={{ background: oklchToHex(accent.lightness, accent.chroma, accent.hue) }}
              />
              <span
                className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                style={{
                  background: oklchToHex(0.9, Math.max(0.004, background.chroma), background.hue),
                }}
              />
            </span>

            <>{texts.appearance.presetNames[preset.id]}</>
          </button>
        );
      })}
    </div>
  );
}
