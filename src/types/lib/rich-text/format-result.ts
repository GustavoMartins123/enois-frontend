/** Texto resultante de uma acao de formatacao + onde o cursor deve ficar depois dela. */
export type FormatResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};
