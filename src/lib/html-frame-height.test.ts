import { describe, expect, it } from "vitest";

import { contentHeight } from "./html-frame-height";

/**
 * A conta da altura do quadro, com os numeros medidos de verdade no navegador (2026-10-21).
 *
 * O caso que motivou: uma bio de 116px dentro de um quadro de 520px. O `scrollHeight` do `<html>`
 * do quadro e a altura da VIEWPORT (520) — nunca menor que ela. Usado direto na conta, ele
 * fazia o quadro nunca encolher e a bio ficava com um buraco de 400px abaixo do texto.
 */
describe("altura do conteudo do quadro HTML", () => {
  it("encolhe para o conteudo quando ele e menor que a viewport do quadro", () => {
    // Medido no navegador: bio de 116px num quadro de 520px.
    expect(
      contentHeight({
        bodyScrollHeight: 116,
        bodyOffsetHeight: 116,
        rootScrollHeight: 520,
        rootClientHeight: 520,
        rootOffsetHeight: 116,
      }),
    ).toBe(116);
  });

  it("cresce quando o conteudo estoura a viewport do quadro", () => {
    expect(
      contentHeight({
        bodyScrollHeight: 800,
        bodyOffsetHeight: 800,
        rootScrollHeight: 800,
        rootClientHeight: 520,
        rootOffsetHeight: 800,
      }),
    ).toBe(800);
  });

  it("respeita o html do autor com altura cheia (o conteudo preenche o quadro)", () => {
    // O autor wrote html{height:100%}: o conteudo ocupa a viewport toda, e o quadro fica nela.
    expect(
      contentHeight({
        bodyScrollHeight: 520,
        bodyOffsetHeight: 520,
        rootScrollHeight: 520,
        rootClientHeight: 520,
        rootOffsetHeight: 520,
      }),
    ).toBe(520);
  });

  it("devolve zero quando nao ha conteudo medido", () => {
    expect(
      contentHeight({
        bodyScrollHeight: 0,
        bodyOffsetHeight: 0,
        rootScrollHeight: 0,
        rootClientHeight: 0,
        rootOffsetHeight: 0,
      }),
    ).toBe(0);
  });
});
