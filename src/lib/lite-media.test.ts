// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { restoreSuspendedMedia, suspendOffscreenMedia } from "./lite-media";

/** Um `<video>` com posição de verdade na tela (o jsdom devolve tudo zero por padrão). */
function placeVideo(src: string, top: number, height = 200): HTMLVideoElement {
  const element = document.createElement("video");
  element.setAttribute("src", src);
  element.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + height,
      height,
      width: 320,
      left: 0,
      right: 320,
      x: 0,
      y: top,
    }) as DOMRect;
  document.body.appendChild(element);
  return element;
}

describe("mídia do modo lite", () => {
  beforeEach(() => {
    // O jsdom não carrega mídia; `load()` existe só para resetar o elemento.
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it("libera o que está fora da tela e devolve depois", () => {
    const onScreen = placeVideo("a.mp4", window.innerHeight - 100);
    const offscreen = placeVideo("b.mp4", window.innerHeight + 500);
    const keep = placeVideo("c.mp4", 0);

    expect(suspendOffscreenMedia(keep)).toBe(1);
    // O buffer/decodificador de quem saiu da tela é liberado; o endereço fica guardado.
    expect(offscreen.hasAttribute("src")).toBe(false);
    expect(offscreen.dataset.liteSrc).toBe("b.mp4");
    // Quem está à vista (ou é o vídeo do palco) fica intocado: nada pisca na tela.
    expect(onScreen.getAttribute("src")).toBe("a.mp4");
    expect(keep.getAttribute("src")).toBe("c.mp4");

    expect(restoreSuspendedMedia()).toBe(1);
    expect(offscreen.getAttribute("src")).toBe("b.mp4");
    expect(offscreen.dataset.liteSrc).toBeUndefined();
    expect(restoreSuspendedMedia()).toBe(0);
  });
});
