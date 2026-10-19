import { useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { GameIdentityBinding } from "@/types/application/games/game-identity-binding";
import type { GamePendingRequest } from "@/types/application/games/game-pending-request";
import type { GameShareRequest } from "@/types/application/games/game-share-request";
import type { GameSpendRequest } from "@/types/application/games/game-spend-request";
import type { GameView } from "@/types/application/games/game-view";
import { Bookmark, Gamepad2, Share2, Sparkles } from "lucide-react";

import { gamesApi, mediaApi } from "@/lib/api";
import { formatFaisca } from "@/lib/faisca";
import { getSessionKey, useSessionKey } from "@/lib/session-key";
import { isAuthenticated, useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

import { GamePlayer } from "@/components/games/game-player";
import { GameStatsLine } from "@/components/games/game-stats-line";

const STAGE_LABEL: Record<string, string> = {
  IN_DEVELOPMENT: "Em desenvolvimento",
  DEMO: "Demo",
  EARLY_ACCESS: "Acesso antecipado",
  RELEASED: "Lançado",
  PAUSED: "Pausado",
};

/**
 * O jogo só PEDE identidade, gasto e compartilhamento; gasto e publicação acontecem com o clique da
 * pessoa. O roteador reaproveita o componente quando só os parâmetros mudam, e a chave garante que
 * nada do jogo anterior (pedido aberto, identidade, sessão do quadro) sobreviva à troca de jogo.
 */
export function GameDetail({ username, gameSlug }: { username: string; gameSlug: string }) {
  return (
    <GameDetailContent key={`${username}/${gameSlug}`} username={username} gameSlug={gameSlug} />
  );
}

function GameDetailContent({ username, gameSlug }: { username: string; gameSlug: string }) {
  const { requireAuth } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sessao, setSessao] = useState(0);
  const sessaoAtual = useRef(0);
  const conta = useSessionKey();
  const [contaDoQuadro, setContaDoQuadro] = useState<string | null>(null);
  const [ultimoJogo, setUltimoJogo] = useState<GameView | null>(null);
  const [identidade, setIdentidade] = useState<GameIdentityBinding | null>(null);
  const [compartilhamento, setCompartilhamento] =
    useState<GamePendingRequest<GameShareRequest> | null>(null);
  const [gasto, setGasto] = useState<GamePendingRequest<GameSpendRequest> | null>(null);
  const t = texts.games.game;
  const slugKey = ["games", "slug", username, gameSlug];

  const game = useQuery({
    queryKey: slugKey,
    queryFn: () => gamesApi.bySlug(username, gameSlug),
    staleTime: 0,
  });
  const gameId = game.data?.id;

  const stats = useQuery({
    queryKey: ["games", "stats", gameId],
    queryFn: () => gamesApi.stats(gameId!),
    enabled: Boolean(gameId),
  });

  const updates = useQuery({
    queryKey: ["games", "updates", gameId],
    queryFn: () => gamesApi.updates(gameId!),
    enabled: Boolean(gameId),
  });

  const play = useMutation({
    mutationFn: (id: string) => gamesApi.play(id),
    onSuccess: (_resposta, id) =>
      queryClient.invalidateQueries({ queryKey: ["games", "stats", id] }),
  });

  const emitirIdentidade = useMutation({
    mutationFn: (id: string) => gamesApi.identity(id),
  });

  const confirmarGasto = useMutation({
    mutationFn: (pedido: GamePendingRequest<GameSpendRequest>) =>
      gamesApi.spend(pedido.gameId, pedido.amount, pedido.motivo, pedido.requestId),
    onSuccess: (_resposta, pedido) => {
      setGasto((atual) => (atual?.requestId === pedido.requestId ? null : atual));
      toast(t.spend.done, "success");
      void queryClient.invalidateQueries({ queryKey: ["carteira"] });
    },
    onError: () => toast(t.spend.error, "error"),
  });

  const favorite = useMutation({
    mutationFn: (vars: { gameId: string; favorited: boolean }) =>
      vars.favorited ? gamesApi.unfavorite(vars.gameId) : gamesApi.favorite(vars.gameId),
    onSuccess: (resposta, vars) => {
      queryClient.setQueryData<GameView>(slugKey, (atual) =>
        atual?.id === vars.gameId
          ? { ...atual, favorited: resposta.favorited, favorites: resposta.favorites }
          : atual,
      );
      void queryClient.invalidateQueries({ queryKey: slugKey });
      void queryClient.invalidateQueries({ queryKey: ["games", "stats", vars.gameId] });
    },
    onError: () => toast(t.favoriteError, "error"),
  });

  const compartilhar = useMutation({
    mutationFn: async (pedido: GamePendingRequest<GameShareRequest>) => {
      let mediaIds: string[] = [];
      if (pedido.imagem) {
        const blob = await (await fetch(pedido.imagem)).blob();
        const arquivo = new File([blob], "conquista.png", { type: blob.type || "image/png" });
        const resultado = await mediaApi.requestUpload({
          fileName: `media/${crypto.randomUUID()}/conquista.png`,
          mimeType: arquivo.type,
          size: arquivo.size,
          purpose: "POST_IMAGE",
        });
        if (resultado.provider !== "S3") {
          throw new Error(t.achievement.uploadsDisabled);
        }
        await mediaApi.uploadToSignedUrl(
          resultado.uploadUrl,
          arquivo,
          resultado.uploadHeaders ?? {},
        );
        mediaIds = [resultado.id];
      }
      return gamesApi.compartilhar(pedido.gameId, pedido.texto, mediaIds);
    },
    onSuccess: (_resposta, pedido) => {
      setCompartilhamento((atual) => (atual === pedido ? null : atual));
      toast(t.achievement.done, "success");
    },
    onError: () => toast(t.achievement.error, "error"),
  });

  // Trocar de sessão zera a cache e a resposta some até chegar a nova. O quadro não pode cair por
  // isso: o player segue com os dados públicos do último jogo exibido, e o que depende de quem lê
  // (favorito) só sai da resposta nova.
  if (game.data && game.data !== ultimoJogo) setUltimoJogo(game.data);
  const jogo = game.data ?? ultimoJogo;

  if (game.isError) {
    return (
      <div className="surface-card mx-auto max-w-2xl p-8 text-center">
        <Gamepad2 className="mx-auto h-10 w-10 text-primary" />

        <p className="mt-3 text-sm font-medium text-text-strong">
          {texts.games.developer.notFound}
        </p>

        <Link to="/games" className="mt-2 inline-block text-sm text-primary hover:underline">
          {texts.games.title}
        </Link>
      </div>
    );
  }

  if (!jogo) {
    return <p className="py-10 text-center text-sm text-text-subtle">{texts.games.loading}</p>;
  }

  const g = jogo;
  const favorited = game.data?.favorited ?? false;
  const playable = g.status === "PUBLISHED";
  const gallery = [g.cover, ...g.mediaIds].filter(Boolean) as string[];
  // O quadro pertence à conta que apertou Jogar. Pedido de outro jogo, de outra sessão do quadro ou
  // de um quadro aberto por outra conta não aparece nem pode ser confirmado.
  const contaTrocou = sessao > 0 && contaDoQuadro !== conta;
  const doQuadroAtual = <T extends { gameId: string; session: number }>(pedido: T | null) =>
    pedido && pedido.gameId === g.id && pedido.session === sessao && !contaTrocou ? pedido : null;
  const gastoAtivo = doQuadroAtual(gasto);
  const compartilhamentoAtivo = doQuadroAtual(compartilhamento);
  const identidadeAtiva = doQuadroAtual(identidade);

  return (
    <>
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <p className="text-sm text-text-subtle">
          <Link to="/games" className="hover:underline">
            {texts.games.title}
          </Link>
          {" / "}
          <Link to="/games/$username" params={{ username }} className="hover:underline">
            {username}
          </Link>
        </p>

        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight text-text-strong">
              {g.title}
            </h1>

            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-subtle">
              <Link
                to="/games/$username"
                params={{ username }}
                className="font-medium text-primary hover:underline"
              >
                {g.username ?? username}
              </Link>

              <span className="rounded-full border border-border-soft px-2 py-0.5 text-xs">
                {STAGE_LABEL[g.stage] ?? g.stage}
              </span>

              <span className="rounded-full border border-border-soft px-2 py-0.5 text-xs">
                {g.distribution === "PAID" ? t.priceSoon(g.priceCoins) : t.free}
              </span>

              {g.version && <span className="text-xs">{t.version(g.version)}</span>}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className={cn("rounded-full gap-1.5", favorited && "text-primary")}
              disabled={favorite.isPending || !game.data}
              onClick={() => {
                if (!requireAuth()) return;
                favorite.mutate({ gameId: g.id, favorited });
              }}
            >
              <Bookmark className="h-3.5 w-3.5" />

              <>{favorited ? t.unfavorite : t.favorite}</>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5"
              onClick={async () => {
                const url = `${window.location.origin}/games/${g.username ?? username}/${g.slug}`;
                try {
                  await navigator.clipboard.writeText(url);
                  toast(t.shareCopied, "success");
                } catch {
                  toast(t.shareCopied, "error");
                }
              }}
            >
              <Share2 className="h-3.5 w-3.5" />

              <>{texts.games.share}</>
            </Button>
          </div>
        </header>

        {!playable && (
          <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {g.status === "SUSPENDED" ? t.suspended : t.notPublished}
          </p>
        )}

        {contaTrocou && (
          <p
            role="status"
            className="rounded-xl bg-primary-soft px-4 py-2 text-sm text-text-strong"
          >
            {t.accountChanged}
          </p>
        )}

        <GamePlayer
          key={g.id}
          url={g.url}
          title={g.title}
          aspect={g.aspect}
          playable={playable}
          tallOnMobile
          identity={
            identidadeAtiva
              ? { session: identidadeAtiva.session, token: identidadeAtiva.token }
              : null
          }
          stats={
            <GameStatsLine
              plays={stats.data?.plays ?? g.plays}
              players={stats.data?.players ?? null}
              favorites={stats.data?.favorites ?? g.favorites}
            />
          }
          onStart={(retry, session) => {
            // "Tentar de novo" recarrega o mesmo jogo: não é partida nova para a métrica, mas o
            // token de identidade é de uso único e o jogo recarregado vai pedir outro.
            const gameIdDaSessao = g.id;
            const contaDaSessao = getSessionKey();
            sessaoAtual.current = session;
            setSessao(session);
            setContaDoQuadro(contaDaSessao);
            setIdentidade(null);
            setGasto(null);
            setCompartilhamento(null);
            if (!retry) play.mutate(gameIdDaSessao);
            if (isAuthenticated()) {
              emitirIdentidade.mutate(gameIdDaSessao, {
                onSuccess: ({ token }) => {
                  if (sessaoAtual.current !== session || getSessionKey() !== contaDaSessao) return;
                  setIdentidade({ gameId: gameIdDaSessao, session, token });
                },
              });
            }
          }}
          onShareRequest={(pedido, session) =>
            setCompartilhamento((atual) =>
              atual?.gameId === g.id && atual.session === session
                ? atual
                : { ...pedido, gameId: g.id, session },
            )
          }
          onSpendRequest={(pedido, session) =>
            setGasto((atual) =>
              atual?.gameId === g.id && atual.session === session
                ? atual
                : { ...pedido, gameId: g.id, session },
            )
          }
        />

        <Dialog
          open={gastoAtivo !== null}
          onOpenChange={(open) => {
            if (!open && !confirmarGasto.isPending) setGasto(null);
          }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>{t.spend.title}</DialogTitle>

              <DialogDescription>{t.spend.notice}</DialogDescription>
            </DialogHeader>

            {gastoAtivo && (
              <p className="text-sm text-text-strong">
                <span className="font-semibold">
                  {t.spend.amount(formatFaisca(gastoAtivo.amount))}
                </span>
                {gastoAtivo.motivo ? ` — ${gastoAtivo.motivo}` : ""}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                className="rounded-full"
                disabled={confirmarGasto.isPending}
                onClick={() => setGasto(null)}
              >
                {t.spend.refuse}
              </Button>

              <Button
                className="rounded-full"
                disabled={confirmarGasto.isPending}
                onClick={() => {
                  if (gastoAtivo?.gameId === g.id) confirmarGasto.mutate(gastoAtivo);
                }}
              >
                {confirmarGasto.isPending ? t.spend.confirming : t.spend.confirm}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={compartilhamentoAtivo !== null}
          onOpenChange={(open) => {
            if (!open && !compartilhar.isPending) setCompartilhamento(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />

                <>{t.achievement.title}</>
              </DialogTitle>

              <DialogDescription>{t.achievement.notice(g.title)}</DialogDescription>
            </DialogHeader>

            {compartilhamentoAtivo && (
              <>
                <p className="whitespace-pre-line rounded-xl bg-surface-2 p-3 text-sm text-text-strong">
                  {compartilhamentoAtivo.texto}
                </p>

                {compartilhamentoAtivo.imagem && (
                  <img
                    src={compartilhamentoAtivo.imagem}
                    alt={t.achievement.imageAlt}
                    className="max-h-48 w-full rounded-xl border border-border-soft object-contain"
                  />
                )}
              </>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                className="rounded-full"
                disabled={compartilhar.isPending}
                onClick={() => setCompartilhamento(null)}
              >
                {t.achievement.cancel}
              </Button>

              <Button
                className="rounded-full"
                disabled={compartilhar.isPending}
                onClick={() => {
                  if (compartilhamentoAtivo?.gameId === g.id) {
                    compartilhar.mutate(compartilhamentoAtivo);
                  }
                }}
              >
                {compartilhar.isPending ? t.achievement.publishing : t.achievement.publish}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {gallery.slice(1, 6).map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="h-24 w-40 shrink-0 rounded-xl border border-border-soft object-cover"
              />
            ))}
          </div>
        )}

        <section className="surface-card space-y-3 p-4 sm:p-5">
          <h2 className="text-base font-medium">{t.about}</h2>

          <p className="whitespace-pre-line text-sm font-normal text-muted-foreground">
            {g.description}
          </p>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {g.genres.length > 0 && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                  {t.genres}
                </dt>

                <dd className="text-text-strong">{g.genres.join(", ")}</dd>
              </div>
            )}

            {g.languages.length > 0 && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                  {t.languages}
                </dt>

                <dd className="text-text-strong">{g.languages.join(", ")}</dd>
              </div>
            )}

            {g.controls && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                  {t.controls}
                </dt>

                <dd className="text-text-strong">{g.controls}</dd>
              </div>
            )}

            {g.requirements && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                  {t.requirements}
                </dt>

                <dd className="text-text-strong">{g.requirements}</dd>
              </div>
            )}

            {g.contentWarnings && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                  {t.warnings}
                </dt>

                <dd className="text-text-strong">{g.contentWarnings}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="surface-card space-y-3 p-4 sm:p-5">
          <h2 className="text-base font-medium">{t.updates}</h2>

          {(updates.data?.length ?? 0) === 0 ? (
            <p className="text-sm font-normal text-text-subtle">{t.noUpdates}</p>
          ) : (
            <ul className="space-y-3">
              {updates.data!.map((update) => (
                <li key={update.id} className="border-l-2 border-border-soft pl-3">
                  <p className="text-sm font-medium text-text-strong">
                    {update.title}
                    {update.version && (
                      <span className="ml-2 text-xs font-normal text-text-subtle">
                        {t.version(update.version)}
                      </span>
                    )}
                  </p>

                  <p className="text-xs text-text-subtle">
                    {new Date(update.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  {update.body && (
                    <p className="mt-1 whitespace-pre-line text-sm font-normal text-muted-foreground">
                      {update.body}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
