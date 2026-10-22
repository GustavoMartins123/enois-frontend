import { describe, expect, it } from "vitest";

import { PIX_KEY, PIX_KEY_DIGITS, pixCopiaECola } from "./pix";

/** CRC16-CCITT (0x1021, init 0xFFFF) — o mesmo do gerador, aqui para conferir o fechamento. */
function crc16(payload: string): string {
  let crc = 65535;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 32768 ? ((crc << 1) ^ 4129) & 65535 : (crc << 1) & 65535;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Lê os campos TLV de primeiro nível (id de 2 dígitos + tamanho de 2 dígitos). */
function tlvFields(payload: string): Map<string, string> {
  const fields = new Map<string, string>();
  let offset = 0;
  while (offset + 4 <= payload.length) {
    const id = payload.slice(offset, offset + 2);
    const length = Number(payload.slice(offset + 2, offset + 4));
    fields.set(id, payload.slice(offset + 4, offset + 4 + length));
    offset += 4 + length;
  }
  return fields;
}

describe("pixCopiaECola", () => {
  /**
   * O CNPJ formatado ("51.839.682/0001-61") NÃO é chave Pix: no BR Code o campo vai com a chave
   * exatamente como registrada (14 dígitos). Era esse o motivo de o app do banco recusar/“expirar”
   * o código.
   */
  it("usa a chave CNPJ como os 14 dígitos, e não o CNPJ formatado", () => {
    const payload = pixCopiaECola();
    expect(payload).toContain(PIX_KEY_DIGITS);
    expect(payload).not.toContain(PIX_KEY);

    const conta = tlvFields(tlvFields(payload).get("26")!);
    expect(conta.get("00")).toBe("br.gov.bcb.pix");
    expect(conta.get("01")).toBe(PIX_KEY_DIGITS);
  });

  it("leva o nome novo no campo do recebedor", () => {
    const payload = pixCopiaECola();
    expect(tlvFields(payload).get("59")).toBe("APOIE O ENOIS");
    expect(payload).toContain("APOIEENOIS"); // identificador da transação
  });

  /** BR Code estático: ponto de iniciação 11, sem valor e SEM vencimento (o código não expira). */
  it("é estático: sem valor fixo e sem data de vencimento", () => {
    const fields = tlvFields(pixCopiaECola());
    expect(fields.get("01")).toBe("11");
    expect(fields.has("54")).toBe(false);
    // O bloco 62 carrega só o txid (05); nada de cobrança com vencimento (54/63/…).
    expect([...tlvFields(fields.get("62")!).keys()]).toEqual(["05"]);
  });

  it("fecha o payload com o CRC certo", () => {
    const payload = pixCopiaECola();
    expect(payload.slice(0, 4)).toBe("0002");
    expect(payload.slice(-8, -4)).toBe("6304");
    expect(payload.slice(-4)).toBe(crc16(payload.slice(0, -4)));
  });
});
