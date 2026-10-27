import { useThemePreviewStore } from "@/stores/theme-preview.store";
import { texts } from "@/texts";
import type { ThemeProfilePreviewProps } from "@/types/components/marketplace/theme-profile-preview-props";
import { Button } from "@rede-enois/design-system/ui";

export function ThemeProfilePreview({ theme, title }: ThemeProfilePreviewProps) {
  const startPreview = useThemePreviewStore((state) => state.startPreview);

  return (
    <Button
      size="sm"
      variant="outline"
      className="w-full rounded-full"
      onClick={() => startPreview(theme, title)}
    >
      {texts.marketplace.previewAction}
    </Button>
  );
}
