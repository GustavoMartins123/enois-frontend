import type { ReactionType } from "@/types/application/reaction/reaction-type";

/** O que o hook de reação expõe para a fileira de ações do post. */
export type UsePostReactionResult = {
  toggle: (type: ReactionType) => void;
  isPending: boolean;
  reactionStatus: ReactionType | null;
};
