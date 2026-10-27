import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { MARKETPLACE_KINDS, MARKETPLACE_KIND_LABELS } from "@/constants/marketplace-kinds";
import { texts } from "@/texts";
import type { MarketplaceListing as MarketplaceListingView } from "@/types/application/marketplace/marketplace-listing";
import type { MarketplacePalette } from "@/types/application/marketplace/marketplace-palette";
import type { MarketplacePurchase } from "@/types/application/marketplace/marketplace-purchase";
import { BadgeCheck, Check, Receipt, RotateCcw, Search, Sparkles, Store } from "lucide-react";

import { ApiError, marketplaceApi } from "@/lib/api";
import { formatFaisca, parseFaiscaInput } from "@/lib/faisca";
import { marketplacePurchasesQueryOptions } from "@/lib/marketplace/purchases-query";
import { useListingTheme } from "@/lib/marketplace/use-listing-theme";
import { usePurchaseActions } from "@/lib/marketplace/use-purchase-actions";
import { getSessionKey, useSessionKey } from "@/lib/session-key";
import { useIsAuthenticated } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

import { AppContainer } from "@/components/app-container";
import { ThemeSellDialog } from "@/components/appearance/theme-sell-dialog";
import { MarketplaceContentDialog } from "@/components/marketplace/marketplace-content-dialog";
import { MarketplaceSellDialog } from "@/components/marketplace/marketplace-sell-dialog";
import { ThemeProfilePreview } from "@/components/marketplace/theme-profile-preview";
import { StyledName } from "@/components/styled-name";

/** Piso de preço do marketplace: 50 faíscas (o backend também recusa abaixo disso). */
const MIN_PRICE = parseFaiscaInput("50") ?? 50_000;

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace · Énóis" }] }),
  component: Marketplace,
});

/**
 * O marketplace em faíscas (Fase 4): temas da comunidade à venda, sempre com ESCROW —
 * as faíscas ficam retidas até o comprador confirmar (ou pedir reembolso em 7 dias).
 */
function Marketplace() {
  const sessionKey = useSessionKey();
  return <MarketplaceSession key={sessionKey} sessionKey={sessionKey} />;
}

function MarketplaceSession({ sessionKey }: { sessionKey: string | null }) {
  const authenticated = useIsAuthenticated();
  const [tab, setTab] = useState("store");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<string | null>(null);
  const [sellContentOpen, setSellContentOpen] = useState(false);
  const [contentPurchase, setContentPurchase] = useState<MarketplacePurchase | null>(null);
  const [bought, setBought] = useState<{ title: string; price: number; purchaseId: string } | null>(
    null,
  );

  useEffect(() => {
    const timer = setTimeout(() => setSearch(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);

  const catalog = useQuery({
    queryKey: ["marketplace", "catalog", search, kind],
    queryFn: () => marketplaceApi.catalog(60, search || undefined, kind || undefined),
  });
  const purchases = useQuery({
    ...marketplacePurchasesQueryOptions(sessionKey),
    enabled: authenticated,
  });
  const sales = useQuery({
    queryKey: ["marketplace", "sales", sessionKey],
    queryFn: () => marketplaceApi.sales(),
    enabled: authenticated,
  });

  return (
    <AppContainer>
      <div className="mx-auto w-full min-w-0 max-w-4xl">
        <div className="mb-6">
          <PageHeader
            icon={Store}
            title="Marketplace"
            description="Temas e conteúdos feitos pela comunidade, em faíscas. O valor fica retido até você confirmar (ou em 7 dias) e o reembolso devolve tudo."
            actions={
              authenticated && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-1.5"
                    onClick={() => setSellContentOpen(true)}
                  >
                    <Store className="h-4 w-4" />
                    Vender conteúdo
                  </Button>

                  <PublishButton />
                </>
              )
            }
          />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 flex-wrap" aria-label={texts.marketplace.tabsLabel}>
            <TabsTrigger value="store" className="data-[state=active]:text-primary">
              <Store className="h-4 w-4" aria-hidden="true" />
              {texts.marketplace.storeTab}
            </TabsTrigger>

            {authenticated && (
              <>
                <TabsTrigger value="purchases" className="data-[state=active]:text-primary">
                  <Receipt className="h-4 w-4" aria-hidden="true" />
                  {texts.marketplace.purchasesTab}
                </TabsTrigger>

                <TabsTrigger value="sales" className="data-[state=active]:text-primary">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  {texts.marketplace.salesTab}
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="store">
            <div className="mb-4 space-y-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
                <Input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Buscar no marketplace..."
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setKind(null)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition",
                    kind === null
                      ? "bg-primary text-primary-foreground"
                      : "border border-border-soft text-text-subtle hover:border-primary/50",
                  )}
                >
                  Todas
                </button>

                {MARKETPLACE_KINDS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setKind(kind === value ? null : value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      kind === value
                        ? "bg-primary text-primary-foreground"
                        : "border border-border-soft text-text-subtle hover:border-primary/50",
                    )}
                  >
                    {MARKETPLACE_KIND_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            {authenticated && purchases.isError && (
              <div className="mb-4 space-y-2" role="alert">
                <p className="text-sm text-text-subtle">{texts.marketplace.purchasesCheckError}</p>

                <Button variant="outline" size="sm" onClick={() => void purchases.refetch()}>
                  {texts.marketplace.retry}
                </Button>
              </div>
            )}
            {catalog.isLoading ? (
              <p className="py-10 text-center text-sm text-text-subtle">Carregando…</p>
            ) : catalog.isError ? (
              <p className="py-10 text-center text-sm text-text-subtle">
                Não foi possível carregar o marketplace agora.
              </p>
            ) : (catalog.data?.length ?? 0) === 0 ? (
              <div className="surface-card rounded-2xl p-8 text-center">
                <Store className="mx-auto h-10 w-10 text-primary" />

                <p className="mt-3 text-sm font-medium">Nada à venda ainda.</p>

                <p className="mt-1 text-sm text-text-subtle">
                  Toque em “Publicar tema” acima: a sua aparência vira uma listagem aqui, por no
                  mínimo 50 faíscas.
                </p>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catalog.data!.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    owned={
                      authenticated &&
                      (purchases.data ?? []).some(
                        (purchase) =>
                          purchase.state !== "REFUNDED" &&
                          (purchase.listingId === l.id ||
                            (purchase.itemKind === l.itemKind && purchase.itemId === l.itemId)),
                      )
                    }
                    checkingPurchases={
                      authenticated &&
                      (purchases.isPending || purchases.isFetching || purchases.isError)
                    }
                    onOpenPurchases={() => setTab("purchases")}
                    onBought={(purchaseId) =>
                      setBought({ title: l.title, price: l.price, purchaseId })
                    }
                  />
                ))}
              </ul>
            )}
          </TabsContent>

          {authenticated && (
            <>
              <TabsContent value="purchases">
                {purchases.isPending ? (
                  <LoadingState label={texts.common.loading} />
                ) : purchases.isError ? (
                  <div className="space-y-3" role="alert">
                    <p className="text-sm text-text-subtle">{texts.marketplace.purchasesError}</p>

                    <Button variant="outline" onClick={() => void purchases.refetch()}>
                      {texts.marketplace.retry}
                    </Button>
                  </div>
                ) : purchases.data.length === 0 ? (
                  <p className="surface-card p-6 text-sm text-text-subtle">
                    {texts.marketplace.purchasesEmpty}
                  </p>
                ) : (
                  <MyPurchases
                    key={sessionKey}
                    purchases={purchases.data}
                    onOpenContent={setContentPurchase}
                  />
                )}
              </TabsContent>

              <TabsContent value="sales">
                {sales.isPending ? (
                  <LoadingState label={texts.common.loading} />
                ) : sales.isError ? (
                  <div className="space-y-3" role="alert">
                    <p className="text-sm text-text-subtle">{texts.marketplace.salesError}</p>

                    <Button variant="outline" onClick={() => void sales.refetch()}>
                      {texts.marketplace.retry}
                    </Button>
                  </div>
                ) : sales.data.length === 0 ? (
                  <p className="surface-card p-6 text-sm text-text-subtle">
                    {texts.marketplace.salesEmpty}
                  </p>
                ) : (
                  <MySales sales={sales.data} />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        <Dialog open={bought !== null} onOpenChange={(open) => !open && setBought(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-normal">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
                  <Check className="h-5 w-5" />
                </span>

                <>{texts.marketplace.purchaseConfirmed}</>
              </DialogTitle>
            </DialogHeader>

            {bought && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border-soft bg-surface-1 p-4">
                  <p className="text-sm font-semibold text-text-strong">{bought.title}</p>

                  <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-primary">
                    <Sparkles className="h-4 w-4" />
                    {formatFaisca(bought.price)} faíscas
                  </p>

                  <p className="mt-2 text-xs text-text-subtle">{texts.marketplace.purchaseHeld}</p>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBought(null);
                      setTab("purchases");
                    }}
                  >
                    {texts.marketplace.openPurchases}
                  </Button>

                  <Button className="rounded-full" onClick={() => setBought(null)}>
                    {texts.marketplace.keepShopping}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {contentPurchase && (
          <MarketplaceContentDialog
            purchaseId={contentPurchase.id}
            title={contentPurchase.title}
            onClose={() => setContentPurchase(null)}
          />
        )}

        <MarketplaceSellDialog open={sellContentOpen} onOpenChange={setSellContentOpen} />
      </div>
    </AppContainer>
  );
}

/** Lê as cores do pacote com fallbacks: pacote inválido não pode quebrar a vitrine. */
function paletteOf(packageJson: string): MarketplacePalette {
  const fallback: MarketplacePalette = {
    bg: "#f5f5f5",
    surface: "#ffffff",
    border: "#e5e5e5",
    primary: "#7c3aed",
    strong: "#111111",
    subtle: "#5f5f5f",
  };
  try {
    const palette = JSON.parse(packageJson).palette ?? {};
    return {
      bg: palette.background ?? fallback.bg,
      surface: palette.surface ?? fallback.surface,
      border: palette.border ?? fallback.border,
      primary: palette.primary ?? fallback.primary,
      strong: palette.text?.strong ?? fallback.strong,
      subtle: palette.text?.subtle ?? fallback.subtle,
    };
  } catch {
    return fallback;
  }
}

/** Miniatura real: renderiza os tokens do pacote do tema. */
function Miniatura({ packageJson }: { packageJson: string }) {
  const { bg, surface, primary } = paletteOf(packageJson);

  return (
    <div
      className="h-16 w-full rounded-md border border-border-soft p-1.5"
      style={{ background: bg }}
    >
      <div
        className="flex h-full flex-col justify-center gap-1 rounded-sm p-1.5"
        style={{ background: surface }}
      >
        <div className="h-1.5 w-2/3 rounded-full" style={{ background: primary }} />
        <div className="h-1 w-full rounded-full opacity-60" style={{ background: primary }} />
        <div className="mt-0.5 h-1 w-3/5 rounded-full opacity-40" style={{ background: primary }} />
      </div>
    </div>
  );
}

/** A listagem com o preview do tema (buscado da galeria). */
function ListingCard({
  listing,
  owned,
  checkingPurchases,
  onOpenPurchases,
  onBought,
}: {
  listing: MarketplaceListingView;
  owned: boolean;
  checkingPurchases: boolean;
  onOpenPurchases: () => void;
  onBought: (purchaseId: string) => void;
}) {
  const theme = useListingTheme(listing);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const busy = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const buy = useMutation({
    mutationFn: (sessionKey: string | null) => marketplaceApi.buy(listing.id, sessionKey),
    onSuccess: async (result, sessionKey) => {
      if (sessionKey !== getSessionKey()) return;
      await queryClient.cancelQueries({
        queryKey: marketplacePurchasesQueryOptions(sessionKey).queryKey,
        exact: true,
      });
      await queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      if (sessionKey !== getSessionKey()) return;
      void queryClient.invalidateQueries({ queryKey: ["carteira"] });
      if (mounted.current) onBought(result.purchaseId);
    },
    onError: (error, sessionKey) => {
      if (sessionKey !== getSessionKey() || !mounted.current) return;
      if (error instanceof ApiError && error.code === "ITEM_ALREADY_OWNED") {
        void queryClient.invalidateQueries({ queryKey: ["marketplace", "purchases"] });
      }
      toast(error instanceof ApiError ? error.message : texts.marketplace.buyError, "error");
    },
    onSettled: () => {
      busy.current = false;
    },
  });

  return (
    <li className="surface-card flex h-full min-w-0 flex-col overflow-hidden">
      <div className="p-3 pb-0">
        {theme.data ? (
          <Miniatura packageJson={theme.data.packageJson} />
        ) : (
          <div
            className="flex h-16 w-full items-center justify-center rounded-md border border-border-soft"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Store className="h-6 w-6 text-primary-foreground/80" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="inline-flex w-fit rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-subtle">
          {MARKETPLACE_KIND_LABELS[listing.itemKind]}
        </span>

        <div className="min-w-0">
          <h3 className="line-clamp-2 font-semibold text-text-strong">{listing.title}</h3>

          {theme.data?.name && theme.data.name !== listing.title && (
            <p className="truncate text-xs text-text-subtle">{theme.data.name}</p>
          )}

          <p className="truncate text-xs text-text-subtle">
            <StyledName name={listing.sellerName ?? ""} style={listing.sellerStyle} />
            {listing.sellerUsername ? ` · @${listing.sellerUsername}` : ""}
          </p>
        </div>

        <div className="mt-auto space-y-2">
          {theme.data && <ThemeProfilePreview theme={theme.data} title={listing.title} />}

          <span className="flex items-center gap-1.5 text-lg font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            {formatFaisca(listing.price)} faíscas
          </span>

          {owned ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-full"
              onClick={onOpenPurchases}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {texts.marketplace.owned}
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full rounded-full"
              disabled={buy.isPending || checkingPurchases}
              onClick={() => {
                if (busy.current || checkingPurchases) return;
                busy.current = true;
                buy.mutate(getSessionKey());
              }}
            >
              {buy.isPending ? texts.marketplace.buying : texts.marketplace.buy}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

/** As compras do usuário, com a decisão do escrow. */
function MyPurchases({
  purchases,
  onOpenContent,
}: {
  purchases: MarketplacePurchase[];
  onOpenContent: (purchase: MarketplacePurchase) => void;
}) {
  const actions = usePurchaseActions();

  // Agrupado por categoria: "Temas", "Templates", "Banners"... — o comprador acha o que comprou.
  const groups = new Map<string, MarketplacePurchase[]>();
  for (const purchase of purchases) {
    const key = purchase.itemKind ?? "THEME";
    groups.set(key, [...(groups.get(key) ?? []), purchase]);
  }

  return (
    <section className="mb-6 space-y-3">
      <h2 className="text-sm font-semibold text-text-subtle">{texts.marketplace.purchasesTab}</h2>

      {[...groups.entries()].map(([kind, list]) => (
        <div key={kind} className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-text-subtle">
            {MARKETPLACE_KIND_LABELS[kind as keyof typeof MARKETPLACE_KIND_LABELS] ?? kind}
          </h3>

          <ul className="space-y-2">
            {list.map((p) => (
              <li key={p.id} className="surface-card flex flex-wrap items-center gap-2 p-3">
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block truncate font-medium text-text-strong">
                    {p.title ?? "Compra no marketplace"}
                  </span>

                  <span className="block text-xs text-text-subtle">
                    {formatFaisca(p.price)} faíscas ·{" "}
                    {p.state === "HELD"
                      ? texts.marketplace.heldUntil(p.createdAt)
                      : p.state === "RELEASED"
                        ? "concluída"
                        : "reembolsada"}
                  </span>
                </span>

                <StateChip state={p.state} />

                {p.state !== "REFUNDED" && p.itemKind === "THEME" && p.itemId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={actions.isPending}
                    onClick={() => actions.execute("apply", p)}
                  >
                    Aplicar tema
                  </Button>
                )}

                {p.state !== "REFUNDED" && p.itemKind && p.itemKind !== "THEME" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => onOpenContent(p)}
                  >
                    Abrir conteúdo
                  </Button>
                )}

                {p.state === "HELD" && (
                  <>
                    <Button
                      size="sm"
                      className="rounded-full gap-1"
                      disabled={actions.isPending}
                      onClick={() => actions.execute("confirm", p)}
                    >
                      <BadgeCheck className="h-4 w-4" />
                      {texts.marketplace.confirmReceipt}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full gap-1"
                      disabled={actions.isPending}
                      onClick={() => actions.execute("refund", p)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reembolso
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function MySales({ sales }: { sales: Awaited<ReturnType<typeof marketplaceApi.sales>> }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold text-text-subtle">{texts.marketplace.salesTab}</h2>

      <ul className="space-y-2">
        {sales.map((s) => (
          <li key={s.id} className="surface-card flex items-center gap-2 p-3">
            <span className="min-w-0 flex-1 text-sm">Venda de {formatFaisca(s.price)} faíscas</span>

            <StateChip state={s.state} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function StateChip({ state }: { state: string }) {
  const map: Record<string, string> = {
    HELD: "bg-surface-2 text-text-subtle",
    RELEASED: "bg-primary-soft text-primary-text",
    REFUNDED: "bg-surface-2 text-text-subtle",
  };
  const label: Record<string, string> = {
    HELD: "em escrow",
    RELEASED: "liberada",
    REFUNDED: "reembolsada",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[state] ?? map.HELD}`}>
      {label[state] ?? state}
    </span>
  );
}

/**
 * Publica a APARÊNCIA ATUAL como tema à venda.
 *
 * O formulário vive aqui no marketplace (e não só no diálogo de Aparência) para funcionar no
 * celular: abre o mesmo `ThemeSellDialog`, que monta o pacote da personalização ativa e lista
 * com o piso de 50 faíscas.
 */
function PublishButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" className="rounded-full gap-1.5" onClick={() => setOpen(true)}>
        <Sparkles className="h-4 w-4" />
        Publicar tema
      </Button>

      <ThemeSellDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
