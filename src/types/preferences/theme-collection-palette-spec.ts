/**
 * Especificação compacta de uma paleta; o que não é declarado é derivado.
 *
 * A derivação usa `color-mix()` — CSS, não JavaScript — então o registro continua
 * sendo só dados e o navegador faz a conta (regra da casa: nada de simular em JS
 * o que o CSS resolve).
 */
export type PaletteSpec = {
  background: string;
  /** Cartões, painéis, popovers. */
  surface: string;
  /** Blocos alternativos, hovers, linhas. */
  muted: string;
  border: string;
  input?: string;
  primary: string;
  onPrimary: string;
  soft?: string;
  secondary?: string;
  onSecondary?: string;
  accent?: string;
  onAccent?: string;
  ring?: string;
  gradient?: string;
  shadows?: { soft?: string; card?: string };
  radius?: string;
  fontSans?: string;
  /** O tema é dono da leitura: texto explícito em toda paleta, com contraste conferido. */
  text: { strong: string; subtle: string; date: string };
  extra?: Record<string, string>;
};
