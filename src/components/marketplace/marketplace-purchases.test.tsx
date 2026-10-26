// @vitest-environment jsdom
import { type ReactNode, act } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Route } from "@/routes/marketplace";
import { usePreferencesStore } from "@/stores/preferences.store";
import { useThemePreviewStore } from "@/stores/theme-preview.store";
import { texts } from "@/texts";
import type { MarketplaceListing } from "@/types/application/marketplace/marketplace-listing";
import type { MarketplacePurchase } from "@/types/application/marketplace/marketplace-purchase";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api-client";
import {
  registerGalleryCollection,
  resolveGalleryCollection,
} from "@/lib/theme/gallery-collections";

const mocks = vi.hoisted(() => ({
  authenticated: true,
  catalog: vi.fn(),
  purchases: vi.fn(),
  sales: vi.fn(),
  buy: vi.fn(),
  confirm: vi.fn(),
  refund: vi.fn(),
  getTheme: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: () => ReactNode }) => ({ options }),
}));
vi.mock("@/components/app-container", () => ({
  AppContainer: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/lib/use-auth", () => ({ useIsAuthenticated: () => mocks.authenticated }));
vi.mock("@/components/ui/toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/components/appearance/theme-sell-dialog", () => ({ ThemeSellDialog: () => null }));
vi.mock("@/components/marketplace/marketplace-sell-dialog", () => ({
  MarketplaceSellDialog: () => null,
}));
vi.mock("@/components/marketplace/marketplace-content-dialog", () => ({
  MarketplaceContentDialog: () => null,
}));
vi.mock("@/lib/api", async () => ({
  ApiError: (await import("@/lib/api-client")).ApiError,
  marketplaceApi: {
    catalog: mocks.catalog,
    purchases: mocks.purchases,
    sales: mocks.sales,
    buy: mocks.buy,
    confirm: mocks.confirm,
    refund: mocks.refund,
  },
  themesApi: { get: mocks.getTheme },
}));

const listing: MarketplaceListing = {
  id: "novo-anuncio",
  sellerId: "vendedor",
  itemKind: "THEME",
  itemId: "tema-comprado",
  title: "Tema adquirido",
  price: 50000,
  status: "ACTIVE",
  createdAt: "2026-10-26T12:00:00Z",
};
const purchase: MarketplacePurchase = {
  id: "compra",
  listingId: "anuncio-antigo",
  buyerId: "comprador",
  sellerId: "vendedor",
  price: 50000,
  state: "RELEASED",
  itemKind: "THEME",
  itemId: listing.itemId,
  title: listing.title,
  createdAt: listing.createdAt,
};
const theme = {
  id: listing.itemId,
  name: listing.title,
  modeDefault: "dark",
  packageJson: JSON.stringify({
    palette: { background: "#282a36", surface: "#44475a", primary: "#bd93f9" },
  }),
};

describe("Compras no marketplace", () => {
  let root: Root;
  let host: HTMLDivElement;
  let client: QueryClient;
  const initialPreferences = usePreferencesStore.getState();

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    mocks.authenticated = true;
    mocks.catalog.mockReset().mockResolvedValue([listing]);
    mocks.purchases.mockReset().mockResolvedValue([purchase]);
    mocks.sales.mockReset().mockResolvedValue([]);
    mocks.getTheme.mockReset().mockResolvedValue(theme);
    mocks.buy.mockReset();
    mocks.confirm.mockReset();
    mocks.refund.mockReset();
    mocks.toast.mockReset();
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    client.clear();
    host.remove();
    useThemePreviewStore.getState().stopPreview();
    usePreferencesStore.setState(initialPreferences, true);
    vi.unstubAllGlobals();
  });

  async function mount() {
    const Page = Route.options.component!;
    await act(async () =>
      root.render(
        <QueryClientProvider client={client}>
          <Page />
        </QueryClientProvider>,
      ),
    );
    await vi.waitFor(async () => {
      await act(async () => {});
      expect(host.querySelector("[role=tabpanel][data-state=active]")?.textContent).toContain(
        listing.title,
      );
    });
  }
  async function tab(label: string) {
    const trigger = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
      (element) => element.textContent === label,
    )!;
    await act(async () =>
      trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 })),
    );
  }
  function button(label: string) {
    return [...host.querySelectorAll<HTMLButtonElement>("button")].find(
      (element) => element.textContent?.trim() === label,
    )!;
  }

  it.each(["HELD", "RELEASED"] as const)(
    "reconhece uma compra %s pelo item mesmo quando o anúncio foi recriado",
    async (state) => {
      mocks.purchases.mockResolvedValue([{ ...purchase, state }]);
      await mount();
      expect(button(texts.marketplace.owned)).toBeDefined();
      expect(button(texts.marketplace.buy)).toBeUndefined();
      await act(async () => button(texts.marketplace.owned).click());
      expect(host.querySelector("[role=tab][data-state=active]")?.textContent).toBe(
        texts.marketplace.purchasesTab,
      );
      expect(button("Aplicar tema")).toBeDefined();
      expect(mocks.buy).not.toHaveBeenCalled();
    },
  );

  it("mantém as compras em uma aba própria após sair e voltar à página", async () => {
    await mount();
    await act(async () => root.render(null));
    client.clear();
    await mount();
    await tab(texts.marketplace.purchasesTab);
    expect(host.querySelector("[role=tabpanel][data-state=active]")?.textContent).toContain(
      listing.title,
    );
    expect(button("Aplicar tema")).toBeDefined();
    expect(button(texts.marketplace.buy)).toBeUndefined();
    expect(mocks.purchases).toHaveBeenCalledTimes(2);
  });

  it("não considera uma compra reembolsada como posse do item", async () => {
    mocks.purchases.mockResolvedValue([{ ...purchase, state: "REFUNDED" }]);
    await mount();
    expect(button(texts.marketplace.buy)?.disabled).toBe(false);
    await tab(texts.marketplace.purchasesTab);
    expect(button("Aplicar tema")).toBeUndefined();
  });

  it("bloqueia novas compras quando não consegue conferir as compras existentes", async () => {
    mocks.purchases.mockRejectedValue(new Error("Falha de teste"));
    await mount();
    expect(button(texts.marketplace.buy)?.disabled).toBe(true);
    expect(host.querySelector("[role=alert]")?.textContent).toContain(
      texts.marketplace.purchasesCheckError,
    );
    await tab(texts.marketplace.purchasesTab);
    expect(host.querySelector("[role=alert]")?.textContent).toContain(
      texts.marketplace.purchasesError,
    );
  });

  it("mostra o estado vazio na aba Minhas compras", async () => {
    mocks.purchases.mockResolvedValue([]);
    await mount();
    await tab(texts.marketplace.purchasesTab);
    expect(host.textContent).toContain(texts.marketplace.purchasesEmpty);
  });

  it("visitantes veem apenas a loja e não carregam compras privadas", async () => {
    mocks.authenticated = false;
    await mount();
    expect(host.querySelectorAll("[role=tab]")).toHaveLength(1);
    expect(mocks.purchases).not.toHaveBeenCalled();
  });

  it("aplicar um tema comprado encerra a prévia temporária para exibir o tema salvo", async () => {
    await mount();
    useThemePreviewStore.getState().startPreview(theme, "Prévia");
    await tab(texts.marketplace.purchasesTab);
    await act(async () => button("Aplicar tema").click());
    await vi.waitFor(async () => {
      await act(async () => {});
      expect(usePreferencesStore.getState().themeCollection).toBe("galeria-" + theme.id);
    });
    expect(useThemePreviewStore.getState().preview).toBeNull();
  });

  it("mostra o erro da API quando uma compra é recusada", async () => {
    mocks.purchases.mockResolvedValue([]);
    mocks.buy.mockRejectedValue(new ApiError(409, "ITEM_ALREADY_OWNED", "Item já comprado"));
    await mount();
    await act(async () => button(texts.marketplace.buy).click());
    await vi.waitFor(() => expect(mocks.toast).toHaveBeenCalledWith("Item já comprado", "error"));
  });

  it("reembolsar um tema aplicado remove o pacote local e permite comprar novamente", async () => {
    mocks.purchases
      .mockResolvedValueOnce([{ ...purchase, state: "HELD" }])
      .mockResolvedValue([{ ...purchase, state: "REFUNDED" }]);
    mocks.refund.mockResolvedValue({ purchaseId: purchase.id, state: "REFUNDED" });
    const collection = registerGalleryCollection(theme);
    usePreferencesStore.getState().setThemeCollection(collection.id);
    useThemePreviewStore.getState().startPreview(theme, theme.name);
    await mount();
    await tab(texts.marketplace.purchasesTab);
    await act(async () => button("Reembolso").click());
    await vi.waitFor(() => expect(usePreferencesStore.getState().themeCollection).toBeNull());
    expect(resolveGalleryCollection(collection.id)).toBeNull();
    expect(useThemePreviewStore.getState().preview).toBeNull();
    await tab(texts.marketplace.storeTab);
    await vi.waitFor(() => expect(button(texts.marketplace.buy)?.disabled).toBe(false));
    expect(button(texts.marketplace.owned)).toBeUndefined();
  });

  it("atualiza a posse após comprar e oferece acesso direto à aba de compras", async () => {
    mocks.purchases.mockResolvedValueOnce([]).mockResolvedValue([{ ...purchase, state: "HELD" }]);
    mocks.catalog
      .mockResolvedValueOnce([listing])
      .mockResolvedValue([{ ...listing, id: "outro-anuncio" }]);
    mocks.buy.mockResolvedValue({ purchaseId: purchase.id, state: "HELD", price: listing.price });
    await mount();
    await act(async () => button(texts.marketplace.buy).click());
    await vi.waitFor(async () => {
      await act(async () => {});
      expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
        texts.marketplace.purchaseConfirmed,
      );
    });
    const openPurchases = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
      (element) => element.textContent === texts.marketplace.openPurchases,
    )!;
    await act(async () => openPurchases.click());
    expect(host.querySelector("[role=tab][data-state=active]")?.textContent).toBe(
      texts.marketplace.purchasesTab,
    );
    expect(button("Aplicar tema")).toBeDefined();
    await tab(texts.marketplace.storeTab);
    expect(button(texts.marketplace.owned)).toBeDefined();
    expect(button(texts.marketplace.buy)).toBeUndefined();
    expect(mocks.buy).toHaveBeenCalledTimes(1);
  });
});
