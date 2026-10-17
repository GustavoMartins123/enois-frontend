import type { ReactNode } from "react";

import { texts } from "@/texts";
import type { BackgroundStylePickerProps } from "@/types/components/appearance/background-style-picker-props";
import type { BackgroundStyle } from "@/types/preferences/background-style";

import { hexToHsl, hslToHex } from "@/lib/theme/color";
import { cn } from "@/lib/utils";

import { RangeField } from "./range-field";

/** Valores de partida, em HSL: o gradiente já nasce como rampa de um matiz só. */
const DEFAULTS = {
  color: hslToHex(258, 30, 95),
  from: hslToHex(258, 30, 90),
  to: hslToHex(258, 30, 70),
};

const MODES: { id: "solid" | "gradient" | null; label: string }[] = [
  { id: null, label: texts.appearance.bgStyleAuto },
  { id: "solid", label: texts.appearance.bgStyleSolid },
  { id: "gradient", label: texts.appearance.bgStyleGradient },
];

const DIRECTIONS = [
  { id: "diagonal", label: texts.appearance.bgStyleDiagonal },
  { id: "vertical", label: texts.appearance.bgStyleVertical },
  { id: "radial", label: texts.appearance.bgStyleRadial },
] as const;

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-normal transition",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border-soft bg-surface-1 text-text-subtle hover:text-text-strong",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Escolha de cor/gradiente no estilo das cores livres: sliders, não seletor de cor
 * nativo. Cor sólida é matiz + saturação + brilho; o gradiente é matiz + brilho do
 * centro + EXTENSÃO — os dois extremos ficam no mesmo matiz, um mais claro e outro
 * mais escuro, que é o degradê que fica bonito sempre (nada de duas cores que
 * brigam). Direção continua em pílulas.
 */
export function BackgroundStylePicker({ value, onChange }: BackgroundStylePickerProps) {
  const mode: "solid" | "gradient" | null = value?.type ?? null;

  const set = (patch: Partial<BackgroundStyle>) =>
    onChange({
      type: value?.type ?? "solid",
      color: value?.color ?? DEFAULTS.color,
      from: value?.from ?? DEFAULTS.from,
      to: value?.to ?? DEFAULTS.to,
      direction: value?.direction ?? "diagonal",
      ...patch,
    });

  const hueLabel = (hue: number) => texts.appearance.hueValue(Math.round(hue));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {MODES.map((option) => (
          <Pill
            key={option.label}
            active={mode === option.id}
            onClick={() =>
              onChange(
                option.id === null ? null : ({ ...DEFAULTS, type: option.id } as BackgroundStyle),
              )
            }
          >
            {option.label}
          </Pill>
        ))}
      </div>

      {mode === "solid" && value && (
        <div className="space-y-2">
          {(() => {
            const colour = hexToHsl(value.color);
            return (
              <>
                <RangeField
                  label={texts.appearance.hue}
                  value={colour.h}
                  min={0}
                  max={360}
                  step={1}
                  valueLabel={hueLabel(colour.h)}
                  onChange={(hue) => set({ color: hslToHex(hue, colour.s, colour.l) })}
                  hueTrack
                />
                <RangeField
                  label={texts.appearance.saturation}
                  value={colour.s}
                  min={0}
                  max={100}
                  step={1}
                  valueLabel={`${colour.s}%`}
                  onChange={(saturation) =>
                    set({ color: hslToHex(colour.h, saturation, colour.l) })
                  }
                />
                <RangeField
                  label={texts.appearance.brightness}
                  value={colour.l}
                  min={0}
                  max={100}
                  step={1}
                  valueLabel={`${colour.l}%`}
                  onChange={(lightness) => set({ color: hslToHex(colour.h, colour.s, lightness) })}
                />
              </>
            );
          })()}
        </div>
      )}

      {mode === "gradient" && value && (
        <div className="space-y-2">
          {(() => {
            const first = hexToHsl(value.from);
            const second = hexToHsl(value.to);
            const center = Math.round((first.l + second.l) / 2);
            const spread = Math.round(Math.min(60, Math.abs(first.l - second.l)));
            // Os extremos saem do centro e da extensão: mesmo matiz, brilhos opostos.
            const ends = (nextCenter: number, nextSpread: number) => ({
              from: hslToHex(
                first.h,
                first.s,
                Math.min(100, Math.round(nextCenter + nextSpread / 2)),
              ),
              to: hslToHex(
                second.h,
                second.s,
                Math.max(0, Math.round(nextCenter - nextSpread / 2)),
              ),
            });
            return (
              <>
                <RangeField
                  label={texts.appearance.hue}
                  value={first.h}
                  min={0}
                  max={360}
                  step={1}
                  valueLabel={hueLabel(first.h)}
                  onChange={(hue) =>
                    set({
                      from: hslToHex(hue, first.s, first.l),
                      to: hslToHex(hue, second.s, second.l),
                    })
                  }
                  hueTrack
                />
                <RangeField
                  label={texts.appearance.brightness}
                  value={center}
                  min={5}
                  max={95}
                  step={1}
                  valueLabel={`${center}%`}
                  onChange={(lightness) => set(ends(lightness, spread))}
                />
                <RangeField
                  label={texts.appearance.bgStyleSpread}
                  value={spread}
                  min={0}
                  max={60}
                  step={1}
                  valueLabel={`${spread}`}
                  hint={texts.appearance.bgStyleSpreadHint}
                  onChange={(nextSpread) => set(ends(center, nextSpread))}
                />

                <div className="flex flex-wrap gap-2">
                  {DIRECTIONS.map((direction) => (
                    <Pill
                      key={direction.id}
                      active={value.direction === direction.id}
                      onClick={() => set({ direction: direction.id })}
                    >
                      {direction.label}
                    </Pill>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {mode !== null && (
        <p className="text-xs font-normal text-text-subtle">
          {texts.appearance.bgStyleContrastNote}
        </p>
      )}
    </div>
  );
}
