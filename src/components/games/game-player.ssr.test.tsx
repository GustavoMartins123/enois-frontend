// @vitest-environment node
import { texts } from "@/texts";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GamePlayer } from "./game-player";

const GAME_URL = "https://jogo.exemplo.com/";

describe("GamePlayer no servidor", () => {
  it("roda sem window nem document", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });

  it("autoStart=false: botão Jogar, sem quadro", () => {
    const html = renderToString(<GamePlayer url={GAME_URL} title="Jogo de exemplo" />);
    expect(html).toContain(texts.games.game.play);
    expect(html).toContain('data-status="idle"');
    expect(html).not.toContain("<iframe");
  });

  it("autoStart=true: carregando, e o quadro só nasce no navegador", () => {
    const html = renderToString(<GamePlayer url={GAME_URL} title="Jogo de exemplo" autoStart />);
    expect(html).toContain('data-status="loading"');
    expect(html).toContain(texts.games.game.loading);
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("sandbox");
  });

  it("endereço inválido continua sem quadro e sem link", () => {
    const html = renderToString(<GamePlayer url="javascript:alert(1)" title="x" autoStart />);
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("javascript:");
  });
});
