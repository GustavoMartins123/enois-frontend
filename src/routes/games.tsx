import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Gamepad2, ExternalLink, Send } from "lucide-react";

import { texts } from "@/texts";
import { gamesApi } from "@/lib/api";
import { isAuthenticated } from "@/lib/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/games")({
  head: () => ({ meta: [{ title: "Jogos · Énóis" }] }),
  component: Games,
});

/**
 * Agregador de jogos (Parte E do plano): o Énóis NÃO hospeda jogo nenhum — o criador
 * envia o LINK de onde o jogo já está publicado (itch.io, site próprio), a moderação
 * revisa e o jogo roda EMBUTIDO no Énóis, num quadro isolado, com a página do criador
 * em /games/{username}.
 */
function Games() {
  const authenticated = isAuthenticated();
  const catalog = useQuery({ queryKey: ["games", "catalog"], queryFn: () => gamesApi.catalog(60) });
  const mine = useQuery({
    queryKey: ["games", "mine"],
    queryFn: () => gamesApi.mine(),
    enabled: authenticated,
  });

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Gamepad2 className="h-6 w-6 text-primary" />
              Jogos
            </h1>
            <p className="mt-1 text-sm text-text-subtle">
              Feitos pela comunidade. O Énóis não hospeda: cada jogo roda no lugar onde o criador
              o publicou — aqui só o convite.
            </p>
          </div>
          {authenticated && <SubmitButton />}
        </header>

        {mine.data && mine.data.length > 0 && <MyGames games={mine.data} />}

        {catalog.isLoading ? (
          <p className="py-10 text-center text-sm text-text-subtle">Carregando…</p>
        ) : catalog.isError ? (
          <p className="py-10 text-center text-sm text-text-subtle">
            Não foi possível carregar o catálogo agora.
          </p>
        ) : (catalog.data?.length ?? 0) === 0 ? (
          <div className="surface-card rounded-2xl p-8 text-center">
            <Gamepad2 className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 text-sm font-medium">Nenhum jogo publicado ainda.</p>
            <p className="mt-1 text-sm text-text-subtle">
              Você fez um jogo? Envie o link e ele aparece aqui depois da moderação.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {catalog.data!.map((g) => (
              <li key={g.id}>
                <Link
                  to="/games/$username/$gameSlug"
                  params={{ username: g.username ?? "", gameSlug: g.slug }}
                  className="surface-card flex items-center gap-3 p-4 transition hover:border-primary"
                >
                  <GameCover cover={g.cover} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{g.title}</span>
                    <span className="block truncate text-sm text-text-subtle">
                      {g.description || " "}
                    </span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-text-subtle" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppContainer>
  );
}

function GameCover({ cover }: { cover?: string | null }) {
  if (cover) {
    return <img src={cover} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />;
  }
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft">
      <Gamepad2 className="h-5 w-5 text-primary-text" />
    </span>
  );
}

/** Os jogos de quem está logado, com o status da moderação e o reenvio. */
function MyGames({ games }: { games: Awaited<ReturnType<typeof gamesApi.mine>> }) {
  const queryClient = useQueryClient();
  const resubmit = useMutation({
    mutationFn: (gameId: string) => gamesApi.resubmit(gameId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["games"] }),
  });

  return (
    <section className="mb-6">
      <h2 className="mb-2 text-sm font-semibold text-text-subtle">Meus envios</h2>
      <ul className="space-y-2">
        {games.map((g) => (
          <li key={g.id} className="surface-card flex items-center gap-3 p-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{g.title}</span>
              {g.status === "REJECTED" && g.reviewNote && (
                <span className="block truncate text-xs text-text-subtle">Moderação: {g.reviewNote}</span>
              )}
            </span>
            <StatusBadge status={g.status} />
            {g.status === "REJECTED" && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={resubmit.isPending}
                onClick={() => resubmit.mutate(g.id)}
              >
                Reenviar
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "bg-primary-soft text-primary-text",
    SUBMITTED: "bg-surface-2 text-text-subtle",
    REJECTED: "bg-surface-2 text-text-subtle",
  };
  const label: Record<string, string> = {
    PUBLISHED: "publicado",
    SUBMITTED: "em revisão",
    REJECTED: "não aceito",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? map.SUBMITTED}`}>
      {label[status] ?? status}
    </span>
  );
}

function SubmitButton() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", slug: "", url: "", description: "", tags: "" });
  const submit = useMutation({
    mutationFn: () =>
      gamesApi.submit({
        slug: form.slug.trim().toLowerCase(),
        title: form.title.trim(),
        url: form.url.trim(),
        description: form.description.trim() || undefined,
        tags: form.tags.trim() || undefined,
      }),
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });

  return (
    <>
      <Button size="sm" className="rounded-full gap-1.5" onClick={() => setOpen(true)}>
        <Send className="h-4 w-4" />
        Enviar jogo
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div
            className="surface-card w-full max-w-md rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Enviar um jogo</h2>
            <p className="mt-1 text-sm text-text-subtle">
              O jogo precisa estar publicado em outro lugar (itch.io, site próprio). Envie o link —
              a moderação revisa antes de publicar.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Título</span>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Slug (o endereço do jogo)</span>
                <Input
                  placeholder="kawaiigame"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Link do jogo (https)</span>
                <Input
                  placeholder="https://meujogo.itch.io/…"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Descrição</span>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Tags (separadas por vírgula)</span>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </label>
            </div>

            {submit.isError && (
              <p className="mt-3 text-sm text-red-500">
                Não foi possível enviar — confere o link (precisa ser https) e o slug.
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                disabled={submit.isPending || !form.title.trim() || !form.slug.trim() || !form.url.trim()}
                onClick={() => submit.mutate()}
              >
                Enviar para moderação
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
