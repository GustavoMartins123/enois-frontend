import type { ReactNode } from "react";

export type ReadMoreProps = {
  children: ReactNode;
  /** Classe do corte quando fechado (ex.: `line-clamp-8`) — literal, para o Tailwind gerar. */
  clampClassName: string;
  moreLabel: string;
  lessLabel: string;
};
