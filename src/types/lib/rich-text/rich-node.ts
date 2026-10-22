/**
 * Nó da formatação leve usada em todo campo de texto que não é HTML (post, comentário, mensagem,
 * bio, descrição de vaga e de comunidade).
 *
 * Blocos (`paragraph`, `heading`, `quote`, `codeBlock`, `list`, `listItem`, `divider`, `table`,
 * `tableRow`, `tableCell`) têm filhos inline (`text`, `bold`, `italic`, `strike`, `code`, `link`,
 * `mention`, `image`, `spoiler`). Renderizado como árvore de elementos React — nunca como HTML cru —
 * então a barra de ferramentas não abre superfície de XSS.
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
    | "table"
    | "tableRow"
    | "tableCell"
    | "text"
    | "bold"
    | "italic"
    | "strike"
    | "code"
    | "link"
    | "mention"
    | "image"
    /** Texto ofuscado até a pessoa tocar em "mostrar" (spoiler). */
    | "spoiler";
  /** Texto do nó (inline) ou do bloco de código. */
  text?: string;
  /** Destino do link, ou o endereço da imagem. */
  href?: string;
  /** Nível do título (1 a 3). */
  level?: number;
  /** Lista numerada quando verdadeiro; com marcadores quando falso. */
  ordered?: boolean;
  /** Item de lista com caixa de marcar: marcado, desmarcado, ou `undefined` em item comum. */
  checked?: boolean;
  /** Lista dentro de um item (`- a` com `  - b` embaixo). */
  nested?: RichNode[];
  /** Linha de cabeçalho da tabela. */
  header?: boolean;
  /** Alinhamento da célula (`center`/`right`; ausente é esquerda). */
  align?: string;
  /** Filhos do bloco ou do nó inline. */
  children?: RichNode[];
};
