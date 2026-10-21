import { describe, expect, it } from "vitest";

import { isNightRestTime, shouldShowNightRest } from "./night-rest";

const at = (day: number, hour: number, minute: number) =>
  new Date(2026, 0, day, hour, minute, 0, 0);

describe("lembrete de descanso da madrugada", () => {
  it("não aparece às 23h59", () => {
    expect(isNightRestTime(at(10, 23, 59))).toBe(false);
  });

  it("aparece às 00h00", () => {
    expect(isNightRestTime(at(11, 0, 0))).toBe(true);
  });

  it("aparece às 02h30", () => {
    expect(isNightRestTime(at(11, 2, 30))).toBe(true);
  });

  it("aparece às 04h59", () => {
    expect(isNightRestTime(at(11, 4, 59))).toBe(true);
  });

  it("não aparece às 05h00", () => {
    expect(isNightRestTime(at(11, 5, 0))).toBe(false);
  });

  it("nunca aparece com a opção desativada", () => {
    expect(shouldShowNightRest(false, at(11, 2, 30))).toBe(false);
  });

  it("nunca aparece enquanto a preferência não carregou ou falhou", () => {
    expect(shouldShowNightRest(undefined, at(11, 2, 30))).toBe(false);
  });

  it("atravessa a mudança de dia sem perder a janela", () => {
    expect(isNightRestTime(at(10, 23, 59))).toBe(false);
    expect(isNightRestTime(at(11, 0, 0))).toBe(true);
  });

  it("reavalia a cada horário, então a página aberta às 04h59 para de mostrar às 05h00", () => {
    expect(shouldShowNightRest(true, at(11, 4, 59))).toBe(true);
    expect(shouldShowNightRest(true, at(11, 5, 0))).toBe(false);
  });

  it("usa o relógio local: a mesma função vale para qualquer fuso do dispositivo", () => {
    // O Date é construído pelos componentes locais; getHours() acompanha o fuso do aparelho.
    const localMidnight = new Date(2026, 0, 11, 0, 0, 0, 0);
    const localMorning = new Date(2026, 0, 11, 5, 0, 0, 0);
    expect(isNightRestTime(localMidnight)).toBe(true);
    expect(isNightRestTime(localMorning)).toBe(false);
  });
});
