import { texts } from "@/texts";
import { describe, expect, it } from "vitest";

describe("texts.events.dateTime", () => {
  const year = new Date().getFullYear();

  it("mostra dia e mês curtos em português no ano atual", () => {
    expect(texts.events.dateTime(`${year}-10-23`, "08:00")).toBe("23 out · 08:00");
  });

  it("acrescenta o ano quando o evento não é deste ano", () => {
    expect(texts.events.dateTime(`${year + 3}-12-31`, "23:59")).toBe(`31 dez ${year + 3} · 23:59`);
  });

  it("não volta um dia por causa do fuso (a data vem sem fuso)", () => {
    expect(texts.events.dateTime(`${year}-01-01`, "00:00")).toBe("1 jan · 00:00");
  });

  it("devolve o texto como veio se a data for inválida", () => {
    expect(texts.events.dateTime("em breve", "")).toBe("em breve · ");
  });
});
