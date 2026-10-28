// @vitest-environment jsdom
import { act } from "react";

import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NEW_FX_FRAMES } from "@/lib/avatar-frames";

import { UserAvatar } from "@/components/user-avatar";

describe("Animação das novas molduras", () => {
  let host: HTMLDivElement;
  let root: Root;
  let hidden: boolean;
  let callback: IntersectionObserverCallback;
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();
  const createObserver = vi.fn(function (onChange: IntersectionObserverCallback) {
    callback = onChange;
    return { observe, unobserve, disconnect };
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("IntersectionObserver", createObserver);
    hidden = false;
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("compartilha o observer, pausa na aba oculta e libera os recursos ao sair", async () => {
    await act(async () =>
      root.render(
        <>
          <UserAvatar frame="moldura-mare" />
          <UserAvatar frame="moldura-vendaval" />
        </>,
      ),
    );
    expect(createObserver).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(2);
    const [first, second] = [...host.querySelectorAll("[data-avatar-animated]")];
    callback(
      [{ target: first, isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(first.hasAttribute("data-avatar-animating")).toBe(true);
    expect(second.hasAttribute("data-avatar-animating")).toBe(false);

    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(first.hasAttribute("data-avatar-animating")).toBe(false);
    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(first.hasAttribute("data-avatar-animating")).toBe(true);

    callback(
      [{ target: first, isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(first.hasAttribute("data-avatar-animating")).toBe(false);
    await act(async () => root.render(<UserAvatar frame="moldura-ambar" />));
    expect(unobserve).toHaveBeenCalledTimes(2);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("propaga erro de observação e desfaz o registro incompleto", async () => {
    observe.mockImplementationOnce(() => {
      throw new Error("Falha ao observar avatar");
    });
    await expect(act(async () => root.render(<UserAvatar frame="moldura-neon" />))).rejects.toThrow(
      "Falha ao observar avatar",
    );
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it.each(NEW_FX_FRAMES)("%s: controla a animação pela visibilidade e pela aba", async (frame) => {
    await act(async () => root.render(<UserAvatar frame={frame} />));
    const avatar = host.querySelector("[data-avatar-animated]")!;
    const intersect = (isIntersecting: boolean) =>
      callback(
        [{ target: avatar, isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    expect(avatar.hasAttribute("data-avatar-animating")).toBe(false);
    intersect(true);
    expect(avatar.hasAttribute("data-avatar-animating")).toBe(true);
    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(avatar.hasAttribute("data-avatar-animating")).toBe(false);
    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(avatar.hasAttribute("data-avatar-animating")).toBe(true);
    intersect(false);
    expect(avatar.hasAttribute("data-avatar-animating")).toBe(false);
  });
});
