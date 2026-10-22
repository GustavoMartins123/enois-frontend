import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import { Flame } from "lucide-react";

import { gamesApi } from "@/lib/api";

import { Skeleton } from "@/components/ui/skeleton";

import { GameIcon } from "@/components/game-icon";

/**
 * "Jogados hoje" no painel lateral do feed: as últimas 24 horas de partidas iniciadas, contadas
 * pelo servidor (`POST /games/{id}/play`), não pelo front.
 *
 * É prova social, não recomendação — não personaliza e não some para quem não tem sessão. O número
 * que aparece é de pessoas distintas, porque "10 sessões" lido como "10 pessoas" é o tipo de número
 * que infla card sem inflar nada de verdade.
 *
 * Sem jogo nenhum na janela o card não abre: painel lateral com seção vazia é anúncio de que a
 * comunidade está parada.
 */
export function TodayGamesCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["games", "trending", "today"],
    queryFn: () => gamesApi.trendingToday(5),
    staleTime: 5 * 60 * 1000,
  });

  const games = data ?? [];

  if (!isLoading && games.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border-soft bg-surface-card p-4">
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-text-strong">
        <Flame className="h-4 w-4 text-primary" aria-hidden />

        <>{texts.games.today.title}</>
      </h2>

      <p className="mt-0.5 text-xs text-text-subtle">{texts.games.today.subtitle}</p>

      <ul className="mt-3 space-y-1">
        {isLoading
          ? [0, 1, 2].map((row) => (
              <li key={row} className="flex items-center gap-2.5 px-2 py-1.5">
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />

                <span className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </span>
              </li>
            ))
          : games.map((game) => (
              <li key={game.id}>
                <Link
                  to="/games/$username/$gameSlug"
                  params={{ username: game.username ?? "", gameSlug: game.slug }}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-muted/50"
                >
                  <GameIcon
                    cover={game.cover}
                    icon={game.icon}
                    url={game.url}
                    className="h-9 w-9"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-normal text-text-strong">
                      {game.title}
                    </span>

                    <span className="block truncate text-xs text-text-subtle">
                      {texts.games.today.players(game.players)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
      </ul>
    </div>
  );
}
