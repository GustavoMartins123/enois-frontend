import { useEffect, useRef } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usePreferencesStore } from "@/stores/preferences.store";
import { useThemePreviewStore } from "@/stores/theme-preview.store";
import { texts } from "@/texts";
import type { MarketplacePurchase } from "@/types/application/marketplace/marketplace-purchase";
import type { MarketplacePurchaseAction } from "@/types/application/marketplace/marketplace-purchase-action";

import { ApiError, marketplaceApi, themesApi } from "@/lib/api";
import { getSessionKey } from "@/lib/session-key";
import { galleryCollectionId, registerGalleryCollection } from "@/lib/theme/gallery-collections";
import { revokeRefundedThemes } from "@/lib/theme/revoke-refunded-themes";

import { useToast } from "@/components/ui/toast";

import { marketplacePurchasesQueryOptions } from "./purchases-query";

export function usePurchaseActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const busy = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (action: MarketplacePurchaseAction) => {
      if (action.sessionKey !== getSessionKey()) return { kind: "ignored" as const };
      if (action.kind === "apply") {
        const theme = await themesApi.get(action.purchase.itemId!);
        if (!mounted.current || action.sessionKey !== getSessionKey())
          return { kind: "ignored" as const };
        const options = marketplacePurchasesQueryOptions(action.sessionKey);
        // Uma consulta iniciada antes da decisão não pode restaurar uma posse antiga.
        await queryClient.cancelQueries({ queryKey: options.queryKey, exact: true });
        const purchases = await queryClient.fetchQuery({ ...options, staleTime: 0 });
        if (!ownsTheme(purchases, theme.id)) {
          throw new ApiError(403, "PURCHASE_REFUNDED", texts.marketplace.themeNotOwned);
        }
        return { kind: "apply" as const, theme };
      }
      if (action.kind === "confirm") {
        await marketplaceApi.confirm(action.purchase.id, action.sessionKey);
        return { kind: "confirm" as const, state: "RELEASED" as const };
      }
      await marketplaceApi.refund(action.purchase.id, action.sessionKey);
      return { kind: "refund" as const, state: "REFUNDED" as const };
    },
    onSuccess: async (result, action) => {
      if (action.sessionKey !== getSessionKey() || result.kind === "ignored") return;
      const options = marketplacePurchasesQueryOptions(action.sessionKey);
      if (result.kind === "apply") {
        const current = usePreferencesStore.getState();
        if (
          !mounted.current ||
          current.themeCollection !== action.themeCollection ||
          current.themeCollectionUpdatedAt !== action.themeCollectionUpdatedAt ||
          useThemePreviewStore.getState().preview !== action.preview ||
          !ownsTheme(queryClient.getQueryData(options.queryKey) ?? [], result.theme.id)
        )
          return;
        const collection = registerGalleryCollection({ ...result.theme, description: "" });
        current.setThemeCollection(collection.id);
        useThemePreviewStore.getState().stopPreview();
        toast(texts.marketplace.themeApplied, "success");
        return;
      }
      await queryClient.cancelQueries({ queryKey: options.queryKey, exact: true });
      if (action.sessionKey !== getSessionKey()) return;
      const purchases =
        queryClient.setQueryData(options.queryKey, (current) => {
          const latest = current ?? [action.purchase];
          return latest.map((purchase) =>
            purchase.id === action.purchase.id ? { ...purchase, state: result.state } : purchase,
          );
        }) ?? [];
      if (result.kind === "refund") {
        revokeRefundedThemes(purchases);
        const itemId = action.purchase.itemId;
        const preview = useThemePreviewStore.getState();
        if (
          itemId &&
          action.purchase.itemKind === "THEME" &&
          !ownsTheme(purchases, itemId) &&
          preview.preview?.collection.id === galleryCollectionId(itemId)
        )
          preview.stopPreview();
      }
      void queryClient.invalidateQueries({ queryKey: ["carteira"] });
      await queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
    onError: (error, action) => {
      if (action.sessionKey !== getSessionKey()) return;
      void queryClient.invalidateQueries({ queryKey: ["marketplace", "purchases"] });
      if (!mounted.current) return;
      const message =
        action.kind === "apply"
          ? texts.marketplace.themeApplyError
          : action.kind === "refund"
            ? texts.marketplace.refundError
            : texts.marketplace.confirmError;
      toast(error instanceof ApiError ? error.message : message, "error");
    },
    onSettled: () => {
      busy.current = false;
    },
  });

  const execute = (kind: MarketplacePurchaseAction["kind"], purchase: MarketplacePurchase) => {
    // O ref fecha também dois eventos disparados antes de o React redesenhar os botões.
    if (busy.current) return;
    busy.current = true;
    const preferences = usePreferencesStore.getState();
    mutation.mutate({
      kind,
      purchase,
      sessionKey: getSessionKey(),
      themeCollection: preferences.themeCollection,
      themeCollectionUpdatedAt: preferences.themeCollectionUpdatedAt,
      preview: useThemePreviewStore.getState().preview,
    });
  };

  return { execute, isPending: mutation.isPending };
}

function ownsTheme(purchases: MarketplacePurchase[], itemId: string): boolean {
  return purchases.some(
    (purchase) =>
      purchase.itemKind === "THEME" && purchase.itemId === itemId && purchase.state !== "REFUNDED",
  );
}
