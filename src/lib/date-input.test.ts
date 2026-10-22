import { describe, expect, it } from "vitest";

import { displayToIso, isoToDisplay, maskDate } from "./date-input";

describe("maskDate", () => {
  it("insere as barras conforme a digitação", () => {
    expect(maskDate("1")).toBe("1");
    expect(maskDate("150")).toBe("15/0");
    expect(maskDate("1503")).toBe("15/03");
    expect(maskDate("15031990")).toBe("15/03/1990");
  });

  it("ignora o que não é dígito e corta em 8 dígitos", () => {
    expect(maskDate("15/03/1990")).toBe("15/03/1990");
    expect(maskDate("15-03-1990999")).toBe("15/03/1990");
    expect(maskDate("ab")).toBe("");
  });
});

describe("displayToIso", () => {
  it("converte data completa para ISO", () => {
    expect(displayToIso("15/03/1990")).toBe("1990-03-15");
    expect(displayToIso("29/02/2024")).toBe("2024-02-29");
  });

  it("devolve vazio para data incompleta ou inexistente", () => {
    expect(displayToIso("15/03/19")).toBe("");
    expect(displayToIso("31/02/1990")).toBe("");
    expect(displayToIso("29/02/2023")).toBe("");
    expect(displayToIso("00/01/1990")).toBe("");
    expect(displayToIso("10/13/1990")).toBe("");
  });
});

describe("isoToDisplay", () => {
  it("converte ISO para dd/mm/aaaa e ignora o resto", () => {
    expect(isoToDisplay("1990-03-15")).toBe("15/03/1990");
    expect(isoToDisplay("")).toBe("");
    expect(isoToDisplay(undefined)).toBe("");
    expect(isoToDisplay("15/0")).toBe("");
  });
});
