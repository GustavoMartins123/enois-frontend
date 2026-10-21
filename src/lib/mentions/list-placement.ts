import type { MentionListSide } from "@/types/lib/mentions/list-placement";

/**
 * Teto visual da lista (`max-h-48` = 12rem). A escolha de lado usa o mesmo número
 * para não abrir num lado onde a lista, no pior caso, não cabe.
 */
export const MENTION_LIST_MAX_HEIGHT = 192;

/** Folga da lista (`mt-1` / `mb-1`). Sem ela, no limite exato a lista ainda cobre a busca. */
export const MENTION_LIST_GAP = 4;

/**
 * O header sticky ocupa o topo, e a lista (`z-50`) pinta por cima dele (`z-40`).
 * O `top` do campo conta essa faixa como livre. Header que já saiu da janela
 * não reduz o espaço: o limite volta a ser o topo da viewport.
 */
export function mentionListSpaceAbove(fieldTop: number, headerBottom: number): number {
  return fieldTop - Math.max(headerBottom, 0);
}

/**
 * A lista abria sempre para cima. No /feed o composer fica sob o header, então
 * ela cobria a busca. Sobe só quando o teto cabe; senão desce, e se os dois
 * lados estiverem apertados fica no que tem mais espaço.
 */
export function mentionListSide(
  spaceAbove: number,
  spaceBelow: number,
  listMaxHeight: number = MENTION_LIST_MAX_HEIGHT + MENTION_LIST_GAP,
): MentionListSide {
  if (spaceAbove >= listMaxHeight) return "above";
  return spaceBelow >= spaceAbove ? "below" : "above";
}
