import type { ReactionType } from "@/types/application/reaction/reaction-type";

/** A intenção de um clique: o tipo escolhido e se ele remove a reação atual. */
export type ReactionVariables = { type: ReactionType; remove: boolean };
