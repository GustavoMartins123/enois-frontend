// @vitest-environment jsdom
// @vitest-environment-options {"url":"https://enois.ia.br/games/dev/jogo"}
import { act } from "react";

import { texts } from "@/texts";
import type { GamePlayerProps } from "@/types/components/games/game-player-props";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SLOW_LOADING_MS } from "@/lib/games/game-player-state";

import { GamePlayer } from "./game-player";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const GAME_URL = "https://jogo.exemplo.com/";
const GAME_ORIGIN = "https://jogo.exemplo.com";

let host: HTMLDivElement;
let root: Root;

function render(props: Partial<GamePlayerProps> = {}) {
  const all: GamePlayerProps = { url: GAME_URL, title: "Jogo de exemplo", ...props };
  act(() => root.render(<GamePlayer {...all} />));
}

const player = () => host.firstElementChild as HTMLElement;
const iframe = () => host.querySelector("iframe");
const button = (label: string) =>
  [...host.querySelectorAll("button")].find((b) => b.textContent?.includes(label));

function play() {
  act(() => button(texts.games.game.play)!.click());
}

function send(data: unknown, init: { origin?: string; source?: Window | null } = {}) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data,
        origin: init.origin ?? GAME_ORIGIN,
        source: init.source === undefined ? iframe()!.contentWindow : init.source,
      }),
    );
  });
}

beforeEach(() => {
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

describe("GamePlayer — ciclo de vida", () => {
  it("começa parado, com o botão Jogar e sem quadro", () => {
    render();
    expect(player().dataset.status).toBe("idle");
    expect(iframe()).toBeNull();
    expect(button(texts.games.game.play)).toBeDefined();
    expect(button(texts.games.game.fullscreen)!.disabled).toBe(true);
  });

  it("Jogar cria o quadro isolado e avisa o início", () => {
    const onStart = vi.fn();
    render({ onStart });
    play();

    const frame = iframe()!;
    expect(frame.getAttribute("src")).toBe(GAME_URL);
    expect(frame.getAttribute("sandbox")).toBe(
      "allow-scripts allow-same-origin allow-pointer-lock",
    );
    expect(frame.getAttribute("allow")).toBe("fullscreen; gamepad; autoplay");
    expect(frame.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(player().dataset.status).toBe("loading");
    expect(onStart).toHaveBeenCalledWith(false, 1);
  });

  it("enois:loading mostra o progresso", () => {
    render();
    play();
    send({ type: "enois:loading", version: 1, progress: 65 });

    expect(host.textContent).toContain(texts.games.game.player.loadingProgress(65));
    expect(host.querySelector('[role="progressbar"]')!.getAttribute("aria-valuenow")).toBe("65");
  });

  it("enois:ready marca o jogo como pronto", () => {
    render();
    play();
    send({ type: "enois:loading", version: 1, progress: 90 });
    send({ type: "enois:ready", version: 1 });

    expect(player().dataset.status).toBe("ready");
    expect(host.textContent).toContain(texts.games.game.player.ready);
    expect(host.querySelector('[role="progressbar"]')).toBeNull();
  });

  it("enois:error mostra a mensagem e Tentar de novo recria o quadro", () => {
    const onStart = vi.fn();
    render({ onStart });
    play();
    const first = iframe();
    send({ type: "enois:error", version: 1, message: "Falha na inicialização do jogo" });

    const alert = host.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain(
      texts.games.game.player.errorDetail("Falha na inicialização do jogo"),
    );

    act(() => (alert.querySelector("button") as HTMLButtonElement).click());
    expect(player().dataset.status).toBe("loading");
    expect(iframe()).not.toBe(first);
    expect(onStart).toHaveBeenLastCalledWith(true, 2);
  });

  it("progresso inválido é descartado sem mudar a tela", () => {
    render();
    play();
    send({ type: "enois:loading", version: 1, progress: 40 });
    for (const progress of [-5, 101, "70", Number.NaN]) {
      send({ type: "enois:loading", version: 1, progress });
    }
    expect(host.textContent).toContain(texts.games.game.player.loadingProgress(40));
  });

  it("mensagens malformadas não quebram o player", () => {
    render();
    play();
    for (const data of [
      null,
      undefined,
      "enois:ready",
      42,
      [],
      {},
      { type: "enois:ready", version: "x" },
    ]) {
      send(data);
    }
    expect(player().dataset.status).toBe("loading");
    expect(iframe()).not.toBeNull();
  });

  it("jogo sem protocolo fica em unverified, sem erro e com o quadro na tela", () => {
    render();
    play();
    act(() => iframe()!.dispatchEvent(new Event("load")));

    expect(player().dataset.status).toBe("unverified");
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(host.textContent).toContain(texts.games.game.player.unverified);
    expect(iframe()).not.toBeNull();
  });

  it("carregamento demorado só avisa — o quadro nunca é desmontado", () => {
    vi.useFakeTimers();
    render();
    play();
    send({ type: "enois:loading", version: 1, progress: 3 });
    const frame = iframe();

    act(() => vi.advanceTimersByTime(SLOW_LOADING_MS + 1));
    expect(host.textContent).toContain(texts.games.game.player.slow);
    expect(player().dataset.status).toBe("loading");

    act(() => vi.advanceTimersByTime(10 * 60_000));
    expect(iframe()).toBe(frame);

    send({ type: "enois:ready", version: 1 });
    expect(player().dataset.status).toBe("ready");
    expect(host.textContent).not.toContain(texts.games.game.player.slow);
  });

  it("jogo antigo sem load nem mensagem também continua montado depois do tempo", () => {
    vi.useFakeTimers();
    render();
    play();
    const frame = iframe();
    act(() => vi.advanceTimersByTime(SLOW_LOADING_MS * 10));
    expect(player().dataset.status).toBe("unverified");
    expect(iframe()).toBe(frame);
  });
  it("a dica de tela cheia do celular some sozinha", () => {
    vi.useFakeTimers();
    render({ tallOnMobile: true });
    expect(host.textContent).toContain(texts.games.game.mobileHint);

    act(() => vi.advanceTimersByTime(3000));
    expect(host.textContent).not.toContain(texts.games.game.mobileHint);
  });

  it("amplia e restaura a janela sem reiniciar o jogo ou perder a sessão", () => {
    const onStart = vi.fn();
    render({ onStart });
    expect(player().dataset.expanded).toBe("false");
    expect(button(texts.games.game.expandWindow)!.disabled).toBe(true);
    play();
    send({ type: "enois:ready", version: 1 });
    const originalFrame = iframe()!;

    act(() => button(texts.games.game.expandWindow)!.click());
    expect(player().dataset.expanded).toBe("true");
    expect(button(texts.games.game.restoreWindow)!.getAttribute("aria-pressed")).toBe("true");
    expect(iframe()).toBe(originalFrame);
    expect(player().dataset.status).toBe("ready");

    // O redimensionamento nativo grava uma altura no elemento; restaurar deve removê-la.
    originalFrame.parentElement!.style.height = "1100px";
    act(() => button(texts.games.game.restoreWindow)!.click());
    expect(originalFrame.parentElement!.style.height).toBe("");
    expect(player().dataset.expanded).toBe("false");
    expect(iframe()).toBe(originalFrame);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(player().dataset.status).toBe("ready");
  });

  it("ampliar um jogo não muda a janela dos outros jogos", () => {
    act(() =>
      root.render(
        <>
          <GamePlayer url={GAME_URL} title="Jogo amplo" aspect="WIDESCREEN" autoStart />
          <GamePlayer url={GAME_URL} title="Jogo vertical" aspect="PORTRAIT" autoStart />
        </>,
      ),
    );
    const players = host.querySelectorAll<HTMLElement>("[data-expanded]");
    const frames = [...host.querySelectorAll("iframe")];
    act(() => button(texts.games.game.expandWindow)!.click());
    expect(players[0].dataset.expanded).toBe("true");
    expect(players[1].dataset.expanded).toBe("false");
    expect([...host.querySelectorAll("iframe")]).toEqual(frames);
  });
});

describe("GamePlayer — origem e janela", () => {
  it("ignora origem diferente, mesmo parecida", () => {
    render();
    play();
    for (const origin of [
      "https://jogo.exemplo.com.evil.com",
      "http://jogo.exemplo.com",
      "https://evil.com",
      "null",
    ]) {
      send({ type: "enois:ready", version: 1 }, { origin });
    }
    expect(player().dataset.status).toBe("loading");
  });

  it("ignora a origem certa vinda de outra janela", () => {
    const other = document.createElement("iframe");
    document.body.appendChild(other);
    render();
    play();

    send({ type: "enois:ready", version: 1 }, { source: other.contentWindow });
    send({ type: "enois:ready", version: 1 }, { source: window });
    send({ type: "enois:ready", version: 1 }, { source: null });

    expect(player().dataset.status).toBe("loading");
    other.remove();
  });

  it("ignora o quadro antigo depois de Tentar de novo", () => {
    render();
    play();
    const oldWindow = iframe()!.contentWindow;
    send({ type: "enois:error", version: 1 });
    act(() => (host.querySelector('[role="alert"] button') as HTMLButtonElement).click());

    send({ type: "enois:error", version: 1, message: "atrasada" }, { source: oldWindow });
    expect(player().dataset.status).toBe("loading");
  });

  it("não reage a nada depois de desmontar", () => {
    const added = vi.spyOn(window, "addEventListener");
    const removed = vi.spyOn(window, "removeEventListener");
    const onShareRequest = vi.fn();
    render({ onShareRequest });
    play();
    const frameWindow = iframe()!.contentWindow;
    act(() => root.unmount());

    const listeners = (spy: typeof added) =>
      spy.mock.calls.filter(([type]) => type === "message").map(([, listener]) => listener);
    expect(listeners(added).length).toBeGreaterThan(0);
    expect(listeners(removed)).toEqual(expect.arrayContaining(listeners(added)));
    added.mockRestore();
    removed.mockRestore();

    expect(() =>
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "enois:share", texto: "oi" },
          origin: GAME_ORIGIN,
          source: frameWindow,
        }),
      ),
    ).not.toThrow();
    expect(onShareRequest).not.toHaveBeenCalled();
    root = createRoot(host);
  });

  it("jogo na mesma origem do Énóis perde allow-same-origin", () => {
    render({ url: `${window.location.origin}/jogo.html` });
    play();
    expect(iframe()!.getAttribute("sandbox")).toBe("allow-scripts allow-pointer-lock");
  });

  it("endereço que não é https não vira quadro nem link", () => {
    render({ url: "javascript:alert(1)" });
    expect(button(texts.games.game.player.unsupportedUrl)!.disabled).toBe(true);
    expect(host.querySelector("a")).toBeNull();
  });
});

describe("GamePlayer — mensagens que já existiam", () => {
  it("identity responde só ao quadro e só com a origem exata", () => {
    render({ identity: { session: 1, token: "tok_opaco" } });
    play();
    const post = vi.spyOn(iframe()!.contentWindow!, "postMessage");

    send({ type: "enois:identity" });
    expect(post).toHaveBeenCalledWith({ type: "enois:identity", token: "tok_opaco" }, GAME_ORIGIN);
  });

  it("identity pedida antes do token é respondida quando ele chega", () => {
    render({ identity: null });
    play();
    const post = vi.spyOn(iframe()!.contentWindow!, "postMessage");

    send({ type: "enois:identity" });
    expect(post).not.toHaveBeenCalled();

    render({ identity: { session: 1, token: "tok_novo" } });
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith({ type: "enois:identity", token: "tok_novo" }, GAME_ORIGIN);
  });

  it("token da sessão anterior não é entregue depois de Tentar de novo", () => {
    render({ identity: { session: 1, token: "tok_sessao_1" } });
    play();
    send({ type: "enois:error", version: 1 });
    act(() => (host.querySelector('[role="alert"] button') as HTMLButtonElement).click());
    const post = vi.spyOn(iframe()!.contentWindow!, "postMessage");

    send({ type: "enois:identity" });
    expect(post).not.toHaveBeenCalled();

    render({ identity: { session: 2, token: "tok_sessao_2" } });
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(
      { type: "enois:identity", token: "tok_sessao_2" },
      GAME_ORIGIN,
    );
  });

  it("pedidos chegam com a sessão do quadro que os fez", () => {
    const onSpendRequest = vi.fn();
    render({ onSpendRequest });
    play();
    send({ type: "enois:error", version: 1 });
    act(() => (host.querySelector('[role="alert"] button') as HTMLButtonElement).click());
    send({ type: "enois:spend", amount: 5, requestId: "r-2" });
    expect(onSpendRequest).toHaveBeenCalledWith({ amount: 5, motivo: "", requestId: "r-2" }, 2);
  });

  it("sem identity (moderação) o pedido é ignorado", () => {
    render();
    play();
    const post = vi.spyOn(iframe()!.contentWindow!, "postMessage");
    send({ type: "enois:identity" });
    expect(post).not.toHaveBeenCalled();
  });

  it("share e spend viram pedidos para a página, nunca ação direta", () => {
    const onShareRequest = vi.fn();
    const onSpendRequest = vi.fn();
    render({ onShareRequest, onSpendRequest });
    play();

    send({ type: "enois:share", texto: "Nível 10!", imagem: "data:image/png;base64,AAAA" });
    send({ type: "enois:spend", amount: 5, motivo: "Poção", requestId: "r-1" });
    send({ type: "enois:spend", amount: -5, requestId: "r-2" });

    expect(onShareRequest).toHaveBeenCalledWith(
      { texto: "Nível 10!", imagem: "data:image/png;base64,AAAA" },
      1,
    );
    expect(onSpendRequest).toHaveBeenCalledTimes(1);
    expect(onSpendRequest).toHaveBeenCalledWith(
      { amount: 5, motivo: "Poção", requestId: "r-1" },
      1,
    );
  });

  it("mensagens de outra origem não pedem nada", () => {
    const onSpendRequest = vi.fn();
    render({ onSpendRequest });
    play();
    send({ type: "enois:spend", amount: 5, requestId: "r-1" }, { origin: "https://evil.com" });
    expect(onSpendRequest).not.toHaveBeenCalled();
  });
});
