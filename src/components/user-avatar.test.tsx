// @vitest-environment node
import { texts } from "@/texts";
import { FX_FRAMES as DESIGN_SYSTEM_FX_FRAMES } from "@rede-enois/design-system/domain";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ANIMATED_FRAMES, NEW_FX_FRAMES } from "@/lib/avatar-frames";

import { UserAvatar } from "./user-avatar";

describe("UserAvatar com as coleções Elementos e Tecnologia", () => {
  it.each(NEW_FX_FRAMES)("%s: compõe um efeito e preserva a foto e o tamanho", (frame) => {
    const html = renderToString(
      <UserAvatar frame={frame} fallback="DE" className="h-8 w-8 shrink-0" />,
    );
    expect(html).toMatch(new RegExp(`^<span[^>]*data-avatar-frame="${frame}"`));
    expect(html).toMatch(/^<span[^>]*class="[^"]*h-8 w-8/);
    expect(html).not.toContain("h-10 w-10");
    expect(html.match(/data-avatar-frame=/g)).toHaveLength(1);
    expect(html.match(/class="moldura-fx"/g)).toHaveLength(1);
    expect(html).toContain("DE");
    expect(ANIMATED_FRAMES).toContain(frame);
  });

  it.each(NEW_FX_FRAMES)("%s: mantém IDs exclusivos em avatares repetidos", (frame) => {
    const html = renderToString(
      <>
        <UserAvatar frame={frame} />
        <UserAvatar frame={frame} />
      </>,
    );
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]);
    if (frame !== "moldura-fliperama") expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(DESIGN_SYSTEM_FX_FRAMES)("%s: preserva o efeito existente do design system", (frame) => {
    const html = renderToString(<UserAvatar frame={frame} fallback="DE" />);
    expect(html).toContain(`data-avatar-frame="${frame}"`);
    expect(html.match(/class="moldura-fx"/g)).toHaveLength(1);
    expect(html).toContain("DE");
  });

  it("respeita o corte das novas molduras em campos compactos", () => {
    const html = renderToString(
      <UserAvatar frame="moldura-vendaval" frameOverflow="hidden" className="h-8 w-8" />,
    );
    expect(html).toMatch(/^<span[^>]*class="[^"]*overflow-hidden/);
  });

  it.each(["moldura-desconhecida", "toString", ""])(
    "rejeita a moldura desconhecida %s",
    (frame) => {
      expect(() => renderToString(<UserAvatar frame={frame} />)).toThrow(
        texts.frameShop.unknownFrame,
      );
    },
  );
});
