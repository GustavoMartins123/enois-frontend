import { Link } from "@tanstack/react-router";

import { useThemePreviewStore } from "@/stores/theme-preview.store";
import { texts } from "@/texts";
import { Button } from "@rede-enois/design-system/ui";

import { useCurrentUser } from "@/lib/current-user";

export function ThemePreviewBar() {
  const active = useThemePreviewStore((state) => state.preview !== null);
  return active ? <ActivePreviewBar /> : null;
}

function ActivePreviewBar() {
  const preview = useThemePreviewStore((state) => state.preview);
  const stopPreview = useThemePreviewStore((state) => state.stopPreview);
  const { data: user } = useCurrentUser();
  if (!preview) return null;

  return (
    <div
      role="region"
      aria-label={texts.marketplace.previewBarLabel}
      className="fixed inset-x-3 bottom-4 z-50 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-soft bg-surface-card p-4 shadow-lg"
    >
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium text-text-strong">
          {texts.marketplace.previewTitle(preview.title)}
        </p>

        <p className="mt-1 text-xs text-text-subtle">{texts.marketplace.previewTemporary}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {user && (
          <Button size="sm" variant="outline" asChild>
            <Link to="/perfil/$username" params={{ username: user.username }}>
              {texts.marketplace.previewProfile}
            </Link>
          </Button>
        )}

        <Button size="sm" variant="outline" onClick={stopPreview}>
          {texts.marketplace.previewEnd}
        </Button>
      </div>
    </div>
  );
}
