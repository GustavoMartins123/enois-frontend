// @vitest-environment node
import { act } from "react";

import type { GamePlayerProps } from "@/types/components/games/game-player-props";
import { renderToString } from "react-dom/server";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { builtinEnvironments } from "vitest/environments";

import { GamePlayer } from "./game-player";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let hydrateRoot: typeof import("react-dom/client").hydrateRoot;
let teardown: ((global: typeof globalThis) => unknown) | undefined;
const servedHtml = new Map<string, string>();
const cleanups: (() => void)[] = [];

function key(props: GamePlayerProps) {
  return JSON.stringify(props);
}

const SCENARIOS: GamePlayerProps[] = [
  { url: "https://jogo.exemplo.com/", title: "Jogo de exemplo" },
  { url: "https://jogo.exemplo.com/", title: "Jogo de exemplo", autoStart: true },
  { url: "https://enois.ia.br/jogo.html", title: "Mesma origem", autoStart: true },
];

// O HTML sai do servidor de verdade (sem window); só depois nasce o DOM que hidrata.
beforeAll(async () => {
  expect(typeof globalThis.window).toBe("undefined");
  for (const props of SCENARIOS) {
    servedHtml.set(key(props), renderToString(<GamePlayer {...props} />));
  }

  ({ teardown } = await builtinEnvironments.jsdom.setup(globalThis, {
    jsdom: { url: "https://enois.ia.br/games/dev/jogo" },
  }));
  ({ hydrateRoot } = await import("react-dom/client"));
});

afterEach(() => {
  while (cleanups.length) cleanups.pop()!();
  vi.restoreAllMocks();
});

afterAll(() => teardown?.(globalThis));

function hydrate(props: GamePlayerProps) {
  const host = document.createElement("div");
  host.innerHTML = servedHtml.get(key(props))!;
  document.body.appendChild(host);

  const recoverable = vi.fn();
  const consoleError = vi.spyOn(console, "error");
  let root!: ReturnType<typeof hydrateRoot>;
  act(() => {
    root = hydrateRoot(host, <GamePlayer {...props} />, { onRecoverableError: recoverable });
  });
  cleanups.push(() => {
    act(() => root.unmount());
    host.remove();
  });
  return { host, root, recoverable, consoleError };
}

describe("GamePlayer hidratado", () => {
  it("autoStart=false hidrata sem diferença e espera o clique", () => {
    const { host, recoverable, consoleError } = hydrate({
      url: "https://jogo.exemplo.com/",
      title: "Jogo de exemplo",
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(host.querySelector("iframe")).toBeNull();

    act(() => host.querySelector("button")!.click());
    expect(host.querySelector("iframe")!.getAttribute("sandbox")).toBe(
      "allow-scripts allow-same-origin allow-pointer-lock",
    );
  });

  it("autoStart=true hidrata sem diferença e cria o quadro externo depois", () => {
    const { host, recoverable, consoleError } = hydrate({
      url: "https://jogo.exemplo.com/",
      title: "Jogo de exemplo",
      autoStart: true,
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(host.querySelector("iframe")!.getAttribute("sandbox")).toBe(
      "allow-scripts allow-same-origin allow-pointer-lock",
    );
  });

  it("jogo na mesma origem do Énóis hidrata com o sandbox restrito", () => {
    const { host, recoverable } = hydrate({
      url: "https://enois.ia.br/jogo.html",
      title: "Mesma origem",
      autoStart: true,
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(host.querySelector("iframe")!.getAttribute("sandbox")).toBe(
      "allow-scripts allow-pointer-lock",
    );
  });

  it("depois de hidratado, o protocolo funciona e o listener sai no unmount", () => {
    const added = vi.spyOn(window, "addEventListener");
    const removed = vi.spyOn(window, "removeEventListener");
    const { host } = hydrate({
      url: "https://jogo.exemplo.com/",
      title: "Jogo de exemplo",
      autoStart: true,
    });
    const frame = host.querySelector("iframe")!;

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: { type: "enois:ready", version: 1 },
          origin: "https://jogo.exemplo.com",
          source: frame.contentWindow,
        }),
      );
    });
    expect((host.firstElementChild as HTMLElement).dataset.status).toBe("ready");

    cleanups.pop()!();
    const messages = (spy: typeof added) =>
      spy.mock.calls.filter(([type]) => type === "message").map(([, listener]) => listener);
    expect(messages(added).length).toBeGreaterThan(0);
    expect(messages(removed)).toEqual(expect.arrayContaining(messages(added)));
  });
});
