/**
 * No da formatacao leve usada nos posts e comentarios.
 *
 * Blocos (`paragraph`, `heading`, `quote`, `codeBlock`, `list`, `divider`) tem filhos inline
 * (`text`, `bold`, `italic`, `strike`, `code`, `link`, `mention`). Renderizado como arvore de
 * elementos React — nunca como HTML cru — entao a barra de ferramentas nao abre superficie de XSS.
 */
export type RichNode = {
  kind:
    | "paragraph"
    | "heading"
    | "quote"
    | "codeBlock"
    | "list"
    | "listItem"
    | "divider"
    | "text"
    | "bold"
    | "italic"
    | "strike"
    | "code"
    | "link"
    | "mention";
  /** Texto do no (inline) ou do bloco de codigo. */
  text?: string;
  /** Destino do link. */
  href?: string;
  /** Nivel do titulo (1 a 3). */
  level?: number;
  /** Lista numerada quando verdadeiro; com marcadores quando falso. */
  ordered?: boolean;
  /** Filhos do bloco ou do no inline. */
  children?: RichNode[];
};
