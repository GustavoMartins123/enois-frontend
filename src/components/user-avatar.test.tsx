// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FX_FRAMES } from "@/lib/avatar-frames";

import { UserAvatar } from "./user-avatar";

describe("UserAvatar com moldura", () => {
  it("moldura simples continua no próprio Avatar, sem invólucro", () => {
    const html = renderToString(
      <UserAvatar frame="moldura-violeta" alt="Ana Lima" className="h-8 w-8" />,
    );
    expect(html).toMatch(
      /^<span[^>]*class="[^"]*h-8 w-8[^"]*"[^>]*data-avatar-frame="moldura-violeta"/,
    );
    expect(html).not.toContain("moldura-fx");
  });

  it.each(FX_FRAMES)(
    "%s: invólucro com o tamanho de quem chamou e o efeito ao lado do Avatar",
    (frame) => {
      const html = renderToString(
        <UserAvatar frame={frame} alt="Ana Lima" className="h-8 w-8 shrink-0" />,
      );
      expect(html).toMatch(
        new RegExp(`^<span class="[^"]*h-8 w-8[^"]*" data-avatar-frame="${frame}">`),
      );
      expect(html).not.toContain("h-10 w-10");
      expect(html).toContain('<span aria-hidden="true" class="moldura-fx">');
      expect(html).toContain("AL");
    },
  );

  it("dois avatares com a mesma moldura não dividem ids de filtro", () => {
    const html = renderToString(
      <>
        <UserAvatar frame="moldura-inferno" alt="A" />
        <UserAvatar frame="moldura-inferno" alt="B" />
      </>,
    );
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
