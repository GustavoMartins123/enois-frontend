/**
 * Pix "copia e cola" (BR Code EMV) da doação.
 *
 * Os dados são da The Kof Foundation (a mesma empresa que mantém o Énóis) e o payload
 * é gerado EXATAMENTE pelo mesmo algoritmo da página de apoiar do Kof (TLV + CRC16-CCITT):
 * a chave entra como está (CNPJ formatado), sem valor (a pessoa escolhe quanto doa).
 */

export const PIX_KEY = "51.839.682/0001-61";
export const PIX_NAME = "THE KOF FOUNDATION";
export const PIX_CITY = "SAO PAULO";
export const PIX_TXID = "KOFDONATION";

/** Campo TLV: id + tamanho em 2 dígitos + valor. */
function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

/** CRC16-CCITT (polinômio 0x1021, init 0xFFFF) em 4 hex maiúsculos. */
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

/** Maiúsculas, sem acento nem símbolo, cortado — o que o EMV aceita em nome/cidade. */
function limpar(valor: string, max: number): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .slice(0, max)
    .trim();
}

/** O payload do BR Code (copia e cola), idêntico ao da página de apoiar do Kof. */
export function pixCopiaECola(): string {
  const conta = tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", PIX_KEY));
  const txid = tlv("62", tlv("05", PIX_TXID));
  const base =
    tlv("00", "01") +
    tlv("01", "11") +
    conta +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("58", "BR") +
    tlv("59", limpar(PIX_NAME, 25)) +
    tlv("60", limpar(PIX_CITY, 15)) +
    txid;
  return `${base}6304${crc16(base)}`;
}
