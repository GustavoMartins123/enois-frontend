// @vitest-environment jsdom
import { act } from "react";

import { texts } from "@/texts";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LiteVideo } from "./lite-video";

/**
 * No Modo lite o vídeo do feed não toca no meio da lista: o card convida ("assistir em tela
 * cheia") e o palco abre com som, pausando o resto. Fechar devolve a pessoa para a mesma tela.
 */
describe("LiteVideo no Modo lite", () => {
  let root: Root | null = null;
  let container: HTMLDivElement;

  beforeEach(() => {
    window.localStorage.setItem("connect-grow-lite-mode", "1");
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    document.body.replaceChildren();
    document.body.style.overflow = "";
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("oferece o palco, abre com som e fecha de volta ao mesmo lugar", async () => {
    await act(async () => root!.render(<LiteVideo src="https://cdn.exemplo/video.mp4" />));

    // O player da página fica sem controles (quem manda é o convite) e o quadro não toca.
    const inline = container.querySelector("video")!;
    expect(inline.controls).toBe(false);
    expect(inline.muted).toBe(true);

    const open = container.querySelector<HTMLButtonElement>(
      `button[aria-label="${texts.posts.mediaStage.open}"]`,
    );
    expect(open).not.toBeNull();

    await act(async () => open!.click());

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    // O palco toca com som: o toque foi um pedido explícito para assistir.
    const stageVideo = dialog!.querySelector("video")!;
    expect(stageVideo.controls).toBe(true);
    expect(stageVideo.muted).toBe(false);
    // A página atrás não rola enquanto o palco está aberto.
    expect(document.body.style.overflow).toBe("hidden");

    const close = dialog!.querySelector<HTMLButtonElement>(
      `button[aria-label="${texts.accessibility.close}"]`,
    );
    expect(close).not.toBeNull();

    await act(async () => close!.click());

    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
});
