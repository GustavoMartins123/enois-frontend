import { usePreferencesStore } from "@/stores/preferences.store";
import type { MarketplacePurchase } from "@/types/application/marketplace/marketplace-purchase";

import { galleryCollectionId, removeGalleryCollection } from "./gallery-collections";

export function revokeRefundedThemes(purchases: MarketplacePurchase[]): void {
  const owned = new Set(
    purchases
      .filter((purchase) => purchase.itemKind === "THEME" && purchase.state !== "REFUNDED")
      .map((purchase) => purchase.itemId),
  );
  for (const purchase of purchases) {
    if (
      purchase.itemKind !== "THEME" ||
      purchase.state !== "REFUNDED" ||
      !purchase.itemId ||
      owned.has(purchase.itemId)
    )
      continue;
    removeGalleryCollection(purchase.itemId);
    const preferences = usePreferencesStore.getState();
    if (preferences.themeCollection === galleryCollectionId(purchase.itemId)) {
      preferences.setThemeCollection(null);
    }
  }
}
