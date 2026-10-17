import type { ReactNode } from "react";

import { texts } from "@/texts";
import type { BackgroundStylePickerProps } from "@/types/components/appearance/background-style-picker-props";
import type { BackgroundStyle } from "@/types/preferences/background-style";

import { cn } from "@/lib/utils";

// Tipo local simples: a união vive aqui mesmo, sem arquivo novo de tipo.

/** Valores de partida ao entrar num modo pela primeira vez (cores suaves da marca). */
const DEFAULTS = { color: "#f4f1fb", from: "#f9f8ff", to: "#e6dcf7" } as const;

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
 * Escolha do plano de fundo da personalização: automático (o tingimento fino que
 * já existia), cor sólida ou gradiente com direção. O `<input type="color">` é
 * nativo — acessível por padrão — e o texto do app se adapta sozinho ao fundo
 * escolhido (matemática de contraste da casa, provada em teste).
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
        <label className="flex items-center gap-3 text-xs font-normal text-text-subtle">
          <>{texts.appearance.bgStyleSolid}</>

          <input
            type="color"
            value={value.color}
            onChange={(event) => set({ color: event.target.value })}
            className="h-8 w-12 cursor-pointer rounded-md border border-border-soft bg-transparent"
            aria-label={texts.appearance.bgStyleSolid}
          />
        </label>
      )}

      {mode === "gradient" && value && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-4 text-xs font-normal text-text-subtle">
            <label className="flex items-center gap-2">
              <>{texts.appearance.bgStyleFrom}</>

              <input
                type="color"
                value={value.from}
                onChange={(event) => set({ from: event.target.value })}
                className="h-8 w-12 cursor-pointer rounded-md border border-border-soft bg-transparent"
                aria-label={texts.appearance.bgStyleFrom}
              />
            </label>

            <label className="flex items-center gap-2">
              <>{texts.appearance.bgStyleTo}</>

              <input
                type="color"
                value={value.to}
                onChange={(event) => set({ to: event.target.value })}
                className="h-8 w-12 cursor-pointer rounded-md border border-border-soft bg-transparent"
                aria-label={texts.appearance.bgStyleTo}
              />
            </label>
          </div>

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
