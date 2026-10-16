import type { RangeFieldProps } from "@/types/components/appearance/range-field-props";

/** Controle deslizante rotulado. Usa `input[type=range]` nativo, então teclado e leitor de tela funcionam de graça. */
export function RangeField({
  label,
  value,
  min,
  max,
  step,
  valueLabel,
  onChange,
  hint,
  hueTrack,
}: RangeFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between gap-3 text-xs font-normal text-text-subtle">
        <>{label}</>

        <span className="tabular-nums text-text-strong">{valueLabel}</span>
      </span>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={hueTrack ? "theme-range theme-range-hue" : "theme-range"}
      />

      {hint && <span className="block text-xs font-normal text-text-date">{hint}</span>}
    </label>
  );
}
