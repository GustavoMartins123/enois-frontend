import type { RichNode } from "./rich-node";

/**
 * Lista aberta durante a leitura do texto: a indentação dela, a própria lista e o array onde ela
 * vive (o bloco do texto ou a lista de dentro do item) — é ali que uma lista irmã entra.
 */
export type OpenList = {
  indent: number;
  list: RichNode;
  siblings: RichNode[];
};
