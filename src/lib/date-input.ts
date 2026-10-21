/**
 * Helpers do campo de data digitável (dd/mm/aaaa).
 *
 * O `<input type="date">` nativo no Chrome do Android não abre o teclado: tocar no campo só seleciona
 * o segmento "dd" e a única saída é o calendário, que para data de nascimento obriga a rolar décadas.
 * O campo digitável usa texto com teclado numérico e converte para o ISO (aaaa-mm-dd) que a API espera.
 */

/** Mantém só dígitos (até 8) e insere as barras: "15031990" → "15/03/1990". */
export function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** "15/03/1990" → "1990-03-15". Devolve "" se a data estiver incompleta ou não existir (31/02). */
export function displayToIso(display: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!match) return "";
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "";
  }
  return `${yyyy}-${mm}-${dd}`;
}

/** "1990-03-15" → "15/03/1990". Qualquer outra coisa vira "". */
export function isoToDisplay(iso: string | undefined | null): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!match) return "";
  const [, yyyy, mm, dd] = match;
  return `${dd}/${mm}/${yyyy}`;
}
