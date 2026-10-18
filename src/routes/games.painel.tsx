import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import { Gamepad2 } from "lucide-react";

import { gamesApi } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/games/painel")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: `${texts.games.panel.title} · Énóis` }] }),
  component: StudioPanel,
});

/**
 * O painel de quem publica.
 *
 * Hoje ele cobre duas coisas: a página do criador (o que o público lê) e os envios, com o status da
 * moderação e o motivo quando algo é recusado. A edição da ficha completa de cada jogo e o envio de
 * capturas ainda não estão aqui — está registrado como pendência no docs/GAMES.md, e não há botão
 * que prometa o que não existe.
 */
function StudioPanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState("");

  const mine = useQuery({ queryKey: ["games", "mine"], queryFn: () => gamesApi.mine() });
  const developer = useQuery({
    queryKey: ["games", "developer", "me"],
    queryFn: () => gamesApi.developer("me").catch(() => null),
  });

  useEffect(() => {
    const profile = developer.data;
    if (!profile) return;
    setDisplayName(profile.displayName ?? "");
    setHeadline(profile.headline ?? "");
    setBio(profile.bio ?? "");
    setLinks(profile.links.join(", "));
  }, [developer.data]);

  const save = useMutation({
    mutationFn: () =>
      gamesApi.saveDeveloper({
        displayName: displayName.trim() || null,
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        links: links.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games", "developer"] });
      toast(texts.games.panel.saved);
    },
    onError: () => toast(texts.games.panel.error, "error"),
  });

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">{texts.games.panel.title}</h1>

          <p className="mt-1 text-sm text-text-subtle">{texts.games.panel.description}</p>
        </header>

        <section className="surface-card space-y-3 p-4 sm:p-5">
          <h2 className="text-base font-medium">{texts.games.panel.profileTitle}</h2>

          <Input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={texts.games.panel.displayName}
            maxLength={120}
          />
          <Input
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            placeholder={texts.games.panel.headline}
            maxLength={200}
          />
          <Textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder={texts.games.panel.bio}
            maxLength={2000}
            className="min-h-[120px]"
          />
          <Input
            value={links}
            onChange={(event) => setLinks(event.target.value)}
            placeholder={texts.games.panel.links}
            maxLength={500}
          />

          <div className="flex justify-end">
            <Button
              className="rounded-full"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? texts.common.saving : texts.common.save}
            </Button>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium">{texts.games.panel.gamesTitle}</h2>

          {(mine.data?.length ?? 0) === 0 ? (
            <p className="surface-card p-6 text-center text-sm font-normal text-text-subtle">
              {texts.games.panel.noGames}
            </p>
          ) : (
            <ul className="space-y-2">
              {mine.data!.map((game) => (
                <li key={game.id} className="surface-card flex items-center gap-3 p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
                    <Gamepad2 className="h-4 w-4 text-primary-text" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-strong">{game.title}</p>

                    <p className="truncate text-xs text-text-subtle">
                      {texts.games.panel.status[game.status]}
                      {game.reviewNote ? ` · ${game.reviewNote}` : ""}
                    </p>
                  </div>

                  {game.status === "PUBLISHED" && (
                    <Link
                      to="/games/$username/$gameSlug"
                      params={{ username: game.username ?? "", gameSlug: game.slug }}
                      className="text-sm text-primary hover:underline"
                    >
                      {texts.games.panel.view}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppContainer>
  );
}
