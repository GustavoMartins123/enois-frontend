import { useQuery } from "@tanstack/react-query";

import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2 } from "lucide-react";

import { gamesApi } from "@/lib/api";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/games/$username")({
  head: ({ params }) => ({ meta: [{ title: `Jogos de ${params.username} · Énóis` }] }),
  component: CreatorGames,
});

/** Página pública do criador: /games/{username} — só o que está PUBLISHED. */
function CreatorGames() {
  const { username } = Route.useParams();
  const games = useQuery({
    queryKey: ["games", "user", username],
    queryFn: () => gamesApi.byUser(username),
  });

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Gamepad2 className="h-6 w-6 text-primary" />
          Jogos de {username}
        </h1>

        {games.isLoading ? (
          <p className="py-10 text-center text-sm text-text-subtle">Carregando…</p>
        ) : games.isError ? (
          <p className="py-10 text-center text-sm text-text-subtle">Não foi possível carregar.</p>
        ) : (games.data?.length ?? 0) === 0 ? (
          <p className="py-10 text-center text-sm text-text-subtle">Nenhum jogo publicado ainda.</p>
        ) : (
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {games.data!.map((g) => (
              <li key={g.id}>
                <Link
                  to="/games/$username/$gameSlug"
                  params={{ username, gameSlug: g.slug }}
                  className="surface-card flex items-center gap-3 p-4 transition hover:border-primary"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{g.title}</span>
                    <span className="block truncate text-sm text-text-subtle">{g.description || " "}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppContainer>
  );
}
