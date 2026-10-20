import { texts } from "@/texts";

export function GameStatsLine({
  plays,
  players,
  favorites,
}: {
  plays: number;
  players: number | null;
  favorites: number;
}) {
  const t = texts.games.game;

  return (
    <p title={t.statsHint}>
      {t.plays(plays)}
      {players !== null && ` · ${t.players(players)}`}
      {favorites > 0 && ` · ${t.favorites(favorites)}`}
    </p>
  );
}
