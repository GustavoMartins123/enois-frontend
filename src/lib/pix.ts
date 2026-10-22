/**
 * Pix "copia e cola" (BR Code EMV) da doação — estático, SEM expiração.
 *
 * O BR Code ESTÁTICO não tem data de validade: quem leva a cobrança é o próprio app do banco, e o
 * payload não carrega vencimento (nada de campos de cobrança/due date). O que fazia o código ser
 * recusado como "expirado" era a CHAVE: o campo 01 do bloco 26 tem que ser a chave exatamente como
 * registrada no Pix — para CNPJ, os 14 DÍGITOS —, e não o CNPJ formatado com pontos e barra.
 *
 * O nome exibido é "Apoie o Énóis"; no payload o campo 59 segue a regra do EMV (maiúsculas, sem
 * acento), então vira "APOIE O ENOIS".
 */

/** CNPJ como aparece na tela (formatado). */
export const PIX_KEY = "51.839.682/0001-61";

/** A chave que vai NO PAYLOAD: só os dígitos, como registrada no Pix. */
export const PIX_KEY_DIGITS = "51839682000161";

/** Nome do recebedor (a tela mostra com acento; o EMV recebe a versão limpa). */
export const PIX_NAME = "Apoie o Énóis";
export const PIX_CITY = "SAO PAULO";
export const PIX_TXID = "APOIEENOIS";

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

/**
 * O payload do BR Code (copia e cola). Estático de propósito: sem valor (a pessoa escolhe quanto
 * doar) e sem vencimento — o mesmo código vale para sempre.
 */
export function pixCopiaECola(): string {
  const conta = tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", PIX_KEY_DIGITS));
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
  // O CRC cobre o payload INTEIRO, incluindo o próprio campo 63/04 — calcular só sobre o "base"
  // (sem o 6304) entrega um código que o app do banco recusa.
  const comCrc = `${base}6304`;
  return comCrc + crc16(comCrc);
}
