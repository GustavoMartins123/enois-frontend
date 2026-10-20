import type { ReactionType } from "./reaction-type";

/** Uma aba do diálogo de reações: o tipo e quantas pessoas reagiram com ele. */
export type ReactionTab = {
  type: ReactionType;
  count: number;
};
