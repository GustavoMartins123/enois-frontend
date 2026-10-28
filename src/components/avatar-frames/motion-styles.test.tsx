// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { NEW_FX_FRAMES } from "@/lib/avatar-frames";

import { UserAvatar } from "@/components/user-avatar";

const frameCss = readFileSync("src/components/avatar-frames/avatar-frames.css", "utf8");

describe("Movimento das oito molduras no CSS local", () => {
  let host: HTMLDivElement;
  let styles: HTMLStyleElement;
  let reducedStyles: HTMLStyleElement;

  beforeEach(() => {
    host = document.createElement("div");
    styles = document.createElement("style");
    reducedStyles = document.createElement("style");
    styles.textContent = frameCss;
    document.head.append(styles);
    document.body.append(host);
  });

  afterEach(() => {
    host.remove();
    styles.remove();
    reducedStyles.remove();
    document.documentElement.removeAttribute("data-force-motion");
  });

  it.each(NEW_FX_FRAMES)("%s: pausa e retoma todos os elementos animados", (frame) => {
    host.innerHTML = renderToStaticMarkup(<UserAvatar frame={frame} />);
    const avatar = host.querySelector("[data-avatar-new-frame]")!;
    const animated = [...avatar.querySelectorAll("*")].filter(
      (element) => getComputedStyle(element).animation !== "",
    );
    expect(animated.length).toBeGreaterThan(0);
    expect(
      animated.every((element) => getComputedStyle(element).animationPlayState === "paused"),
    ).toBe(true);
    avatar.setAttribute("data-avatar-animating", "");
    expect(
      animated.every((element) => getComputedStyle(element).animationPlayState === "running"),
    ).toBe(true);
    avatar.removeAttribute("data-avatar-animating");
    expect(
      animated.every((element) => getComputedStyle(element).animationPlayState === "paused"),
    ).toBe(true);
  });

  it.each(NEW_FX_FRAMES)(
    "%s: movimento reduzido desativa os efeitos mesmo com a moldura ativa",
    (frame) => {
      host.innerHTML = renderToStaticMarkup(<UserAvatar frame={frame} />);
      const avatar = host.querySelector("[data-avatar-new-frame]")!;
      avatar.setAttribute("data-avatar-animating", "");
      const animated = [...avatar.querySelectorAll("*")].filter(
        (element) => getComputedStyle(element).animation !== "",
      );
      expect(animated.length).toBeGreaterThan(0);
      const media = [...styles.sheet!.cssRules].filter(
        (rule): rule is CSSMediaRule =>
          rule instanceof CSSMediaRule && rule.conditionText === "(prefers-reduced-motion: reduce)",
      );
      expect(media).toHaveLength(1);
      // O jsdom não aplica media queries; aplicamos as regras reais do bloco selecionado.
      reducedStyles.textContent = media
        .flatMap((rule) => [...rule.cssRules].map((css) => css.cssText))
        .join("\n");
      document.head.append(reducedStyles);
      expect(animated.every((element) => getComputedStyle(element).animation === "none")).toBe(
        true,
      );
      document.documentElement.setAttribute("data-force-motion", "");
      expect(animated.every((element) => getComputedStyle(element).animation !== "none")).toBe(
        true,
      );
    },
  );
});
