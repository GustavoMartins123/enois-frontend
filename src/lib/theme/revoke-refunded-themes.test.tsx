// @vitest-environment jsdom
import { act } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { usePreferencesStore } from "@/stores/preferences.store";
import type { MarketplacePurchase } from "@/types/application/marketplace/marketplace-purchase";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { registerGalleryCollection, resolveGalleryCollection } from "./gallery-collections";
import { revokeRefundedThemes } from "./revoke-refunded-themes";
import { useGalleryThemeOwnership } from "./use-gallery-theme-ownership";

const mocks = vi.hoisted(() => ({ purchases: vi.fn() }));
vi.mock("@/lib/api", () => ({ marketplaceApi: { purchases: mocks.purchases } }));
vi.mock("@/lib/use-auth", () => ({ useIsAuthenticated: () => true }));

const refunded: MarketplacePurchase = {
  id: "refund",
  listingId: "listing",
  buyerId: "buyer",
  sellerId: "seller",
  price: 50000,
  state: "REFUNDED",
  itemKind: "THEME",
  itemId: "refund-theme",
  createdAt: "2026-10-26T00:00:00Z",
};
const theme = {
  id: refunded.itemId!,
  name: "Tema devolvido",
  modeDefault: "dark",
  packageJson: JSON.stringify({
    palette: { background: "#282a36", surface: "#44475a", primary: "#bd93f9" },
  }),
};

function Observer() {
  useGalleryThemeOwnership();
  return null;
}

describe("Temas reembolsados", () => {
  const initial = usePreferencesStore.getState();
  let root: Root;
  let host: HTMLDivElement;
  let client: QueryClient;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    localStorage.clear();
    const collection = registerGalleryCollection(theme);
    usePreferencesStore.getState().setThemeCollection(collection.id);
    mocks.purchases.mockReset().mockResolvedValue([refunded]);
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    client.clear();
    host.remove();
    revokeRefundedThemes([refunded]);
    usePreferencesStore.setState(initial, true);
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("remove o pacote da memória e do armazenamento ao reembolsar", () => {
    revokeRefundedThemes([refunded]);
    expect(usePreferencesStore.getState().themeCollection).toBeNull();
    expect(resolveGalleryCollection("galeria-" + theme.id)).toBeNull();
    expect(localStorage.getItem("connect-grow-gallery-themes")).not.toContain(theme.id);
  });

  it("conserva o tema quando houve uma nova compra válida depois do reembolso", () => {
    revokeRefundedThemes([refunded, { ...refunded, id: "nova-compra", state: "HELD" }]);
    expect(usePreferencesStore.getState().themeCollection).toBe("galeria-" + theme.id);
    expect(resolveGalleryCollection("galeria-" + theme.id)).not.toBeNull();
  });

  it("detecta um reembolso anterior ao carregar o tema salvo", async () => {
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <Observer />
        </QueryClientProvider>,
      ),
    );
    await vi.waitFor(async () => {
      await act(async () => {});
      expect(usePreferencesStore.getState().themeCollection).toBeNull();
    });
    expect(mocks.purchases).toHaveBeenCalledTimes(1);
    expect(resolveGalleryCollection("galeria-" + theme.id)).toBeNull();
  });

  it("não conclui que houve reembolso quando a API está indisponível", async () => {
    mocks.purchases.mockRejectedValue(new Error("Falha de teste"));
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <Observer />
        </QueryClientProvider>,
      ),
    );
    await vi.waitFor(async () => {
      await act(async () => {});
      expect(client.getQueryState(["marketplace", "purchases", null])?.status).toBe("error");
    });
    expect(usePreferencesStore.getState().themeCollection).toBe("galeria-" + theme.id);
  });
});
