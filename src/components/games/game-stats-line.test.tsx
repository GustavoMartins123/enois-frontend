import { texts } from "@/texts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GameStatsLine } from "./game-stats-line";

const render = (plays: number, players: number | null, favorites = 0) =>
  renderToStaticMarkup(<GameStatsLine plays={plays} players={players} favorites={favorites} />);

describe("GameStatsLine", () => {
  it("mostra partidas e jogadores com os números de cada um", () => {
    const html = render(12, 5);
    expect(html).toContain("12 partidas iniciadas · 5 jogadores");
    expect(html).not.toContain("12 jogadores");
  });

  it("singular em cada número, sem esconder o segundo", () => {
    expect(render(1, 1)).toContain("1 partida iniciada · 1 jogador");
    expect(render(3, 1)).toContain("3 partidas iniciadas · 1 jogador");
  });

  it("sem os números do servidor, não inventa jogadores a partir das partidas", () => {
    const html = render(7, null);
    expect(html).toContain("7 partidas iniciadas");
    expect(html).not.toContain("jogador");
  });

  it("explica o que cada número mede e soma a biblioteca quando há", () => {
    const html = render(4, 2, 3);
    expect(html).toContain(`title="${texts.games.game.statsHint}"`);
    expect(html).toContain("· 3 na biblioteca");
    expect(render(4, 2, 0)).not.toContain("biblioteca");
  });
});
