import { texts } from "@/texts";

/**
 * Amostra do app com o tema atual.
 *
 * Não recebe props de propósito: as mudanças são aplicadas na hora, então este card
 * já mostra as cores reais do app — não uma maquete que pode mentir.
 */
export function ThemePreview() {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface-1 p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {texts.appearance.previewAvatar}
        </span>

        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium text-text-strong">
            {texts.appearance.previewAvatarName}
          </p>

          <span className="inline-block rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
            {texts.appearance.previewBadge}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm font-normal text-text-strong">{texts.appearance.previewPost}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className="rounded-full px-4 py-1.5 text-xs font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          {texts.common.publish}
        </span>

        <span className="rounded-full border border-border-soft px-4 py-1.5 text-xs font-normal text-text-subtle">
          {texts.common.cancel}
        </span>
      </div>
    </div>
  );
}
