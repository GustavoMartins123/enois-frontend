import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CharCounter } from "./char-counter";

const render = (length: number) =>
  renderToStaticMarkup(<CharCounter length={length} max={1200} />);

describe("CharCounter", () => {
  it("mostra o uso e o limite desde o campo vazio", () => {
    expect(render(0)).toContain("0 / 1.200 caracteres");
    expect(render(850)).toContain("850 / 1.200 caracteres");
  });

  it("mantém o aviso de proximidade do limite", () => {
    const html = render(1180);

    expect(html).toContain("1.180 / 1.200 caracteres");
    expect(html).toContain("faltam 20 caracteres");
    expect(html).toContain("text-primary");
    expect(render(1199)).toContain("falta 1 caractere");
  });

  it("informa quando o limite é atingido com anúncio acessível", () => {
    const html = render(1200);

    expect(html).toContain("1.200 / 1.200 caracteres");
    expect(html).toContain("limite de caracteres atingido");
    expect(html).toContain("text-destructive");
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
  });

  it("retorna ao progresso normal após apagar caracteres", () => {
    const html = render(1100);

    expect(html).toContain("1.100 / 1.200 caracteres");
    expect(html).not.toContain("limite de caracteres atingido");
    expect(html).not.toContain("faltam");
  });
});
