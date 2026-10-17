import type { ReactNode } from "react";

export type ReadMoreProps = {
  children: ReactNode;
  /** Classe do corte quando fechado (ex.: `line-clamp-8`) — literal, para o Tailwind gerar. */
  clampClassName: string;
  /** Texto que decide se vale mostrar o controle (curto não precisa de "ler mais"). */
  length: number;
  /** A partir de quantos caracteres o controle aparece. */
  threshold: number;
  moreLabel: string;
  lessLabel: string;
};
