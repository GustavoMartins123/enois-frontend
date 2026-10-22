import { createFileRoute } from "@tanstack/react-router";

import { AppContainer } from "@/components/app-container";
import { GameDetail } from "@/components/games/game-detail";

export const Route = createFileRoute("/games/$username/$gameSlug")({
  head: ({ params }) => ({ meta: [{ title: `${params.gameSlug} · Jogos · Énóis` }] }),
  component: GamePage,
});

function GamePage() {
  const { username, gameSlug } = Route.useParams();

  return (
    <AppContainer>
      <GameDetail username={username} gameSlug={gameSlug} />
    </AppContainer>
  );
}
