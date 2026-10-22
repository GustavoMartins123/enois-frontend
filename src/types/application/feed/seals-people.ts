import type { PostSealCount } from "./post-seal-count";
import type { SealPerson } from "./seal-person";

/** Quem marcou o post e com o quê, com a contagem por selo no topo. */
export type SealsPeople = {
  postId: string;
  seals: PostSealCount[];
  people: SealPerson[];
};
