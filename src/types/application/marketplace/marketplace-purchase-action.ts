import type { ThemePreviewState } from "@/types/stores/theme-preview-state";

import type { MarketplacePurchase } from "./marketplace-purchase";

export type MarketplacePurchaseAction = {
  kind: "confirm" | "refund" | "apply";
  purchase: MarketplacePurchase;
  sessionKey: string | null;
  themeCollection: string | null;
  themeCollectionUpdatedAt: number | null;
  preview: ThemePreviewState["preview"];
};
