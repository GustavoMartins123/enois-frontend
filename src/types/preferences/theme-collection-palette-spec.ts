/**
 * Especificação compacta de uma paleta; o que não é declarado é derivado.
 *
 * A derivação usa `color-mix()` — CSS, não JavaScript — então o registro continua
 * sendo só dados e o navegador faz a conta (regra da casa: nada de simular em JS
 * o que o CSS resolve).
 *
 * ## Contrato com a galeria
 *
 * Um pacote publicado usa este mesmo tipo, pelo caminho de `gallery-collections`. O que a
 * porta (`ThemeGalleryService.validatePackageJson`) exige hoje: `background`, `surface`,
 * `border`, `primary`, `text.strong`, `text.subtle` em hex de 6 dígitos, `gradient` só na
 * forma `linear-gradient(Ndeg, #rrggbb, #rrggbb)`, e contraste `text.strong × background`
 * >= 4.5:1. `muted`, `onPrimary` e `text.date` não são obrigatórios — quem publicar por
 * fora do app pode declará-los, e eles valem.
 *
 * Por isso `gallery-collections` trata derivação como plano B, não como substituição: sem
 * declaração, `muted` sai de superfície+fundo, `onPrimary` da luminância do destaque e
 * `text.date` do texto sutil. `muted` merece atenção — é dele que saem `--muted` e
 * `--surface-2`, e `--surface-2` é o fundo do item selecionado da navegação lateral.
 *
 * `extra` e `shadows` são a saída de emergência dos temas hardcoded da coleção (relevos que
 * precisam de token próprio). Pacote publicado não deve usá-los: a porta não os audita, e
 * `palette()` os espalha direto nas declarações CSS.
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
  /**
   * Fonte só dos títulos. Sem ela, os títulos usam a `fontSans`. Serve para o tema ter uma fonte
   * de personalidade (mono, serifa) sem que o texto corrido inteiro fique nela.
   */
  fontDisplay?: string;
  /** O tema é dono da leitura: texto explícito em toda paleta, com contraste conferido. */
  text: { strong: string; subtle: string; date: string };
  /** Transparência nativa das superfícies do tema (Aero 55, Frutiger 72; resto opaco). */
  surfaceAlpha?: number;
  extra?: Record<string, string>;
};
