import type { WordMark } from "./word-mark";

export interface RowProps {
  letters: string[];
  marks: WordMark[] | null; // null = linha ainda não confirmada
  shake: boolean;
  /** Se true, anima o flip ao ser revelado (só na linha recém confirmada). */
  animateReveal: boolean;
}
