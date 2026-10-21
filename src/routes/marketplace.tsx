import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import { BadgeCheck, RotateCcw, Sparkles, Store } from "lucide-react";

import { marketplaceApi, themesApi } from "@/lib/api";
import { formatFaisca, parseFaiscaInput } from "@/lib/faisca";
import { isAuthenticated } from "@/lib/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AppContainer } from "@/components/app-container";
import { ThemeSellDialog } from "@/components/appearance/theme-sell-dialog";

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
  const authenticated = isAuthenticated();
  const catalog = useQuery({
    queryKey: ["marketplace", "catalog"],
    queryFn: () => marketplaceApi.catalog(60),
  });
  const purchases = useQuery({
    queryKey: ["marketplace", "purchases"],
    queryFn: () => marketplaceApi.purchases(),
    enabled: authenticated,
  });
  const sales = useQuery({
    queryKey: ["marketplace", "sales"],
    queryFn: () => marketplaceApi.sales(),
    enabled: authenticated,
  });

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Store className="h-6 w-6 text-primary" />
              Marketplace
            </h1>

            <p className="mt-1 text-sm text-text-subtle">
              Temas feitos pela comunidade, em faíscas. Toda compra passa por escrow: o criador só
              recebe quando você confirma (ou em 7 dias) — e o reembolso devolve tudo.
            </p>
          </div>
          {authenticated && <PublishButton />}
        </header>

        {purchases.data && purchases.data.length > 0 && <MyPurchases purchases={purchases.data} />}
        {sales.data && sales.data.length > 0 && <MySales sales={sales.data} />}

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
              Toque em “Publicar tema” acima: a sua aparência vira uma listagem aqui, por no mínimo
              50 faíscas.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {catalog.data!.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </ul>
        )}
      </div>
    </AppContainer>
  );
}

/** Miniatura real: renderiza os tokens do pacote do tema. */
function Miniatura({ packageJson }: { packageJson: string }) {
  let bg = "#f5f5f5",
    surface = "#ffffff",
    primary = "#7c3aed";
  try {
    const palette = JSON.parse(packageJson).palette;
    bg = palette.background ?? bg;
    surface = palette.surface ?? surface;
    primary = palette.primary ?? primary;
  } catch {
    // pacote invalido não chega aqui (o backend valida), mas o preview não pode quebrar
  }

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
}: {
  listing: {
    id: string;
    itemId: string;
    title: string;
    price: number;
    sellerName?: string | null;
    sellerUsername?: string | null;
  };
}) {
  const theme = useQuery({
    queryKey: ["themes", "item", listing.itemId],
    queryFn: () => themesApi.get(listing.itemId),
  });
  const queryClient = useQueryClient();
  const buy = useMutation({
    mutationFn: () => marketplaceApi.buy(listing.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["marketplace"] }),
  });

  return (
    <li className="surface-card p-4">
      {theme.data ? <Miniatura packageJson={theme.data.packageJson} /> : null}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate font-semibold">{listing.title}</span>
          {theme.data?.name && theme.data.name !== listing.title && (
            <span className="block truncate text-xs text-text-subtle">{theme.data.name}</span>
          )}

          {(listing.sellerName || listing.sellerUsername) && (
            <span className="block truncate text-xs text-text-subtle">
              por {listing.sellerName ?? "conta removida"}
              {listing.sellerUsername ? ` · @${listing.sellerUsername}` : ""}
            </span>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-sm font-semibold text-primary-text">
          <Sparkles className="h-3.5 w-3.5" />
          {formatFaisca(listing.price)}
        </span>
      </div>

      <Button
        size="sm"
        className="mt-3 w-full rounded-full"
        disabled={buy.isPending}
        onClick={() => buy.mutate()}
      >
        {buy.isPending ? "Retendo faíscas…" : "Comprar (escrow)"}
      </Button>
    </li>
  );
}

/** As compras do usuário, com a decisão do escrow. */
function MyPurchases({
  purchases,
}: {
  purchases: Awaited<ReturnType<typeof marketplaceApi.purchases>>;
}) {
  const queryClient = useQueryClient();
  const confirm = useMutation({
    mutationFn: (id: string) => marketplaceApi.confirm(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["marketplace"] }),
  });
  const refund = useMutation({
    mutationFn: (id: string) => marketplaceApi.refund(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["marketplace"] }),
  });

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold text-text-subtle">Minhas compras</h2>

      <ul className="space-y-2">
        {purchases.map((p) => (
          <li key={p.id} className="surface-card flex flex-wrap items-center gap-2 p-3">
            <span className="min-w-0 flex-1 text-sm">
              Compra de {p.price} faíscas ·{" "}
              {p.state === "HELD"
                ? "retidas no escrow"
                : p.state === "RELEASED"
                  ? "concluída"
                  : "reembolsada"}
            </span>

            <StateChip state={p.state} />
            {p.state === "HELD" && (
              <>
                <Button
                  size="sm"
                  className="rounded-full gap-1"
                  disabled={confirm.isPending}
                  onClick={() => confirm.mutate(p.id)}
                >
                  <BadgeCheck className="h-4 w-4" />
                  Confirmar
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full gap-1"
                  disabled={refund.isPending}
                  onClick={() => refund.mutate(p.id)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reembolso
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function MySales({ sales }: { sales: Awaited<ReturnType<typeof marketplaceApi.sales>> }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold text-text-subtle">Minhas vendas</h2>

      <ul className="space-y-2">
        {sales.map((s) => (
          <li key={s.id} className="surface-card flex items-center gap-2 p-3">
            <span className="min-w-0 flex-1 text-sm">Venda de {s.price} faíscas</span>

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
