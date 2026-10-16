import { texts } from "@/texts";
import type { ContrastNoticeProps } from "@/types/components/appearance/contrast-notice-props";
import type { ThemeContrastLevel } from "@/types/preferences/theme-contrast-level";
import { AlertTriangle, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const TONE: Record<ThemeContrastLevel, string> = {
  AAA: "text-growth",
  AA: "text-growth",
  AA_LARGE: "text-opportunity",
  FAIL: "text-destructive",
};

/**
 * Mede o pior par de cores do tema e diz, em português claro, se dá para ler.
 *
 * É o que impede a personalização livre de terminar em texto ilegível: o usuário
 * vê o problema na hora, com a dica de como resolver.
 */
export function ContrastNotice({ report }: ContrastNoticeProps) {
  const healthy = report.level === "AAA" || report.level === "AA";
  const Icon = healthy ? CircleCheck : AlertTriangle;

  return (
    <div className="flex items-start gap-2 rounded-xl bg-surface-2 px-3 py-2">
      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", TONE[report.level])} />

      <div className="min-w-0 space-y-0.5">
        <p className={cn("text-xs font-medium", TONE[report.level])}>
          {texts.appearance.contrast.label}: {texts.appearance.contrast[report.level]} (
          {report.ratio}:1)
        </p>

        <p className="text-xs font-normal text-text-subtle">
          {texts.appearance.contrast.worstPair(report.worstPair)}
        </p>

        {!healthy && (
          <p className="text-xs font-normal text-text-subtle">
            {texts.appearance.contrast.hint}
          </p>
        )}
      </div>
    </div>
  );
}
