import type { ReactNode } from "react";

import type { ReactionType } from "@/types/application/reaction/reaction-type";

export type ReactionPickerProps = {
  /** Reação atual de quem está vendo (fica realçada no seletor). */
  activeType: ReactionType | null;
  /** Chamado com o emoji escolhido — por clique ou no fim do gesto de segurar e arrastar. */
  onReact: (type: ReactionType) => void;
  /** Classes do botão-gatilho (cada superfície tem as suas). */
  buttonClassName: string;
  /** Texto do `title` do gatilho. */
  buttonTitle: string;
  /** Conteúdo visual do gatilho (ícone, emoji ou o texto "Reagir"). */
  children: ReactNode;
};
