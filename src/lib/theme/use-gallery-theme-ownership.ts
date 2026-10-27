import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { usePreferencesStore } from "@/stores/preferences.store";

import { marketplacePurchasesQueryOptions } from "@/lib/marketplace/purchases-query";
import { useSessionKey } from "@/lib/session-key";
import { useIsAuthenticated } from "@/lib/use-auth";

import { isGalleryCollectionId } from "./gallery-collections";
import { revokeRefundedThemes } from "./revoke-refunded-themes";

/** Confere também reembolsos feitos em outra aba antes de conservar um tema comprado. */
export function useGalleryThemeOwnership(): void {
  const authenticated = useIsAuthenticated();
  const sessionKey = useSessionKey();
  const collection = usePreferencesStore((state) => state.themeCollection);
  const purchases = useQuery({
    ...marketplacePurchasesQueryOptions(sessionKey),
    enabled: authenticated && isGalleryCollectionId(collection),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (authenticated && isGalleryCollectionId(collection) && purchases.isSuccess) {
      revokeRefundedThemes(purchases.data);
    }
  }, [authenticated, collection, purchases.data, purchases.isSuccess]);
}
